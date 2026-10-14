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
ON CONFLICT DO NOTHING;

-- Catalog products. These fields follow public.products in the schema migration.
-- Conflict-safe inserts keep existing product edits and inventory unchanged.
INSERT INTO public.products (
  name, slug, category_id, short_description, full_description, sku,
  base_price, original_price, discount_percentage, stock_quantity,
  weight_or_size, ingredients, storage_instructions, shelf_life,
  is_featured, is_bestseller, is_active, is_archived
)
SELECT
  item.name, item.slug, category.id, item.short_description, item.full_description,
  item.sku, item.base_price, item.original_price, item.discount_percentage,
  item.stock_quantity, item.weight_or_size, item.ingredients,
  item.storage_instructions, item.shelf_life, item.is_featured,
  item.is_bestseller, TRUE, FALSE
FROM (VALUES
  ('traditional-kandi-podi', 'Traditional Kandi Podi (Lentil Rice Powder)', 'powders', 'Roasted lentils, cumin, pepper and Guntur chillies ground for a classic Andhra rice podi.', 'Farm-style pigeon pea and lentil podi, slowly roasted with cumin, pepper and sun-dried chillies. Serve with hot rice and ghee.', 'KVF-POD-001', 180.00, 210.00, 14, 45, '250g', 'Toor dal, chana dal, moong dal, cumin, black pepper, Guntur chillies, rock salt and hing.', 'Store airtight in a cool, dry place. Use a dry spoon.', '6 months', TRUE, TRUE),
  ('karivepaku-podi', 'Karivepaku Podi (Curry Leaf Rice Powder)', 'powders', 'Curry leaves and roasted lentils make this aromatic powder a pantry staple.', 'Curry leaves are gently dried and blended with roasted dals, coriander, sesame and chillies for a fragrant rice accompaniment.', 'KVF-POD-002', 195.00, 230.00, 15, 35, '250g', 'Curry leaves, chana dal, urad dal, coriander, cumin, sesame, red chillies and salt.', 'Keep sealed away from moisture and direct sunlight.', '6 months', TRUE, TRUE),
  ('nalla-karam-podi', 'Nalla Karam Podi (Spiced Black Gram Powder)', 'powders', 'Unpolished black gram, garlic and tamarind bring a deep, savoury finish.', 'Black gram is patiently roasted and ground with country garlic, tamarind, cumin and red chillies for a bold village-style podi.', 'KVF-POD-003', 210.00, 240.00, 12, 40, '250g', 'Black urad dal, garlic, tamarind, cumin, Guntur chillies and salt.', 'Store in an airtight container in a cool, dry place.', '6 months', TRUE, FALSE),
  ('idli-dosa-gunpowder-podi', 'Idli Dosa Chutney Podi (Gunpowder)', 'powders', 'A coarse roasted lentil and sesame podi for idli, dosa and uthappam.', 'Roasted lentils, sesame and red chillies are ground to a coarse texture. Mix with sesame oil or serve alongside breakfast.', 'KVF-POD-004', 185.00, 220.00, 16, 60, '250g', 'Chana dal, urad dal, sesame, Guntur chillies, curry leaves, hing and salt.', 'Store airtight in a cool, dry place.', '6 months', TRUE, TRUE),
  ('kakarakaya-karam-podi', 'Kakarakaya Karam Podi (Bitter Gourd Spice Powder)', 'powders', 'Sun-dried bitter gourd meets roasted garlic and spices in this distinctive podi.', 'Thinly sliced bitter gourd is dried and blended with garlic, coriander, cumin and red chillies for a tangy, savoury rice accompaniment.', 'KVF-POD-005', 225.00, 260.00, 13, 28, '250g', 'Bitter gourd, garlic, coriander, cumin, dry red chillies and salt.', 'Keep sealed in a cool, dry place.', '5 months', FALSE, FALSE),
  ('vellulli-karam-podi', 'Vellulli Karam Podi (Village Garlic Chutney Powder)', 'powders', 'A robust garlic podi with dry red chillies and cumin.', 'Country garlic is gently roasted with red chillies and cumin, then ground into a savoury accompaniment for dosa, idli and rice.', 'KVF-POD-006', 190.00, 220.00, 13, 32, '250g', 'Country garlic, dry red chillies, cumin, coriander and salt.', 'Store airtight in a cool, dry place.', '6 months', FALSE, TRUE),

  ('gummadikaya-ash-gourd-vadiyalu', 'Gummadikaya Vadiyalu (Ash Gourd Sun-Dried Crisps)', 'dry-items', 'Traditional ash gourd and urad dal crisps, naturally sun-dried for frying.', 'Grated ash gourd is seasoned with urad dal, green chillies and cumin, shaped by hand and slowly sun-dried. Fry until crisp.', 'KVF-DRY-001', 240.00, 280.00, 14, 25, '250g', 'Ash gourd, urad dal, green chillies, cumin, hing and rock salt.', 'Store airtight in a dry place. Keep away from moisture.', '12 months', TRUE, TRUE),
  ('challamirapakayalu-curd-chillies', 'Challamirapakayalu (Curd Sun-Dried Green Chillies)', 'dry-items', 'Green chillies marinated in sour curd and sun-dried for a savoury side.', 'Fresh green chillies are slit, seasoned with sour curd and rock salt, then dried in the sun. Fry and serve with rice and curd.', 'KVF-DRY-002', 195.00, 230.00, 15, 30, '250g', 'Green chillies, sour curd, rock salt, hing and cumin.', 'Keep in an airtight jar away from moisture.', '12 months', FALSE, TRUE),
  ('saggubiyyam-sago-vadiyalu', 'Saggubiyyam Vadiyalu (Tapioca Sago Crisps)', 'dry-items', 'Light, crisp sago rounds seasoned with cumin and green chilli.', 'Sago pearls are cooked, seasoned and shaped into rounds before sun-drying. Fry briefly for airy, crunchy crisps.', 'KVF-DRY-003', 210.00, 250.00, 16, 20, '250g', 'Sago pearls, cumin, green chillies, lemon and salt.', 'Keep sealed in a moisture-free container.', '12 months', FALSE, FALSE),
  ('tomato-vadiyalu', 'Tomato Vadiyalu (Sun-Infused Tomato Rice Crisps)', 'dry-items', 'Tangy tomato and rice crisps with a gentle carom-seed aroma.', 'Ripe tomatoes are cooked down and blended with rice flour and carom seeds, shaped and naturally sun-dried for frying.', 'KVF-DRY-004', 230.00, 270.00, 14, 18, '250g', 'Tomatoes, rice flour, carom seeds, green chilli and salt.', 'Store in an airtight, moisture-free container.', '10 months', TRUE, FALSE),
  ('bellam-nuvvula-laddu', 'Bellam Nuvvula Laddu (Jaggery Sesame Balls)', 'dry-items', 'Roasted sesame and jaggery form a traditional bite-sized sweet.', 'Roasted sesame seeds are bound with cane jaggery and a hint of cardamom, then shaped into a classic village sweet.', 'KVF-DRY-005', 250.00, 290.00, 13, 35, '400g', 'Sesame seeds, cane jaggery, cardamom and ghee.', 'Store in a cool, dry place in an airtight container.', '2 months', TRUE, TRUE),
  ('dry-turmeric-sticks-pasupu-kommulu', 'Farm Fresh Dry Turmeric Sticks (Pasupu Kommulu)', 'dry-items', 'Whole cured turmeric fingers, naturally dried and unpolished.', 'Turmeric fingers are washed, cured and sun-dried without polish or added colour. Grind as needed for cooking.', 'KVF-DRY-006', 160.00, 190.00, 15, 40, '250g', 'Whole dried turmeric fingers.', 'Keep sealed in a dry container.', '18 months', FALSE, FALSE),

  ('gongura-pachadi-pickle', 'Gongura Pachadi (Heritage Sorrel Leaves Pickle)', 'pachadlu', 'Tangy gongura leaves cooked with spices and sesame oil.', 'Fresh gongura leaves are cooked with garlic, fenugreek, mustard and red chillies, then preserved in sesame oil for a classic Andhra pickle.', 'KVF-PAC-001', 249.00, 299.00, 16, 50, '300g', 'Gongura leaves, sesame oil, garlic, fenugreek, mustard, red chilli, rock salt and turmeric.', 'Keep the jar closed and use a clean, dry spoon.', '9 months', TRUE, TRUE),
  ('traditional-avakaya-cut-mango-pickle', 'Traditional Avakaya (Cut Mango Mustard Pickle)', 'pachadlu', 'Raw mango, mustard and chilli cured in cold-pressed sesame oil.', 'Firm raw mango pieces are mixed with ground mustard, red chilli, fenugreek and sesame oil, then left to mature into a bold Andhra avakaya.', 'KVF-PAC-002', 279.00, 330.00, 15, 40, '350g', 'Raw mango, mustard, red chilli, sesame oil, salt, turmeric and fenugreek.', 'Store in a cool, dry place. Use a clean, dry spoon.', '12 months', TRUE, TRUE),
  ('sun-infused-tomato-pickle', 'Sun-Infused Tomato Pachadi', 'pachadlu', 'Ripe country tomatoes cooked with tamarind, garlic and warming spices.', 'Farm tomatoes are seasoned with tamarind and spices, then cooked into a richly flavoured pickle with cold-pressed oil.', 'KVF-PAC-003', 239.00, 280.00, 14, 35, '300g', 'Tomatoes, tamarind, groundnut oil, garlic, red chilli, mustard and salt.', 'Keep sealed and use a dry spoon.', '9 months', FALSE, FALSE),
  ('allam-pachadi-ginger-pickle', 'Allam Pachadi (Fresh Ginger Jaggery Pickle)', 'pachadlu', 'Fresh ginger, tamarind and jaggery balance sweet, sour and spice.', 'Fresh ginger is blended with cane jaggery, tamarind and roasted spices for a traditional accompaniment to pesarattu and dosa.', 'KVF-PAC-004', 259.00, 300.00, 13, 40, '300g', 'Ginger, cane jaggery, tamarind, sesame oil, fenugreek, red chillies and salt.', 'Keep tightly sealed in a cool, dry place.', '9 months', TRUE, TRUE),
  ('pandumirapa-red-ripe-chilli-pickle', 'Pandumirapa Pachadi (Red Ripe Chilli Pickle)', 'pachadlu', 'Ripe red chillies pounded with tamarind, garlic and sesame oil.', 'Seasonal red chillies are coarsely pounded with tamarind and country garlic, then seasoned with sesame oil and spices.', 'KVF-PAC-005', 269.00, 310.00, 13, 30, '300g', 'Ripe red chillies, tamarind, garlic, sesame oil, salt and fenugreek.', 'Store sealed in a cool, dry place. Use a dry spoon.', '12 months', FALSE, FALSE),
  ('usirikaya-whole-amla-pickle', 'Usirikaya Pachadi (Whole Amla Pickle)', 'pachadlu', 'Whole amla cooked with mustard, fenugreek and red chilli.', 'Firm amla fruits are gently cooked with mustard, fenugreek and chilli in cold-pressed oil for a tangy seasonal pickle.', 'KVF-PAC-006', 279.00, 320.00, 12, 25, '350g', 'Amla, sesame oil, mustard, fenugreek, red chilli, rock salt and turmeric.', 'Keep sealed in a cool, dry place.', '12 months', FALSE, TRUE),

  ('cold-pressed-groundnut-oil-marachekku', 'Cold Pressed Wood-Churned Groundnut Oil (Marachekku)', 'oils', 'Unrefined groundnut oil slowly extracted in a traditional wooden ghani.', 'Native groundnuts are slowly pressed in a wooden ghani to retain their natural aroma. Suitable for everyday cooking.', 'KVF-OIL-001', 340.00, 390.00, 12, 60, '1L', '100% cold-pressed groundnut oil.', 'Store sealed away from heat and direct sunlight.', '9 months', TRUE, TRUE),
  ('cold-pressed-sesame-gingelly-oil', 'Cold Pressed Sesame / Gingelly Oil (Nuvvula Nune)', 'oils', 'Aromatic sesame oil for cooking, pickles and traditional recipes.', 'Sesame seeds are slowly pressed in a wooden ghani to produce a fragrant, unrefined cooking oil.', 'KVF-OIL-002', 420.00, 480.00, 12, 40, '1L', '100% cold-pressed sesame oil.', 'Store sealed in a cool, dark pantry.', '9 months', TRUE, FALSE),
  ('pure-wood-pressed-coconut-oil', 'Pure Wood Pressed Coconut Oil (Kobbari Nune)', 'oils', 'Wood-pressed coconut oil with a clean, naturally rich aroma.', 'Dried coconut kernels are slowly pressed to make a versatile unrefined oil for cooking and everyday use.', 'KVF-OIL-003', 360.00, 410.00, 12, 35, '1L', '100% cold-pressed coconut oil.', 'Store sealed away from heat and direct sunlight.', '9 months', FALSE, TRUE),
  ('cold-pressed-mustard-oil', 'Cold Pressed Wood-Churned Mustard Oil (Avalu Nune)', 'oils', 'Pungent mustard oil slowly pressed for traditional cooking.', 'Mustard seeds are slowly pressed without refining to retain their characteristic aroma and flavour.', 'KVF-OIL-004', 310.00, 360.00, 13, 25, '1L', '100% cold-pressed mustard oil.', 'Store sealed in a cool, dark pantry.', '9 months', FALSE, FALSE),
  ('desi-cow-a2-bilona-ghee', 'Desi Cow A2 Bilona Churned Ghee', 'oils', 'Small-batch bilona-churned ghee with a rich, nutty aroma.', 'Cultured butter is traditionally churned and clarified in small batches for a fragrant finishing ghee.', 'KVF-OIL-005', 890.00, 1050.00, 15, 30, '500ml', 'Clarified cultured cow milk butter.', 'Keep tightly closed in a cool, dry place. Use a clean spoon.', '12 months', TRUE, TRUE),
  ('cold-pressed-castor-oil', 'Pure Cold Pressed Castor Oil (Aamudamu)', 'oils', 'Unrefined castor oil for external and traditional household use.', 'Castor seeds are cold-pressed in small batches. This product is intended for external and traditional household use.', 'KVF-OIL-006', 210.00, 245.00, 14, 20, '500ml', '100% cold-pressed castor oil.', 'Store sealed away from heat and direct sunlight.', '12 months', FALSE, FALSE)
) AS item(
  slug, name, category_slug, short_description, full_description, sku,
  base_price, original_price, discount_percentage, stock_quantity,
  weight_or_size, ingredients, storage_instructions, shelf_life,
  is_featured, is_bestseller
)
JOIN public.categories AS category ON category.slug = item.category_slug
ON CONFLICT DO NOTHING;

