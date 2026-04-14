/**
 * Client-side helper: takes the export response and adds the design as a
 * line item to a Shopify cart. Manages a persistent cart id in localStorage,
 * and either redirects to the Shopify checkout (top-window) or posts a
 * DESIGN_ADDED_TO_CART message to the parent (iframe / Shopify embed).
 */

const CART_ID_KEY = "eb_cart_id";

type Attribute = { key: string; value: string };

export type AddToCartArgs = {
  variantId: string;
  printUrl: string;
  previewUrl: string;
  templateId: string;
  designType: "template" | "canvas";
  customizationSummary?: string;
};

export async function addDesignToCart({
  variantId,
  printUrl,
  previewUrl,
  templateId,
  designType,
  customizationSummary,
}: AddToCartArgs): Promise<{ cartId: string; checkoutUrl: string }> {
  const attributes: Attribute[] = [
    { key: "_print_file_url", value: printUrl },
    { key: "_preview_url", value: previewUrl },
    { key: "_template_id", value: templateId },
    { key: "_design_type", value: designType },
  ];
  if (customizationSummary) {
    attributes.push({ key: "Customization", value: customizationSummary });
  }

  const cartId =
    typeof window !== "undefined" ? localStorage.getItem(CART_ID_KEY) : null;

  const res = await fetch("/api/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      variantId,
      attributes,
      cartId,
      quantity: 1,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Add to cart failed");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(CART_ID_KEY, data.cartId);
  }

  return { cartId: data.cartId, checkoutUrl: data.checkoutUrl };
}

/**
 * Sends the shopper to the Shopify /cart page where the preview image
 * swap runs (Shopify's hosted checkout cannot render custom per-line
 * images on non-Plus plans, so the cart is the last place we can show
 * the customer their actual design before payment).
 *
 * In the Shopify embed modal we post a message so the embed can dismiss
 * the iframe and navigate the parent window. Standalone (no parent) we
 * navigate directly.
 */
export function handoffCheckout(checkoutUrl: string) {
  if (typeof window === "undefined") return;
  const cartUrl = "/cart";
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(
      { type: "DESIGN_ADDED_TO_CART", checkoutUrl: cartUrl },
      "*"
    );
  } else {
    window.location.href = cartUrl;
  }
  void checkoutUrl;
}
