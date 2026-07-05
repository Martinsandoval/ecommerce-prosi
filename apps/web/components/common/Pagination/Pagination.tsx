import { Button } from "@/components/common/Button/Button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Previous/Next pager with a "Page X of Y" label, shared by any
 * paginated list view. Renders nothing when there's only one page.
 *
 * @author Martin Sandoval
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1 || disabled}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages || disabled}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
