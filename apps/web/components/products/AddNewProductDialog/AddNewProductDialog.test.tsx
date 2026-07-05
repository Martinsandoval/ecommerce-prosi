import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { AddNewProductDialog } from "@/components/products/AddNewProductDialog/AddNewProductDialog";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("AddNewProductDialog", () => {
  it("opens the dialog when the trigger is clicked", async () => {
    render(<AddNewProductDialog />, { wrapper: createWrapper() });

    expect(
      screen.queryByRole("heading", { name: /add new product/i }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /add new product/i }),
    );

    expect(
      await screen.findByRole("heading", { name: /add new product/i }),
    ).toBeInTheDocument();
  });

  it("closes the dialog after a successful submission", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        id: "1",
        name: "Classic Cotton T-Shirt",
        pictureUrl: "https://example.com/t-shirt.png",
        price: 19.99,
        isActive: true,
        attributes: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    render(<AddNewProductDialog />, { wrapper: createWrapper() });

    await userEvent.click(
      screen.getByRole("button", { name: /add new product/i }),
    );
    await screen.findByRole("heading", { name: /add new product/i });

    await userEvent.type(
      screen.getByLabelText("Name"),
      "Classic Cotton T-Shirt",
    );
    await userEvent.type(
      screen.getByLabelText("Picture URL"),
      "https://example.com/t-shirt.png",
    );
    const priceInput = screen.getByLabelText("Price");
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, "19.99");

    await userEvent.click(
      screen.getByRole("button", { name: /create product/i }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /add new product/i }),
      ).not.toBeInTheDocument(),
    );
  });
});
