import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";

describe("EmptyState", () => {
  it("renders the title and description", () => {
    render(
      <EmptyState title="No products found" description="Try again later" />,
    );

    expect(
      screen.getByRole("heading", { name: "No products found" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Try again later")).toBeInTheDocument();
  });

  it("omits the description when not provided", () => {
    render(<EmptyState title="Nothing here" />);

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders the icon and action when provided", () => {
    render(
      <EmptyState
        title="Couldn't load"
        icon={<span data-testid="icon">!</span>}
        action={<button type="button">Retry</button>}
      />,
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
