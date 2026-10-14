-- ============================================================================
-- KARNAM VARI FARMS - SCHEMA, RPCs, AND ROW LEVEL SECURITY
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN 'AKFARMS' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Privileged admin roster. Clients cannot insert rows (no INSERT policy).
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
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

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price IS NULL OR original_price >= base_price),
  discount_percentage INT DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  weight_or_size TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  weight_or_size TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupons (
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

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount_amount NUMERIC(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
  delivery_charge NUMERIC(10, 2) DEFAULT 0 CHECK (delivery_charge >= 0),
  final_total NUMERIC(10, 2) NOT NULL CHECK (final_total >= 0),
  coupon_code TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'simulated_online', 'upi', 'card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN (
    'pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery',
    'delivered', 'cancelled', 'return_requested', 'returned'
  )),
  courier_name TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
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

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  discount_applied NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  change_quantity INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reason TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  visitor_id TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'session_start', 'page_view', 'product_view', 'category_view', 'add_to_cart', 'checkout_start', 'order_placed'
  )),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  order_id TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_categories_updated ON public.categories;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated ON public.orders;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_coupons_updated ON public.coupons;
CREATE TRIGGER trg_coupons_updated BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- ADMIN CHECK (SECURITY DEFINER — avoids RLS recursion)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- CHECKOUT RPC
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.place_order_atomic(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_shipping_address JSONB,
  p_payment_method TEXT,
  p_items JSONB,
  p_coupon_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  v_settings JSONB;
  v_free_threshold NUMERIC := 999;
  v_shipping_fee NUMERIC := 70;
  v_order JSONB;
  v_items JSONB;
  v_history JSONB;
BEGIN
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  SELECT value INTO v_settings FROM public.store_settings WHERE key = 'shipping';
  IF v_settings IS NOT NULL THEN
    v_free_threshold := COALESCE((v_settings->>'free_shipping_threshold')::NUMERIC, 999);
    v_shipping_fee := COALESCE((v_settings->>'standard_fee')::NUMERIC, 70);
  END IF;

  v_order_id := public.generate_order_id();

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id UUID,
    variant_id UUID,
    quantity INT
  )
  LOOP
    IF v_item.quantity IS NULL OR v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Item quantity must be greater than zero';
    END IF;

    SELECT * INTO v_variant FROM public.product_variants
    WHERE id = v_item.variant_id FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variant not found';
    END IF;

    IF v_variant.stock_quantity < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for %', v_variant.title;
    END IF;

    SELECT p.*, c.name AS category_name INTO v_product
    FROM public.products p
    LEFT JOIN public.categories c ON p.category_id = c.id
    WHERE p.id = v_item.product_id;

    IF NOT FOUND OR NOT v_product.is_active OR v_product.is_archived THEN
      RAISE EXCEPTION 'Product is not available';
    END IF;

    v_subtotal := v_subtotal + (v_variant.price * v_item.quantity);
  END LOOP;

  IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) <> '' THEN
    SELECT * INTO v_coupon_record FROM public.coupons
    WHERE UPPER(code) = UPPER(TRIM(p_coupon_code)) AND is_active = TRUE;

    IF FOUND THEN
      IF (v_coupon_record.valid_to IS NULL OR v_coupon_record.valid_to >= NOW())
         AND (v_coupon_record.min_order_amount IS NULL OR v_subtotal >= v_coupon_record.min_order_amount)
         AND (v_coupon_record.usage_limit IS NULL OR v_coupon_record.total_used_count < v_coupon_record.usage_limit) THEN
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

  IF (v_subtotal - v_discount) >= v_free_threshold THEN
    v_delivery_charge := 0;
  ELSE
    v_delivery_charge := v_shipping_fee;
  END IF;

  v_final_total := v_subtotal - v_discount + v_delivery_charge;

  INSERT INTO public.orders (
    order_id, customer_id, customer_name, customer_email, customer_phone,
    shipping_address, subtotal, discount_amount, delivery_charge,
    final_total, coupon_code, payment_method, payment_status, order_status
  ) VALUES (
    v_order_id, auth.uid(), p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, v_subtotal, v_discount, v_delivery_charge,
    v_final_total, NULLIF(TRIM(COALESCE(p_coupon_code, '')), ''), p_payment_method,
    CASE WHEN p_payment_method = 'simulated_online' THEN 'completed' ELSE 'pending' END,
    'confirmed'
  ) RETURNING id INTO v_new_order_uuid;

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id UUID,
    variant_id UUID,
    quantity INT
  )
  LOOP
    SELECT * INTO v_variant FROM public.product_variants WHERE id = v_item.variant_id;
    SELECT p.*, c.name AS category_name INTO v_product
    FROM public.products p
    LEFT JOIN public.categories c ON p.category_id = c.id
    WHERE p.id = v_item.product_id;

    UPDATE public.product_variants
    SET stock_quantity = stock_quantity - v_item.quantity
    WHERE id = v_item.variant_id;

    UPDATE public.products p
    SET stock_quantity = GREATEST(0, (
      SELECT COALESCE(SUM(pv.stock_quantity), 0) FROM public.product_variants pv WHERE pv.product_id = p.id
    ))
    WHERE p.id = v_item.product_id;

    INSERT INTO public.inventory_logs (
      product_id, variant_id, change_quantity, previous_stock, new_stock, reason, created_by
    ) VALUES (
      v_item.product_id, v_item.variant_id, -v_item.quantity,
      v_variant.stock_quantity, v_variant.stock_quantity - v_item.quantity,
      'order_placed:' || v_order_id, COALESCE(p_customer_email, 'customer')
    );

    INSERT INTO public.order_items (
      order_id, product_id, variant_id, product_name, variant_title,
      category_name, sku, unit_price, quantity, total_price, image_url
    ) VALUES (
      v_new_order_uuid, v_item.product_id, v_item.variant_id,
      v_product.name, v_variant.title, COALESCE(v_product.category_name, 'General'),
      v_variant.sku, v_variant.price, v_item.quantity,
      v_variant.price * v_item.quantity,
      (SELECT image_url FROM public.product_images WHERE product_id = v_item.product_id AND is_primary = TRUE LIMIT 1)
    );
  END LOOP;

  IF v_coupon_record.id IS NOT NULL AND v_discount > 0 THEN
    UPDATE public.coupons
    SET total_used_count = total_used_count + 1,
        total_discount_granted = total_discount_granted + v_discount
    WHERE id = v_coupon_record.id;

    INSERT INTO public.coupon_usages (coupon_id, order_id, customer_email, discount_applied)
    VALUES (v_coupon_record.id, v_new_order_uuid, p_customer_email, v_discount);
  END IF;

  INSERT INTO public.order_status_history (order_id, status, note, updated_by)
  VALUES (v_new_order_uuid, 'confirmed', 'Order successfully placed by customer', 'Customer');

  SELECT to_jsonb(o) INTO v_order FROM public.orders o WHERE o.id = v_new_order_uuid;
  SELECT COALESCE(jsonb_agg(to_jsonb(oi)), '[]'::jsonb) INTO v_items FROM public.order_items oi WHERE oi.order_id = v_new_order_uuid;
  SELECT COALESCE(jsonb_agg(to_jsonb(h) ORDER BY h.created_at), '[]'::jsonb) INTO v_history FROM public.order_status_history h WHERE h.order_id = v_new_order_uuid;

  RETURN v_order || jsonb_build_object(
    'success', true,
    'items', v_items,
    'status_history', v_history
  );
