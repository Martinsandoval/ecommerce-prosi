import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ProductStatusFilter } from '../dto/query-products.dto';
import { ProductsService } from './products.service';

type MockCache = {
  wrap: jest.Mock;
  clear: jest.Mock;
};

function createMockCache(): MockCache {
  return {
    wrap: jest.fn((_key: string, fn: () => Promise<unknown>) => fn()),
    clear: jest.fn().mockResolvedValue(true),
  };
}

type MockPrisma = {
  product: {
    findMany: jest.Mock;
    count: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  productAttribute: {
    deleteMany: jest.Mock;
  };
  $transaction: jest.Mock;
};

function createMockPrisma(): MockPrisma {
  const mock: MockPrisma = {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    productAttribute: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  mock.$transaction.mockImplementation(
    async (arg: unknown[] | ((tx: MockPrisma) => Promise<unknown>)) => {
      if (typeof arg === 'function') {
        return arg(mock);
      }
      return Promise.all(arg);
    },
  );

  return mock;
}

const baseProduct = {
  id: 'product-1',
  name: 'T-Shirt',
  pictureUrl: 'https://example.com/shirt.png',
  price: { toString: () => '19.99' } as unknown as number,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  attributes: [
    {
      id: 'attr-2',
      name: 'Size',
      value: 'M',
      position: 1,
      productId: 'product-1',
      createdAt: new Date(),
    },
    {
      id: 'attr-1',
      name: 'Color',
      value: 'Red',
      position: 0,
      productId: 'product-1',
      createdAt: new Date(),
    },
  ],
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: MockPrisma;
  let cache: MockCache;

  beforeEach(async () => {
    prisma = createMockPrisma();
    cache = createMockCache();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  describe('findAll', () => {
    it('filters by active status by default and sorts attributes by position', async () => {
      prisma.product.findMany.mockResolvedValue([baseProduct]);
      prisma.product.count.mockResolvedValue(1);

      const result = await service.findAll({
        status: ProductStatusFilter.ACTIVE,
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true } }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].attributes.map((a) => a.name)).toEqual([
        'Color',
        'Size',
      ]);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('filters by inactive status', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.findAll({ status: ProductStatusFilter.INACTIVE });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: false } }),
      );
    });

    it('applies no isActive filter when status is "all"', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.findAll({ status: ProductStatusFilter.ALL });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('wraps the query in a cache keyed by page/limit/status/search', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.findAll({
        status: ProductStatusFilter.ACTIVE,
        search: 'shirt',
        page: 2,
        limit: 5,
      });

      expect(cache.wrap).toHaveBeenCalledWith(
        'products:list:page=2:limit=5:status=active:search=shirt',
        expect.any(Function),
      );
    });

    it('returns the cached value without hitting the database on a cache hit', async () => {
      const cached = {
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
      };
      cache.wrap.mockResolvedValueOnce(cached);

      const result = await service.findAll({
        status: ProductStatusFilter.ACTIVE,
      });

      expect(result).toBe(cached);
      expect(prisma.product.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns the mapped product when found', async () => {
      prisma.product.findUnique.mockResolvedValue(baseProduct);

      const result = await service.findOne('product-1');

      expect(result.id).toBe('product-1');
      expect(result.price).toBe(19.99);
    });

    it('throws NotFoundException when the product does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('wraps the lookup in a cache keyed by product id', async () => {
      prisma.product.findUnique.mockResolvedValue(baseProduct);

      await service.findOne('product-1');

      expect(cache.wrap).toHaveBeenCalledWith(
        'products:item:product-1',
        expect.any(Function),
      );
    });

    it('returns the cached value without hitting the database on a cache hit', async () => {
      const cached = { id: 'product-1' };
      cache.wrap.mockResolvedValueOnce(cached);

      const result = await service.findOne('product-1');

      expect(result).toBe(cached);
      expect(prisma.product.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('creates a product with positioned attributes', async () => {
      prisma.product.create.mockResolvedValue(baseProduct);

      await service.create({
        name: 'T-Shirt',
        pictureUrl: 'https://example.com/shirt.png',
        price: 19.99,
        attributes: [
          { name: 'Color', value: 'Red' },
          { name: 'Size', value: 'M' },
        ],
      });

      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attributes: {
              create: [
                { name: 'Color', value: 'Red', position: 0 },
                { name: 'Size', value: 'M', position: 1 },
              ],
            },
          }),
        }),
      );
      expect(cache.clear).toHaveBeenCalled();
    });
  });

  describe('setActive', () => {
    it('throws NotFoundException when the product does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.setActive('missing', false)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.product.update).not.toHaveBeenCalled();
      expect(cache.clear).not.toHaveBeenCalled();
    });

    it('updates isActive when the product exists and invalidates the cache', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'product-1' });
      prisma.product.update.mockResolvedValue({
        ...baseProduct,
        isActive: false,
      });

      const result = await service.setActive('product-1', false);

      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'product-1' },
          data: { isActive: false },
        }),
      );
      expect(result.isActive).toBe(false);
      expect(cache.clear).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('throws NotFoundException when the product does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing', { name: 'New name' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('replaces attributes when provided', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'product-1' });
      prisma.product.update.mockResolvedValue(baseProduct);

      await service.update('product-1', {
        attributes: [{ name: 'Color', value: 'Blue' }],
      });

      expect(prisma.productAttribute.deleteMany).toHaveBeenCalledWith({
        where: { productId: 'product-1' },
      });
      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attributes: {
              create: [{ name: 'Color', value: 'Blue', position: 0 }],
            },
          }),
        }),
      );
      expect(cache.clear).toHaveBeenCalled();
    });

    it('does not touch attributes when not provided', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'product-1' });
      prisma.product.update.mockResolvedValue(baseProduct);

      await service.update('product-1', { name: 'Updated name' });

      expect(prisma.productAttribute.deleteMany).not.toHaveBeenCalled();
      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { name: 'Updated name' } }),
      );
    });
  });
});
