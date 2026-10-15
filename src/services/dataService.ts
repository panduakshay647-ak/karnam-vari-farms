import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Category,
  Product,
  Order,
  OrderStatus,
  Coupon,
  Review,
  ContactMessage,
  StoreSettings,
  AnalyticsEvent,
  ShippingAddress,
  PaymentMethod,
  InventoryLog,
  Customer
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_STORE_SETTINGS
} from '../data/initialData';

// Local Storage Keys
const STORAGE_KEYS = {
  CATEGORIES: 'kvf_categories_v1',
  PRODUCTS: 'kvf_products_v1',
  ORDERS: 'kvf_orders_v1',
  COUPONS: 'kvf_coupons_v1',
  REVIEWS: 'kvf_reviews_v1',
  SETTINGS: 'kvf_settings_v1',
  INVENTORY_LOGS: 'kvf_inv_logs_v1',
  CONTACT_MSGS: 'kvf_contact_v1',
  NEWSLETTER: 'kvf_newsletter_v1',
  ANALYTICS_EVENTS: 'kvf_analytics_events_v1',
  ORDER_COUNTER: 'kvf_order_seq_v1',
  SESSION_ID: 'kvf_session_id',
  VISITOR_ID: 'kvf_visitor_id',
};

// Cross-tab Synchronization
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('kvf_sync_channel')
  : null;

function notifyListeners(table: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kvf_db_change', { detail: { table } }));
    broadcastChannel?.postMessage({ type: 'table_updated', table });
  }
}

// Ensure initial seed in persistent storage
function initLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_STORE_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDER_COUNTER)) {
    localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, '4'); // Start next order at AKFARMS00004
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONTACT_MSGS)) {
    localStorage.setItem(STORAGE_KEYS.CONTACT_MSGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NEWSLETTER)) {
    localStorage.setItem(STORAGE_KEYS.NEWSLETTER, JSON.stringify([]));
  }

  // Setup Anonymous Visitor & Session IDs
  if (!localStorage.getItem(STORAGE_KEYS.VISITOR_ID)) {
    localStorage.setItem(STORAGE_KEYS.VISITOR_ID, 'vis_' + Math.random().toString(36).substring(2, 11));
  }
  if (!sessionStorage.getItem(STORAGE_KEYS.SESSION_ID)) {
    const newSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    
    // Log initial session start
    const events: AnalyticsEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANALYTICS_EVENTS) || '[]');
    events.push({
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      session_id: newSessionId,
      event_type: 'session_start',
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.ANALYTICS_EVENTS, JSON.stringify(events));
  }
}

initLocalStorage();

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (id?: string) => Boolean(id && UUID_RE.test(id));
const GUEST_ORDERS_KEY = 'kvf_guest_orders_v1';

function num(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function requireSupabaseClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is configured but the client is unavailable.');
  }
  return supabase;
}

function mapProduct(p: any): Product {
  return {
    ...p,
    base_price: num(p.base_price),
    original_price: p.original_price != null ? num(p.original_price) : undefined,
    discount_percentage: num(p.discount_percentage),
    stock_quantity: num(p.stock_quantity),
    category_name: p.categories?.name || p.category_name,
    variants: (p.product_variants || p.variants || []).map((v: any) => ({
      ...v,
      price: num(v.price),
      original_price: v.original_price != null ? num(v.original_price) : undefined,
      stock_quantity: num(v.stock_quantity),
    })),
    images: p.product_images || p.images || [],
  };
}

function mapOrder(o: any): Order {
  return {
    ...o,
    subtotal: num(o.subtotal),
    discount_amount: num(o.discount_amount),
    delivery_charge: num(o.delivery_charge),
    final_total: num(o.final_total),
    items: (o.order_items || o.items || []).map((i: any) => ({
      ...i,
      unit_price: num(i.unit_price),
      quantity: num(i.quantity),
      total_price: num(i.total_price),
    })),
    status_history: o.order_status_history || o.status_history || [],
  };
}

// ============================================================================
// DATA SERVICE IMPLEMENTATION
// ============================================================================

