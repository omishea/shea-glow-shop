/**
 * Splits a Shopify `descriptionHtml` into the four product-page sections while
 * keeping the merchant's original markup (paragraphs, headings, lists, bold).
 * Only headings that name a section are used as split points; everything else
 * stays exactly as authored in Shopify.
 */
export type DescriptionSections = {
  description: string;
  usage: string;
  ingredients: string;
  shipping: string;
};

type Heading = { start: number; contentStart: number; text: string };

/** Removes scripts, inline event handlers, and authoring-tool classes. */
function sanitize(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(class|style|id)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    headings.push({
      start: match.index,
      contentStart: match.index + match[0].length,
      text: stripTags(match[2] ?? "").toLowerCase(),
    });
  }
  return headings;
}

function slice(html: string, from: number, to: number): string {
  return html.slice(from, to).trim();
}

export function splitDescriptionHtml(html: string | null | undefined): DescriptionSections | null {
  if (!html || !html.trim()) return null;
  const clean = sanitize(html);
  const headings = findHeadings(clean);
  if (!headings.length) return null;

  const indexOfHeading = (test: (text: string) => boolean) =>
    headings.findIndex((h) => test(h.text));

  const iIntro = indexOfHeading((t) => t.startsWith("produktbeskrivning"));
  const iUsage = indexOfHeading((t) => t === "användning" || t.startsWith("användning"));
  const iIngredients = indexOfHeading((t) => t.startsWith("ingrediens"));
  const iShipping = indexOfHeading((t) => t.startsWith("leverans") || t.startsWith("frakt"));

  const markers = [iUsage, iIngredients, iShipping].filter((i) => i >= 0).sort((a, b) => a - b);
  const nextHeadingAfter = (index: number, stopAt: number[]) => {
    for (let i = index + 1; i < headings.length; i++) {
      if (stopAt.includes(i)) return headings[i]!.start;
    }
    return clean.length;
  };

  // Description: from after the "Produktbeskrivning" heading (or the very top)
  // up to the first section marker.
  const descStart = iIntro >= 0 ? headings[iIntro]!.contentStart : 0;
  const descEnd = markers.length ? headings[markers[0]!]!.start : clean.length;
  let description = slice(clean, descStart, descEnd);

  const usage =
    iUsage >= 0
      ? slice(clean, headings[iUsage]!.contentStart, nextHeadingAfter(iUsage, markers))
      : "";
  const ingredients =
    iIngredients >= 0
      ? slice(
          clean,
          headings[iIngredients]!.contentStart,
          nextHeadingAfter(iIngredients, markers),
        )
      : "";

  let shipping = "";
  if (iShipping >= 0) {
    // Shipping runs until the next heading of any kind; any trailing content
    // after it (e.g. "Varför välja ...") belongs back in the description.
    const next = headings.find((h) => h.start > headings[iShipping]!.start);
    shipping = slice(clean, headings[iShipping]!.contentStart, next ? next.start : clean.length);
    if (next) {
      const trailing = slice(clean, next.start, clean.length);
      if (trailing) description = `${description}\n${trailing}`;
    }
  }

  if (!description && !usage && !ingredients && !shipping) return null;
  return { description, usage, ingredients, shipping };
}
