"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { isAxiosError } from "axios";
import { ArrowLeft, Loader2, ServerCrash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/common/Button/Button";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { FiltersBar } from "@/components/common/FiltersBar/FiltersBar";
import { Pagination } from "@/components/common/Pagination/Pagination";
import { SearchBar } from "@/components/common/SearchBar/SearchBar";
import { Table } from "@/components/common/Table/Table";
import { AddNewProductDialog } from "@/components/products/AddNewProductDialog/AddNewProductDialog";
import {
  useActivateProduct,
  useDeactivateProduct,
  useProducts,
} from "@/hooks/product";
import { toast } from "@/lib/toast";
import type {
  ApiErrorResponse,
  Product,
  ProductStatusFilter,
} from "@/types/product";

const PAGE_SIZE = 10;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function notifyStatusChangeError(error: unknown, actionLabel: string) {
  // A missing `response` means the axios interceptor already showed a
  // network-error toast for this request.
  if (isAxiosError<ApiErrorResponse>(error) && error.response) {
    const { message } = error.response.data;
    toast.error(`Couldn't ${actionLabel} the product`, {
      description: Array.isArray(message) ? message.join(" ") : message,
    });
  }
}

function ProductStatusToggle({ product }: { product: Product }) {
  const activate = useActivateProduct();
  const deactivate = useDeactivateProduct();
  const isPending = activate.isPending || deactivate.isPending;

  function handleClick() {
    if (product.isActive) {
      deactivate.mutate(product.id, {
        onSuccess: () =>
          toast.success(`"${product.name}" deactivated`),
        onError: (error) => notifyStatusChangeError(error, "deactivate"),
      });
    } else {
      activate.mutate(product.id, {
        onSuccess: () => toast.success(`"${product.name}" activated`),
        onError: (error) => notifyStatusChangeError(error, "activate"),
      });
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      loading={isPending}
      loadingText={product.isActive ? "Deactivating…" : "Activating…"}
      onClick={handleClick}
    >
      {product.isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}

/**
 * Admin product management view (`/admin/products`): searchable,
 * filterable, sortable product table with create/activate/deactivate
 * actions.
 *
 * @author Martin Sandoval
 */
export function ProductsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatusFilter>("all");
  const [page, setPage] = useState(1);

  const { data, isPending, isError, isFetching, refetch } = useProducts({
    search: search || undefined,
    status,
    page,
    limit: PAGE_SIZE,
  });

  const products = data?.data ?? [];
  const meta = data?.meta;

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "picture",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="relative size-12 overflow-hidden rounded-lg bg-muted">
            <Image
              src={row.original.pictureUrl}
              alt={row.original.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => currencyFormatter.format(row.original.price),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "attributes",
        header: "Attributes",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.attributes.length > 0 ? (
            <span className="text-sm text-muted-foreground">
              {row.original.attributes
                .map((attribute) => `${attribute.name}: ${attribute.value}`)
                .join(", ")}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => <ProductStatusToggle product={row.original} />,
      },
    ],
    [],
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: ProductStatusFilter) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4">
        <Link
          href="/products"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to shop
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Product Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {meta
                ? `${meta.total} product${meta.total === 1 ? "" : "s"}`
                : "Manage the catalog"}
            </p>
          </div>
          <AddNewProductDialog />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            className="sm:max-w-sm sm:flex-1"
          />
          <FiltersBar value={status} onChange={handleStatusChange} />
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center rounded-2xl border border-border/70 py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={<ServerCrash className="size-10" />}
          title="Couldn't load products"
          description="Something went wrong reaching the product service. Please try again."
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try a different search term or adjust the status filter."
        />
      ) : (
        <>
          <Table
            columns={columns}
            data={products}
            getRowId={(product) => product.id}
          />
          {meta && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              disabled={isFetching}
              className="mt-6"
            />
          )}
        </>
      )}
    </div>
  );
}
