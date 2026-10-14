import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import {
  X,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    cart,
    updateQuantity,
    removeFromCart,
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
  } = useCart();

  const [couponMessage, setCouponMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!isOpen) return null;

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCodeInput).trim();
    if (!code) return;

    setApplying(true);
    const res = await applyCoupon(code);
    setApplying(false);
    setCouponMessage({ text: res.message, error: !res.success });
  };

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - (subtotal - discountAmount));
  const shippingProgressPct = Math.min(100, Math.round(((subtotal - discountAmount) / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Slide-over Panel (pointer-events-auto restores clicks inside the drawer while letting background remain clickable) */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 pointer-events-auto shadow-2xl">
        <div className="w-screen max-w-md bg-white border-l border-[#ebe0cd] flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-[#faf7f2]">
            <h2 className="font-serif font-bold text-base text-stone-900">
              Your Cart ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#f4eee2] p-3 text-xs border-b border-[#ebe0cd] space-y-1.5">
            <div className="flex justify-between font-medium text-stone-800">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#1b4332]" />
                {amountNeededForFreeShipping > 0 ? (
                  <>Add <strong>₹{amountNeededForFreeShipping}</strong> for Free Delivery</>
                ) : (
                  <span className="text-emerald-700 font-bold">🎉 Free Delivery Unlocked!</span>
                )}
              </span>
              <span>{shippingProgressPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#1b4332] transition-all duration-500" style={{ width: `${shippingProgressPct}%` }} />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto text-stone-300" />
                <p className="text-xs text-stone-500">Your cart is currently empty.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 bg-[#faf7f2]/50">
                  <img src={item.image_url} alt="" className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-xs text-stone-900 truncate">{item.product_name}</h4>
                    <p className="text-[11px] text-stone-500">{item.variant_title}</p>
                    <div className="text-xs font-bold text-[#1b4332] mt-0.5">₹{item.price} each</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden text-xs">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-0.5 text-stone-600 hover:bg-stone-50">-</button>
                      <span className="px-2 font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.max_stock} className="px-2 py-0.5 text-stone-600 hover:bg-stone-50 disabled:opacity-40">+</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-100 bg-[#faf7f2] space-y-4">
              {/* Coupon input */}
              <div className="space-y-1.5">
                {appliedCoupon ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-emerald-800">{appliedCoupon.code}</span>
                      <span className="text-emerald-600 ml-2">(-₹{discountAmount})</span>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-rose-600 font-semibold hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code (e.g. AKSHAY07)"
                      className="flex-1 px-3 py-2 bg-white border border-[#ebe0cd] rounded-xl text-xs font-mono uppercase focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      disabled={applying}
                      className="px-4 py-2 bg-[#1b4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a27]"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponMessage && (
                  <p className={`text-[11px] ${couponMessage.error ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{deliveryCharge === 0 ? <strong className="text-emerald-700 uppercase">FREE</strong> : `₹${deliveryCharge}`}</span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between items-baseline text-stone-900">
                  <span className="font-bold text-sm">Estimated Total:</span>
                  <span className="font-serif font-bold text-2xl text-[#1b4332]">₹{finalTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
                className="w-full py-3.5 px-6 bg-[#1b4332] hover:bg-[#2d5a27] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};