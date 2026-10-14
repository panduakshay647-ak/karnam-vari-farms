import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '../types';
import { dataService } from '../services/dataService';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  couponCodeInput: string;
  setCouponCodeInput: (code: string) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  freeShippingThreshold: number;
  finalTotal: number;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kvf_cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kvf_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(70);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);

  // Sync settings
  useEffect(() => {
    dataService.getStoreSettings().then(settings => {
      setFreeShippingThreshold(settings.free_shipping_threshold);
    });
  }, []);

  // Save cart changes
  useEffect(() => {
    localStorage.setItem('kvf_cart', JSON.stringify(cart));
  }, [cart]);

  // Save applied coupon
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('kvf_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('kvf_applied_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, variant?: ProductVariant, quantity = 1) => {
    const selectedVariant = variant || product.variants[0] || {
      id: `var-${product.id}-default`,
      product_id: product.id,
      title: product.weight_or_size,
      weight_or_size: product.weight_or_size,
      sku: product.sku,
      price: product.base_price,
      original_price: product.original_price,
      stock_quantity: product.stock_quantity,
      is_active: true,
    };

    const itemId = `${product.id}_${selectedVariant.id}`;
    const primaryImg = product.images.find(img => img.is_primary)?.image_url || product.images[0]?.image_url || '';

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === itemId);
      if (existingIndex >= 0) {
        const updated = [...prevCart];
        const newQty = Math.min(
          updated[existingIndex].quantity + quantity,
          selectedVariant.stock_quantity
        );
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: itemId,
            product_id: product.id,
            variant_id: selectedVariant.id,
            product_name: product.name,
            variant_title: selectedVariant.title,
            sku: selectedVariant.sku,
            price: selectedVariant.price,
            original_price: selectedVariant.original_price,
            image_url: primaryImg,
            quantity: Math.min(quantity, selectedVariant.stock_quantity),
            max_stock: selectedVariant.stock_quantity,
            category_name: product.category_name,
          },
        ];
      }
    });

    dataService.trackEvent('add_to_cart', {
      product_name: product.name,
      variant: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
    }, product.id, product.category_id);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const validQty = Math.min(quantity, item.max_stock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Recalculate discount
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
  const currentDeliveryFee = discountedSubtotal >= freeShippingThreshold || subtotal === 0 ? 0 : deliveryCharge;
  const finalTotal = Math.max(0, Math.round((discountedSubtotal + currentDeliveryFee) * 100) / 100);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (code: string) => {
    if (!code.trim()) {
      return { success: false, message: 'Please enter a coupon code.' };
    }
    const result = await dataService.validateCoupon(code, subtotal);
    if (result.isValid && result.coupon) {
      setAppliedCoupon(result.coupon);
      return {
        success: true,
        message: `Coupon "${result.coupon.code}" applied! You save ₹${result.discountAmount}`,
      };
    } else {
      return { success: false, message: result.error || 'Invalid coupon code.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        couponCodeInput,
        setCouponCodeInput,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        deliveryCharge: currentDeliveryFee,
        freeShippingThreshold,
        finalTotal,
        totalItemCount,
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
