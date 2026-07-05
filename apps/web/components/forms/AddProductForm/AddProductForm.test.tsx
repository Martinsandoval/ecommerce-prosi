import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { AddProductForm } from "@/components/forms/AddProductForm/AddProductForm";
import { toast } from "@/lib/toast";

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

describe("AddProductForm", () => {
  it("shows validation errors for required fields and does not submit", async () => {
    render(<AddProductForm onSuccess={vi.fn()} />, { wrapper: createWrapper() });

    await userEvent.click(
      screen.getByRole("button", { name: /create product/i }),
    );

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Picture URL is required")).toBeInTheDocument();
    expect(
      screen.getByText("Price must be greater than 0"),
    ).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it("submits the trimmed payload and calls onSuccess", async () => {
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
    const onSuccess = vi.fn();

    render(<AddProductForm onSuccess={onSuccess} />, {
      wrapper: createWrapper(),
    });

    await userEvent.type(
      screen.getByLabelText("Name"),
      "  Classic Cotton T-Shirt  ",
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

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());

    expect(apiClient.post).toHaveBeenCalledWith("/products", {
      name: "Classic Cotton T-Shirt",
      pictureUrl: "https://example.com/t-shirt.png",
      price: 19.99,
      attributes: [],
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Product created",
      expect.objectContaining({
        description: expect.stringContaining("Classic Cotton T-Shirt"),
      }),
    );
  });

  it("shows an error toast when the server rejects the submission", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          statusCode: 400,
          timestamp: "2026-01-01T00:00:00.000Z",
          path: "/api/products",
          method: "POST",
          message: ["name must be shorter than or equal to 150 characters"],
          error: "Bad Request",
        },
      },
    });

    render(<AddProductForm onSuccess={vi.fn()} />, { wrapper: createWrapper() });

    await userEvent.type(screen.getByLabelText("Name"), "T-Shirt");
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
      expect(toast.error).toHaveBeenCalledWith(
        "Couldn't create the product",
        expect.objectContaining({
          description: "name must be shorter than or equal to 150 characters",
        }),
      ),
    );
  });

  it("adds and removes attribute rows, capped at 10", async () => {
    render(<AddProductForm onSuccess={vi.fn()} />, { wrapper: createWrapper() });

    await userEvent.click(
      screen.getByRole("button", { name: /add attribute/i }),
    );

    expect(screen.getByLabelText("Attribute name")).toBeInTheDocument();
    expect(screen.getByLabelText("Value")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /remove attribute/i }),
    );

    expect(screen.queryByLabelText("Attribute name")).not.toBeInTheDocument();
    expect(screen.getByText("No attributes added yet.")).toBeInTheDocument();
  });
});
