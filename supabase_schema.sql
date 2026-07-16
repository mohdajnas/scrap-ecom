-- Patshell Trading - Supabase Database Schema

-- Custom Types
CREATE TYPE user_role AS ENUM ('buyer', 'super_admin');
CREATE TYPE product_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE order_status AS ENUM ('created', 'placed', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE product_condition AS ENUM ('new', 'used');

-- 1. Profiles Table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  city TEXT,
  role user_role DEFAULT 'buyer'::user_role NOT NULL,
  is_banned BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Authentication Triggers & Functions

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    'buyer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to prevent role escalation
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is changing, ensure the person doing the changing is a super_admin
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- auth.uid() returns the current user ID
    -- We must check if the current user is a super_admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
    ) THEN
      RAISE EXCEPTION 'Unauthorized: Only super admins can change user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_role_escalation();


-- 2. Categories Table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  condition product_condition NOT NULL,
  vehicle_make TEXT,
  vehicle_model TEXT,
  stock_qty INTEGER DEFAULT 1 NOT NULL,
  status product_status DEFAULT 'pending'::product_status NOT NULL,
  rejection_reason TEXT,
  images TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  avg_rating DECIMAL(3,2) DEFAULT 0 NOT NULL,
  review_count INTEGER DEFAULT 0 NOT NULL,
  fts tsvector GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || description)) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX products_fts_idx ON products USING GIN (fts);

-- 4. Orders Table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'placed'::order_status NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Order Items Table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  price_at_time DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Cart Items Table
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(buyer_id, product_id)
);

-- 7. Payment Events Table (Webhook idempotency)
CREATE TABLE payment_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razorpay_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Admin Audit Log
CREATE TABLE admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Reviews Table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE NOT NULL UNIQUE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to update product rating automatically
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products
    SET avg_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE product_id = NEW.product_id
    ),
    review_count = review_count + 1
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products
    SET avg_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE product_id = OLD.product_id
    ), 0),
    review_count = review_count - 1
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change
AFTER INSERT OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- RLS Policies Setup

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles (for seller info), but only update their own.
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: Anyone can read categories
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Products: Viewable if approved OR if the user is the seller.
CREATE POLICY "Approved products are viewable by everyone" ON products FOR SELECT USING (status = 'approved');
CREATE POLICY "Sellers can view their own products" ON products FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can insert their own products" ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their own products" ON products FOR UPDATE USING (auth.uid() = seller_id);

-- Orders: Users can only see and update their own orders.
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update their own orders" ON orders FOR UPDATE USING (auth.uid() = buyer_id);

-- Order Items: Viewable if the user owns the order.
CREATE POLICY "Users can view items of their orders" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);
CREATE POLICY "Users can insert items for their orders" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);

-- Cart Items: Users can only see and manage their own cart
CREATE POLICY "Users can view their own cart items" ON cart_items FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can insert their own cart items" ON cart_items FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update their own cart items" ON cart_items FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "Users can delete their own cart items" ON cart_items FOR DELETE USING (auth.uid() = buyer_id);

-- Note: Super Admins bypass RLS using the service_role key on the backend.

-- Admin Audit Log: Super admins can read and insert
CREATE POLICY "Super admins can read audit log" ON admin_audit_log FOR SELECT USING (is_super_admin());
CREATE POLICY "Super admins can insert audit log" ON admin_audit_log FOR INSERT WITH CHECK (is_super_admin());

-- Reviews: Public can read, buyers can insert if they own a delivered order item
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can insert review if order is delivered" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND 
  EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.id = order_item_id 
      AND o.buyer_id = auth.uid() 
      AND o.status = 'delivered'
  )
);

-- 10. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated' AND
  (storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'png' OR storage.extension(name) = 'webp') AND
  length(COALESCE(metadata->>'size', '0')::text) < 10 -- simplistic length check for size or use real limits if available
);
CREATE POLICY "Super admin can delete images" ON storage.objects FOR DELETE USING (
  bucket_id = 'product-images' AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);
