import type { Metadata } from "next";
import { ProductsTable } from "@/components/products/ProductsTable/ProductsTable";

export const metadata: Metadata = {
  title: "Product Management",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminProductsPage() {
  return <ProductsTable />;
}
