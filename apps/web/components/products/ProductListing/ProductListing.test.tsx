import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { ProductListing } from "@/components/products/ProductListing/ProductListing";
import type { PaginatedResponse, Product } from "@/types/product";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const product: Product = {
  id: "1",
  name: "Classic Cotton T-Shirt",
  pictureUrl: "https://example.com/t-shirt.png",
  price: 19.99,
  isActive: true,
  attributes: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("ProductListing", () => {
  it("only ever requests active products", async () => {
    const response: PaginatedResponse<Product> = {
      data: [product],
      meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
    };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: response });

    render(<ProductListing />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Classic Cotton T-Shirt")).toBeInTheDocument(),
    );

    expect(apiClient.get).toHaveBeenCalledWith("/products", {
      params: { search: undefined, status: "active", page: 1, limit: 12 },
    });
  });

  it("shows an empty state when there are no results", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: [],
        meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
      },
    });

    render(<ProductListing />, { wrapper: createWrapper() });

    expect(await screen.findByText("No products found")).toBeInTheDocument();
  });
});
