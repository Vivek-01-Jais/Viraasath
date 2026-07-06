-- Fix product images to use reliable placeholder URLs
-- Run this in Supabase SQL Editor if images don't load

-- Delete existing placeholder images
DELETE FROM product_images;

-- Insert new images with reliable URLs
INSERT INTO product_images (product_id, url, alt_text, position)
SELECT 
  p.id,
  'https://picsum.photos/seed/' || p.slug || '1/600/800',
  p.name || ' - Front View',
  1
FROM products p;

INSERT INTO product_images (product_id, url, alt_text, position)
SELECT 
  p.id,
  'https://picsum.photos/seed/' || p.slug || '2/600/800',
  p.name || ' - Back View',
  2
FROM products p;
