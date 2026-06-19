-- Viraasat - Complete Database Schema for Women's Kurti Brand

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- PROFILES (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  material TEXT,
  care_instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCT VARIANTS (size + color + stock)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  color_hex TEXT,
  sku TEXT UNIQUE,
  price DECIMAL(10,2) CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCT IMAGES
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADDRESSES
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CARTS
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CART ITEMS
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  razorpay_order_id TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_name TEXT NOT NULL,
  variant_size TEXT,
  variant_color TEXT
);

-- REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WISHLIST
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_product ON wishlist_items(product_id);
CREATE INDEX idx_cart_user ON carts(user_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ============================================
-- AUTO-PROFILE CREATION TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- PROFILES: users can read/update own profile; admins can read all
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES: public read, admin write
CREATE POLICY categories_select_all ON categories FOR SELECT USING (TRUE);
CREATE POLICY categories_insert_admin ON categories FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY categories_update_admin ON categories FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY categories_delete_admin ON categories FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- PRODUCTS: public read, admin write
CREATE POLICY products_select_all ON products FOR SELECT USING (TRUE);
CREATE POLICY products_insert_admin ON products FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY products_update_admin ON products FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY products_delete_admin ON products FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- VARIANTS: public read, admin write
CREATE POLICY variants_select_all ON product_variants FOR SELECT USING (TRUE);
CREATE POLICY variants_insert_admin ON product_variants FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY variants_update_admin ON product_variants FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY variants_delete_admin ON product_variants FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- IMAGES: public read, admin write
CREATE POLICY images_select_all ON product_images FOR SELECT USING (TRUE);
CREATE POLICY images_insert_admin ON product_images FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY images_update_admin ON product_images FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY images_delete_admin ON product_images FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ADDRESSES: user owns their addresses
CREATE POLICY addresses_select_own ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY addresses_insert_own ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY addresses_update_own ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY addresses_delete_own ON addresses FOR DELETE USING (auth.uid() = user_id);

-- CARTS: user owns their cart
CREATE POLICY carts_select_own ON carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY carts_insert_own ON carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY carts_update_own ON carts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY carts_delete_own ON carts FOR DELETE USING (auth.uid() = user_id);

-- CART ITEMS: user owns items via cart
CREATE POLICY cart_items_select_own ON cart_items FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id)
);
CREATE POLICY cart_items_insert_own ON cart_items FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id)
);
CREATE POLICY cart_items_update_own ON cart_items FOR UPDATE USING (
  auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id)
);
CREATE POLICY cart_items_delete_own ON cart_items FOR DELETE USING (
  auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id)
);

-- ORDERS: user owns orders, admins can see all
CREATE POLICY orders_select_own ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY orders_insert_own ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY orders_select_admin ON orders FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY orders_update_admin ON orders FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ORDER ITEMS: user owns items via order, admins can see all
CREATE POLICY order_items_select_own ON order_items FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM orders WHERE id = order_id)
);
CREATE POLICY order_items_insert_own ON order_items FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM orders WHERE id = order_id)
);
CREATE POLICY order_items_select_admin ON order_items FOR SELECT USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- REVIEWS: public read, authenticated user can insert/update own, admin can moderate
CREATE POLICY reviews_select_all ON reviews FOR SELECT USING (TRUE);
CREATE POLICY reviews_insert_own ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY reviews_update_own ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY reviews_update_admin ON reviews FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY reviews_delete_admin ON reviews FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- WISHLIST: user owns their wishlist
CREATE POLICY wishlist_select_own ON wishlist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY wishlist_insert_own ON wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY wishlist_delete_own ON wishlist_items FOR DELETE USING (auth.uid() = user_id);
