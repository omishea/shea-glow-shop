import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { fetchProductByHandle, formatPrice } from "@/lib/shopify";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useCartSync } from "@/hooks/useCartSync";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Package, Leaf, Truck, Sparkles } from "lucide-react";
import { toast } from "sonner";

const sections = [
  { id: "beskrivning", label: "Produktbeskrivning", icon: Package },
  { id: "anvandning", label: "Användning", icon: Sparkles },
  { id: "ingredienser", label: "Ingredienser", icon: Leaf },
  { id: "leverans", label: "Leverans", icon: Truck },
] as const;

function cleanDescription(description: string | null): string {
  if (!description) return "";
  const usageIndex = description.toLowerCase().indexOf("användning");
  if (usageIndex === -1) return description;
  return description.slice(0, usageIndex).trim();
}

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => {
    const name = params.handle.replace(/-/g, " ");
    return {
      meta: [
        { title: `${name} — Shea Org sheasmör` },
        {
          name: "description",
          content: `Köp ${name}: oraffinerat, vildskördat sheasmör av Grade A från Shea Org.`,
        },
        { property: "og:title", content: `${name} — Shea Org sheasmör` },
        {
          property: "og:description",
          content: `Köp ${name}: oraffinerat, vildskördat sheasmör av Grade A från Shea Org.`,
        },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  useCartSync();
  const addItem = useCartStore((s) => s.addItem);
  const isAdding = useCartStore((s) => s.isLoading);
  const [variantIndex, setVariantIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<string>(sections[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const { data: product, isLoading } = useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

  const variants = product?.node.variants.edges ?? [];
  const variant = variants[variantIndex]?.node;
  const image = product?.node.images.edges[0]?.node;

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
              <div className="bg-muted overflow-hidden rounded-3xl">
                {image && (
                  <img
                    src={image.url}
                    alt={image.altText ?? product.node.title}
                    className="h-full w-full object-cover"
                  />
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
                <p className="text-muted-foreground">
                  Oraffinerat, vildskördat sheasmör av Grade A. En enda ingrediens, inget annat.
                </p>

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
                  <h2 className="font-serif mb-4 text-2xl tracking-tight">Produktbeskrivning</h2>
                  <div className="text-muted-foreground max-w-3xl whitespace-pre-line leading-relaxed">
                    {cleanDescription(product.node.description) || (
                      <p>
                        Vårt sheasmör är oraffinerat och kallpressat för att bevara alla naturliga
                        näringsämnen. Det är rikt på vitamin A och E och passar torr hud, läppar,
                        armbågar, hälar och hår.
                      </p>
                    )}
                  </div>
                </section>

                <section
                  id="anvandning"
                  ref={(el) => {
                    sectionRefs.current["anvandning"] = el;
                  }}
                  className="scroll-mt-32"
                >
                  <h2 className="font-serif mb-4 text-2xl tracking-tight">Användning</h2>
                  <ul className="text-muted-foreground max-w-3xl list-disc space-y-2 pl-5 leading-relaxed">
                    <li>Värm en liten mängd mellan handflatorna tills den smälter.</li>
                    <li>Massera in i fuktig hud efter dusch eller bad.</li>
                    <li>Använd på armbågar, knän, händer, fötter och läppar.</li>
                    <li>Fungerar även som hårinpackning för torra toppar.</li>
                    <li>Bra som bas för hemmagjorda kropps- och läppvårdsprodukter.</li>
                  </ul>
                </section>

                <section
                  id="ingredienser"
                  ref={(el) => {
                    sectionRefs.current["ingredienser"] = el;
                  }}
                  className="scroll-mt-32"
                >
                  <h2 className="font-serif mb-4 text-2xl tracking-tight">Ingredienser</h2>
                  <p className="text-muted-foreground max-w-3xl leading-relaxed">
                    <span className="text-foreground font-medium">100 % Butyrospermum Parkii Butter</span>{" "}
                    (oraffinerat sheasmör). Ingen doft, inga konserveringsmedel, inga färgämnen och
                    inga mineraloljor. Endast rent sheasmör från vildväxande sheaträd.
                  </p>
                </section>

                <section
                  id="leverans"
                  ref={(el) => {
                    sectionRefs.current["leverans"] = el;
                  }}
                  className="scroll-mt-32"
                >
                  <h2 className="font-serif mb-4 text-2xl tracking-tight">Leverans</h2>
                  <div className="text-muted-foreground max-w-3xl space-y-3 leading-relaxed">
                    <p>
                      Vi skickar ditt sheasmör inom 1–2 arbetsdagar. Leveransen sker direkt från
                      vårt lager med pålitliga fraktpartners.
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                      <li>Leveranstid: 2–5 arbetsdagar inom Sverige.</li>
                      <li>Fri frakt</li>
                      <li>Du får ett spårningsnummer när paketet har skickats.</li>
                    </ul>
                  </div>
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
