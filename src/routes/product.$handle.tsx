import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { fetchProductByHandle, formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useCartSync } from "@/hooks/useCartSync";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Package, Leaf, Truck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getProductContent } from "@/lib/product-content";
import { splitDescriptionHtml } from "@/lib/shopify-description";

const SITE_URL = "https://shea-glow-shop.lovable.app";

const sections = [
  { id: "beskrivning", label: "Produktbeskrivning", icon: Package },
  { id: "anvandning", label: "Användning", icon: Sparkles },
  { id: "ingredienser", label: "Ingredienser", icon: Leaf },
  { id: "leverans", label: "Leverans", icon: Truck },
] as const;

function cleanDescription(description: string | null): string {
  if (!description) return "";
  let text = description.replace(/^\s*produktbeskrivning\s*:?\s*/i, "");
  const usageIndex = text.toLowerCase().indexOf("användning");
  if (usageIndex !== -1) text = text.slice(0, usageIndex);
  return text.trim();
}

function truncate(text: string, max = 155): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Handles that ship a pre-built 1200x630 share card in /public, used when the
 * Shopify source image is too small to be served at full 1.91:1 preview size.
 */
const SOCIAL_CARDS: Record<string, string> = {
  "pure-shea-butter-beige-organic-unrefined":
    "/og-product-pure-shea-butter-beige-organic-unrefined.jpg",
};

/** Shopify CDN serves public, unauthenticated https images and supports resizing. */
function socialImageUrl(handle: string, url: string | undefined): string {
  const card = SOCIAL_CARDS[handle];
  if (card) return `${SITE_URL}${card}`;
  if (!url) return `${SITE_URL}/og-cover.jpg`;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("width", "1200");
    parsed.searchParams.set("height", "630");
    parsed.searchParams.set("crop", "center");
    return parsed.toString();
  } catch {
    return `${SITE_URL}/og-cover.jpg`;
  }
}


export const Route = createFileRoute("/product/$handle")({
  loader: ({ params }) => fetchProductByHandle(params.handle),
  head: ({ params, loaderData }) => {
    const product = loaderData as ShopifyProduct | null | undefined;
    const url = `${SITE_URL}/product/${params.handle}`;
    const fallbackName = params.handle.replace(/-/g, " ");
    const content = getProductContent(params.handle);
    const title = product ? `${product.node.title} — Shea Org` : `${fallbackName} — Shea Org`;
    const description = product
      ? truncate(
          content.description?.intro ||
            cleanDescription(product.node.description) ||
            `Köp ${product.node.title}: ${content.metaSummary}.`,
        )
      : `Köp ${fallbackName}: ${content.metaSummary}.`;
    const imageNode = product?.node.images.edges[0]?.node;
    const image = socialImageUrl(params.handle, imageNode?.url);
    const imageAlt = imageNode?.altText ?? product?.node.title ?? "Shea Org";

    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:site_name", content: "Shea Org" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "product" },
      { property: "og:url", content: url },
      { property: "og:locale", content: "sv_SE" },
      { property: "og:image", content: image },
      { property: "og:image:secure_url", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: imageAlt },
    ];

    const firstVariant = product?.node.variants.edges[0]?.node;

    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: product
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: product.node.title,
                description,
                image: [image],
                brand: { "@type": "Brand", name: "Shea Org" },
                url,
                ...(firstVariant
                  ? {
                      offers: {
                        "@type": "Offer",
                        url,
                        price: firstVariant.price.amount,
                        priceCurrency: firstVariant.price.currencyCode,
                        availability: firstVariant.availableForSale
                          ? "https://schema.org/InStock"
                          : "https://schema.org/OutOfStock",
                      },
                    }
                  : {}),
              }),
            },
          ]
        : undefined,
    };
  },
  component: ProductPage,
});

