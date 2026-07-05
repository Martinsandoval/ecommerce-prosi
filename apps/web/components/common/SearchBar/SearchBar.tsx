"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/**
 * Debounced search input with a clear button, used to filter product
 * listings by name.
 *
 * @author Martin Sandoval
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Search products…",
  debounceMs = 350,
  className,
}: SearchBarProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [draft, setDraft] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (draft === value) return;
    const timeout = setTimeout(() => onChangeRef.current(draft), debounceMs);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- value is only read to bail out; onChange is read via ref
  }, [draft, debounceMs]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="h-10 rounded-full bg-white pr-9 pl-9 text-neutral-900 placeholder:text-neutral-500"
      />
      {draft && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => {
            setDraft("");
            onChangeRef.current("");
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
