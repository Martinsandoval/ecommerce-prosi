import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const createdProductIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    if (createdProductIds.length > 0) {
      await prisma.product.deleteMany({
        where: { id: { in: createdProductIds } },
      });
    }
    await app.close();
  });

  it('rejects an invalid payload with a structured 400 response', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/products')
      .send({ pictureUrl: 'not-a-url', price: -5 })
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      path: '/api/products',
      method: 'POST',
    });
    expect(Array.isArray(response.body.message)).toBe(true);
  });

  it('rejects a payload with more than 10 attributes', async () => {
    const attributes = Array.from({ length: 11 }, (_, i) => ({
      name: `attr${i}`,
      value: 'v',
    }));

    await request(app.getHttpServer())
      .post('/api/products')
      .send({
        name: 'Overflow product',
        pictureUrl: 'https://example.com/x.png',
        price: 1,
        attributes,
      })
      .expect(400);
  });

  it('creates, lists, fetches, deactivates, and reactivates a product', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/products')
      .send({
        name: 'E2E Test Product',
        pictureUrl: 'https://example.com/e2e.png',
        price: 42.5,
        attributes: [
          { name: 'Color', value: 'Green' },
          { name: 'Size', value: 'L' },
        ],
      })
      .expect(201);

    const product = createResponse.body;
    createdProductIds.push(product.id);

    expect(product).toMatchObject({
      name: 'E2E Test Product',
      price: 42.5,
      isActive: true,
    });
    expect(product.attributes.map((a: { name: string }) => a.name)).toEqual([
      'Color',
      'Size',
    ]);

    const listResponse = await request(app.getHttpServer())
      .get('/api/products')
      .expect(200);
    expect(
      listResponse.body.data.some((p: { id: string }) => p.id === product.id),
    ).toBe(true);

    await request(app.getHttpServer())
      .get(`/api/products/${product.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/products/${product.id}/deactivate`)
      .expect(200)
      .expect((res) => {
        expect(res.body.isActive).toBe(false);
      });

    const activeListAfterDeactivate = await request(app.getHttpServer())
      .get('/api/products')
      .expect(200);
    expect(
      activeListAfterDeactivate.body.data.some(
        (p: { id: string }) => p.id === product.id,
      ),
    ).toBe(false);

    const inactiveList = await request(app.getHttpServer())
      .get('/api/products?status=inactive')
      .expect(200);
    expect(
      inactiveList.body.data.some((p: { id: string }) => p.id === product.id),
    ).toBe(true);

    await request(app.getHttpServer())
      .patch(`/api/products/${product.id}/activate`)
      .expect(200)
      .expect((res) => {
        expect(res.body.isActive).toBe(true);
      });
  });

  it('returns 404 for an unknown product id', async () => {
    await request(app.getHttpServer())
      .get('/api/products/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('returns 400 for a non-uuid product id', async () => {
    await request(app.getHttpServer())
      .get('/api/products/not-a-uuid')
      .expect(400);
  });
});
