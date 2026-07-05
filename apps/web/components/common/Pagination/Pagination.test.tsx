import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "@/components/common/Pagination/Pagination";

describe("Pagination", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the current page and total pages", () => {
    render(<Pagination page={2} totalPages={5} onPageChange={vi.fn()} />);

    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  it("disables Previous on the first page and Next on the last page", () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={3} onPageChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();

    rerender(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /previous/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("disables both buttons when disabled is true", () => {
    render(
      <Pagination page={2} totalPages={3} onPageChange={vi.fn()} disabled />,
    );

    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("calls onPageChange with the adjacent page", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await userEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
