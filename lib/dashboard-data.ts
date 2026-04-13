import { listProductsWithMetafield } from "./shopify-admin";
import { MOCK_DASHBOARD_ITEMS } from "./mock-data";
import type { AnyConfig, DashboardItem } from "./types";

/**
 * Server-side loader for the admin dashboard.
 *
 * Tries to read template_config and canvas_config metafields from Shopify.
 * Falls back to mock data if Shopify env vars are not configured or the
 * request fails (so the dashboard is testable before real credentials land).
 */
export async function loadDashboardItems(): Promise<{
  items: DashboardItem[];
  source: "shopify" | "mock";
}> {
  try {
    const [templates, canvases] = await Promise.all([
      listProductsWithMetafield("custom", "template_config"),
      listProductsWithMetafield("custom", "canvas_config"),
    ]);

    const items: DashboardItem[] = [];
    for (const p of templates) {
      const cfg = p.metafieldValue as AnyConfig | null;
      if (cfg && cfg.type === "template") {
        items.push({ productId: p.numericId, config: cfg });
      }
    }
    for (const p of canvases) {
      const cfg = p.metafieldValue as AnyConfig | null;
      if (cfg && cfg.type === "canvas") {
        items.push({ productId: p.numericId, config: cfg });
      }
    }

    if (items.length === 0) {
      return { items: MOCK_DASHBOARD_ITEMS, source: "mock" };
    }
    return { items, source: "shopify" };
  } catch {
    return { items: MOCK_DASHBOARD_ITEMS, source: "mock" };
  }
}
