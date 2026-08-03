/**
 * Per-product editorial copy for the product page sections. Shopify supplies the
 * title, price, images and description; everything below is store-authored copy
 * keyed by product handle, with a neutral fallback for handles not listed yet.
 */
export type ProductContent = {
  tagline: string;
  metaSummary: string;
  usage: string[];
  ingredients: { highlight: string; body: string };
  shippingIntro: string;
};

const FALLBACK: ProductContent = {
  tagline: "Naturlig hudvård från Shea Org. Rena råvaror, inget onödigt.",
  metaSummary: "naturlig hudvård med rena råvaror från Shea Org",
  usage: [
    "Följ anvisningarna på förpackningen.",
    "Gör alltid ett test på en liten hudyta först.",
    "Förvara svalt och torrt, skyddat från direkt solljus.",
  ],
  ingredients: {
    highlight: "Rena, naturliga råvaror",
    body: "Utan parfym, färgämnen och mineraloljor.",
  },
  shippingIntro:
    "Vi skickar din beställning inom 1–2 arbetsdagar. Leveransen sker direkt från vårt lager med pålitliga fraktpartners.",
};

const CONTENT: Record<string, ProductContent> = {
  "pure-shea-butter-beige-organic-unrefined": {
    tagline: "Oraffinerat, vildskördat sheasmör av Grade A. En enda ingrediens, inget annat.",
    metaSummary: "oraffinerat, vildskördat sheasmör av Grade A från Shea Org",
    usage: [
      "Värm en liten mängd mellan handflatorna tills den smälter.",
      "Massera in i fuktig hud efter dusch eller bad.",
      "Använd på armbågar, knän, händer, fötter och läppar.",
      "Fungerar även som hårinpackning för torra toppar.",
      "Bra som bas för hemmagjorda kropps- och läppvårdsprodukter.",
    ],
    ingredients: {
      highlight: "100 % Butyrospermum Parkii Butter",
      body: "(oraffinerat sheasmör). Ingen doft, inga konserveringsmedel, inga färgämnen och inga mineraloljor. Endast rent sheasmör från vildväxande sheaträd.",
    },
    shippingIntro:
      "Vi skickar ditt sheasmör inom 1–2 arbetsdagar. Leveransen sker direkt från vårt lager med pålitliga fraktpartners.",
  },
  "australian-pastel-pink-clay": {
    tagline: "Australisk pastellrosa lera. Mild ansiktsmask för stressad och mogen hud.",
    metaSummary: "australisk pastellrosa lera – mild ansiktsmask för stressad och mogen hud",
    usage: [
      "Blanda 1 tsk lera med lika delar vatten, hydrolat eller växtolja till en slät kräm.",
      "Applicera ett jämnt lager på ren, torr hud och undvik ögonpartiet.",
      "Låt sitta 5–10 minuter — skölj av innan masken torkar helt.",
      "Skölj av med ljummet vatten och avsluta med din vanliga fuktkräm.",
      "Använd 1–2 gånger i veckan. Gör ett test på en liten hudyta först.",
    ],
    ingredients: {
      highlight: "100 % Kaolin (australisk pastellrosa lera)",
      body: "Ingen parfym, inga konserveringsmedel, inga färgämnen och inga mineraloljor. Endast ren, naturligt utvunnen lera.",
    },
    shippingIntro:
      "Vi skickar din lera inom 1–2 arbetsdagar. Leveransen sker direkt från vårt lager med pålitliga fraktpartners.",
  },
};

export function getProductContent(handle: string): ProductContent {
  return CONTENT[handle] ?? FALLBACK;
}