function ProductPage() {
  useCartSync();
  const addItem = useCartStore((s) => s.addItem);
  const isAdding = useCartStore((s) => s.isLoading);
  const [variantIndex, setVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<string>(sections[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const product = Route.useLoaderData() as ShopifyProduct | null;
  const { handle } = Route.useParams();
  const content = getProductContent(handle);
  const shopifySections = splitDescriptionHtml(product?.node.descriptionHtml);
  const isLoading = false;

  const variants = product?.node.variants.edges ?? [];
  const variant = variants[variantIndex]?.node;
  const images = product?.node.images.edges ?? [];
  const image = images[imageIndex]?.node ?? images[0]?.node;

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  const handleAdd = async () => {
    if (!product || !variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success(`${product.node.title} lades i varukorgen`, { position: "top-center" });
  };

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Tillbaka till butiken
        </Link>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : !product ? (
          <p className="text-muted-foreground py-24 text-center">Produkten hittades inte</p>
        ) : (
          <>
            <div className="grid gap-12 md:grid-cols-2">
              <div className="space-y-4">
                <div className="bg-muted aspect-square overflow-hidden rounded-3xl">
                  {image && (
                    <img
                      src={image.url}
                      alt={image.altText ?? product.node.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <button
                        key={img.node.url}
                        onClick={() => setImageIndex(i)}
                        aria-label={`Visa bild ${i + 1}`}
                        className={`bg-muted h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                          i === imageIndex ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <img
                          src={img.node.url}
                          alt={img.node.altText ?? `${product.node.title} bild ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <h1 className="font-serif text-4xl leading-tight tracking-tight">
                  {product.node.title}
                </h1>
                <p className="text-2xl font-semibold">
                  {variant
                    ? formatPrice(variant.price.amount, variant.price.currencyCode)
                    : formatPrice(
                        product.node.priceRange.minVariantPrice.amount,
                        product.node.priceRange.minVariantPrice.currencyCode,
                      )}
                </p>
                <p className="text-muted-foreground">{content.tagline}</p>


                {variants.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Alternativ</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v, i) => (
                        <button
                          key={v.node.id}
                          onClick={() => setVariantIndex(i)}
                          disabled={!v.node.availableForSale}
                          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                            i === variantIndex
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:bg-accent"
                          } disabled:opacity-40`}
                        >
                          {v.node.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={handleAdd}
                  disabled={isAdding || !variant || !variant.availableForSale}
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : variant?.availableForSale ? (
                    "Lägg i varukorgen"
                  ) : (
                    "Slutsåld"
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-16">
              <nav
                className="border-border/60 sticky top-0 z-10 -mx-6 border-b bg-background/95 px-6 py-4 backdrop-blur-sm"
                aria-label="Produktsektioner"
              >
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {sections.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => scrollToSection(id)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        activeSection === id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </nav>

              <div className="mt-8 space-y-16">
                <section
                  id="beskrivning"
                  ref={(el) => {
                    sectionRefs.current["beskrivning"] = el;
                  }}
                  className="scroll-mt-32"
                >
                  {shopifySections?.description ? (
                    <div
                      className="shopify-richtext text-muted-foreground max-w-3xl leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: shopifySections.description }}
                    />
                  ) : content.description ? (
                    <div className="text-muted-foreground max-w-3xl leading-relaxed">
                      <p>{content.description.intro}</p>
                      <h2 className="text-foreground mt-8 text-xl font-semibold">Fördelar</h2>
                      <ul className="mt-4 list-disc space-y-2 pl-6">
                        {content.description.benefits.map((benefit) => (
                          <li key={benefit}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-muted-foreground max-w-3xl whitespace-pre-line leading-relaxed">
                      {cleanDescription(product.node.description) || <p>{content.tagline}</p>}
                    </div>
                  )}
                </section>

                <section
                  id="anvandning"
                  ref={(el) => {
                    sectionRefs.current["anvandning"] = el;
                  }}
                  className="scroll-mt-32"
                >
                  <h2 className="font-serif mb-4 text-2xl tracking-tight">Användning</h2>
                  {shopifySections?.usage ? (
                    <div
                      className="shopify-richtext text-muted-foreground max-w-3xl leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: shopifySections.usage }}
                    />
                  ) : (
                    <ul className="text-muted-foreground max-w-3xl list-disc space-y-2 pl-5 leading-relaxed">
                      {content.usage.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  )}
                </section>

                <section
                  id="ingredienser"
                  ref={(el) => {
                    sectionRefs.current["ingredienser"] = el;
                  }}
                  className="scroll-mt-32"
                >
                  <h2 className="font-serif mb-4 text-2xl tracking-tight">Ingredienser</h2>
                  {shopifySections?.ingredients ? (
                    <div
                      className="shopify-richtext text-muted-foreground max-w-3xl leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: shopifySections.ingredients }}
                    />
                  ) : (
                    <p className="text-muted-foreground max-w-3xl leading-relaxed">
                      <span className="text-foreground font-medium">
                        {content.ingredients.highlight}
                      </span>{" "}
                      {content.ingredients.body}
                    </p>
                  )}
                </section>

                <section
                  id="leverans"
                  ref={(el) => {
                    sectionRefs.current["leverans"] = el;
                  }}
                  className="scroll-mt-32"
                >
                  <h2 className="font-serif mb-4 text-2xl tracking-tight">Leverans</h2>
                  {shopifySections?.shipping ? (
                    <div
                      className="shopify-richtext text-muted-foreground max-w-3xl leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: shopifySections.shipping }}
                    />
                  ) : (
                    <>
                      <p className="text-muted-foreground max-w-3xl leading-relaxed">
                        {content.shippingIntro}
                      </p>
                      <ul className="text-muted-foreground mt-4 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed">
                        <li>Fri frakt</li>
                        <li>Leveranstid 2–4 arbetsdagar inom Sverige.</li>
                        <li>Spårbar frakt med avisering via e-post.</li>
                      </ul>
                    </>
                  )}
                </section>
              </div>

            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

