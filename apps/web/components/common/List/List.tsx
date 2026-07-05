import { cn } from "@/lib/utils";

interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
}

/**
 * Generic responsive grid renderer for a list of items, agnostic of
 * what each item actually is.
 *
 * @author Martin Sandoval
 */
export function List<T>({
  items,
  renderItem,
  keyExtractor,
  className,
}: ListProps<T>) {
  return (
    <ul
      className={cn(
        "grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}
