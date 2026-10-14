-- ============================================================================
-- KARNAM VARI FARMS - INITIAL SEED DATA
-- ============================================================================

-- Categories
INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111101', 'Powders', 'powders', 'Stone-ground traditional spice powders, rice podis, and aromatic home blends.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80', 1, TRUE),
  ('11111111-1111-1111-1111-111111111102', 'Dry Items', 'dry-items', 'Sun-dried traditional vadiyalu, curd chillies, and nutritious farm-dried snacks.', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80', 2, TRUE),
  ('11111111-1111-1111-1111-111111111103', 'Pachadlu', 'pachadlu', 'Authentic heritage pickles cured with cold-pressed oils, rock salt, and grandma recipes.', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80', 3, TRUE),
  ('11111111-1111-1111-1111-111111111104', 'Oils', 'oils', 'Cold-pressed wooden churned (Marachekku) unrefined pure edible oils and ghee.', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80', 4, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Initial Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
VALUES
  ('AKSHAY07', 'Special Launch Discount - 5% Off entire order', 'percentage', 5.00, 399.00, 200.00, TRUE),
  ('WELCOME10', 'Welcome to Karnam Vari Farms - 10% Off on your first order', 'percentage', 10.00, 499.00, 250.00, TRUE),
  ('FARMFLAT100', 'Flat ₹100 Off on orders above ₹1199', 'fixed', 100.00, 1199.00, NULL, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Store Settings
INSERT INTO store_settings (key, value)
VALUES
  ('shipping', '{"standard_fee": 70, "free_shipping_threshold": 999}'::jsonb),
  ('announcement', '{"text": "🌾 Welcome to Karnam Vari Farms! Authentic village delicacies delivered pan-India. Free shipping on orders over ₹999. Use code AKSHAY07 for 5% off!", "is_active": true}'::jsonb),
  ('contact', '{"phone": "+91 98765 43210", "email": "contact@karnamvarifarms.com", "address": "Karnam Vari Farms, Village Road, Guntur District, Andhra Pradesh - 522002"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
