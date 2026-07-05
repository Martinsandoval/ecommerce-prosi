import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import {
  ProductStatusFilter,
  QueryProductsDto,
} from '../dto/query-products.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import {
  PaginatedResponse,
  ProductResponse,
} from '../interfaces/product-response.interface';
import { toProductResponse } from '../mappers/products.mapper';
import {
  buildProductItemCacheKey,
  buildProductListCacheKey,
} from '../products.cache-keys';

const ATTRIBUTES_ORDER_BY = { position: Prisma.SortOrder.asc } as const;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findAll(
    query: QueryProductsDto,
  ): Promise<PaginatedResponse<ProductResponse>> {
    const cacheKey = buildProductListCacheKey(query);

    return this.cache.wrap(cacheKey, () => this.findAllUncached(query));
  }

  async findOne(id: string): Promise<ProductResponse> {
    const cacheKey = buildProductItemCacheKey(id);

    return this.cache.wrap(cacheKey, () => this.findOneUncached(id));
  }

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        pictureUrl: dto.pictureUrl,
        price: dto.price,
        attributes: {
          create: (dto.attributes ?? []).map((attribute, index) => ({
            name: attribute.name,
            value: attribute.value,
            position: index,
          })),
        },
      },
      include: { attributes: { orderBy: ATTRIBUTES_ORDER_BY } },
    });

    await this.invalidateCache();

    return toProductResponse(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    await this.ensureExists(id);

    const product = await this.prisma.$transaction(async (tx) => {
      if (dto.attributes) {
        await tx.productAttribute.deleteMany({ where: { productId: id } });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.pictureUrl !== undefined && { pictureUrl: dto.pictureUrl }),
          ...(dto.price !== undefined && { price: dto.price }),
          ...(dto.attributes && {
            attributes: {
              create: dto.attributes.map((attribute, index) => ({
                name: attribute.name,
                value: attribute.value,
                position: index,
              })),
            },
          }),
        },
        include: { attributes: { orderBy: ATTRIBUTES_ORDER_BY } },
      });
    });

    await this.invalidateCache();

    return toProductResponse(product);
  }

  async setActive(id: string, isActive: boolean): Promise<ProductResponse> {
    await this.ensureExists(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: { isActive },
      include: { attributes: { orderBy: ATTRIBUTES_ORDER_BY } },
    });

    await this.invalidateCache();

    return toProductResponse(product);
  }

  private async findAllUncached(
    query: QueryProductsDto,
  ): Promise<PaginatedResponse<ProductResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ProductWhereInput = {
      ...(query.status === ProductStatusFilter.ACTIVE && { isActive: true }),
      ...(query.status === ProductStatusFilter.INACTIVE && { isActive: false }),
      ...(query.search && {
        name: { contains: query.search, mode: Prisma.QueryMode.insensitive },
      }),
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { attributes: { orderBy: ATTRIBUTES_ORDER_BY } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map(toProductResponse),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  private async findOneUncached(id: string): Promise<ProductResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { attributes: { orderBy: ATTRIBUTES_ORDER_BY } },
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return toProductResponse(product);
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
  }

  /**
   * Products is the only cached domain in this app, so a full clear is
   * equivalent to (and simpler than) tracking every generated list-query key
   * for targeted invalidation. Revisit if other domains start sharing this
   * cache store.
   */
  private async invalidateCache(): Promise<void> {
    await this.cache.clear();
  }
}
