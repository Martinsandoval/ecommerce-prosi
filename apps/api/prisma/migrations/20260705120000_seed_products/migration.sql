-- Seeds a starter product catalog so the storefront has data the first
-- time the app runs. Runs once via `prisma migrate deploy` and is then
-- tracked in _prisma_migrations, so it never re-applies on later starts.
WITH inserted_products AS (
  INSERT INTO "products" ("id", "name", "picture_url", "price", "is_active", "created_at", "updated_at")
  VALUES
    (gen_random_uuid(), 'Classic Cotton T-Shirt', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 19.99, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Slim Fit Denim Jeans', 'https://images.unsplash.com/photo-1542272604-787c3835535d', 49.50, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Running Sneakers', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 89.99, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Leather Belt', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', 24.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Wool Blend Overcoat', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3', 149.99, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Canvas Tote Bag', 'https://images.unsplash.com/photo-1591561954557-26941169b49e', 15.50, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Discontinued Wool Scarf', 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9', 12.00, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Last Season Baseball Cap', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b', 9.99, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING "id", "name"
)
INSERT INTO "product_attributes" ("id", "name", "value", "position", "product_id", "created_at")
SELECT gen_random_uuid(), attr.name, attr.value, attr.position, p.id, CURRENT_TIMESTAMP
FROM inserted_products p
JOIN (VALUES
  ('Classic Cotton T-Shirt', 'Color', 'White', 0),
  ('Classic Cotton T-Shirt', 'Size', 'M', 1),
  ('Classic Cotton T-Shirt', 'Material', 'Cotton', 2),

  ('Slim Fit Denim Jeans', 'Color', 'Indigo', 0),
  ('Slim Fit Denim Jeans', 'Size', '32x32', 1),
  ('Slim Fit Denim Jeans', 'Fit', 'Slim', 2),

  ('Running Sneakers', 'Color', 'Black/Red', 0),
  ('Running Sneakers', 'Size', '10 US', 1),
  ('Running Sneakers', 'Material', 'Mesh', 2),

  ('Leather Belt', 'Color', 'Brown', 0),
  ('Leather Belt', 'Material', 'Genuine Leather', 1),

  ('Wool Blend Overcoat', 'Color', 'Charcoal', 0),
  ('Wool Blend Overcoat', 'Size', 'L', 1),
  ('Wool Blend Overcoat', 'Material', 'Wool Blend', 2),

  ('Canvas Tote Bag', 'Color', 'Natural', 0),
  ('Canvas Tote Bag', 'Material', 'Canvas', 1),

  ('Discontinued Wool Scarf', 'Color', 'Grey', 0),
  ('Discontinued Wool Scarf', 'Material', 'Wool', 1),

  ('Last Season Baseball Cap', 'Color', 'Navy', 0)
) AS attr("product_name", "name", "value", "position") ON attr."product_name" = p."name";
