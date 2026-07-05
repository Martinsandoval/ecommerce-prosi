import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder matching {@link ProductCard}'s layout.
 *
 * @author Martin Sandoval
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card">
      <Skeleton className="aspect-4/5 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