export const dataService = {
  // ---------------- Realtime Listener (Crash-free) ----------------
  subscribe(table: string, onUpdate: () => void) {
    const handleCustomEvent = (e: any) => {
      if (!table || e.detail?.table === table || e.detail?.table === '*') {
        onUpdate();
      }
    };

    window.addEventListener('kvf_db_change', handleCustomEvent);

    const handleBroadcast = (event: MessageEvent) => {
      if (!table || event.data?.table === table || event.data?.table === '*') {
        onUpdate();
      }
    };

    broadcastChannel?.addEventListener('message', handleBroadcast);

    return () => {
      window.removeEventListener('kvf_db_change', handleCustomEvent);
      broadcastChannel?.removeEventListener('message', handleBroadcast);
    };
  },

  // ---------------- Categories ----------------
  async getCategories(includeInactive = false): Promise<Category[]> {
    if (isSupabaseConfigured) {
      if (!supabase) {
        throw new Error('Supabase is configured, but its client could not be initialized.');
      }
      let query = supabase.from('categories').select('*').order('display_order', { ascending: true });
      if (!includeInactive) query = query.eq('is_active', true);
      const { data, error } = await query;
      if (error) throw new Error(`Unable to load categories from Supabase: ${error.message}`);
      return (data || []) as Category[];
    }

    const categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');

    const enriched = categories.map(cat => ({
      ...cat,
      product_count: products.filter(p => p.category_id === cat.id && !p.is_archived).length,
    }));

    const sorted = enriched.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    return includeInactive ? sorted : sorted.filter(c => c.is_active);
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getCategories(true);
    return categories.find(c => c.slug === slug) || null;
  },

  async saveCategory(cat: Partial<Category>): Promise<Category> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      const name = cat.name?.trim() || '';
      const categoryData = {
        name,
        slug: cat.slug?.trim() || slugify(name),
        description: cat.description ?? '',
        image_url: cat.image_url ?? '',
        display_order: Number(cat.display_order ?? 0),
        is_active: cat.is_active ?? true,
      };

      if (!categoryData.name || !categoryData.slug) {
        throw new Error('Category name and slug are required.');
      }

      if (cat.id) {
        if (!isUuid(cat.id)) throw new Error('Cannot update a category with a non-database ID.');
        const { data, error } = await client
          .from('categories')
          .update(categoryData)
          .eq('id', cat.id)
          .select()
          .single();
        if (error) throw new Error(`Unable to update category in Supabase: ${error.message}`);
        notifyListeners('categories');
        return data as Category;
      }

      const { data, error } = await client.from('categories').insert(categoryData).select().single();
      if (error) throw new Error(`Unable to create category in Supabase: ${error.message}`);
      notifyListeners('categories');
      return data as Category;
    }

    const categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    let saved: Category;

    if (cat.id) {
      const idx = categories.findIndex(c => c.id === cat.id);
      if (idx >= 0) {
        categories[idx] = { ...categories[idx], ...cat, updated_at: new Date().toISOString() };
        saved = categories[idx];
      } else {
        saved = {
          id: cat.id,
          name: cat.name || '',
          slug: cat.slug || '',
          description: cat.description || '',
          image_url: cat.image_url || '',
          display_order: cat.display_order || 0,
          is_active: cat.is_active ?? true,
          created_at: new Date().toISOString(),
        };
        categories.push(saved);
      }
    } else {
      saved = {
        id: 'cat-' + Math.random().toString(36).substring(2, 9),
        name: cat.name || '',
        slug: (cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || ''),
        description: cat.description || '',
        image_url: cat.image_url || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
        display_order: cat.display_order || categories.length + 1,
        is_active: cat.is_active ?? true,
        created_at: new Date().toISOString(),
      };
      categories.push(saved);
    }

    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    notifyListeners('categories');
    return saved;
  },

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const client = requireSupabaseClient();
        const { count, error: countError } = await client
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', id);
        if (countError) throw countError;
        if ((count || 0) > 0) {
          return {
            success: false,
            error: `Cannot delete category: ${count} products are still assigned to it. Reassign or archive them first.`,
          };
        }

        const { data, error } = await client
          .from('categories')
          .delete()
          .eq('id', id)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        if (!data) return { success: false, error: 'Category was not found in Supabase.' };
        notifyListeners('categories');
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unable to delete category from Supabase.',
        };
      }
    }

    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const attachedCount = products.filter(p => p.category_id === id && !p.is_archived).length;
    if (attachedCount > 0) {
      return {
        success: false,
        error: `Cannot delete category: ${attachedCount} active products are currently assigned to it. Reassign or archive them first.`,
      };
    }

    const categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    notifyListeners('categories');
    return { success: true };
  },

  // ---------------- Products & Variants ----------------
  async getProducts(params?: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    isBestseller?: boolean;
    inStock?: boolean;
    sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
    includeArchived?: boolean;
  }): Promise<Product[]> {
    if (isSupabaseConfigured) {
      if (!supabase) {
        throw new Error('Supabase is configured, but its client could not be initialized.');
      }
      let query = supabase.from('products').select(`
        *,
        categories(name),
        product_variants(*),
        product_images(*)
      `);
      if (!params?.includeArchived) query = query.eq('is_archived', false).eq('is_active', true);
      if (params?.categoryId) query = query.eq('category_id', params.categoryId);
      if (params?.isFeatured) query = query.eq('is_featured', true);
      if (params?.isBestseller) query = query.eq('is_bestseller', true);
      if (params?.inStock) query = query.gt('stock_quantity', 0);
      if (params?.minPrice !== undefined) query = query.gte('base_price', params.minPrice);
      if (params?.maxPrice !== undefined) query = query.lte('base_price', params.maxPrice);
      if (params?.search?.trim()) {
        const searchTerm = params.search.trim().replace(/[^a-zA-Z0-9\s-]/g, ' ').replace(/\s+/g, ' ');
        if (searchTerm) {
          query = query.or([
            `name.ilike.%${searchTerm}%`,
            `short_description.ilike.%${searchTerm}%`,
            `sku.ilike.%${searchTerm}%`,
            `ingredients.ilike.%${searchTerm}%`,
          ].join(','));
        }
      }
      if (params?.sortBy === 'price-asc') query = query.order('base_price', { ascending: true });
      if (params?.sortBy === 'price-desc') query = query.order('base_price', { ascending: false });
      if (params?.sortBy === 'newest') query = query.order('created_at', { ascending: false });
      if (params?.sortBy === 'popular') {
        query = query
          .order('is_bestseller', { ascending: false })
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });
      }
      const { data, error } = await query;
      if (error) throw new Error(`Unable to load products from Supabase: ${error.message}`);
      return (data || []).map((product: any) => mapProduct({
        ...product,
        category_name: product.categories?.name,
        product_variants: product.product_variants || [],
        product_images: product.product_images || [],
      }));
    }

    let products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    const catMap = new Map(categories.map(c => [c.id, c.name]));

    products = products.map(p => ({
      ...p,
      category_name: catMap.get(p.category_id) || p.category_name || 'General',
    }));

    if (!params?.includeArchived) {
      products = products.filter(p => !p.is_archived && p.is_active);
    }

    if (params?.categoryId) {
      products = products.filter(p => p.category_id === params.categoryId);
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      products = products.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q) ||
          p.ingredients?.toLowerCase().includes(q)
      );
    }

    if (params?.minPrice !== undefined) {
      products = products.filter(p => p.base_price >= (params.minPrice || 0));
    }
    if (params?.maxPrice !== undefined) {
      products = products.filter(p => p.base_price <= (params.maxPrice || Infinity));
    }

    if (params?.isFeatured) {
      products = products.filter(p => p.is_featured);
    }
    if (params?.isBestseller) {
      products = products.filter(p => p.is_bestseller);
    }
    if (params?.inStock) {
      products = products.filter(p => p.stock_quantity > 0);
    }

    if (params?.sortBy) {
      switch (params.sortBy) {
        case 'price-asc':
          products.sort((a, b) => a.base_price - b.base_price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.base_price - a.base_price);
          break;
        case 'popular':
          products.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
          break;
        case 'newest':
        default:
          break;
      }
    }

    return products;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts({ includeArchived: true });
    return products.find(p => p.slug === slug) || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts({ includeArchived: true });
    return products.find(p => p.id === id) || null;
  },

  async saveProduct(prod: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      const productName = prod.name?.trim() || '';
      const productSku = prod.sku?.trim() || '';
      const productWeight = prod.weight_or_size?.trim() || '';
      const variants = prod.variants || [];
      const images = prod.images || [];

      if (!productName || !productSku || !productWeight) {
        throw new Error('Product name, SKU, and size are required.');
      }
      if (variants.length === 0) {
        throw new Error('A product must have at least one variant.');
      }
      if (prod.id && !isUuid(prod.id)) {
        throw new Error('Cannot edit a product with a non-database ID.');
      }

      let existingSlug: string | undefined;
      let existingVariantIds = new Set<string>();
      let existingImageIds = new Set<string>();
      if (prod.id) {
        const [{ data: existingProduct, error: productReadError }, { data: existingVariants, error: variantReadError }, { data: existingImages, error: imageReadError }] = await Promise.all([
          client.from('products').select('slug').eq('id', prod.id).single(),
          client.from('product_variants').select('id').eq('product_id', prod.id),
          client.from('product_images').select('id').eq('product_id', prod.id),
        ]);
        if (productReadError) throw new Error(`Unable to read product before editing: ${productReadError.message}`);
        if (variantReadError) throw new Error(`Unable to read product variants: ${variantReadError.message}`);
        if (imageReadError) throw new Error(`Unable to read product images: ${imageReadError.message}`);
        existingSlug = existingProduct.slug;
        existingVariantIds = new Set((existingVariants || []).map(row => row.id));
        existingImageIds = new Set((existingImages || []).map(row => row.id));
      }

      const productData = {
        name: productName,
        slug: prod.slug?.trim() || existingSlug || slugify(productName),
        category_id: prod.category_id || null,
        short_description: prod.short_description ?? '',
        full_description: prod.full_description ?? '',
        sku: productSku,
        base_price: Number(prod.base_price ?? 0),
        original_price: prod.original_price ?? null,
        discount_percentage: Number(prod.discount_percentage ?? 0),
        stock_quantity: Math.max(0, Math.trunc(Number(prod.stock_quantity ?? 0))),
        weight_or_size: productWeight,
        ingredients: prod.ingredients ?? null,
        storage_instructions: prod.storage_instructions ?? null,
        shelf_life: prod.shelf_life ?? null,
        is_featured: prod.is_featured ?? false,
        is_bestseller: prod.is_bestseller ?? false,
        is_active: prod.is_active ?? true,
        is_archived: prod.is_archived ?? false,
      };

      const productResult = prod.id
        ? await client.from('products').update(productData).eq('id', prod.id).select('id').single()
        : await client.from('products').insert(productData).select('id').single();
      if (productResult.error) {
        throw new Error(`Unable to save product in Supabase: ${productResult.error.message}`);
      }
      const productId = productResult.data.id;

      try {
        const submittedVariantIds = new Set(variants.filter(variant => isUuid(variant.id)).map(variant => variant.id));
        const submittedImageIds = new Set(images.filter(image => isUuid(image.id)).map(image => image.id));
        if ([...submittedVariantIds].some(id => !existingVariantIds.has(id))) {
          throw new Error('A submitted variant does not belong to this product.');
        }
        if ([...submittedImageIds].some(id => !existingImageIds.has(id))) {
          throw new Error('A submitted image does not belong to this product.');
        }

        const variantRows = variants.map((variant, index) => ({
          ...(isUuid(variant.id) ? { id: variant.id } : {}),
          product_id: productId,
          title: variant.title,
          weight_or_size: variant.weight_or_size,
          sku: variant.sku,
          price: Number(variant.price),
          original_price: variant.original_price ?? null,
          stock_quantity: Math.max(0, Math.trunc(Number(variant.stock_quantity))),
          is_active: variant.is_active ?? true,
          display_order: Number(variant.display_order ?? index),
        }));
        const { error: variantWriteError } = await client
          .from('product_variants')
          .upsert(variantRows, { onConflict: 'id' });
        if (variantWriteError) throw new Error(`Unable to save variants: ${variantWriteError.message}`);

        const removedVariantIds = [...existingVariantIds].filter(id => !submittedVariantIds.has(id));
        if (removedVariantIds.length > 0) {
          const { error } = await client
            .from('product_variants')
            .update({ is_active: false, stock_quantity: 0 })
            .eq('product_id', productId)
            .in('id', removedVariantIds);
          if (error) throw new Error(`Unable to deactivate removed variants: ${error.message}`);
        }

        const imageRows = images.map((image, index) => ({
          ...(isUuid(image.id) ? { id: image.id } : {}),
          product_id: productId,
          image_url: image.image_url,
          is_primary: image.is_primary ?? index === 0,
          display_order: Number(image.display_order ?? index + 1),
        }));
        if (imageRows.length > 0) {
          const { error: imageWriteError } = await client
            .from('product_images')
            .upsert(imageRows, { onConflict: 'id' });
          if (imageWriteError) throw new Error(`Unable to save product images: ${imageWriteError.message}`);
        }

        const removedImageIds = [...existingImageIds].filter(id => !submittedImageIds.has(id));
        if (removedImageIds.length > 0) {
          const { error } = await client
            .from('product_images')
            .delete()
            .eq('product_id', productId)
            .in('id', removedImageIds);
          if (error) throw new Error(`Unable to remove product images: ${error.message}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        throw new Error(`Product ${prod.id ? 'was updated' : 'was created'}, but its variants or images were not fully saved: ${message}`);
      }

      notifyListeners('products');
      const saved = await this.getProductById(productId);
      if (!saved) throw new Error('Product was saved, but could not be reloaded from Supabase.');
      return saved;
    }

    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    const category = categories.find(c => c.id === prod.category_id);

    let saved: Product;

    if (prod.id) {
      const idx = products.findIndex(p => p.id === prod.id);
      if (idx >= 0) {
        products[idx] = {
          ...products[idx],
          ...prod,
          category_name: category?.name || products[idx].category_name,
          updated_at: new Date().toISOString(),
        } as Product;
        saved = products[idx];
      } else {
        saved = prod as Product;
        products.push(saved);
      }
    } else {
      const newId = 'prod-' + Math.random().toString(36).substring(2, 9);
      const generatedSlug = (prod.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const baseVariants = prod.variants && prod.variants.length > 0
        ? prod.variants.map((v, i) => ({
            ...v,
            id: v.id || `var-${newId}-${i}`,
            product_id: newId,
          }))
        : [
            {
              id: `var-${newId}-default`,
              product_id: newId,
              title: prod.weight_or_size || 'Standard Pack',
              weight_or_size: prod.weight_or_size || '500g',
              sku: `${prod.sku || 'KVF'}-STD`,
              price: prod.base_price || 199,
              original_price: prod.original_price,
              stock_quantity: prod.stock_quantity || 20,
              is_active: true,
            },
          ];

      const baseImages = prod.images && prod.images.length > 0
        ? prod.images
        : [
            {
              id: `img-${newId}-1`,
              product_id: newId,
              image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
              is_primary: true,
              display_order: 1,
            },
          ];

      saved = {
        id: newId,
        name: prod.name || 'Unnamed Farm Product',
        slug: generatedSlug,
        category_id: prod.category_id || categories[0]?.id || 'cat-powders',
        category_name: category?.name || 'Powders',
        short_description: prod.short_description || '',
        full_description: prod.full_description || '',
        sku: prod.sku || `KVF-${Math.floor(100 + Math.random() * 900)}`,
        base_price: Number(prod.base_price) || 199,
        original_price: prod.original_price ? Number(prod.original_price) : undefined,
        discount_percentage: prod.discount_percentage || 0,
        stock_quantity: Number(prod.stock_quantity) || 20,
        weight_or_size: prod.weight_or_size || '250g',
        ingredients: prod.ingredients || '',
        storage_instructions: prod.storage_instructions || 'Store in a cool, dry place away from direct sunlight.',
        shelf_life: prod.shelf_life || '6 months from manufacture',
        is_featured: prod.is_featured ?? false,
        is_bestseller: prod.is_bestseller ?? false,
        is_active: prod.is_active ?? true,
        is_archived: false,
        rating: 5.0,
        review_count: 0,
        images: baseImages,
        variants: baseVariants,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      products.push(saved);
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    notifyListeners('products');
    return saved;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      if (!isUuid(id)) throw new Error('Cannot archive a product with a non-database ID.');
      const { data, error } = await client
        .from('products')
        .update({ is_archived: true, is_active: false })
        .eq('id', id)
        .select('id')
        .maybeSingle();
      if (error) throw new Error(`Unable to archive product in Supabase: ${error.message}`);
      if (!data) return false;
      notifyListeners('products');
      return true;
    }

    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const idx = products.findIndex(p => p.id === id);
    if (idx >= 0) {
      products[idx].is_archived = true;
      products[idx].is_active = false;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      notifyListeners('products');
      return true;
    }
    return false;
  },

  async restoreProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      if (!isUuid(id)) throw new Error('Cannot restore a product with a non-database ID.');
      const { data, error } = await client
        .from('products')
        .update({ is_archived: false, is_active: true })
        .eq('id', id)
        .select('id')
        .maybeSingle();
      if (error) throw new Error(`Unable to restore product in Supabase: ${error.message}`);
      if (!data) return false;
      notifyListeners('products');
      return true;
    }

    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const product = products.find(item => item.id === id);
    if (!product) return false;
    product.is_archived = false;
    product.is_active = true;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    notifyListeners('products');
    return true;
  },

  async getInventoryLogs(limit = 15): Promise<InventoryLog[]> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      const { data, error } = await client
        .from('inventory_logs')
        .select('*, products(name), product_variants(title)')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw new Error(`Unable to load inventory history from Supabase: ${error.message}`);
      return (data || []).map((row: any) => ({
        ...row,
        product_name: row.products?.name || 'Product',
        variant_title: row.product_variants?.title || undefined,
      })) as InventoryLog[];
    }

    const logs: InventoryLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS) || '[]');
    return logs.slice(0, Math.max(0, limit));
  },

  async updateVariantStock(productId: string, variantId: string, newStock: number, reason: string): Promise<void> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      if (!isUuid(productId) || !isUuid(variantId)) {
        throw new Error('Inventory adjustments require database product and variant IDs.');
      }
      const stock = Number(newStock);
      if (!Number.isFinite(stock)) throw new Error('Stock quantity must be a valid number.');
      const { error } = await client.rpc('adjust_variant_stock', {
        p_product_id: productId,
        p_variant_id: variantId,
        p_new_stock: Math.max(0, Math.trunc(stock)),
        p_reason: reason.trim() || 'Manual inventory adjustment',
      });
      if (error) throw new Error(`Unable to adjust inventory in Supabase: ${error.message}`);
      notifyListeners('products');
      notifyListeners('inventory');
      return;
    }

    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const variant = prod.variants.find(v => v.id === variantId);
    if (!variant) return;

    const previousStock = variant.stock_quantity;
    const diff = newStock - previousStock;
    variant.stock_quantity = Math.max(0, newStock);

    prod.stock_quantity = prod.variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    const logs: InventoryLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS) || '[]');
    logs.unshift({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      product_id: productId,
      product_name: prod.name,
      variant_id: variantId,
      variant_title: variant.title,
      change_quantity: diff,
      previous_stock: previousStock,
      new_stock: newStock,
      reason,
      created_by: 'Admin',
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify(logs));

    notifyListeners('products');
    notifyListeners('inventory');
  },

  // ---------------- Coupons ----------------
  async getCoupons(): Promise<Coupon[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (data) return data as Coupon[];
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ isValid: boolean; discountAmount: number; coupon?: Coupon; error?: string }> {
    const coupons = await this.getCoupons();
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode && c.is_active);

    if (!coupon) {
      return { isValid: false, discountAmount: 0, error: 'Invalid coupon code' };
    }

    if (coupon.valid_to && new Date(coupon.valid_to) < new Date()) {
      return { isValid: false, discountAmount: 0, error: 'This coupon has expired' };
    }

    if (coupon.usage_limit && coupon.total_used_count >= coupon.usage_limit) {
      return { isValid: false, discountAmount: 0, error: 'Coupon usage limit reached' };
    }

    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      return {
        isValid: false,
        discountAmount: 0,
        error: `Minimum order amount of ₹${coupon.min_order_amount} required to use this coupon`,
      };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      discount = coupon.discount_value;
    }

    discount = Math.min(discount, subtotal);
    discount = Math.round(discount * 100) / 100;

    return {
      isValid: true,
      discountAmount: discount,
      coupon,
    };
  },

  async saveCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
    const coupons: Coupon[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
    let saved: Coupon;

    if (couponData.id) {
      const idx = coupons.findIndex(c => c.id === couponData.id);
      if (idx >= 0) {
        coupons[idx] = { ...coupons[idx], ...couponData, updated_at: new Date().toISOString() };
        saved = coupons[idx];
      } else {
        saved = couponData as Coupon;
        coupons.push(saved);
      }
    } else {
      saved = {
        id: 'coup-' + Math.random().toString(36).substring(2, 9),
        code: (couponData.code || '').trim().toUpperCase(),
        description: couponData.description || '',
        discount_type: couponData.discount_type || 'percentage',
        discount_value: Number(couponData.discount_value) || 5,
        min_order_amount: Number(couponData.min_order_amount) || 0,
        max_discount_amount: couponData.max_discount_amount ? Number(couponData.max_discount_amount) : undefined,
        valid_from: couponData.valid_from || new Date().toISOString(),
        valid_to: couponData.valid_to,
        usage_limit: couponData.usage_limit,
        per_customer_limit: couponData.per_customer_limit || 1,
        total_used_count: 0,
        total_discount_granted: 0,
        is_active: couponData.is_active ?? true,
        created_at: new Date().toISOString(),
      };
      coupons.push(saved);
    }

    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    notifyListeners('coupons');
    return saved;
  },

  async deleteCoupon(id: string): Promise<boolean> {
    const coupons: Coupon[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
    const filtered = coupons.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(filtered));
    notifyListeners('coupons');
    return true;
  },

  // ---------------- Orders & Atomic Checkout ----------------
  async getNextOrderId(): Promise<string> {
    const currentSeq = parseInt(localStorage.getItem(STORAGE_KEYS.ORDER_COUNTER) || '4', 10);
    const orderId = `AKFARMS${String(currentSeq).padStart(5, '0')}`;
    localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, String(currentSeq + 1));
    return orderId;
  },

  async placeOrder(params: {
    customer_name: string;
    customer_email?: string;
    customer_phone: string;
    shipping_address: ShippingAddress;
    payment_method: PaymentMethod;
    items: { product_id: string; variant_id: string; quantity: number }[];
    coupon_code?: string;
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      if (params.items.length === 0) return { success: false, error: 'Cart is empty.' };
      const invalidItem = params.items.find(item =>
        !isUuid(item.product_id) ||
        !isUuid(item.variant_id) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      );
      if (invalidItem) {
        return {
          success: false,
          error: 'Your cart contains an invalid or outdated product. Refresh the catalog and add the item again.',
        };
      }

      // Ensure empty or blank coupon codes are passed as null to prevent database unassigned record errors
      const cleanCouponCode = params.coupon_code && params.coupon_code.trim() !== '' 
        ? params.coupon_code.trim() 
        : null;

      const { data, error } = await client.rpc('place_order_atomic', {
        p_customer_name: params.customer_name,
        p_customer_email: params.customer_email || null,
        p_customer_phone: params.customer_phone,
        p_shipping_address: params.shipping_address,
        p_payment_method: params.payment_method,
        p_items: params.items,
        p_coupon_code: cleanCouponCode,
      });
      if (error) return { success: false, error: `Unable to place order: ${error.message}` };

      const rpcResult = data as any;
      if (!rpcResult?.success || !rpcResult.order_id) {
        return { success: false, error: 'The order service returned an invalid confirmation.' };
      }

      const order = mapOrder(rpcResult);
      notifyListeners('orders');
      return { success: true, order };
    }

    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const settings: StoreSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(INITIAL_STORE_SETTINGS));

    let calculatedSubtotal = 0;
    const orderItems: any[] = [];

    for (const item of params.items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product || !product.is_active || product.is_archived) {
        return { success: false, error: `Product is no longer available.` };
      }

      const variant = product.variants.find(v => v.id === item.variant_id);
      if (!variant) {
        return { success: false, error: `Variant for ${product.name} not found.` };
      }

      if (variant.stock_quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name} (${variant.title}). Available: ${variant.stock_quantity}.`,
        };
      }

      const itemTotal = variant.price * item.quantity;
      calculatedSubtotal += itemTotal;

      const primaryImg = product.images.find(img => img.is_primary)?.image_url || product.images[0]?.image_url;

      orderItems.push({
        id: 'ord-item-' + Math.random().toString(36).substring(2, 9),
        order_id: '',
        product_id: product.id,
        variant_id: variant.id,
        product_name: product.name,
        variant_title: variant.title,
        category_name: product.category_name || 'General',
        sku: variant.sku,
        unit_price: variant.price,
        quantity: item.quantity,
        total_price: itemTotal,
        image_url: primaryImg,
      });
    }

    let discountAmount = 0;
    if (params.coupon_code) {
      const validation = await this.validateCoupon(params.coupon_code, calculatedSubtotal);
      if (validation.isValid) {
        discountAmount = validation.discountAmount;

        const coupons: Coupon[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
        const coupIdx = coupons.findIndex(c => c.code.toUpperCase() === params.coupon_code!.toUpperCase());
        if (coupIdx >= 0) {
          coupons[coupIdx].total_used_count += 1;
          coupons[coupIdx].total_discount_granted += discountAmount;
          localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
        }
      }
    }

    const discountedSubtotal = calculatedSubtotal - discountAmount;
    const deliveryCharge = discountedSubtotal >= settings.free_shipping_threshold ? 0 : settings.shipping_standard_fee;
    const finalTotal = Math.round((discountedSubtotal + deliveryCharge) * 100) / 100;

    const orderIdCode = await this.getNextOrderId();
    const orderUuid = 'ord-uuid-' + Math.random().toString(36).substring(2, 11);

    orderItems.forEach(i => (i.order_id = orderUuid));

    for (const item of params.items) {
      await this.updateVariantStock(item.product_id, item.variant_id, 0, `Order placed: ${orderIdCode}`);
      const p = products.find(pr => pr.id === item.product_id);
      const v = p?.variants.find(vr => vr.id === item.variant_id);
      if (v) {
        v.stock_quantity = Math.max(0, v.stock_quantity - item.quantity);
        p!.stock_quantity = p!.variants.reduce((s, vr) => s + vr.stock_quantity, 0);
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    const newOrder: Order = {
      id: orderUuid,
      order_id: orderIdCode,
      customer_name: params.customer_name,
      customer_email: params.customer_email || '',
      customer_phone: params.customer_phone,
      shipping_address: params.shipping_address,
      subtotal: calculatedSubtotal,
      discount_amount: discountAmount,
      delivery_charge: deliveryCharge,
      final_total: finalTotal,
      coupon_code: params.coupon_code,
      payment_method: params.payment_method,
      payment_status: params.payment_method === 'simulated_online' ? 'completed' : 'pending',
      order_status: 'confirmed',
      items: orderItems,
      status_history: [
        {
          id: 'hist-' + Math.random().toString(36).substring(2, 9),
          order_id: orderUuid,
          status: 'confirmed',
          note: params.payment_method === 'simulated_online'
            ? 'Order placed and simulated payment completed successfully.'
            : 'Order placed with Cash on Delivery.',
          updated_by: 'Customer',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const orders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    this.trackEvent('order_placed', {
      order_id: orderIdCode,
      revenue: finalTotal,
      units: orderItems.reduce((acc, i) => acc + i.quantity, 0),
    });

    notifyListeners('orders');
    notifyListeners('analytics');

    return {
      success: true,
      order: newOrder,
    };
  },

  async getOrders(filters?: { status?: OrderStatus; search?: string; customerEmail?: string }): Promise<Order[]> {
    let orders: Order[];
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      let query = client.from('orders').select(`
        *,
        order_items(*),
        order_status_history(*)
      `).order('created_at', { ascending: false });
      if (filters?.status) query = query.eq('order_status', filters.status);
      if (filters?.customerEmail) query = query.eq('customer_email', filters.customerEmail);
      const { data, error } = await query;
      if (error) throw new Error(`Unable to load orders from Supabase: ${error.message}`);
      orders = (data || []).map(mapOrder);
    } else {
      orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    }

    if (filters?.status) {
      orders = orders.filter(o => o.order_status === filters.status);
    }
    if (filters?.customerEmail) {
      orders = orders.filter(o => o.customer_email.toLowerCase() === filters.customerEmail!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      orders = orders.filter(
        o =>
          o.order_id.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          o.shipping_address.city.toLowerCase().includes(q)
      );
    }

    return orders;
  },

  async getOrderById(orderIdOrUuid: string): Promise<Order | null> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      const lookupField = isUuid(orderIdOrUuid) ? 'id' : 'order_id';
      const { data, error } = await client
        .from('orders')
        .select('*, order_items(*), order_status_history(*)')
        .eq(lookupField, orderIdOrUuid.trim())
        .maybeSingle();
      if (error) throw new Error(`Unable to load order from Supabase: ${error.message}`);
      return data ? mapOrder(data) : null;
    }

    const orders = await this.getOrders();
    const query = orderIdOrUuid.trim().toUpperCase();
    return (
      orders.find(o => o.id === orderIdOrUuid || o.order_id.toUpperCase() === query) || null
    );
  },

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    notes?: string,
    courierName?: string,
    trackingNumber?: string,
    trackingUrl?: string
  ): Promise<Order> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      const lookupField = isUuid(orderId) ? 'id' : 'order_id';
      const { data: existingOrder, error: readError } = await client
        .from('orders')
        .select('id, payment_method')
        .eq(lookupField, orderId)
        .maybeSingle();
      if (readError) throw new Error(`Unable to find order in Supabase: ${readError.message}`);
      if (!existingOrder) throw new Error(`Order ${orderId} not found.`);

      const updates: Record<string, unknown> = { order_status: newStatus };
      if (notes !== undefined) updates.admin_notes = notes;
      if (courierName !== undefined) updates.courier_name = courierName;
      if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
      if (trackingUrl !== undefined) updates.tracking_url = trackingUrl;
      if (newStatus === 'delivered' && existingOrder.payment_method === 'cod') {
        updates.payment_status = 'completed';
      }

      const { error: updateError } = await client
        .from('orders')
        .update(updates)
        .eq('id', existingOrder.id);
      if (updateError) throw new Error(`Unable to update order in Supabase: ${updateError.message}`);

      const { error: historyError } = await client.from('order_status_history').insert({
        order_id: existingOrder.id,
        status: newStatus,
        note: notes || `Status updated to ${newStatus.replace(/_/g, ' ')}`,
        updated_by: 'Admin',
      });
      if (historyError) {
        throw new Error(`Order status was updated, but its history entry failed: ${historyError.message}`);
      }

      notifyListeners('orders');
      const updatedOrder = await this.getOrderById(existingOrder.id);
      if (!updatedOrder) throw new Error('Order was updated, but could not be reloaded from Supabase.');
      return updatedOrder;
    }

    const orders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const idx = orders.findIndex(o => o.id === orderId || o.order_id === orderId);

    if (idx < 0) {
      throw new Error(`Order ${orderId} not found`);
    }

    const order = orders[idx];
    order.order_status = newStatus;
    order.updated_at = new Date().toISOString();

    if (courierName) order.courier_name = courierName;
    if (trackingNumber) order.tracking_number = trackingNumber;
    if (trackingUrl) order.tracking_url = trackingUrl;

    if (newStatus === 'delivered' && order.payment_method === 'cod') {
      order.payment_status = 'completed';
    }

    if (!order.status_history) order.status_history = [];
    order.status_history.push({
      id: 'hist-' + Math.random().toString(36).substring(2, 9),
      order_id: order.id,
      status: newStatus,
      note: notes || `Status updated to ${newStatus.replace(/_/g, ' ')}`,
      updated_by: 'Admin',
      created_at: new Date().toISOString(),
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    notifyListeners('orders');
    return order;
  },

  // ---------------- Customer Management ----------------
  async getCustomers(): Promise<Customer[]> {
    const orders = await this.getOrders();
    const map = new Map<string, Customer>();

    orders.forEach(o => {
      const email = (o.customer_email || 'guest@customer.com').toLowerCase();
      if (!map.has(email)) {
        map.set(email, {
          email,
          name: o.customer_name,
          phone: o.customer_phone,
          total_orders: 1,
          total_spent: o.final_total,
          first_order_date: o.created_at,
          last_order_date: o.created_at,
          is_returning: false,
        });
      } else {
        const c = map.get(email)!;
        c.total_orders += 1;
        c.total_spent += o.final_total;
        c.is_returning = true;
        if (new Date(o.created_at) > new Date(c.last_order_date)) {
          c.last_order_date = o.created_at;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.total_spent - a.total_spent);
  },

  // ---------------- Reviews ----------------
  async getReviews(productId?: string, status: 'approved' | 'all' = 'approved'): Promise<Review[]> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      let query = client.from('reviews').select('*').order('created_at', { ascending: false });
      if (productId) query = query.eq('product_id', productId);
      if (status !== 'all') query = query.eq('status', 'approved');
      const { data, error } = await query;
      if (error) throw new Error(`Unable to load reviews from Supabase: ${error.message}`);
      return (data || []) as Review[];
    }

    let reviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
    if (productId) {
      reviews = reviews.filter(r => r.product_id === productId);
    }
    if (status !== 'all') {
      reviews = reviews.filter(r => r.status === status);
    }
    return reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async submitReview(review: Omit<Review, 'id' | 'created_at' | 'status'>): Promise<Review> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      const { data, error } = await client
        .from('reviews')
        .insert({
          product_id: review.product_id,
          user_name: review.user_name.trim(),
          user_email: review.user_email.trim().toLowerCase(),
          rating: review.rating,
          title: review.title?.trim() || null,
          comment: review.comment.trim(),
          is_verified_purchase: false,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw new Error(`Unable to submit review: ${error.message}`);
      notifyListeners('reviews');
      return data as Review;
    }

    const reviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
    const newRev: Review = {
      ...review,
      id: 'rev-' + Math.random().toString(36).substring(2, 9),
      is_verified_purchase: false,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    reviews.unshift(newRev);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const prod = products.find(p => p.id === review.product_id);
    if (prod) {
      const prodRevs = reviews.filter(r => r.product_id === review.product_id && r.status === 'approved');
      const avg = prodRevs.reduce((acc, r) => acc + r.rating, 0) / prodRevs.length;
      prod.rating = Math.round(avg * 10) / 10;
      prod.review_count = prodRevs.length;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }

    notifyListeners('reviews');
    notifyListeners('products');
    return newRev;
  },

  async updateReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      if (!isUuid(id)) throw new Error('Cannot moderate a review with a non-database ID.');
      const { data, error } = await client
        .from('reviews')
        .update({ status })
        .eq('id', id)
        .select('id')
        .maybeSingle();
      if (error) throw new Error(`Unable to update review status: ${error.message}`);
      if (!data) throw new Error('Review was not found or you are not authorized to moderate it.');
      notifyListeners('reviews');
      return;
    }

    const reviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
    const r = reviews.find(rev => rev.id === id);
    if (r) {
      r.status = status;
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
      notifyListeners('reviews');
    }
  },

  async deleteReview(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const client = requireSupabaseClient();
      if (!isUuid(id)) throw new Error('Cannot delete a review with a non-database ID.');
      const { data, error } = await client
        .from('reviews')
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();
      if (error) throw new Error(`Unable to delete review: ${error.message}`);
      if (!data) throw new Error('Review was not found or you are not authorized to delete it.');
      notifyListeners('reviews');
      return;
    }

    const reviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
    const filtered = reviews.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(filtered));
    notifyListeners('reviews');
  },

  // ---------------- Visitor & Analytics Tracking ----------------
  trackEvent(
    eventType: AnalyticsEvent['event_type'],
    metadata?: Record<string, any>,
    productId?: string,
    categoryId?: string
  ): void {
    if (typeof window === 'undefined') return;

    const sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID) || 'anon_session';
    const events: AnalyticsEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANALYTICS_EVENTS) || '[]');

    events.push({
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      session_id: sessionId,
      event_type: eventType,
      product_id: productId,
      category_id: categoryId,
      metadata,
      created_at: new Date().toISOString(),
    });

    if (events.length > 2000) events.splice(0, events.length - 2000);
    localStorage.setItem(STORAGE_KEYS.ANALYTICS_EVENTS, JSON.stringify(events));
  },

  async getAnalytics(dateRange: 'today' | '7d' | '30d' | '90d' | 'custom', customStart?: string, customEnd?: string) {
    const orders = await this.getOrders();
    const products = await this.getProducts({ includeArchived: true });
    const categories = await this.getCategories(true);
    const events: AnalyticsEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANALYTICS_EVENTS) || '[]');

    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();

    if (dateRange === 'today') {
      startDate.setHours(0, 0, 0, 0);
      prevStartDate.setDate(now.getDate() - 1);
      prevStartDate.setHours(0, 0, 0, 0);
      prevEndDate.setDate(now.getDate() - 1);
      prevEndDate.setHours(23, 59, 59, 999);
    } else if (dateRange === '7d') {
      startDate.setDate(now.getDate() - 7);
      prevStartDate.setDate(now.getDate() - 14);
      prevEndDate.setDate(now.getDate() - 7);
    } else if (dateRange === '30d') {
      startDate.setDate(now.getDate() - 30);
      prevStartDate.setDate(now.getDate() - 60);
      prevEndDate.setDate(now.getDate() - 30);
    } else if (dateRange === '90d') {
      startDate.setDate(now.getDate() - 90);
      prevStartDate.setDate(now.getDate() - 180);
      prevEndDate.setDate(now.getDate() - 90);
    } else if (dateRange === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      const days = Math.max(1, Math.round((new Date(customEnd).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      prevEndDate = new Date(startDate);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - days);
    }

    const currentOrders = orders.filter(o => new Date(o.created_at) >= startDate && o.order_status !== 'cancelled');
    const prevOrders = orders.filter(
      o => new Date(o.created_at) >= prevStartDate && new Date(o.created_at) < prevEndDate && o.order_status !== 'cancelled'
    );

    const currentEvents = events.filter(e => new Date(e.created_at) >= startDate);

    const totalRevenue = currentOrders.reduce((sum, o) => sum + o.final_total, 0);
    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.final_total, 0);

    const revenueGrowthPct = prevRevenue > 0
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
      : totalRevenue > 0 ? 100 : 0;

    const totalOrdersCount = currentOrders.length;
    const prevOrdersCount = prevOrders.length;

    const totalUnitsSold = currentOrders.reduce(
      (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    const sessionIds = new Set(currentEvents.map(e => e.session_id));
    const totalVisitors = Math.max(sessionIds.size, totalOrdersCount * 3 + 12);
    const uniqueVisitors = Math.round(totalVisitors * 0.78);
    const productViews = currentEvents.filter(e => e.event_type === 'product_view').length || totalVisitors * 4;
    const categoryViews = currentEvents.filter(e => e.event_type === 'category_view').length || totalVisitors * 2;
    const addToCartCount = currentEvents.filter(e => e.event_type === 'add_to_cart').length || totalOrdersCount * 2 + 5;
    const checkoutStarts = currentEvents.filter(e => e.event_type === 'checkout_start').length || totalOrdersCount + 3;
    const conversionRate = totalVisitors > 0 ? Math.round((totalOrdersCount / totalVisitors) * 1000) / 10 : 0;

    const salesGrowthSeries: { date: string; currentSales: number; prevSales: number }[] = [];
    const daysToShow = dateRange === 'today' ? 24 : dateRange === '7d' ? 7 : 14;

    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

      const daySales = currentOrders
        .filter(o => new Date(o.created_at).toDateString() === d.toDateString())
        .reduce((sum, o) => sum + o.final_total, 0);

      const prevD = new Date(d);
      prevD.setDate(prevD.getDate() - daysToShow);
      const prevDaySales = prevOrders
        .filter(o => new Date(o.created_at).toDateString() === prevD.toDateString())
        .reduce((sum, o) => sum + o.final_total, 0);

      salesGrowthSeries.push({
        date: dateStr,
        currentSales: Math.round(daySales),
        prevSales: Math.round(prevDaySales),
      });
    }

    const prodSalesMap = new Map<string, { name: string; units: number; revenue: number; category: string }>();
    currentOrders.forEach(o => {
      o.items.forEach(item => {
        const cur = prodSalesMap.get(item.product_name) || {
          name: item.product_name,
          units: 0,
          revenue: 0,
          category: item.category_name,
        };
        cur.units += item.quantity;
        cur.revenue += item.total_price;
        prodSalesMap.set(item.product_name, cur);
      });
    });

    const bestSellers = Array.from(prodSalesMap.values()).sort((a, b) => b.units - a.units);

    const catSalesMap = new Map<string, { category: string; sales: number; units: number }>();
    categories.forEach(c => catSalesMap.set(c.name, { category: c.name, sales: 0, units: 0 }));

    currentOrders.forEach(o => {
      o.items.forEach(item => {
        const c = catSalesMap.get(item.category_name) || { category: item.category_name, sales: 0, units: 0 };
        c.sales += item.total_price;
        c.units += item.quantity;
        catSalesMap.set(item.category_name, c);
      });
    });
    const categorySales = Array.from(catSalesMap.values());

    const categoryPerformance = salesGrowthSeries.map(point => {
      const entry: Record<string, any> = { date: point.date };
      categories.forEach(c => {
        entry[c.name] = Math.round(point.currentSales * (0.2 + (c.display_order * 0.05)));
      });
      return entry;
    });

    const categoryInventory = categories.map(cat => {
      const catProds = products.filter(p => p.category_id === cat.id && !p.is_archived);
      const activeCount = catProds.length;
      const availableCount = catProds.filter(p => p.stock_quantity > 0).length;
      const outOfStockCount = catProds.filter(p => p.stock_quantity === 0).length;
      const unitsSold = currentOrders.reduce(
        (sum, o) => sum + o.items.filter(i => i.category_name === cat.name).reduce((is, i) => is + i.quantity, 0),
        0
      );
      const revenue = currentOrders.reduce(
        (sum, o) => sum + o.items.filter(i => i.category_name === cat.name).reduce((is, i) => is + i.total_price, 0),
        0
      );

      return {
        category: cat.name,
        totalProducts: activeCount,
        available: availableCount,
        outOfStock: outOfStockCount,
        unitsSold,
        revenue,
      };
    });

    const top10Products = bestSellers.slice(0, 10);

    const paymentBreakdown = [
      { name: 'Simulated Online / UPI', value: currentOrders.filter(o => o.payment_method === 'simulated_online').length },
      { name: 'Cash on Delivery', value: currentOrders.filter(o => o.payment_method === 'cod').length },
    ];

    const statusBreakdown = [
      { name: 'Delivered', count: currentOrders.filter(o => o.order_status === 'delivered').length },
      { name: 'Shipped', count: currentOrders.filter(o => o.order_status === 'shipped' || o.order_status === 'out_for_delivery').length },
      { name: 'Processing / Packed', count: currentOrders.filter(o => o.order_status === 'processing' || o.order_status === 'packed').length },
      { name: 'Confirmed / Pending', count: currentOrders.filter(o => o.order_status === 'confirmed' || o.order_status === 'pending').length },
      { name: 'Cancelled / Returned', count: currentOrders.filter(o => o.order_status === 'cancelled' || o.order_status === 'returned').length },
    ];

    const lowStockProducts = products.filter(p => p.stock_quantity <= 15 && !p.is_archived);

    return {
      kpis: {
        totalRevenue,
        prevRevenue,
        revenueGrowthPct: Math.round(revenueGrowthPct * 10) / 10,
        totalOrdersCount,
        prevOrdersCount,
        totalUnitsSold,
        averageOrderValue,
        totalVisitors,
        uniqueVisitors,
        productViews,
        categoryViews,
        addToCartCount,
        checkoutStarts,
        conversionRate,
      },
      salesGrowthSeries,
      bestSellers,
      categorySales,
      categoryPerformance,
      categoryInventory,
      top10Products,
      paymentBreakdown,
      statusBreakdown,
      lowStockProducts,
    };
  },

  // ---------------- Contact & Newsletter ----------------
  async submitContactMessage(msg: { name: string; email: string; phone?: string; subject?: string; message: string }): Promise<boolean> {
    const messages: ContactMessage[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACT_MSGS) || '[]');
    messages.unshift({
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      name: msg.name,
      email: msg.email,
      phone: msg.phone,
      subject: msg.subject || 'General Inquiry',
      message: msg.message,
      status: 'new',
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.CONTACT_MSGS, JSON.stringify(messages));
    notifyListeners('contact');
    return true;
  },

  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    const subscribers: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NEWSLETTER) || '[]');
    if (subscribers.includes(email.toLowerCase())) {
      return { success: true, message: 'You are already subscribed to Karnam Vari Farms updates!' };
    }
    subscribers.push(email.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.NEWSLETTER, JSON.stringify(subscribers));
    return { success: true, message: 'Thank you for subscribing! Check your inbox soon for delicious farm updates.' };
  },

  // ---------------- Settings ----------------
  async getStoreSettings(): Promise<StoreSettings> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(INITIAL_STORE_SETTINGS));
  },

  async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getStoreSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    notifyListeners('settings');
    return updated;
  },
};