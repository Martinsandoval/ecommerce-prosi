import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/common/Button/Button";

describe("Button", () => {
  it("renders its children and forwards onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Click me" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("respects an explicit disabled prop", () => {
    render(<Button disabled>Click me</Button>);

    expect(screen.getByRole("button", { name: "Click me" })).toBeDisabled();
  });

  it("shows a spinner, disables itself, and swaps in loadingText while loading", () => {
    const { container } = render(
      <Button loading loadingText="Saving…">
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving…" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("falls back to children while loading if no loadingText is given", () => {
    render(<Button loading>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