END;
$$;

REVOKE ALL ON FUNCTION public.place_order_atomic(TEXT, TEXT, TEXT, JSONB, TEXT, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order_atomic(TEXT, TEXT, TEXT, JSONB, TEXT, JSONB, TEXT) TO anon, authenticated;

-- Guest lookup requires both order code and email (order IDs are sequential).
CREATE OR REPLACE FUNCTION public.lookup_guest_order(p_order_id TEXT, p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order JSONB;
  v_items JSONB;
  v_history JSONB;
  v_uuid UUID;
BEGIN
  SELECT to_jsonb(o), o.id INTO v_order, v_uuid
  FROM public.orders o
  WHERE UPPER(o.order_id) = UPPER(TRIM(p_order_id))
    AND LOWER(o.customer_email) = LOWER(TRIM(p_email));

  IF v_order IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(oi)), '[]'::jsonb) INTO v_items
  FROM public.order_items oi WHERE oi.order_id = v_uuid;

  SELECT COALESCE(jsonb_agg(to_jsonb(h) ORDER BY h.created_at), '[]'::jsonb) INTO v_history
  FROM public.order_status_history h WHERE h.order_id = v_uuid;

  RETURN v_order || jsonb_build_object('items', v_items, 'status_history', v_history);
END;
$$;

