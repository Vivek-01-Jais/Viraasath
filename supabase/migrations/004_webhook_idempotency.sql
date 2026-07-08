-- Prevent duplicate webhook processing
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD CONSTRAINT uq_razorpay_payment_id UNIQUE NULLS NOT DISTINCT (razorpay_payment_id);

-- Create index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
