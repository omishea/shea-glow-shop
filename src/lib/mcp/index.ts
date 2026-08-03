import { defineMcp } from "@lovable.dev/mcp-js";

import getProductTool from "./tools/get-product";
import listProductsTool from "./tools/list-products";
import storeInfoTool from "./tools/store-info";

export default defineMcp({
  name: "shea-glow-shop",
  title: "Shea Glow Shop",
  version: "0.1.0",
  instructions:
    "Read-only tools for the Shea Org webshop (public Shopify catalog). Use `store_info` for shop-level facts, `list_products` to browse the catalog, and `get_product` for full details and variants of a single product by handle.",
  tools: [storeInfoTool, listProductsTool, getProductTool],
});
