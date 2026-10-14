-- ============================================================================
-- KARNAM VARI FARMS - PRODUCTION DATABASE SCHEMA & MIGRATIONS
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SEQUENCES FOR ORDER ID (AKFARMS00001 format)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
DECLARE
  next_val BIGINT;
BEGIN
  next_val := nextval('order_number_seq');
  RETURN 'AKFARMS' || LPAD(next_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. PROFILES & ADMIN ROLES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price >= base_price),
  discount_percentage INT DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  weight_or_size TEXT NOT NULL, -- e.g. "250g", "500ml"
  ingredients TEXT,
  storage_instructions TEXT,
  shelf_life TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCT VARIANTS (different package sizes e.g. 100g, 250g, 500g, 1kg, 1L)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g. "500 Grams", "1 Litre"
  weight_or_size TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10, 2) DEFAULT 0,
  max_discount_amount NUMERIC(10, 2),
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  usage_limit INT,
  per_customer_limit INT DEFAULT 1,
  total_used_count INT DEFAULT 0,
  total_discount_granted NUMERIC(12, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE, -- AKFARMS00001
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL, -- { line1, line2, city, state, pincode, landmark }
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount_amount NUMERIC(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
  delivery_charge NUMERIC(10, 2) DEFAULT 0 CHECK (delivery_charge >= 0),
  final_total NUMERIC(10, 2) NOT NULL CHECK (final_total >= 0),
  coupon_code TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'simulated_online', 'upi', 'card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN (
    'pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'
  )),
  courier_name TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ORDER ITEMS (Immutable snapshots of product details at checkout)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_title TEXT NOT NULL,
  category_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. COUPON USAGES
CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  discount_applied NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. INVENTORY LOGS
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  change_quantity INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reason TEXT NOT NULL, -- e.g. "order_placed", "manual_adjustment", "restock"
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. ANALYTICS SESSIONS & EVENTS
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  visitor_id TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'session_start', 'page_view', 'product_view', 'category_view', 'add_to_cart', 'checkout_start', 'order_placed'
  )),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  order_id TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. NEWSLETTER & CONTACT
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. STORE SETTINGS
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. ATOMIC STORE PROCEDURES (RPCs)

-- Atomic Order Creation Function with Concurrency Lock and Inventory Validation
CREATE OR REPLACE FUNCTION place_order_atomic(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_shipping_address JSONB,
  p_payment_method TEXT,
  p_items JSONB, -- array of { product_id, variant_id, quantity }
  p_coupon_code TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order_id TEXT;
  v_new_order_uuid UUID;
  v_subtotal NUMERIC(10, 2) := 0;
  v_discount NUMERIC(10, 2) := 0;
  v_delivery_charge NUMERIC(10, 2) := 0;
  v_final_total NUMERIC(10, 2) := 0;
  v_coupon_record RECORD;
  v_item RECORD;
  v_product RECORD;
  v_variant RECORD;
  v_item_subtotal NUMERIC(10, 2);
  v_category_name TEXT;
BEGIN
  -- Generate unique sequential Order ID (AKFARMS00001)
  v_order_id := generate_order_id();

  -- Iterate through items to validate prices, inventory, and calculate true subtotal
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id UUID,
    variant_id UUID,
    quantity INT
  )
  LOOP
    IF v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Item quantity must be greater than zero';
    END IF;

    -- Lock variant row FOR UPDATE to prevent race condition overselling
    SELECT * INTO v_variant FROM product_variants 
    WHERE id = v_item.variant_id FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variant not found';
    END IF;

    IF v_variant.stock_quantity < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for %', v_variant.title;
    END IF;

    -- Fetch parent product
    SELECT p.*, c.name as category_name INTO v_product 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = v_item.product_id;

    IF NOT FOUND OR NOT v_product.is_active THEN
      RAISE EXCEPTION 'Product is not available';
    END IF;

    v_item_subtotal := v_variant.price * v_item.quantity;
    v_subtotal := v_subtotal + v_item_subtotal;
  END LOOP;

  -- Validate coupon if provided
  IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) <> '' THEN
    SELECT * INTO v_coupon_record FROM coupons 
    WHERE UPPER(code) = UPPER(TRIM(p_coupon_code)) AND is_active = TRUE;

    IF FOUND THEN
      IF (v_coupon_record.valid_to IS NULL OR v_coupon_record.valid_to >= NOW()) AND
         (v_coupon_record.min_order_amount IS NULL OR v_subtotal >= v_coupon_record.min_order_amount) AND
         (v_coupon_record.usage_limit IS NULL OR v_coupon_record.total_used_count < v_coupon_record.usage_limit) THEN
        
        IF v_coupon_record.discount_type = 'percentage' THEN
          v_discount := (v_subtotal * v_coupon_record.discount_value) / 100.0;
          IF v_coupon_record.max_discount_amount IS NOT NULL AND v_discount > v_coupon_record.max_discount_amount THEN
            v_discount := v_coupon_record.max_discount_amount;
          END IF;
        ELSE
          v_discount := v_coupon_record.discount_value;
        END IF;

        IF v_discount > v_subtotal THEN
          v_discount := v_subtotal;
        END IF;
      END IF;
    END IF;
  END IF;

  -- Delivery charge logic: Free shipping over ₹999, else ₹70 standard
  IF (v_subtotal - v_discount) >= 999 THEN
    v_delivery_charge := 0;
  ELSE
    v_delivery_charge := 70;
  END IF;

  v_final_total := v_subtotal - v_discount + v_delivery_charge;

  -- Insert order
  INSERT INTO orders (
    order_id, customer_name, customer_email, customer_phone,
    shipping_address, subtotal, discount_amount, delivery_charge,
    final_total, coupon_code, payment_method, payment_status, order_status
  ) VALUES (
    v_order_id, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, v_subtotal, v_discount, v_delivery_charge,
    v_final_total, p_coupon_code, p_payment_method, 
    CASE WHEN p_payment_method = 'simulated_online' THEN 'completed' ELSE 'pending' END,
    'confirmed'
  ) RETURNING id INTO v_new_order_uuid;

  -- Insert Order Items and decrement stock
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id UUID,
    variant_id UUID,
    quantity INT
  )
  LOOP
    SELECT * INTO v_variant FROM product_variants WHERE id = v_item.variant_id;
    SELECT p.*, c.name as category_name INTO v_product 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = v_item.product_id;

    -- Decrement variant stock
    UPDATE product_variants 
    SET stock_quantity = stock_quantity - v_item.quantity 
    WHERE id = v_item.variant_id;

    -- Decrement overall product stock
    UPDATE products 
    SET stock_quantity = GREATEST(0, stock_quantity - v_item.quantity) 
    WHERE id = v_item.product_id;

    -- Record inventory change log
    INSERT INTO inventory_logs (
      product_id, variant_id, change_quantity, previous_stock, new_stock, reason
    ) VALUES (
      v_item.product_id, v_item.variant_id, -v_item.quantity, 
      v_variant.stock_quantity, v_variant.stock_quantity - v_item.quantity,
      'order_placed:' || v_order_id
    );

    -- Insert snapshot item
    INSERT INTO order_items (
      order_id, product_id, variant_id, product_name, variant_title,
      category_name, sku, unit_price, quantity, total_price, image_url
    ) VALUES (
      v_new_order_uuid, v_item.product_id, v_item.variant_id,
      v_product.name, v_variant.title, COALESCE(v_product.category_name, 'General'),
      v_variant.sku, v_variant.price, v_item.quantity,
      v_variant.price * v_item.quantity,
      (SELECT image_url FROM product_images WHERE product_id = v_item.product_id AND is_primary = TRUE LIMIT 1)
    );
  END LOOP;

  -- Update coupon usage count if used
  IF v_coupon_record.id IS NOT NULL AND v_discount > 0 THEN
    UPDATE coupons 
    SET total_used_count = total_used_count + 1,
        total_discount_granted = total_discount_granted + v_discount
    WHERE id = v_coupon_record.id;

    INSERT INTO coupon_usages (coupon_id, order_id, customer_email, discount_applied)
    VALUES (v_coupon_record.id, v_new_order_uuid, p_customer_email, v_discount);
  END IF;

  -- Record initial status history
  INSERT INTO order_status_history (order_id, status, note, updated_by)
  VALUES (v_new_order_uuid, 'confirmed', 'Order successfully placed by customer', 'system');

  RETURN jsonb_build_object(
    'success', true,
    'order_uuid', v_new_order_uuid,
    'order_id', v_order_id,
    'final_total', v_final_total,
    'discount', v_discount,
    'delivery_charge', v_delivery_charge
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Categories: Public read active, Admin all
CREATE POLICY "Public can view active categories" ON categories 
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins have full access to categories" ON categories 
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() IN (SELECT user_id FROM admin_users));

