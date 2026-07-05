import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedAttribute {
  name: string;
  value: string;
}

interface SeedProduct {
  name: string;
  pictureUrl: string;
  price: number;
  isActive: boolean;
  attributes: SeedAttribute[];
}

const products: SeedProduct[] = [
  {
    name: 'Classic Cotton T-Shirt',
    pictureUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    price: 19.99,
    isActive: true,
    attributes: [
      { name: 'Color', value: 'White' },
      { name: 'Size', value: 'M' },
      { name: 'Material', value: 'Cotton' },
    ],
  },
  {
    name: 'Slim Fit Denim Jeans',
    pictureUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
    price: 49.5,
    isActive: true,
    attributes: [
      { name: 'Color', value: 'Indigo' },
      { name: 'Size', value: '32x32' },
      { name: 'Fit', value: 'Slim' },
    ],
  },
  {
    name: 'Running Sneakers',
    pictureUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    price: 89.99,
    isActive: true,
    attributes: [
      { name: 'Color', value: 'Black/Red' },
      { name: 'Size', value: '10 US' },
      { name: 'Material', value: 'Mesh' },
    ],
  },
  {
    name: 'Leather Belt',
    pictureUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
    price: 24.0,
    isActive: true,
    attributes: [
      { name: 'Color', value: 'Brown' },
      { name: 'Material', value: 'Genuine Leather' },
    ],
  },
  {
    name: 'Wool Blend Overcoat',
    pictureUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3',
    price: 149.99,
    isActive: true,
    attributes: [
      { name: 'Color', value: 'Charcoal' },
      { name: 'Size', value: 'L' },
      { name: 'Material', value: 'Wool Blend' },
    ],
  },
  {
    name: 'Canvas Tote Bag',
    pictureUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e',
    price: 15.5,
    isActive: true,
    attributes: [
      { name: 'Color', value: 'Natural' },
      { name: 'Material', value: 'Canvas' },
    ],
  },
  {
    name: 'Discontinued Wool Scarf',
    pictureUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9',
    price: 12.0,
    isActive: false,
    attributes: [
      { name: 'Color', value: 'Grey' },
      { name: 'Material', value: 'Wool' },
    ],
  },
  {
    name: 'Last Season Baseball Cap',
    pictureUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b',
    price: 9.99,
    isActive: false,
    attributes: [{ name: 'Color', value: 'Navy' }],
  },
];

async function main(): Promise<void> {
  for (const product of products) {
    await prisma.product.create({
      data: {
        name: product.name,
        pictureUrl: product.pictureUrl,
        price: product.price,
        isActive: product.isActive,
        attributes: {
          create: product.attributes.map((attribute, index) => ({
            name: attribute.name,
            value: attribute.value,
            position: index,
          })),
        },
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
