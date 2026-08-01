import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useCartSync } from "@/hooks/useCartSync";
import { Loader2, Leaf, Droplets, Sun } from "lucide-react";
import heroImage from "@/assets/hero-shea.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shea Org — Oraffinerat vildskördat sheasmör" },
      {
        name: "description",
        content:
          "Oraffinerat sheasmör av Grade A, vildskördat och kallpressat. En enda ingrediens, inget annat. Handla den rena karité-ritualen.",
      },
      { property: "og:title", content: "Shea Org — Oraffinerat vildskördat sheasmör" },
      {
        property: "og:description",
        content:
          "Oraffinerat sheasmör av Grade A, vildskördat och kallpressat. En enda ingrediens, inget annat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <p className="text-primary text-xs tracking-[0.25em] uppercase">
              100 % Naturligt · Grade A
            </p>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
              Rent sheasmör, precis som nöten gjorde det.
            </h1>
            <p className="text-muted-foreground max-w-md text-lg">
              Vildskördat, kallpressat och aldrig raffinerat. En enda ingrediens som mjukgör torr
              hud, lugnar irritation och räcker hela säsongen.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#shop"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 items-center rounded-full px-7 text-sm font-medium transition-colors"
              >
                Handla sheasmöret
              </a>
              <a
                href="#about"
                className="border-border hover:bg-accent inline-flex h-11 items-center rounded-full border px-7 text-sm font-medium transition-colors"
              >
                Varför oraffinerat
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl">
            <img
              src={heroImage}
              alt="Rent oraffinerat sheasmör i en keramikskål bredvid knäckta sheanötter"
              width={1600}
              height={1104}
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section id="shop" className="mx-auto max-w-6xl px-6 py-16">
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
                title: "Vildskördat",
                body: "Nötter plockade för hand, aldrig odlade.",
              },
              {
                icon: Droplets,
                title: "Kallpressat",
                body: "Ingen värme, inga lösningsmedel, inga blekmedel.",
              },
              {
                icon: Sun,
                title: "Oraffinerat Grade A",
                body: "Vitamin A, E och F helt bevarade.",
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

        <section id="ritual" className="mx-auto max-w-3xl px-6 pb-8 text-center">
          <h2 className="font-serif text-3xl tracking-tight">Ritualen</h2>
          <p className="text-muted-foreground mt-4">
            Värm en liten mängd mellan handflatorna tills den smälter och massera in i fuktig hud.
            Bäst på armbågar, hälar, händer och överallt där vintern varit hård.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
