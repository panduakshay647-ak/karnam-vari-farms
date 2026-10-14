# Karnam Vari Farms — Production E-Commerce Platform

A complete, production-grade, full-stack e-commerce web application for **Karnam Vari Farms**, selling traditional Indian farm foods, stone-ground powders (podis), sun-cured pickles (pachadlu), sun-dried items (vadiyalu), and wood-pressed edible oils & ghee.

---

## 🌾 Highlights & Business Concept

- **Brand Identity**: Indian farm delicacy brand styling with warm cream (`#FAF7F2`), forest green (`#1B4332`), and golden accents (`#C58940`).
- **Authentic Product Catalog**: 24 distinct demo products across the 4 core categories:
  1. **Powders (Podis)**: Kandi Podi, Karivepaku Podi, Nalla Karam, Gunpowder, Kakarakaya Karam, Vellulli Karam.
  2. **Dry Items (Vadiyalu)**: Ash Gourd Vadiyalu, Curd Chillies (Challamirapakayalu), Sago Vadiyalu, Tomato Vadiyalu, Bellam Nuvvula Laddu, Whole Turmeric Fingers.
  3. **Pachadlu (Pickles)**: Heritage Gongura Pachadi, Traditional Avakaya, Sun-Infused Tomato Pickle, Allam (Ginger) Pachadi, Pandumirapa Pickle, Usirikaya (Amla) Pickle.
  4. **Oils & Ghee**: Cold Pressed Groundnut Oil (Marachekku), Sesame / Gingelly Oil, Wood Pressed Coconut Oil, Mustard Oil, Desi Cow A2 Bilona Ghee, Cold Pressed Castor Oil.
- **Package Size Variants**: Multiple weights/sizes (100g, 250g, 500g, 1kg, 500ml, 1L, 5L) with variant-specific pricing, SKUs, and stock tracking.
- **Sequential Collision-Safe Order ID**: Every order receives a backend-generated order ID formatted as `AKFARMS00001`, `AKFARMS00002`, etc.
- **Dual-Mode Backend Architecture**:
  - **Live Mode**: Direct connection to Supabase PostgreSQL, Supabase Auth, Storage, and Realtime with Row Level Security (RLS).
  - **Resilient Persistent Mode**: Instant out-of-the-box persistent database engine with multi-tab `BroadcastChannel` real-time sync, local storage backup, and full admin capabilities.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Lucide Icons, Canvas Confetti.
- **Analytics & Graphs**: Recharts for sales growth, category comparisons, and conversion funnels.
- **Database & Backend**: PostgreSQL schema, Supabase Auth, Row Level Security (RLS), atomic stored procedures (`place_order_atomic`).
- **Storage**: Supabase Storage buckets for product and category image management.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Supabase project credentials (optional for initial preview):
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### 3. Database Migration (for Supabase)
Execute `supabase/migrations/20261014000000_karnam_vari_farms_schema.sql` and `supabase/seed.sql` in your Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Admin Dashboard Access

- **URL**: [http://localhost:5173/admin](http://localhost:5173/admin)
- Sign in with a Supabase Auth account that has an authorized entry in the `admin_users` table. This project does not provision default administrator credentials.

---

## 🎟️ Promotional Coupons Included

- `AKSHAY07` — 5% discount on all farm products (minimum cart ₹399)
- `WELCOME10` — 10% discount on first order (minimum cart ₹499)
- `FARMFLAT100` — Flat ₹100 OFF on orders above ₹1199

---

## 📱 Page Sitemap

### Customer Pages
1. **Home**: `/` (Hero banner, 4 category cards, promo strip, bestsellers, why choose us, reviews, FAQs)
2. **Shop All**: `/shop` (Filters by category, price slider, search, stock availability, sort)
3. **Category Products**: `/category/:slug` (Filtered category catalog with hero banner)
4. **Search Results**: `/search` (Live catalog search across names, ingredients, SKUs)
5. **Product Details**: `/product/:slug` (Multi-image zoom gallery, variant selector, stock status, ingredients tab, reviews)
6. **Cart**: `/cart` (Free delivery progress bar, coupon code input with 1-click apply, price summary)
7. **Checkout**: `/checkout` (Shipping address, COD or simulated online payment, atomic order generation)
8. **Order Confirmation**: `/order-confirmation/:orderId` (Confetti animation, AKFARMSXXXXX order ID, invoice snapshot)
9. **My Orders**: `/my-orders` (Order tracking lookup by email or order ID)
10. **Order Details**: `/order/:orderId` (7-step dispatch progress stepper, courier tracking URL)
11. **About Us**: `/about` (Farm heritage, stone-ground podis, wood-pressing, community fair trade)
12. **Contact Us**: `/contact` (Interactive contact message form saved to database)
13. **FAQ**: `/faq` (Categorized expandable accordions for purity, shipping, and storage)
14. **Shipping Policy**: `/shipping-policy` (Transit timelines, pan-India courier partners, packaging safety)
15. **Return and Refund Policy**: `/returns-policy` (Perishable food terms, transit damage replacement)
16. **Privacy Policy**: `/privacy-policy` (Data protection, zero third-party sale notice)
17. **Terms & Conditions**: `/terms` (Purchase terms, Indian law jurisdiction)
18. **404 Not Found**: `*` (Farm-themed recovery page with search bar)

### Admin Portal Pages (`/admin`)
1. **Dashboard Overview**: `/admin` (Live KPI cards, revenue growth %, recent orders, low stock alerts, mini sales trend)
2. **Categories**: `/admin/categories` (Add/Edit categories, display order, active toggle, safe delete guard)
3. **Products**: `/admin/products` (Full catalog manager, variant price & stock editor, image manager, archive)
4. **Inventory**: `/admin/inventory` (Stock matrix, quick restock adjuster with audit reason logger)
5. **Orders**: `/admin/orders` (10 order status transitions, courier name, AWB tracking number, address inspector)
6. **Coupons**: `/admin/coupons` (Create & edit codes, percentage/fixed discounts, usage metrics)
7. **Customers**: `/admin/customers` (Patron directory, order count, lifetime spend, repeat buyer badge)
8. **Visitor Analytics**: `/admin/analytics` (Real visitor sessions, product views, conversion funnel drop-off)
9. **Sales Reports**: `/admin/sales` (All 6 Recharts graphs, date range comparison, CSV export)
10. **Reviews**: `/admin/reviews` (Customer review moderation queue: approve/reject/delete)
11. **Store Settings**: `/admin/settings` (Free shipping threshold, delivery fee, announcement text, Supabase status)
