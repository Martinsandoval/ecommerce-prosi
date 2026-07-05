import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  count?: number;
  renderSkeletonItem: (index: number) => React.ReactNode;
  className?: string;
}

/**
 * Generic loading placeholder that mirrors the grid layout of
 * {@link List}, filled with caller-provided skeleton items.
 *
 * @author Martin Sandoval
 */
export function ListSkeleton({
  count = 8,
  renderSkeletonItem,
  className,
}: ListSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4",
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{renderSkeletonItem(index)}</div>
      ))}
    </div>
  );
}
