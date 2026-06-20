-- Viraasat - Sample Product Data

-- CATEGORIES
INSERT INTO categories (name, slug, description) VALUES
  ('Kurtis', 'kurtis', 'Classic and contemporary kurtis for everyday elegance'),
  ('Anarkalis', 'anarkalis', 'Floor-length anarkali suits for festive occasions'),
  ('Tunics', 'tunics', 'Stylish tunics perfect for work and casual outings'),
  ('Ethnic Sets', 'ethnic-sets', 'Coordinated ethnic sets — kurti with dupatta or palazzo'),
  ('Palazzo Sets', 'palazzo-sets', 'Comfortable kurti with palazzo pants for a modern look');

-- PRODUCTS (women's kurtis)
INSERT INTO products (name, slug, description, price, compare_at_price, category_id, material, care_instructions, is_featured) VALUES
  ('Rose印花 Kurti', 'rose-print-kurti', 'Beautiful rose-printed cotton kurti with subtle embroidery on the neckline. Perfect for daily wear with a touch of elegance.', 1299, 1799, (SELECT id FROM categories WHERE slug='kurtis'), 'Pure Cotton', 'Machine wash cold, gentle cycle. Do not bleach. Iron on medium heat.', TRUE),
  ('Royal Blue Anarkali', 'royal-blue-anarkali', 'Stunning royal blue anarkali suit with intricate thread work and sequin detailing. Features a round neckline and three-quarter sleeves.', 2499, 3499, (SELECT id FROM categories WHERE slug='anarkalis'), 'Georgette', 'Dry clean only. Store in a cool dry place.', TRUE),
  ('White Cotton Tunics', 'white-cotton-tunic', 'Crisp white cotton tunic with hand-block print detailing. Lightweight and breathable for summer days.', 999, 1499, (SELECT id FROM categories WHERE slug='tunics'), 'Handloom Cotton', 'Machine wash gentle. Use mild detergent. Dry in shade.', FALSE),
  ('Green Palazzo Set', 'green-palazzo-set', 'Elegant sage green kurti paired with matching palazzo pants. The set includes a printed dupatta for a complete ethnic look.', 1999, 2799, (SELECT id FROM categories WHERE slug='palazzo-sets'), 'Rayon', 'Hand wash cold. Do not wring. Iron on low heat.', TRUE),
  ('Maroon Embroidered Kurti', 'maroon-embroidered-kurti', 'Rich maroon kurti with heavy thread embroidery on the yoke. Features delicate mirror work accents.', 1799, 2499, (SELECT id FROM categories WHERE slug='kurtis'), 'Silk Cotton', 'Dry clean recommended. Can be hand washed in cold water.', TRUE),
  ('Teal Blue Ethnic Set', 'teal-blue-ethnic-set', 'Teal blue kurti with matching dupatta and churidar pants. The set features subtle gota patti work on the borders.', 2999, 3999, (SELECT id FROM categories WHERE slug='ethnic-sets'), 'Chanderi Silk', 'Dry clean only. Iron while slightly damp.', TRUE),
  ('Peach Party Wear Kurti', 'peach-party-wear-kurti', 'Peach-colored kurti in luxe fabric with stone embellishments on the neckline. Ideal for parties and festive gatherings.', 2199, 2999, (SELECT id FROM categories WHERE slug='kurtis'), 'Art Silk', 'Dry clean only. Keep away from sharp objects to prevent snagging.', FALSE),
  ('Navy Blue Printed Tunic', 'navy-blue-printed-tunic', 'Navy blue tunic with intricate digital print design. Features side slits and a mandarin collar.', 1199, 1699, (SELECT id FROM categories WHERE slug='tunics'), 'Viscose', 'Machine wash cold. Tumble dry low. Do not bleach.', FALSE),
  ('Pink Floral Anarkali', 'pink-floral-anarkali', 'Beautiful pink anarkali with all-over floral print and lace detailing at the hem. Lightweight and flowy.', 2699, 3599, (SELECT id FROM categories WHERE slug='anarkalis'), 'Crepe', 'Hand wash separately. Dry in shade. Iron on medium.', TRUE),
  ('Black Cotton Kurti', 'black-cotton-kurti', 'Classic black cotton kurti with gold thread border work. Versatile piece that pairs with any bottom wear.', 1399, 1899, (SELECT id FROM categories WHERE slug='kurtis'), 'Cotton Silk', 'Machine wash gentle. Use color catcher sheet. Iron warm.', FALSE),
  ('Yellow Palazzo Set', 'yellow-palazzo-set', 'Bright yellow kurti with printed palazzo pants. The vibrant color makes it perfect for daytime festivities.', 1799, 2299, (SELECT id FROM categories WHERE slug='palazzo-sets'), 'Cotton Lycra', 'Machine wash cold. Do not soak for long. Dry in shade.', FALSE),
  ('Lavender Anarkali', 'lavender-anarkali', 'Soft lavender anarkali with delicate zari work and a matching dupatta. Features a keyhole neckline.', 3199, 4299, (SELECT id FROM categories WHERE slug='anarkalis'), 'Net & Silk', 'Dry clean only. Handle with care. Store in muslin cloth.', TRUE);

-- VARIANTS (sizes for each product)
DO $$
DECLARE
  prod RECORD;
  size TEXT;
  sizes TEXT[] := ARRAY['S', 'M', 'L', 'XL', 'XXL'];
  colors TEXT[] := ARRAY['As Shown', 'Same as image'];
  color_hex TEXT[] := ARRAY['#666666', '#666666'];
  base_stock INTEGER;
BEGIN
  FOR prod IN SELECT * FROM products LOOP
    FOREACH size IN ARRAY sizes LOOP
      base_stock := floor(random() * 15 + 5)::INTEGER;
      INSERT INTO product_variants (product_id, size, color, color_hex, sku, stock_quantity)
      VALUES (prod.id, size, colors[1], color_hex[1],
              'VIR-' || upper(replace(prod.slug, '-', '')) || '-' || size,
              base_stock);
    END LOOP;
  END LOOP;
END $$;

-- IMAGES (using placeholder images)
DO $$
DECLARE
  prod RECORD;
  img_idx INTEGER;
  img_count INTEGER;
BEGIN
  FOR prod IN SELECT * FROM products LOOP
    img_count := floor(random() * 2 + 2)::INTEGER;
    FOR img_idx IN 1..img_count LOOP
      INSERT INTO product_images (product_id, url, alt_text, position)
      VALUES (
        prod.id,
        'https://placehold.co/600x800/EEE/999?text=' || replace(prod.name, ' ', '+') || '+' || img_idx,
        prod.name || ' - View ' || img_idx,
        img_idx
      );
    END LOOP;
  END LOOP;
END $$;