-- Products: Public read active, Admin all
CREATE POLICY "Public can view active products" ON products 
  FOR SELECT USING (is_active = TRUE AND is_archived = FALSE);
CREATE POLICY "Admins have full access to products" ON products 
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() IN (SELECT user_id FROM admin_users));

-- Product Variants & Images: Public read, Admin all
CREATE POLICY "Public can view variants" ON product_variants 
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins have full access to variants" ON product_variants 
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Public can view product images" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "Admins have full access to images" ON product_images 
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() IN (SELECT user_id FROM admin_users));

-- Orders: Customer can view their own orders or by order_id lookup with matching email/phone; Admins view all
CREATE POLICY "Users can view own orders" ON orders 
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND customer_id = auth.uid()) OR
    auth.uid() IN (SELECT user_id FROM admin_users) OR
    auth.jwt() ->> 'role' = 'service_role'
  );
CREATE POLICY "Admins can update orders" ON orders 
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admin_users) OR auth.jwt() ->> 'role' = 'service_role');

-- Order Items
CREATE POLICY "Users can view items of permitted orders" ON order_items 
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()) OR
    auth.uid() IN (SELECT user_id FROM admin_users) OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Coupons: Public read active coupons to apply code, Admins full access
CREATE POLICY "Public can read active coupons" ON coupons 
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins have full access to coupons" ON coupons 
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users) OR auth.jwt() ->> 'role' = 'service_role');

-- Reviews: Public read approved, authenticated or guest insert, admin moderate
CREATE POLICY "Public can read approved reviews" ON reviews 
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can submit a review" ON reviews 
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins can manage reviews" ON reviews 
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users) OR auth.jwt() ->> 'role' = 'service_role');

-- Analytics: Public can insert events, Admins can read
CREATE POLICY "Public can insert analytics events" ON analytics_events FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins can read analytics events" ON analytics_events 
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users) OR auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Public can insert sessions" ON analytics_sessions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins can read sessions" ON analytics_sessions 
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users) OR auth.jwt() ->> 'role' = 'service_role');

-- Newsletter & Contact: Anyone can submit
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Anyone can send contact message" ON contact_messages FOR INSERT WITH CHECK (TRUE);