-- Variant SKUs are unique in the schema, making this safe to run repeatedly.
INSERT INTO public.product_variants (
  product_id, title, weight_or_size, sku, price, original_price,
  stock_quantity, is_active, display_order
)
SELECT product.id, variant.title, variant.weight_or_size, variant.sku,
       variant.price, variant.original_price, variant.stock_quantity, TRUE,
       variant.display_order
FROM (VALUES
  ('traditional-kandi-podi', '100 Grams', '100g', 'KVF-POD-001-100G', 90.00, 110.00, 20, 1),
  ('traditional-kandi-podi', '250 Grams', '250g', 'KVF-POD-001-250G', 180.00, 210.00, 15, 2),
  ('traditional-kandi-podi', '500 Grams', '500g', 'KVF-POD-001-500G', 340.00, 390.00, 10, 3),
  ('karivepaku-podi', '100 Grams', '100g', 'KVF-POD-002-100G', 95.00, 115.00, 15, 1),
  ('karivepaku-podi', '250 Grams', '250g', 'KVF-POD-002-250G', 195.00, 230.00, 20, 2),
  ('nalla-karam-podi', '250 Grams', '250g', 'KVF-POD-003-250G', 210.00, 240.00, 25, 1),
  ('nalla-karam-podi', '500 Grams', '500g', 'KVF-POD-003-500G', 399.00, 460.00, 15, 2),
  ('idli-dosa-gunpowder-podi', '250 Grams', '250g', 'KVF-POD-004-250G', 185.00, 220.00, 35, 1),
  ('idli-dosa-gunpowder-podi', '500 Grams', '500g', 'KVF-POD-004-500G', 350.00, 410.00, 25, 2),
  ('kakarakaya-karam-podi', '250 Grams', '250g', 'KVF-POD-005-250G', 225.00, 260.00, 28, 1),
  ('vellulli-karam-podi', '250 Grams', '250g', 'KVF-POD-006-250G', 190.00, 220.00, 20, 1),
  ('vellulli-karam-podi', '500 Grams', '500g', 'KVF-POD-006-500G', 360.00, 420.00, 12, 2),

  ('gummadikaya-ash-gourd-vadiyalu', '250 Grams', '250g', 'KVF-DRY-001-250G', 240.00, 280.00, 15, 1),
  ('gummadikaya-ash-gourd-vadiyalu', '500 Grams', '500g', 'KVF-DRY-001-500G', 460.00, 540.00, 10, 2),
  ('challamirapakayalu-curd-chillies', '250 Grams', '250g', 'KVF-DRY-002-250G', 195.00, 230.00, 20, 1),
  ('challamirapakayalu-curd-chillies', '500 Grams', '500g', 'KVF-DRY-002-500G', 370.00, 440.00, 10, 2),
  ('saggubiyyam-sago-vadiyalu', '250 Grams', '250g', 'KVF-DRY-003-250G', 210.00, 250.00, 20, 1),
  ('tomato-vadiyalu', '250 Grams', '250g', 'KVF-DRY-004-250G', 230.00, 270.00, 18, 1),
  ('bellam-nuvvula-laddu', '400 Grams (Approx 12 Pieces)', '400g', 'KVF-DRY-005-400G', 250.00, 290.00, 35, 1),
  ('dry-turmeric-sticks-pasupu-kommulu', '250 Grams', '250g', 'KVF-DRY-006-250G', 160.00, 190.00, 25, 1),
  ('dry-turmeric-sticks-pasupu-kommulu', '500 Grams', '500g', 'KVF-DRY-006-500G', 299.00, 360.00, 15, 2),

  ('gongura-pachadi-pickle', '300 Grams Glass Jar', '300g', 'KVF-PAC-001-300G', 249.00, 299.00, 30, 1),
  ('gongura-pachadi-pickle', '500 Grams Glass Jar', '500g', 'KVF-PAC-001-500G', 399.00, 479.00, 20, 2),
  ('traditional-avakaya-cut-mango-pickle', '350 Grams Jar', '350g', 'KVF-PAC-002-350G', 279.00, 330.00, 25, 1),
  ('traditional-avakaya-cut-mango-pickle', '1 Kilogram Value Jar', '1kg', 'KVF-PAC-002-1KG', 699.00, 820.00, 15, 2),
  ('sun-infused-tomato-pickle', '300 Grams', '300g', 'KVF-PAC-003-300G', 239.00, 280.00, 35, 1),
  ('allam-pachadi-ginger-pickle', '300 Grams', '300g', 'KVF-PAC-004-300G', 259.00, 300.00, 25, 1),
  ('allam-pachadi-ginger-pickle', '500 Grams', '500g', 'KVF-PAC-004-500G', 410.00, 480.00, 15, 2),
  ('pandumirapa-red-ripe-chilli-pickle', '300 Grams', '300g', 'KVF-PAC-005-300G', 269.00, 310.00, 30, 1),
  ('usirikaya-whole-amla-pickle', '350 Grams', '350g', 'KVF-PAC-006-350G', 279.00, 320.00, 25, 1),

  ('cold-pressed-groundnut-oil-marachekku', '500 ml Glass Bottle', '500ml', 'KVF-OIL-001-500ML', 185.00, 210.00, 25, 1),
  ('cold-pressed-groundnut-oil-marachekku', '1 Litre Bottle', '1L', 'KVF-OIL-001-1L', 340.00, 390.00, 25, 2),
  ('cold-pressed-groundnut-oil-marachekku', '5 Litre Family Tin', '5L', 'KVF-OIL-001-5L', 1599.00, 1850.00, 10, 3),
  ('cold-pressed-sesame-gingelly-oil', '500 ml Glass Bottle', '500ml', 'KVF-OIL-002-500ML', 225.00, 255.00, 20, 1),
  ('cold-pressed-sesame-gingelly-oil', '1 Litre Bottle', '1L', 'KVF-OIL-002-1L', 420.00, 480.00, 20, 2),
  ('pure-wood-pressed-coconut-oil', '500 ml Glass Bottle', '500ml', 'KVF-OIL-003-500ML', 195.00, 220.00, 20, 1),
  ('pure-wood-pressed-coconut-oil', '1 Litre Bottle', '1L', 'KVF-OIL-003-1L', 360.00, 410.00, 15, 2),
  ('cold-pressed-mustard-oil', '1 Litre Bottle', '1L', 'KVF-OIL-004-1L', 310.00, 360.00, 25, 1),
  ('desi-cow-a2-bilona-ghee', '250 ml Glass Jar', '250ml', 'KVF-OIL-005-250ML', 475.00, 550.00, 15, 1),
  ('desi-cow-a2-bilona-ghee', '500 ml Glass Jar', '500ml', 'KVF-OIL-005-500ML', 890.00, 1050.00, 15, 2),
  ('cold-pressed-castor-oil', '500 ml Bottle', '500ml', 'KVF-OIL-006-500ML', 210.00, 245.00, 20, 1)
) AS variant(product_slug, title, weight_or_size, sku, price, original_price, stock_quantity, display_order)
JOIN public.products AS product ON product.slug = variant.product_slug
ON CONFLICT DO NOTHING;

