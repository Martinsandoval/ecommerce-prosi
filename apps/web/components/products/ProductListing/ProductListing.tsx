"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { SearchX, ServerCrash } from "lucide-react";
import { Button } from "@/components/common/Button/Button";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { List } from "@/components/common/List/List";
import { ListSkeleton } from "@/components/common/ListSkeleton/ListSkeleton";
import { Pagination } from "@/components/common/Pagination/Pagination";
import { SearchBar } from "@/components/common/SearchBar/SearchBar";
import { ProductCard } from "@/components/products/ProductCard/ProductCard";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton/ProductCardSkeleton";
import { PRODUCT_LISTING_PAGE_SIZE } from "@/components/products/ProductListing/constants";
import { useProducts } from "@/hooks/product";

const PAGE_SIZE = PRODUCT_LISTING_PAGE_SIZE;

/**
 * Public storefront product listing (`/products`): search plus a
 * paginated grid of active products only.
 *
 * @author Martin Sandoval
 */
export function ProductListing() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isPending, isError, isFetching, refetch } = useProducts({
    search: search || undefined,
    status: "active",
    page,
    limit: PAGE_SIZE,
  });

  const products = data?.data ?? [];
  const meta = data?.meta;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            The Catalog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta
              ? `${meta.total} product${meta.total === 1 ? "" : "s"} found`
              : "Browse the full collection"}
          </p>
        </div>
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          className="sm:max-w-sm"
        />
      </div>

      {isPending ? (
        <ListSkeleton
          count={PAGE_SIZE}
          renderSkeletonItem={(index) => <ProductCardSkeleton key={index} />}
        />
      ) : isError ? (
        <EmptyState
          icon={<ServerCrash className="size-10" />}
          title="Couldn't load the catalog"
          description="Something went wrong reaching the product service. Please try again."
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-10" />}
          title="No products found"
          description="Try a different search term."
        />
      ) : (
        <>
          <List
            items={products}
            keyExtractor={(product) => product.id}
            renderItem={(product, index) => (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(index, 8) * 0.04,
                  ease: "easeOut",
                }}
                className="h-full"
              >
                <ProductCard product={product} />
              </motion.div>
            )}
          />
          {meta && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              disabled={isFetching}
              className="mt-10"
            />
          )}
        </>
      )}
    </div>
  );
}
