import { Product, ProductAttribute } from '@prisma/client';
import { ProductResponse } from '../interfaces/product-response.interface';

type ProductWithAttributes = Product & { attributes: ProductAttribute[] };

export function toProductResponse(
  product: ProductWithAttributes,
): ProductResponse {
  return {
    id: product.id,
    name: product.name,
    pictureUrl: product.pictureUrl,
    price: Number(product.price),
    isActive: product.isActive,
    attributes: [...product.attributes]
      .sort((a, b) => a.position - b.position)
      .map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        value: attribute.value,
      })),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
