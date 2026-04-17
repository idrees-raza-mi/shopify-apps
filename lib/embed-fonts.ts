/**
 * Font embedding for SVG uploads.
 *
 * At upload time, extracts every font-family from <text>/<tspan> elements,
 * fetches the matching Google Font woff2 binary, base64-encodes it, and
 * injects @font-face rules directly into the SVG's <style> block.
 *
 * After this, the SVG is self-contained — no runtime CDN dependency.
 * Works in the customer editor, Puppeteer export, and Shopify embed.
 *
 * Zero npm dependencies — uses Node 18+ built-in fetch only.
 */

const GOOGLE_FONTS_API = "https://fonts.googleapis.com/css2";

// Google returns woff2 only when it sees a modern desktop User-Agent.
const DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const SYSTEM_FONTS = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "math",
  "emoji",
  "inherit",
  "initial",
  "unset",
  "arial",
  "helvetica",
  "times new roman",
  "georgia",
  "verdana",
  "courier new",
  "tahoma",
  "trebuchet ms",
  "impact",
]);

/**
 * Parse a CSS font-family value into a list of clean font names.
 * Strips quotes, splits on commas, filters generic/system fonts.
 */
function parseFontFamily(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
    .filter((s) => s.length > 0 && !SYSTEM_FONTS.has(s.toLowerCase()));
}

/**
 * Extract all unique non-system font families from an SVG string.
 * Checks three places where Illustrator / design tools emit font-family:
 *   1. font-family="..." attribute on <text>/<tspan>
 *   2. style="font-family: ..." inline style
 *   3. <style> block CSS rules
 */
function extractFontFamilies(svgString: string): string[] {
  const fonts = new Set<string>();

  // 1. font-family attribute
  const attrRe = /font-family=["']([^"']+)["']/g;
  for (const m of svgString.matchAll(attrRe)) {
    parseFontFamily(m[1]).forEach((f) => fonts.add(f));
  }

  // 2. font-family inside style="" attributes
  const styleRe = /style="[^"]*font-family:\s*([^;"]+)/gi;
  for (const m of svgString.matchAll(styleRe)) {
    parseFontFamily(m[1]).forEach((f) => fonts.add(f));
  }

  // 3. <style> blocks
  const styleBlockRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  for (const block of svgString.matchAll(styleBlockRe)) {
    const cssRe = /font-family:\s*([^;}]+)/gi;
    for (const m of block[1].matchAll(cssRe)) {
      parseFontFamily(m[1]).forEach((f) => fonts.add(f));
    }
  }

  return [...fonts];
}

/**
 * Fetch Google Fonts CSS for one family (regular + bold).
 * Returns the raw CSS text or null on failure.
 */
async function fetchGoogleFontCSS(fontFamily: string): Promise<string | null> {
  const familyParam = fontFamily.replace(/\s+/g, "+");
  const url = `${GOOGLE_FONTS_API}?family=${familyParam}:wght@400;700&display=swap`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": DESKTOP_UA },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.warn(`[embed-fonts] Could not fetch CSS for "${fontFamily}":`, err);
    return null;
  }
}

/**
 * Download a woff2 binary and return it as a base64 string.
 */
async function fetchFontAsBase64(woff2Url: string): Promise<string> {
  const res = await fetch(woff2Url);
  if (!res.ok) throw new Error(`woff2 download failed: ${res.status}`);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

/**
 * Parse Google Fonts CSS into @font-face rules with embedded base64 data.
 *
 * Google's CSS looks like:
 *   /* latin * /
 *   @font-face {
 *     font-family: 'Pacifico';
 *     font-style: normal;
 *     font-weight: 400;
 *     ...
 *     src: url(https://fonts.gstatic.com/s/...) format('woff2');
 *     unicode-range: U+0000-00FF, ...;
 *   }
 *
 * We extract the woff2 URL, download it, and replace with a data URI.
 */
async function cssToEmbeddedRules(css: string): Promise<string[]> {
  const rules: string[] = [];
  // Match each @font-face block
  const blockRe = /@font-face\s*\{([^}]+)\}/g;
  for (const match of css.matchAll(blockRe)) {
    const block = match[1];

    // Extract the woff2 URL
    const urlMatch = block.match(/url\((https:\/\/[^)]+\.woff2)\)/);
    if (!urlMatch) continue;

    try {
      const base64 = await fetchFontAsBase64(urlMatch[1]);
      // Replace the remote URL with an embedded data URI
      const embedded = block.replace(
        /url\(https:\/\/[^)]+\.woff2\)/,
        `url('data:font/woff2;base64,${base64}')`
      );
      rules.push(`@font-face {${embedded}}`);
    } catch (err) {
      console.warn("[embed-fonts] Failed to download woff2:", err);
    }
  }
  return rules;
}

/**
 * Main export. Takes an SVG string, finds all Google Fonts used in text
 * elements, downloads them, and returns a new SVG with the fonts embedded
 * as base64 @font-face rules in a <style> block.
 *
 * If anything fails, returns the ORIGINAL SVG unchanged — safe fallback.
 */
export async function embedFonts(svgString: string): Promise<string> {
  try {
    const families = extractFontFamilies(svgString);
    if (families.length === 0) return svgString;

    const allRules: string[] = [];

    // Fetch all font families in parallel
    const cssResults = await Promise.all(
      families.map((f) => fetchGoogleFontCSS(f))
    );

    // Convert each CSS result to embedded rules in parallel
    const ruleArrays = await Promise.all(
      cssResults
        .filter((css): css is string => css !== null)
        .map((css) => cssToEmbeddedRules(css))
    );
    for (const rules of ruleArrays) {
      allRules.push(...rules);
    }

    if (allRules.length === 0) return svgString;

    const styleBlock = `<style>\n${allRules.join("\n")}\n</style>`;

    // Inject immediately after the opening <svg ...> tag
    return svgString.replace(/(<svg[^>]*>)/, `$1\n${styleBlock}`);
  } catch (err) {
    // SAFE FALLBACK — never break the upload
    console.error("[embed-fonts] Unexpected error, returning original SVG:", err);
    return svgString;
  }
}
