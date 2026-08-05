/**
 * Per-product editorial copy for the product page sections. Shopify supplies the
 * title, price, images and description; everything below is store-authored copy
 * keyed by product handle, with a neutral fallback for handles not listed yet.
 */
export type ProductContent = {
  tagline: string;
  metaSummary: string;
  description?: { intro: string; benefits: string[] };
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
    description: {
      intro:
        "Vårt ekologiska sheasmör kommer från Ghana, där sheanötterna skördas enligt traditionella metoder och förädlas varsamt för att bevara sin naturliga kvalitet. Sheasmöret är 100 % rent, kallpressat och oraffinerat, vilket hjälper till att bevara dess naturliga vitaminer och näringsrika fettsyror. Rikt på vitaminerna A och E vårdar, återfuktar och skyddar det både hud och hår på djupet – helt utan tillsatser, parfym eller kemikalier.",
      benefits: [
        "Intensivt återfuktande för torr och känslig hud.",
        "Hjälper till att lugna irritation och stödjer hudens naturliga barriär.",
        "Bidrar till ökad elasticitet och en mjuk, smidig hud.",
        "Vårdar torrt och skadat hår samt ger mjukhet, glans och följsamhet.",
        "100 % naturligt och fritt från tillsatser, parfym och kemikalier.",
        "Passar alla hud- och hårtyper.",
      ],
    },
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
    description: {
      intro:
        "Upptäck kraften i Australisk Rosa Lera, en naturligt mineralrik premiumlera som utvinns i Australien och varsamt soltorkas för att bevara sina värdefulla egenskaper. Denna lyxiga kosmetiska lera är ett uppskattat val inom naturlig hudvård och passar perfekt för ansiktsmasker, kroppsinpackningar, badprodukter, tvål och andra DIY-hudvårdsprodukter. Den silkeslena leran rengör huden på djupet, absorberar orenheter och överflödigt talg samtidigt som den hjälper till att återfukta och förbättra hudens spänst. Resultatet är en mjukare hud med jämnare hudstruktur och en naturlig, hälsosam lyster. Passar alla hudtyper – särskilt känslig, torr, stressad och mogen hud.",
      benefits: [
        "Djuprengör huden och avlägsnar orenheter.",
        "Exfolierar skonsamt för en jämnare hudstruktur.",
        "Återfuktar och hjälper huden att kännas mjuk och smidig.",
        "Bidrar till förbättrad elasticitet och en fräsch lyster.",
        "Rik på naturliga mineraler såsom kalium, kalcium, magnesium och koppar.",
        "100 % naturlig kosmetisk lera, fri från parfym, färgämnen och onödiga tillsatser.",
        "Perfekt för ansiktsmasker, kroppsinpackningar, badpulver, handgjorda tvålar, DIY-hudvård och spa-behandlingar hemma.",
      ],
    },
    usage: [
      "Ansiktsmask: blanda 1 msk lera med 2 msk vatten till en jämn pasta. Tillsätt gärna 1 tsk jojoba-, mandel- eller annan vegetabilisk olja för extra återfuktning.",
      "Applicera ett jämnt lager på rengjord hud och låt verka i 8–10 minuter — låt inte masken torka helt.",
      "Skölj av med ljummet vatten och avsluta med en återfuktande ansiktskräm.",
      "Kroppsinpackning: blanda leran med vatten till krämig konsistens och applicera på önskat område. Låt verka 10–15 minuter och skölj av i duschen med cirkulära rörelser.",
      "Undvik kontakt med ögon och andra känsliga områden.",
    ],
    ingredients: {
      highlight: "100 % Australisk Rosa Lera",
      body: "(Australian Pink Clay). Ingen parfym, inga konserveringsmedel, inga färgämnen och inga mineraloljor. Endast ren, naturligt utvunnen lera.",
    },
    shippingIntro:
      "Vi skickar din lera inom 1–2 arbetsdagar. Leveransen sker direkt från vårt lager med pålitliga fraktpartners.",
  },

};

export function getProductContent(handle: string): ProductContent {
  return CONTENT[handle] ?? FALLBACK;
}
