import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { formatPrice, getProductByHandle, SITE_URL } from "../shopify";

export default defineTool({
  name: "get_product",
  title: "Get product details",
  description:
    "Get full details for one product by its handle: description, images, options and every purchasable variant with price and stock status.",
  inputSchema: {
    handle: z
      .string()
      .trim()
      .min(1)
      .describe("The product handle, e.g. 'pure-shea-butter-beige-organic-unrefined'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ handle }) => {
    const product = await getProductByHandle(handle);
    if (!product) throw new ToolError(`No product found with handle "${handle}".`);

    const details = {
      handle: product.handle,
      title: product.title,
      description: product.description,
      url: `${SITE_URL}/product/${product.handle}`,
      images: product.images.edges.map((edge) => ({
        url: edge.node.url,
        alt: edge.node.altText,
      })),
      options: product.options,
      variants: product.variants.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        price: formatPrice(node.price.amount, node.price.currencyCode),
        amount: node.price.amount,
        currency: node.price.currencyCode,
        availableForSale: node.availableForSale,
        selectedOptions: node.selectedOptions,
      })),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(details, null, 2) }],
      structuredContent: { product: details },
    };
  },
});
