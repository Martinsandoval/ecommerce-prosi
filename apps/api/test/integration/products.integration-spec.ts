import { CacheModule } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../src/common/prisma/prisma.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { ProductStatusFilter } from '../../src/modules/products/dto/query-products.dto';
import { ProductsModule } from '../../src/modules/products/products.module';
import { ProductsService } from '../../src/modules/products/services/products.service';

/**
 * Integration tests exercise ProductsService against a real Postgres
 * database and a real cache-manager instance (via Nest's TestingModule),
 * with no HTTP layer in between. This is the tier that catches mistakes a
 * mocked-Prisma unit test can't (wrong Prisma filter shape, transaction
 * bugs, FK/cascade behavior) while staying much cheaper than booting the
 * full app + supertest, which is what the e2e suite is for.
 *
 * Requires a reachable Postgres at DATABASE_URL (loaded from .env), same as
 * the e2e suite — point it at a disposable/local database, not production.
 */
describe('ProductsService (integration)', () => {
  let moduleRef: TestingModule;
  let service: ProductsService;
  let prisma: PrismaService;

  const runId = `it_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const withPrefix = (name: string): string => `${runId}__${name}`;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register({ isGlobal: true, ttl: 60_000 }),
        PrismaModule,
        ProductsModule,
      ],
    }).compile();

    await moduleRef.init();

    service = moduleRef.get(ProductsService);
    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.productAttribute.deleteMany({
      where: { product: { name: { startsWith: runId } } },
    });
    await prisma.product.deleteMany({
      where: { name: { startsWith: runId } },
    });
    await moduleRef.close();
  });

  describe('create + findOne (persistence round trip)', () => {
    it('persists the product and its attributes with correct ordering and precision', async () => {
      const created = await service.create({
        name: withPrefix('Round Trip Product'),
        pictureUrl: 'https://example.com/round-trip.png',
        price: 19.9,
        attributes: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Red' },
        ],
      });

      expect(created.price).toBe(19.9);
      expect(created.attributes.map((a) => a.name)).toEqual(['Size', 'Color']);

      const fetched = await service.findOne(created.id);
      expect(fetched).toEqual(created);

      const rawAttributes = await prisma.productAttribute.findMany({
        where: { productId: created.id },
        orderBy: { position: 'asc' },
      });
      expect(rawAttributes.map((a) => a.position)).toEqual([0, 1]);
    });

    it('throws NotFoundException for a real, non-existent id', async () => {
      await expect(
        service.findOne('00000000-0000-0000-0000-000000000000'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('database-level cascade delete', () => {
    it('deletes attributes when their product is deleted', async () => {
      const product = await service.create({
        name: withPrefix('Cascade Product'),
        pictureUrl: 'https://example.com/cascade.png',
        price: 5,
        attributes: [{ name: 'Color', value: 'Blue' }],
      });

      await prisma.product.delete({ where: { id: product.id } });

      const remainingAttributes = await prisma.productAttribute.findMany({
        where: { productId: product.id },
      });
      expect(remainingAttributes).toHaveLength(0);
    });
  });

  describe('findAll against real data', () => {
    const searchToken = withPrefix('FindAllSuite');

    beforeAll(async () => {
      await service.create({
        name: `${searchToken} Active One`,
        pictureUrl: 'https://example.com/a.png',
        price: 10,
      });
      await service.create({
        name: `${searchToken} Active Two`,
        pictureUrl: 'https://example.com/b.png',
        price: 20,
      });
      const inactive = await service.create({
        name: `${searchToken} Inactive One`,
        pictureUrl: 'https://example.com/c.png',
        price: 30,
      });
      await service.setActive(inactive.id, false);
    });

    it('defaults to active-only and matches a case-insensitive search substring', async () => {
      const result = await service.findAll({
        status: ProductStatusFilter.ACTIVE,
        search: searchToken.toLowerCase(),
        page: 1,
        limit: 20,
      });

      expect(result.data.map((p) => p.name).sort()).toEqual(
        [`${searchToken} Active One`, `${searchToken} Active Two`].sort(),
      );
    });

    it('returns only inactive products when status=inactive', async () => {
      const result = await service.findAll({
        status: ProductStatusFilter.INACTIVE,
        search: searchToken,
      });

      expect(result.data.map((p) => p.name)).toEqual([
        `${searchToken} Inactive One`,
      ]);
    });

    it('returns everything when status=all, with correct pagination meta', async () => {
      const result = await service.findAll({
        status: ProductStatusFilter.ALL,
        search: searchToken,
        page: 1,
        limit: 2,
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        total: 3,
        page: 1,
        limit: 2,
        totalPages: 2,
      });

      const secondPage = await service.findAll({
        status: ProductStatusFilter.ALL,
        search: searchToken,
        page: 2,
        limit: 2,
      });
      expect(secondPage.data).toHaveLength(1);
    });
  });

  describe('update against real data', () => {
    it('atomically replaces attributes', async () => {
      const product = await service.create({
        name: withPrefix('Update Replace Product'),
        pictureUrl: 'https://example.com/update.png',
        price: 15,
        attributes: [{ name: 'Color', value: 'Green' }],
      });
      const originalAttributeIds = (
        await prisma.productAttribute.findMany({
          where: { productId: product.id },
        })
      ).map((a) => a.id);

      await service.update(product.id, {
        attributes: [
          { name: 'Color', value: 'Yellow' },
          { name: 'Size', value: 'L' },
        ],
      });

      const newAttributes = await prisma.productAttribute.findMany({
        where: { productId: product.id },
        orderBy: { position: 'asc' },
      });
      expect(
        newAttributes.map((a) => ({ name: a.name, value: a.value })),
      ).toEqual([
        { name: 'Color', value: 'Yellow' },
        { name: 'Size', value: 'L' },
      ]);
      expect(newAttributes.map((a) => a.id)).not.toEqual(
        expect.arrayContaining(originalAttributeIds),
      );
    });

    it('leaves existing attribute rows untouched when attributes are omitted', async () => {
      const product = await service.create({
        name: withPrefix('Update Preserve Product'),
        pictureUrl: 'https://example.com/preserve.png',
        price: 8,
        attributes: [{ name: 'Material', value: 'Cotton' }],
      });
      const before = await prisma.productAttribute.findMany({
        where: { productId: product.id },
      });

      await service.update(product.id, {
        name: withPrefix('Renamed Preserve Product'),
      });

      const after = await prisma.productAttribute.findMany({
        where: { productId: product.id },
      });
      expect(after).toEqual(before);

      const persisted = await prisma.product.findUniqueOrThrow({
        where: { id: product.id },
      });
      expect(persisted.name).toBe(withPrefix('Renamed Preserve Product'));
    });
  });

  describe('setActive against real data', () => {
    it('persists the isActive flag', async () => {
      const product = await service.create({
        name: withPrefix('SetActive Product'),
        pictureUrl: 'https://example.com/set-active.png',
        price: 12,
      });

      await service.setActive(product.id, false);
      expect(
        (await prisma.product.findUniqueOrThrow({ where: { id: product.id } }))
          .isActive,
      ).toBe(false);

      await service.setActive(product.id, true);
      expect(
        (await prisma.product.findUniqueOrThrow({ where: { id: product.id } }))
          .isActive,
      ).toBe(true);
    });

    it('throws NotFoundException for a real, non-existent id', async () => {
      await expect(
        service.setActive('00000000-0000-0000-0000-000000000000', true),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('cache wiring', () => {
    it('serves a repeated findOne from cache without re-querying the database', async () => {
      const product = await service.create({
        name: withPrefix('Cache Wiring Product'),
        pictureUrl: 'https://example.com/cache-wiring.png',
        price: 7,
      });
      const findUniqueSpy = jest.spyOn(prisma.product, 'findUnique');

      await service.findOne(product.id);
      await service.findOne(product.id);

      expect(findUniqueSpy).toHaveBeenCalledTimes(1);
      findUniqueSpy.mockRestore();
    });

    it('re-queries the database after a mutation invalidates the cache', async () => {
      const product = await service.create({
        name: withPrefix('Cache Invalidation Product'),
        pictureUrl: 'https://example.com/cache-invalidation.png',
        price: 7,
      });

      await service.findOne(product.id);
      // setActive() itself calls findUnique once (via ensureExists) before
      // invalidating the cache, so it isn't part of the findOne cache path.
      await service.setActive(product.id, false);

      const findUniqueSpy = jest.spyOn(prisma.product, 'findUnique');
      await service.findOne(product.id);

      expect(findUniqueSpy).toHaveBeenCalledTimes(1);
      findUniqueSpy.mockRestore();
    });
  });
});
