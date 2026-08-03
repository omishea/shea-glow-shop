import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { SITE_URL } from "../shopify";

export default defineTool({
  name: "store_info",
  title: "Store information",
  description:
    "Get general information about the Shea Org webshop: what it sells, shipping policy and useful links.",
  inputSchema: {},
  outputSchema: {
    name: z.string(),
    language: z.string(),
    currency: z.string(),
    about: z.string(),
    shipping: z.string(),
    url: z.string(),
    shopUrl: z.string(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "Shea Org",
      language: "sv-SE",
      currency: "SEK",
      about:
        "Shea Org säljer oraffinerat, vildskördat och kallpressat sheasmör av Grade A. Inga tillsatser, inga parfymer.",
      shipping: "Fri frakt.",
      url: SITE_URL,
      shopUrl: `${SITE_URL}/#shop`,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