REVOKE ALL ON FUNCTION public.lookup_guest_order(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_guest_order(TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.adjust_variant_stock(
  p_product_id UUID,
  p_variant_id UUID,
  p_new_stock INT,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_previous INT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT stock_quantity INTO v_previous FROM public.product_variants WHERE id = p_variant_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Variant not found';
  END IF;

  UPDATE public.product_variants
  SET stock_quantity = GREATEST(0, p_new_stock)
  WHERE id = p_variant_id;

  UPDATE public.products p
  SET stock_quantity = GREATEST(0, (
    SELECT COALESCE(SUM(pv.stock_quantity), 0) FROM public.product_variants pv WHERE pv.product_id = p.id
  ))
  WHERE p.id = p_product_id;

  INSERT INTO public.inventory_logs (
    product_id, variant_id, change_quantity, previous_stock, new_stock, reason, created_by
  ) VALUES (
    p_product_id, p_variant_id, p_new_stock - v_previous, v_previous, GREATEST(0, p_new_stock),
    p_reason, auth.email()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_variant_stock(UUID, UUID, INT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adjust_variant_stock(UUID, UUID, INT, TEXT) TO authenticated;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Admin roster: readable by the signed-in user (to check their own role) and by admins.
-- No INSERT/UPDATE/DELETE policies for clients — only the service role / SQL editor can grant admin.
CREATE POLICY "Read own admin membership" ON public.admin_users
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Categories
CREATE POLICY "Public read active categories" ON public.categories
  FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins insert categories" ON public.categories
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update categories" ON public.categories
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete categories" ON public.categories
  FOR DELETE USING (public.is_admin());

-- Products
CREATE POLICY "Public read listed products" ON public.products
  FOR SELECT USING ((is_active = TRUE AND is_archived = FALSE) OR public.is_admin());
CREATE POLICY "Admins insert products" ON public.products
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update products" ON public.products
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete products" ON public.products
  FOR DELETE USING (public.is_admin());

-- Variants & images
CREATE POLICY "Public read variants" ON public.product_variants
  FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins write variants" ON public.product_variants
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read product images" ON public.product_images
  FOR SELECT USING (TRUE);
CREATE POLICY "Admins write product images" ON public.product_images
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Coupons: public may read active codes to validate at checkout; only admins mutate
CREATE POLICY "Public read active coupons" ON public.coupons
  FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins write coupons" ON public.coupons
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Orders: no client INSERT (checkout uses place_order_atomic). Admins manage; owners read own.
CREATE POLICY "Admins and owners read orders" ON public.orders
  FOR SELECT USING (public.is_admin() OR customer_id = auth.uid());
CREATE POLICY "Admins update orders" ON public.orders
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins and owners read order items" ON public.order_items
  FOR SELECT USING (
    public.is_admin()
    OR order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid())
  );

CREATE POLICY "Admins and owners read order history" ON public.order_status_history
  FOR SELECT USING (
    public.is_admin()
    OR order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid())
  );
CREATE POLICY "Admins insert order history" ON public.order_status_history
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins read coupon usages" ON public.coupon_usages
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins read inventory logs" ON public.inventory_logs
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins insert inventory logs" ON public.inventory_logs
  FOR INSERT WITH CHECK (public.is_admin());

-- Reviews
CREATE POLICY "Public read approved reviews" ON public.reviews
  FOR SELECT USING (status = 'approved' OR public.is_admin());
CREATE POLICY "Anyone can submit a review" ON public.reviews
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins manage reviews" ON public.reviews
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Analytics
CREATE POLICY "Public insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins read analytics events" ON public.analytics_events
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Public insert analytics sessions" ON public.analytics_sessions
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins read analytics sessions" ON public.analytics_sessions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins read subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Anyone can contact" ON public.contact_messages
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins read contact messages" ON public.contact_messages
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update contact messages" ON public.contact_messages
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read store settings" ON public.store_settings
  FOR SELECT USING (TRUE);
CREATE POLICY "Admins write store settings" ON public.store_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
