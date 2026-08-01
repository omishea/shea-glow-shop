import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchProductByHandle, formatPrice } from "@/lib/shopify";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useCartSync } from "@/hooks/useCartSync";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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

  const { data: product, isLoading } = useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

  const variants = product?.node.variants.edges ?? [];
  const variant = variants[variantIndex]?.node;
  const image = product?.node.images.edges[0]?.node;

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
              <p className="text-muted-foreground whitespace-pre-line">{product.node.description}</p>

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
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
