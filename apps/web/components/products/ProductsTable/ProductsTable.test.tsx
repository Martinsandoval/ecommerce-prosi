import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { ProductsTable } from "@/components/products/ProductsTable/ProductsTable";
import { toast } from "@/lib/toast";
import type { PaginatedResponse, Product } from "@/types/product";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("@/lib/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
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

const activeProduct: Product = {
  id: "1",
  name: "Classic Cotton T-Shirt",
  pictureUrl: "https://example.com/t-shirt.png",
  price: 19.99,
  isActive: true,
  attributes: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function mockListResponse(products: Product[]) {
  const response: PaginatedResponse<Product> = {
    data: products,
    meta: { total: products.length, page: 1, limit: 10, totalPages: 1 },
  };
  vi.mocked(apiClient.get).mockResolvedValue({ data: response });
}

describe("ProductsTable", () => {
  it("renders a row per product with its status and a Back to shop link", async () => {
    mockListResponse([activeProduct]);

    render(<ProductsTable />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Classic Cotton T-Shirt")).toBeInTheDocument(),
    );
    expect(
      screen.getByText("Active", { selector: '[data-slot="badge"]' }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to shop/i })).toHaveAttribute(
      "href",
      "/products",
    );
  });

  it("deactivates a product when clicking Deactivate", async () => {
    mockListResponse([activeProduct]);
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { ...activeProduct, isActive: false },
    });

    render(<ProductsTable />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Classic Cotton T-Shirt")).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: /deactivate/i }));

    expect(apiClient.patch).toHaveBeenCalledWith("/products/1/deactivate");
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        '"Classic Cotton T-Shirt" deactivated',
      ),
    );
  });

  it("shows an error toast when deactivating fails", async () => {
    mockListResponse([activeProduct]);
    vi.mocked(apiClient.patch).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 404,
        data: {
          statusCode: 404,
          timestamp: "2026-01-01T00:00:00.000Z",
          path: "/api/products/1/deactivate",
          method: "PATCH",
          message: "Product not found",
          error: "Not Found",
        },
      },
    });

    render(<ProductsTable />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(screen.getByText("Classic Cotton T-Shirt")).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: /deactivate/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Couldn't deactivate the product",
        expect.objectContaining({ description: "Product not found" }),
      ),
    );
  });

  it("opens the Add new Product dialog", async () => {
    mockListResponse([activeProduct]);

    render(<ProductsTable />, { wrapper: createWrapper() });
    await waitFor(() =>
      expect(screen.getByText("Classic Cotton T-Shirt")).toBeInTheDocument(),
    );

    await userEvent.click(
      screen.getByRole("button", { name: /add new product/i }),
    );

    expect(
      await screen.findByRole("heading", { name: /add new product/i }),
    ).toBeInTheDocument();
  });
});
