-- Enable full-text search on products using tsvector

-- 1. Add tsvector column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
) STORED;

-- 2. Create GIN index for fast search
CREATE INDEX IF NOT EXISTS idx_products_search_vector
ON products
USING GIN(search_vector);

-- 3. Drop the old function and trigger if they exist
DROP FUNCTION IF EXISTS update_product_search_vector CASCADE;

-- Note: The column is GENERATED ALWAYS AS STORED, so it auto-updates.
-- No trigger needed.
