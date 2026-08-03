// Minimal, dependency-free Shopify Storefront client for MCP tool handlers.
// Deliberately separate from src/lib/shopify.ts, which pulls in browser-only UI deps.

const API_VERSION = "2025-07";
const STORE_DOMAIN = "cuyr8c-g3.myshopify.com";
const STOREFRONT_URL = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;
const STOREFRONT_TOKEN = "3afbf871722413108d391313468c3caf";

export const SITE_URL = "https://shea-glow-shop.lovable.app";

export type StorefrontProduct = {
  id: string;
  title: string;
  description: string;
  handle: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: { amount: string; currencyCode: string };
        availableForSale: boolean;
        selectedOptions: Array<{ name: string; value: string }>;
      };
    }>;
  };
  options: Array<{ name: string; values: string[] }>;
};

const PRODUCT_FIELDS = `
  id
  title
  description
  handle
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 5) { edges { node { url altText } } }
  variants(first: 20) {
    edges {
      node {
        id
        title
        price { amount currencyCode }
        availableForSale
        selectedOptions { name value }
      }
    }
  }
  options { name values }
`;

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges { node { ${PRODUCT_FIELDS} } }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;

async function storefront<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch(STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) {
    throw new Error(`Shopify Storefront request failed with status ${response.status}`);
  }
  const payload = (await response.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (payload.errors?.length) {
    throw new Error(`Shopify error: ${payload.errors.map((e) => e.message).join(", ")}`);
  }
  if (!payload.data) throw new Error("Shopify returned an empty response");
  return payload.data;
}

export async function listProducts(first: number, query?: string): Promise<StorefrontProduct[]> {
  const data = await storefront<{ products: { edges: Array<{ node: StorefrontProduct }> } }>(
    PRODUCTS_QUERY,
    { first, query: query ?? null },
  );
  return data.products.edges.map((edge) => edge.node);
}

export async function getProductByHandle(handle: string): Promise<StorefrontProduct | null> {
  const data = await storefront<{ product: StorefrontProduct | null }>(PRODUCT_BY_HANDLE_QUERY, {
    handle,
  });
  return data.product;
}

export function formatPrice(amount: string, currencyCode: string): string {
  const value = Number.parseFloat(amount);
  try {
    return new Intl.NumberFormat("sv-SE", { style: "currency", currency: currencyCode }).format(
      value,
    );
  } catch {
    return `${value.toFixed(2)} ${currencyCode}`;
  }
}

export function summarizeProduct(product: StorefrontProduct) {
  return {
    handle: product.handle,
    title: product.title,
    price: formatPrice(
      product.priceRange.minVariantPrice.amount,
      product.priceRange.minVariantPrice.currencyCode,
    ),
    currency: product.priceRange.minVariantPrice.currencyCode,
    url: `${SITE_URL}/product/${product.handle}`,
    image: product.images.edges[0]?.node.url ?? null,
    available: product.variants.edges.some((v) => v.node.availableForSale),
  };
}
