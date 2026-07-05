import { QueryProductsDto } from './dto/query-products.dto';

const NAMESPACE = 'products';

export function buildProductListCacheKey(query: QueryProductsDto): string {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const status = query.status ?? 'active';
  const search = query.search ?? '';

  return `${NAMESPACE}:list:page=${page}:limit=${limit}:status=${status}:search=${search}`;
}

export function buildProductItemCacheKey(id: string): string {
  return `${NAMESPACE}:item:${id}`;
}
