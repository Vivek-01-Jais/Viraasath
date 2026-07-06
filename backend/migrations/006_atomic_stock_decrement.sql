CREATE OR REPLACE FUNCTION atomic_decrement_stock(variant_id UUID, qty INT)
RETURNS INT AS $$
DECLARE
  new_stock INT;
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity - qty
  WHERE id = variant_id AND stock_quantity >= qty
  RETURNING stock_quantity INTO new_stock;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  RETURN new_stock;
END;
$$ LANGUAGE plpgsql;
