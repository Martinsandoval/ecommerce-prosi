import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchBar } from "@/components/common/SearchBar/SearchBar";

describe("SearchBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onChange only after the debounce delay", () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText("Search products…"), {
      target: { value: "shirt" },
    });

    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(350);

    expect(onChange).toHaveBeenCalledWith("shirt");
  });

  it("shows a clear button once there is text, clearing immediately on click", () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search products…");
    fireEvent.change(input, { target: { value: "shirt" } });

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(onChange).toHaveBeenCalledWith("");
    expect(input).toHaveValue("");
  });

  it("syncs the input when the external value prop changes", () => {
    const { rerender } = render(<SearchBar value="" onChange={vi.fn()} />);
    rerender(<SearchBar value="jeans" onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText("Search products…")).toHaveValue(
      "jeans",
    );
  });
});
