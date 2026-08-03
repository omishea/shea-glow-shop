import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { listProducts, summarizeProduct } from "../shopify";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List the shea butter products sold in the Shea Org webshop, with price, availability and product page URL.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("How many products to return (default 20)."),
    query: z
      .string()
      .optional()
      .describe("Optional Shopify search query to filter products, e.g. 'sheasmör'."),
  },
  outputSchema: { products: z.array(z.record(z.string(), z.unknown())) },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, query }) => {
    const products = await listProducts(limit ?? 20, query);
    const items = products.map(summarizeProduct);
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { products: items },
    };
  },
});
