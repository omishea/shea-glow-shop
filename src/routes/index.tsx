import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useCartSync } from "@/hooks/useCartSync";
import { Loader2, Leaf, Truck, ShieldCheck } from "lucide-react";
import logoImage from "@/assets/shea-org-logo-transparent.png";

const SITE_URL = "https://shea-glow-shop.lovable.app";
const OG_IMAGE = `${SITE_URL}/og-cover.jpg`;
const HOME_TITLE = "Shea Org — Oraffinerat vildskördat sheasmör";
const HOME_DESCRIPTION =
  "Oraffinerat sheasmör av Grade A, vildskördat och kallpressat. En enda ingrediens, inget annat.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      { property: "og:site_name", content: "Shea Org" },
      { property: "og:title", content: HOME_TITLE },
      { property: "og:description", content: HOME_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:locale", content: "sv_SE" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:secure_url", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/jpeg" },
      {
        property: "og:image:alt",
        content: "Oraffinerat sheasmör i en keramikskål bredvid knäckta sheanötter",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: HOME_TITLE },
      { name: "twitter:description", content: HOME_DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Shea Org",
          url: `${SITE_URL}/`,
          inLanguage: "sv-SE",
          description: HOME_DESCRIPTION,
        }),
      },
    ],
  }),
  component: Index,
});


function Index() {
  useCartSync();
  const { data: products, isLoading } = useQuery({
    queryKey: ["shopify-products"],
    queryFn: () => fetchProducts(20),
  });

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-8 md:grid-cols-2 md:pt-24 md:pb-12">
          <div className="space-y-6">
            <p className="text-primary text-xs tracking-[0.25em] uppercase">
              100 % Naturligt
            </p>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
              Naturliga produkter, noga utvalda för dig.
            </h1>
            <p className="text-muted-foreground max-w-md text-lg">
              Välkommen till en plats där natur och kvalitet möts. Vi erbjuder noggrant utvalda
              produkter med rena ingredienser som hjälper dig att vårda din kropp, stärka ditt
              välmående och skapa hållbara rutiner för en hälsosammare vardag.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#shop"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 items-center rounded-full px-7 text-sm font-medium transition-colors"
              >
                Upptäck våra produkter
              </a>
            </div>
          </div>
          <div className="aspect-[1600/1104] overflow-hidden rounded-3xl">
            <img
              src={logoImage}
              alt="Shea Org logotyp"
              width={1254}
              height={1254}
              className="h-full w-full scale-[1.25] object-contain"
            />
          </div>
        </section>

        <section id="shop" className="mx-auto max-w-6xl px-6 pt-8 pb-16">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-serif text-3xl tracking-tight md:text-4xl">Produkter</h2>
            <p className="text-muted-foreground text-sm">Skickas från vår egen butik</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border-border rounded-2xl border border-dashed py-20 text-center">
              <p className="text-muted-foreground">Inga produkter hittades</p>
            </div>
          )}
        </section>

        <section id="about" className="border-border/60 border-y">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-3">
            {[
              {
                icon: Leaf,
                title: "Rena ingredienser",
                body: "Noga utvalda råvaror utan onödiga tillsatser.",
              },
              {
                icon: Truck,
                title: "Fri frakt",
                body: "Vi skickar alla beställningar fraktfritt.",
              },
              {
                icon: ShieldCheck,
                title: "Trygg handel",
                body: "Säker betalning och snabb kundservice.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="space-y-3">
                <Icon className="text-primary h-6 w-6" />
                <h2 className="font-serif text-xl">{title}</h2>
                <p className="text-muted-foreground text-sm">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="ritual" className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-serif text-3xl tracking-tight">Om Shea Org</h2>
          <p className="text-muted-foreground mt-4">
            Vi handplockar naturliga produkter för hud, hår och välmående — från oraffinerat
            sheasmör till mineralrik lera. Litet sortiment, hög kvalitet och full transparens
            kring vad varje produkt innehåller.
          </p>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
