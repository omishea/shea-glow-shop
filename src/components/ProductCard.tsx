import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";

const TITLE_OVERRIDES: Record<string, { title: string; subtitle?: string }> = {
  "pure-shea-butter-beige-organic-unrefined": {
    title: "Ekologiskt Sheasmör",
    subtitle: "100 % rent, kallpressat & oraffinerat – från Ghana",
  },
};

function cleanTitle(title: string): string {
  return title.replace(/\s*[-–—]\s*för stressad\s*&?\s*mogen hud\s*$/i, "").trim();
}

function cleanProductDescription(description: string): string {
  return description.replace(/^\s*produktbeskrivning\s*[:.–-]?\s*/i, "").trim();
}

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const image = product.node.images.edges[0]?.node;
  const override = TITLE_OVERRIDES[product.node.handle];
  const title = override?.title ?? cleanTitle(product.node.title);
  const subtitle = override?.subtitle ?? cleanProductDescription(product.node.description);

  return (
    <article className="group border-border/70 bg-card overflow-hidden rounded-2xl border">
      <Link to="/product/$handle" params={{ handle: product.node.handle }} className="block">
        <div className="bg-muted aspect-square overflow-hidden">
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
        </div>
      </Link>
      <div className="space-y-3 p-5">
        <Link to="/product/$handle" params={{ handle: product.node.handle }}>
          <h3 className="font-serif text-lg leading-snug">{title}</h3>
        </Link>
        <p className="text-muted-foreground line-clamp-2 text-sm">{subtitle}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-semibold">
            Från{" "}
            {formatPrice(
              product.node.priceRange.minVariantPrice.amount,
              product.node.priceRange.minVariantPrice.currencyCode,
            )}
          </span>
          <Button asChild size="sm">
            <Link to="/product/$handle" params={{ handle: product.node.handle }}>
              Se produkt →
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
