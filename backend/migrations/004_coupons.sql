-- Coupon/discount system

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_cart_value DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

INSERT INTO coupons (code, discount_type, discount_value, min_cart_value, max_discount, usage_limit, is_active)
VALUES ('VIRASAT10', 'percentage', 10, 0, 500, NULL, true)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY coupons_select_active ON coupons FOR SELECT USING (is_active = true);
