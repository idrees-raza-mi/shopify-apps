/**
 * Shopify Admin API GraphQL client.
 * Uses the custom-app Admin API access token.
 */

const STORE = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN ?? "";
const VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-01";

const ADMIN_ENDPOINT = `https://${STORE}/admin/api/${VERSION}/graphql.json`;

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!STORE || !TOKEN) {
    throw new Error(
      "Shopify Admin API not configured: set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_TOKEN"
    );
  }

  const res = await fetch(ADMIN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Shopify Admin API HTTP ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Shopify Admin API error: ${json.errors.map((e) => e.message).join(", ")}`);
  }
  if (!json.data) {
    throw new Error("Shopify Admin API returned no data");
  }
  return json.data;
}

function toGid(kind: "Product" | "Order", id: string): string {
  if (id.startsWith("gid://")) return id;
  return `gid://shopify/${kind}/${id}`;
}

// =====================================================
// Metafield helpers
// =====================================================

export async function getProductMetafield<T = unknown>(
  productId: string,
  namespace: string,
  key: string
): Promise<T | null> {
  const data = await adminFetch<{
    product: { metafield: { value: string } | null } | null;
  }>(
    `query GetProductMetafield($id: ID!, $namespace: String!, $key: String!) {
       product(id: $id) {
         metafield(namespace: $namespace, key: $key) { value }
       }
     }`,
    { id: toGid("Product", productId), namespace, key }
  );

  const value = data.product?.metafield?.value;
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

export async function setProductMetafield(
  productId: string,
  namespace: string,
  key: string,
  value: unknown
): Promise<void> {
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  const data = await adminFetch<{
    metafieldsSet: {
      metafields: Array<{ id: string }> | null;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>(
    `mutation SetMetafield($metafields: [MetafieldsSetInput!]!) {
       metafieldsSet(metafields: $metafields) {
         metafields { id }
         userErrors { field message }
       }
     }`,
    {
      metafields: [
        {
          ownerId: toGid("Product", productId),
          namespace,
          key,
          type: "json",
          value: stringValue,
        },
      ],
    }
  );

  if (data.metafieldsSet.userErrors.length) {
    throw new Error(
      `Shopify metafield set failed: ${data.metafieldsSet.userErrors
        .map((e) => `${e.field?.join(".")}: ${e.message}`)
        .join("; ")}`
    );
  }
}

export async function getOrderMetafield<T = unknown>(
  orderId: string,
  namespace: string,
  key: string
): Promise<T | null> {
  const data = await adminFetch<{
    order: { metafield: { value: string } | null } | null;
  }>(
    `query GetOrderMetafield($id: ID!, $namespace: String!, $key: String!) {
       order(id: $id) {
         metafield(namespace: $namespace, key: $key) { value }
       }
     }`,
    { id: toGid("Order", orderId), namespace, key }
  );

  const value = data.order?.metafield?.value;
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

export async function setOrderMetafield(
  orderId: string,
  namespace: string,
  key: string,
  value: unknown
): Promise<void> {
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  const data = await adminFetch<{
    metafieldsSet: {
      metafields: Array<{ id: string }> | null;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  }>(
    `mutation SetOrderMetafield($metafields: [MetafieldsSetInput!]!) {
       metafieldsSet(metafields: $metafields) {
         metafields { id }
         userErrors { field message }
       }
     }`,
    {
      metafields: [
        {
          ownerId: toGid("Order", orderId),
          namespace,
          key,
          type: "json",
          value: stringValue,
        },
      ],
    }
  );

  if (data.metafieldsSet.userErrors.length) {
    throw new Error(
      `Shopify order metafield set failed: ${data.metafieldsSet.userErrors
        .map((e) => `${e.field?.join(".")}: ${e.message}`)
        .join("; ")}`
    );
  }
}

// =====================================================
// Product listing
// =====================================================

export type ProductWithMetafield = {
  id: string;
  numericId: string;
  title: string;
  status: string;
  metafieldValue: unknown;
};

export async function listProductsWithMetafield(
  namespace: string,
  key: string
): Promise<ProductWithMetafield[]> {
  const out: ProductWithMetafield[] = [];
  let cursor: string | null = null;

  while (true) {
    const data: {
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        edges: Array<{
          cursor: string;
          node: {
            id: string;
            title: string;
            status: string;
            metafield: { value: string } | null;
          };
        }>;
      };
    } = await adminFetch(
      `query ListProductsWithMetafield($cursor: String, $namespace: String!, $key: String!) {
         products(first: 100, after: $cursor) {
           pageInfo { hasNextPage endCursor }
           edges {
             cursor
             node {
               id
               title
               status
               metafield(namespace: $namespace, key: $key) { value }
             }
           }
         }
       }`,
      { cursor, namespace, key }
    );

    for (const edge of data.products.edges) {
      const raw = edge.node.metafield?.value;
      if (!raw) continue;
      let parsed: unknown = raw;
      try {
        parsed = JSON.parse(raw);
      } catch {
        /* leave as string */
      }
      out.push({
        id: edge.node.id,
        numericId: edge.node.id.replace(/^gid:\/\/shopify\/Product\//, ""),
        title: edge.node.title,
        status: edge.node.status,
        metafieldValue: parsed,
      });
    }

    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }

  return out;
}
