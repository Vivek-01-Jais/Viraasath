-- Cart persistence: anonymous carts stored by session_id, user carts by user_id

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT cart_owner_check CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id) WHERE session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cart_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);

ALTER TABLE IF EXISTS public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carts ENABLE ROW LEVEL SECURITY;

-- Allow users to read/write their own cart
DROP POLICY IF EXISTS cart_select_own ON carts;
CREATE POLICY cart_select_own ON carts
  FOR SELECT USING (user_id = auth.uid() OR session_id = current_setting('request.session_id', true));

DROP POLICY IF EXISTS cart_insert_own ON carts;
CREATE POLICY cart_insert_own ON carts
  FOR INSERT WITH CHECK (user_id = auth.uid() OR session_id = current_setting('request.session_id', true));

DROP POLICY IF EXISTS cart_update_own ON carts;
CREATE POLICY cart_update_own ON carts
  FOR UPDATE USING (user_id = auth.uid() OR session_id = current_setting('request.session_id', true));

DROP POLICY IF EXISTS cart_delete_own ON carts;
CREATE POLICY cart_delete_own ON carts
  FOR DELETE USING (user_id = auth.uid() OR session_id = current_setting('request.session_id', true));

-- Cart items inherit cart ownership
DROP POLICY IF EXISTS cart_items_select_own ON cart_items;
CREATE POLICY cart_items_select_own ON cart_items
  FOR SELECT USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid() OR session_id = current_setting('request.session_id', true))
  );

DROP POLICY IF EXISTS cart_items_insert_own ON cart_items;
CREATE POLICY cart_items_insert_own ON cart_items
  FOR INSERT WITH CHECK (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid() OR session_id = current_setting('request.session_id', true))
  );

DROP POLICY IF EXISTS cart_items_update_own ON cart_items;
CREATE POLICY cart_items_update_own ON cart_items
  FOR UPDATE USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid() OR session_id = current_setting('request.session_id', true))
  );

DROP POLICY IF EXISTS cart_items_delete_own ON cart_items;
CREATE POLICY cart_items_delete_own ON cart_items
  FOR DELETE USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid() OR session_id = current_setting('request.session_id', true))
  );
