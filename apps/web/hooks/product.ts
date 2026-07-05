import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import type {
  ApiErrorResponse,
  CreateProductInput,
  PaginatedResponse,
  Product,
  ProductsQueryParams,
} from "@/types/product";

export type ApiError = AxiosError<ApiErrorResponse>;

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: ProductsQueryParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

async function fetchProducts(
  params: ProductsQueryParams,
): Promise<PaginatedResponse<Product>> {
  const { data } = await apiClient.get<PaginatedResponse<Product>>(
    "/products",
    { params },
  );
  return data;
}

async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data } = await apiClient.post<Product>("/products", input);
  return data;
}

async function activateProduct(id: string): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}/activate`);
  return data;
}

async function deactivateProduct(id: string): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}/deactivate`);
  return data;
}

export function useProducts(
  params: ProductsQueryParams = {},
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Product>, ApiError>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    ...options,
  });
}

export function useCreateProduct(
  options?: UseMutationOptions<Product, ApiError, CreateProductInput>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useActivateProduct(
  options?: UseMutationOptions<Product, ApiError, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateProduct,
    onSuccess: (product, ...rest) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(product.id), product);
      options?.onSuccess?.(product, ...rest);
    },
    ...options,
  });
}

export function useDeactivateProduct(
  options?: UseMutationOptions<Product, ApiError, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateProduct,
    onSuccess: (product, ...rest) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(product.id), product);
      options?.onSuccess?.(product, ...rest);
    },
    ...options,
  });
}
