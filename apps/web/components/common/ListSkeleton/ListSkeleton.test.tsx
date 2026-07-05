import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ListSkeleton } from "@/components/common/ListSkeleton/ListSkeleton";

describe("ListSkeleton", () => {
  it("renders the default count of skeleton items", () => {
    render(
      <ListSkeleton
        renderSkeletonItem={(index) => (
          <div data-testid="skeleton-item">{index}</div>
        )}
      />,
    );

    expect(screen.getAllByTestId("skeleton-item")).toHaveLength(8);
  });

  it("renders a custom count of skeleton items", () => {
    render(
      <ListSkeleton
        count={3}
        renderSkeletonItem={(index) => (
          <div data-testid="skeleton-item">{index}</div>
        )}
      />,
    );

    expect(screen.getAllByTestId("skeleton-item")).toHaveLength(3);
  });
});