-- Product images use the same HTTPS Unsplash URL format as the existing demo catalog.
INSERT INTO public.product_images (product_id, image_url, is_primary, display_order)
SELECT product.id, image.image_url, TRUE, 1
FROM (VALUES
  ('traditional-kandi-podi', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'),
  ('karivepaku-podi', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'),
  ('nalla-karam-podi', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'),
  ('idli-dosa-gunpowder-podi', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'),
  ('kakarakaya-karam-podi', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'),
  ('vellulli-karam-podi', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'),
  ('gummadikaya-ash-gourd-vadiyalu', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'),
  ('challamirapakayalu-curd-chillies', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80'),
  ('saggubiyyam-sago-vadiyalu', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'),
  ('tomato-vadiyalu', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'),
  ('bellam-nuvvula-laddu', 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80'),
  ('dry-turmeric-sticks-pasupu-kommulu', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'),
  ('gongura-pachadi-pickle', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'),
  ('traditional-avakaya-cut-mango-pickle', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'),
  ('sun-infused-tomato-pickle', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'),
  ('allam-pachadi-ginger-pickle', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'),
  ('pandumirapa-red-ripe-chilli-pickle', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'),
  ('usirikaya-whole-amla-pickle', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'),
  ('cold-pressed-groundnut-oil-marachekku', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'),
  ('cold-pressed-sesame-gingelly-oil', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'),
  ('pure-wood-pressed-coconut-oil', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'),
  ('cold-pressed-mustard-oil', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'),
  ('desi-cow-a2-bilona-ghee', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'),
  ('cold-pressed-castor-oil', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80')
) AS image(product_slug, image_url)
JOIN public.products AS product ON product.slug = image.product_slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_images AS existing
  WHERE existing.product_id = product.id AND existing.is_primary = TRUE
);

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
  ('announcement', '{"text": "🌾 Welcome to Karnam Vari Farms!  Authentic village delicacies delivered pan-India. Free shipping on orders over ₹999. Use code AKSHAY07 for 5% off!", "is_active": true}'::jsonb),
  ('contact', '{"phone": "+91 98765 43210", "email": "contact@karnamvarifarms.com", "address": "Karnam Vari Farms, Village Road, Guntur District, Andhra Pradesh - 522002"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
