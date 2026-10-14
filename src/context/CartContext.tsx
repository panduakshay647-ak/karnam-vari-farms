import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, Coupon } from '../types';
import { dataService } from '../services/dataService';

export interface CartItem {
  id: string; // unique cart line ID (product_id + variant_id)
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_title: string;
  category_name: string;
  sku: string;
  price: number;
  original_price?: number;
  quantity: number;
  max_stock: number;
  image_url: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  freeShippingThreshold: number;
  finalTotal: number;
  totalItemCount: number;
  appliedCoupon: Coupon | null;
  couponCodeInput: string;
  setCouponCodeInput: (code: string) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'kvf_persistent_cart_v1';
const COUPON_STORAGE_KEY = 'kvf_applied_coupon_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize cart from localStorage so the user is remembered across visits/refreshes
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [standardFee, setStandardFee] = useState(70);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [cart]);

  // Save applied coupon to localStorage
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  // Load store settings for shipping thresholds
  useEffect(() => {
    dataService.getStoreSettings().then(settings => {
      if (settings?.free_shipping_threshold) {
        setFreeShippingThreshold(settings.free_shipping_threshold);
      }
      if (settings?.shipping_standard_fee !== undefined) {
        setStandardFee(settings.shipping_standard_fee);
      }
    }).catch(() => {});
  }, []);

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    const lineId = `${product.id}_${variant.id}`;
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === lineId);
      const primaryImg = product.images.find(img => img.is_primary)?.image_url || product.images[0]?.image_url || '';

      if (existingIndex >= 0) {
        const updated = [...prevCart];
        const currentItem = updated[existingIndex];
        const newQty = Math.min(variant.stock_quantity, currentItem.quantity + quantity);
        updated[existingIndex] = {
          ...currentItem,
          quantity: newQty,
          max_stock: variant.stock_quantity,
          price: variant.price,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: lineId,
          product_id: product.id,
          variant_id: variant.id,
          product_name: product.name,
          variant_title: variant.title,
          category_name: product.category_name || 'General',
          sku: variant.sku,
          price: variant.price,
          original_price: variant.original_price,
          quantity: Math.min(variant.stock_quantity, quantity),
          max_stock: variant.stock_quantity,
          image_url: primaryImg,
        };
        return [...prevCart, newItem];
      }
    });

    dataService.trackEvent('add_to_cart', { product_name: product.name, variant: variant.title }, product.id, product.category_id);
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.id === cartItemId) {
          return { ...item, quantity: Math.min(item.max_stock, quantity) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(COUPON_STORAGE_KEY);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate discount if coupon is applied
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.max_discount_amount && discountAmount > appliedCoupon.max_discount_amount) {
        discountAmount = appliedCoupon.max_discount_amount;
      }
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
    discountAmount = Math.min(discountAmount, subtotal);
    discountAmount = Math.round(discountAmount * 100) / 100;
  }

  const discountedSubtotal = subtotal - discountAmount;
  const deliveryCharge = discountedSubtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardFee;
  const finalTotal = Math.round((discountedSubtotal + deliveryCharge) * 100) / 100;
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const res = await dataService.validateCoupon(code, subtotal);
    if (res.isValid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponCodeInput('');
      return { success: true, message: `Coupon "${res.coupon.code}" applied successfully!` };
    } else {
      return { success: false, message: res.error || 'Invalid coupon code.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        discountAmount,
        deliveryCharge,
        freeShippingThreshold,
        finalTotal,
        totalItemCount,
        appliedCoupon,
        couponCodeInput,
        setCouponCodeInput,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};