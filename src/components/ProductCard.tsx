import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const selectedVariant = product.node.variants.edges[0]?.node;
  const image = product.node.images.edges[0]?.node;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success(`${product.node.title} lades i varukorgen`, { position: "top-center" });
  };

  return (
    <article className="group border-border/70 bg-card overflow-hidden rounded-2xl border">
      <Link to="/product/$handle" params={{ handle: product.node.handle }} className="block">
        <div className="bg-muted aspect-square overflow-hidden">
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? product.node.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
        </div>
      </Link>
      <div className="space-y-3 p-5">
        <Link to="/product/$handle" params={{ handle: product.node.handle }}>
          <h3 className="font-serif text-lg leading-snug">{product.node.title}</h3>
        </Link>
        <p className="text-muted-foreground line-clamp-2 text-sm">{product.node.description}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-semibold">
            {formatPrice(
              product.node.priceRange.minVariantPrice.amount,
              product.node.priceRange.minVariantPrice.currencyCode,
            )}
          </span>
          <Button onClick={handleAddToCart} disabled={isLoading || !selectedVariant} size="sm">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lägg i varukorgen"}
          </Button>
        </div>
      </div>
    </article>
  );
}
