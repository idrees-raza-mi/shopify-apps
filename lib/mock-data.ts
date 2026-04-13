import type { DashboardItem } from "./types";

/**
 * Mock dashboard items used as a fallback when Shopify is not yet configured.
 * Real data comes from listProductsWithMetafield in lib/shopify-admin.ts.
 */
export const MOCK_DASHBOARD_ITEMS: DashboardItem[] = [
  {
    productId: "mock_1",
    config: {
      type: "template",
      templateId: "tpl_birthday_princess",
      productName: "Happy Birthday Princess",
      svgUrl: "",
      canvasWidth: 800,
      canvasHeight: 1010,
      permissions: {
        "title-text": { type: "text", label: "Name", locked: false },
        "date-text": { type: "text", label: "Date", locked: false },
        "bg-shape": { type: "color", label: "Background color", locked: false },
        "logo-group": { type: "locked", label: "Logo", locked: true },
      },
      price: "£29.99",
      status: "published",
      createdAt: "2026-04-10",
    },
  },
  {
    productId: "mock_2",
    config: {
      type: "template",
      templateId: "tpl_wedding_invite",
      productName: "Elegant Wedding Invite",
      svgUrl: "",
      canvasWidth: 800,
      canvasHeight: 1200,
      permissions: {
        "bride-name": { type: "text", label: "Bride name", locked: false },
        "groom-name": { type: "text", label: "Groom name", locked: false },
        "wedding-date": { type: "text", label: "Date", locked: false },
        "venue-text": { type: "text", label: "Venue", locked: false },
      },
      price: "£39.99",
      status: "published",
      createdAt: "2026-04-08",
    },
  },
  {
    productId: "mock_3",
    config: {
      type: "template",
      templateId: "tpl_baby_shower",
      productName: "Baby Shower Welcome",
      svgUrl: "",
      canvasWidth: 800,
      canvasHeight: 1010,
      permissions: {
        "baby-name": { type: "text", label: "Baby name", locked: false },
        "shower-date": { type: "text", label: "Date", locked: false },
      },
      price: "£24.99",
      status: "draft",
      createdAt: "2026-04-12",
    },
  },
  {
    productId: "mock_4",
    config: {
      type: "canvas",
      templateId: "cnv_rect_large",
      productName: "Rectangle Canvas Print 100x150",
      shape: "rect",
      displayW: 380,
      displayH: 500,
      printWidthCm: 100,
      printHeightCm: 150,
      bleedPx: 10,
      safePx: 22,
      price: "£89.99",
      status: "published",
      createdAt: "2026-04-11",
    },
  },
  {
    productId: "mock_5",
    config: {
      type: "canvas",
      templateId: "cnv_rect_small",
      productName: "Rectangle Canvas Print 40x60",
      shape: "rect",
      displayW: 320,
      displayH: 460,
      printWidthCm: 40,
      printHeightCm: 60,
      bleedPx: 10,
      safePx: 22,
      price: "£49.99",
      status: "draft",
      createdAt: "2026-04-09",
    },
  },
];
