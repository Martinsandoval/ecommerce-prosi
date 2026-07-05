import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/product";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

interface ProductCardProps {
  product: Product;
}

/**
 * Storefront card for a single product: picture, name, price,
 * attributes, and an "Inactive" badge when deactivated.
 *
 * @author Martin Sandoval
 */
export function ProductCard({ product }: ProductCardProps) {
  const visibleAttributes = product.attributes.slice(0, 3);
  const hiddenCount = product.attributes.length - visibleAttributes.length;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
      <div className="relative aspect-4/5 overflow-hidden bg-muted">
        <Image
          src={product.pictureUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!product.isActive && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-background/90 text-foreground shadow-sm"
          >
            Inactive
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-display text-lg leading-snug text-foreground">
          {product.name}
        </h3>
        <p className="font-display text-xl font-semibold text-primary">
          {currencyFormatter.format(product.price)}
        </p>
        {product.attributes.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {visibleAttributes.map((attribute) => (
              <span
                key={attribute.id}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {attribute.name}: {attribute.value}
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                +{hiddenCount} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
