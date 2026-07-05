import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCard } from "@/components/products/ProductCard/ProductCard";
import type { Product } from "@/types/product";

const baseProduct: Product = {
  id: "1",
  name: "Classic Cotton T-Shirt",
  pictureUrl: "https://example.com/t-shirt.png",
  price: 19.99,
  isActive: true,
  attributes: [
    { id: "a1", name: "Color", value: "Red" },
    { id: "a2", name: "Size", value: "M" },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("ProductCard", () => {
  it("renders the name, formatted price, and attributes", () => {
    render(<ProductCard product={baseProduct} />);

    expect(screen.getByText("Classic Cotton T-Shirt")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
    expect(screen.getByText("Color: Red")).toBeInTheDocument();
    expect(screen.getByText("Size: M")).toBeInTheDocument();
  });

  it("does not show the Inactive badge for active products", () => {
    render(<ProductCard product={baseProduct} />);

    expect(screen.queryByText("Inactive")).not.toBeInTheDocument();
  });

  it("shows the Inactive badge for deactivated products", () => {
    render(<ProductCard product={{ ...baseProduct, isActive: false }} />);

    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("collapses extra attributes into a '+N more' pill", () => {
    const product: Product = {
      ...baseProduct,
      attributes: [
        { id: "a1", name: "Color", value: "Red" },
        { id: "a2", name: "Size", value: "M" },
        { id: "a3", name: "Material", value: "Cotton" },
        { id: "a4", name: "Fit", value: "Slim" },
      ],
    };
    render(<ProductCard product={product} />);

    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });
});
