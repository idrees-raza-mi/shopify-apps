/**
 * Shared types for template and canvas configs stored in Shopify metafields.
 */

export type PermissionType = "text" | "color" | "locked";

export type ElementPermission = {
  type: PermissionType;
  label: string;
  locked: boolean;
};

export type TemplateConfig = {
  type: "template";
  templateId: string;
  productName: string;
  svgUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  permissions: Record<string, ElementPermission>;
  price: string;
  status: "published" | "draft";
  createdAt: string;
};

export type CanvasConfig = {
  type: "canvas";
  templateId: string;
  productName: string;
  shape: "rect";
  displayW: number;
  displayH: number;
  printWidthCm: number;
  printHeightCm: number;
  bleedPx: number;
  safePx: number;
  price: string;
  status: "published" | "draft";
  createdAt: string;
};

export type AnyConfig = TemplateConfig | CanvasConfig;

export type DashboardItem = {
  productId: string;
  config: AnyConfig;
};
