import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { ProductListing } from "@/components/products/ProductListing/ProductListing";
import { PRODUCT_LISTING_PAGE_SIZE } from "@/components/products/ProductListing/constants";
import { productKeys } from "@/hooks/product";
import { apiClient } from "@/lib/api-client";
import { SITE_URL } from "@/lib/site";
import type { PaginatedResponse, Product } from "@/types/product";

// Data comes from a live backend reachable only at runtime (a separate
// container in Docker Compose), so this route can't be statically
// prerendered during `next build`.
export const dynamic = "force-dynamic";

const TITLE = "Shop the Catalog";
const DESCRIPTION =
  "Browse the full Prósi product catalog — apparel, accessories, and more, updated in real time.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/products",
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

const INITIAL_PARAMS = {
  status: "active" as const,
  page: 1,
  limit: PRODUCT_LISTING_PAGE_SIZE,
};

async function fetchInitialProducts() {
  const { data } = await apiClient.get<PaginatedResponse<Product>>(
    "/products",
    { params: INITIAL_PARAMS },
  );
  return data;
}

function buildProductListJsonLd(products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/products#${product.id}`,
      item: {
        "@type": "Product",
        name: product.name,
        image: product.pictureUrl,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };
}

export default async function ProductsPage() {
  const queryClient = new QueryClient();
  const initialData = await queryClient.fetchQuery({
    queryKey: productKeys.list(INITIAL_PARAMS),
    queryFn: fetchInitialProducts,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildProductListJsonLd(initialData.data)),
        }}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductListing />
      </HydrationBoundary>
    </>
  );
}
