"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ProductStatusFilter } from "@/types/product";

const STATUS_OPTIONS: { value: ProductStatusFilter; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "all", label: "All" },
];

interface FiltersBarProps {
  value: ProductStatusFilter;
  onChange: (value: ProductStatusFilter) => void;
  className?: string;
}

/**
 * Segmented toggle group for filtering products by status
 * (active / inactive / all).
 *
 * @author Martin Sandoval
 */
export function FiltersBar({ value, onChange, className }: FiltersBarProps) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(values) => {
        const next = values[0] as ProductStatusFilter | undefined;
        if (next) onChange(next);
      }}
      variant="outline"
      className={className}
      aria-label="Filter products by status"
    >
      {STATUS_OPTIONS.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
