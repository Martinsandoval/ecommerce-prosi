import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton/ProductCardSkeleton";

describe("ProductCardSkeleton", () => {
  it("renders skeleton placeholder blocks", () => {
    const { container } = render(<ProductCardSkeleton />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
