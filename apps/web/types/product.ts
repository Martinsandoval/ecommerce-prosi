export type {
  Product,
  ProductAttribute,
  PaginationMeta,
  PaginatedResponse,
  ProductsQueryParams,
  ProductAttributeInput,
  CreateProductInput,
  UpdateProductInput,
} from "@ecommerce/shared";
export { ProductStatusFilter } from "@ecommerce/shared";

export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error: string;
}
