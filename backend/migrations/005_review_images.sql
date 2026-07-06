ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_reviews_product_id_approved ON reviews(product_id, is_approved);
