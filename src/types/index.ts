export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';

export type PaymentMethod = 'cod' | 'simulated_online' | 'upi' | 'card';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string; // e.g. "250 Grams", "500 Grams", "1 Litre"
  weight_or_size: string;
  sku: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  is_active: boolean;
  display_order?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name?: string;
  short_description: string;
  full_description: string;
  sku: string;
  base_price: number;
  original_price?: number;
  discount_percentage?: number;
  stock_quantity: number;
  weight_or_size: string;
  ingredients?: string;
  storage_instructions?: string;
  shelf_life?: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  is_archived: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  rating?: number;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string; // unique item id: product_id + '_' + variant_id
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_title: string;
  sku: string;
  price: number;
  original_price?: number;
  image_url: string;
  quantity: number;
  max_stock: number;
  category_name?: string;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  email: string;
  address_line: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_title: string;
  category_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  status: OrderStatus;
  note?: string;
  updated_by: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_id: string; // AKFARMS00001
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  subtotal: number;
  discount_amount: number;
  delivery_charge: number;
  final_total: number;
  coupon_code?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  courier_name?: string;
  tracking_number?: string;
  tracking_url?: string;
  admin_notes?: string;
  items: OrderItem[];
  status_history?: OrderStatusHistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  valid_from: string;
  valid_to?: string;
  usage_limit?: number;
  per_customer_limit?: number;
  total_used_count: number;
  total_discount_granted: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_title?: string;
  change_quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  created_by?: string;
  created_at: string;
}

export interface Customer {
  email: string;
  name: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  first_order_date: string;
  last_order_date: string;
  is_returning: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_purchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  session_id: string;
  event_type: 'session_start' | 'page_view' | 'product_view' | 'category_view' | 'add_to_cart' | 'checkout_start' | 'order_placed';
  product_id?: string;
  category_id?: string;
  order_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface StoreSettings {
  shipping_standard_fee: number;
  free_shipping_threshold: number;
  announcement_bar_text: string;
  announcement_bar_active: boolean;
  store_phone: string;
  store_email: string;
  store_address: string;
}
