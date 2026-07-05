import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FiltersBar } from "@/components/common/FiltersBar/FiltersBar";

describe("FiltersBar", () => {
  it("renders the three status options with the current value pressed", () => {
    render(<FiltersBar value="active" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Active" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Inactive" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onChange with the newly selected status", async () => {
    const onChange = vi.fn();
    render(<FiltersBar value="active" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Inactive" }));

    expect(onChange).toHaveBeenCalledWith("inactive");
  });

  it("does not call onChange when clicking the already-selected option", async () => {
    const onChange = vi.fn();
    render(<FiltersBar value="active" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Active" }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
