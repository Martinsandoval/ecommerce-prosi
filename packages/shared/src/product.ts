export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  pictureUrl: string;
  price: number;
  isActive: boolean;
  attributes: ProductAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Plain object (not a TS `enum`) so the derived type below stays a
// structural string-literal union - callers can keep passing raw
// strings like "active" while api code gets a real runtime object to
// use with class-validator's `@IsEnum()` and Swagger's `enum` metadata.
export const ProductStatusFilter = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ALL: 'all',
} as const;

export type ProductStatusFilter =
  (typeof ProductStatusFilter)[keyof typeof ProductStatusFilter];

export interface ProductsQueryParams {
  status?: ProductStatusFilter;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductAttributeInput {
  name: string;
  value: string;
}

export interface CreateProductInput {
  name: string;
  pictureUrl: string;
  price: number;
  attributes?: ProductAttributeInput[];
}

export type UpdateProductInput = Partial<CreateProductInput>;
