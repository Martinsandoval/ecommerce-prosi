import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { useProducts } from "@/hooks/product";
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

describe("useProducts", () => {
  it("fetches products from /products and returns them", async () => {
    const response: PaginatedResponse<Product> = {
      data: [
        {
          id: "1",
          name: "T-Shirt",
          pictureUrl: "https://example.com/t-shirt.png",
          price: 19.99,
          isActive: true,
          attributes: [],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: response });

    const { result } = renderHook(() => useProducts({ search: "shirt" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith("/products", {
      params: { search: "shirt" },
    });
    expect(result.current.data).toEqual(response);
  });
});
