/**
 * Google Fonts loaded into the customer editor (Phase 7).
 * Loaded via a <link> tag injected at editor mount time so the fonts
 * never bloat the admin dashboard.
 */

export type EditorFont = {
  name: string;
  cssFamily: string;
  google: boolean;
};

export const SYSTEM_FONTS: EditorFont[] = [
  { name: "Arial", cssFamily: "Arial, sans-serif", google: false },
  { name: "Georgia", cssFamily: "Georgia, serif", google: false },
  { name: "Times New Roman", cssFamily: "'Times New Roman', serif", google: false },
  { name: "Courier New", cssFamily: "'Courier New', monospace", google: false },
];

export const GOOGLE_FONTS: EditorFont[] = [
  "Playfair Display",
  "Merriweather",
  "Lora",
  "EB Garamond",
  "Libre Baskerville",
  "Raleway",
  "Montserrat",
  "Poppins",
  "Nunito",
  "Lato",
  "Open Sans",
  "Oswald",
  "Bebas Neue",
  "Dancing Script",
  "Pacifico",
  "Sacramento",
  "Great Vibes",
  "Lobster",
  "Satisfy",
  "Abril Fatface",
  "Cinzel",
  "Cormorant Garamond",
  "Josefin Sans",
  "Quicksand",
  "Righteous",
  "Permanent Marker",
].map((name) => ({
  name,
  cssFamily: `'${name}', sans-serif`,
  google: true,
}));

export const ALL_EDITOR_FONTS: EditorFont[] = [...SYSTEM_FONTS, ...GOOGLE_FONTS];

export function googleFontsHref(): string {
  const families = GOOGLE_FONTS.map((f) =>
    `family=${f.name.replace(/ /g, "+")}:wght@400;700`
  ).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
