import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Tag,
  CheckCircle2,
  ShieldCheck,
  Truck
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
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
  } = useCart();

  const [couponMessage, setCouponMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [applying, setApplying] = useState(false);

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

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#faf7f2] border border-[#f4eee2] flex items-center justify-center text-stone-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
          Looks like you haven't added any authentic podis, traditional pachadlu, or cold-pressed oils yet.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1b4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a27] transition-all shadow-md"
        >
          <span>Explore Farm Delicacies</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#f4eee2] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Shopping Cart
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in your basket
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-rose-600 transition-colors"
        >
          Clear entire cart
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-[#faf7f2] p-4 rounded-2xl border border-[#ebe0cd] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-800 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#1b4332]" />
            {amountNeededForFreeShipping > 0 ? (
              <>
                Add <strong className="text-[#1b4332]">₹{amountNeededForFreeShipping}</strong> more to unlock <strong>FREE Delivery</strong>!
              </>
            ) : (
              <span className="text-emerald-700 font-bold">
                🎉 Congratulations! You have unlocked FREE Express Delivery!
              </span>
            )}
          </span>
          <span className="font-bold text-stone-500">{shippingProgressPct}%</span>
        </div>
        <div className="w-full h-2 bg-[#f4eee2] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1b4332] transition-all duration-500"
            style={{ width: `${shippingProgressPct}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Cart Items (8 cols) + Order Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#f4eee2] flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xs hover:border-[#ebe0cd] transition-all"
            >
              {/* Product Thumbnail */}
              <img
                src={item.image_url}
                alt={item.product_name}
                className="w-20 h-20 rounded-xl object-cover bg-stone-100 shrink-0"
              />

              {/* Item Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b4513]">
                  {item.category_name}
                </span>
                <h3 className="font-serif font-bold text-sm text-stone-900 truncate">
                  {item.product_name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span>Size: <strong>{item.variant_title}</strong></span>
                  <span>•</span>
                  <span>SKU: {item.sku}</span>
                </div>
                <div className="text-xs font-serif font-bold text-stone-900">
                  ₹{item.price} each
                </div>
              </div>

              {/* Quantity Controls & Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                {/* Counter */}
                <div className="flex items-center border border-[#ebe0cd] rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-stone-600 hover:bg-stone-50"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-stone-800 min-w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.max_stock}
                    className="px-2.5 py-1 text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Total Price */}
                <div className="text-right min-w-20">
                  <span className="font-serif font-bold text-base text-[#1b4332]">
                    ₹{item.price * item.quantity}
                  </span>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <Link
              to="/shop"
              className="text-xs font-semibold text-[#1b4332] hover:text-[#c58940] transition-colors"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white rounded-3xl p-5 border border-[#ebe0cd] shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800">
              <Tag className="w-4 h-4 text-[#c58940]" />
              <span>Apply Coupon</span>
            </div>

            {appliedCoupon ? (
              <div className="bg-[#f2f7f4] border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-xs text-emerald-800">
                    {appliedCoupon.code}
                  </div>
                  <div className="text-[11px] text-emerald-600">
                    Saving ₹{discountAmount} on this order
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. AKSHAY07)"
                    className="flex-1 px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs font-mono uppercase focus:outline-hidden focus:border-[#1b4332]"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={applying}
                    className="px-4 py-2 bg-[#1b4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a27] transition-colors shrink-0"
                  >
                    {applying ? 'Checking...' : 'Apply'}
                  </button>
                </div>

                {couponMessage && (
                  <p
                    className={`text-[11px] ${
                      couponMessage.error ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}

                {/* Quick Coupon Pill */}
                <div className="pt-2">
                  <button
                    onClick={() => handleApplyCoupon('AKSHAY07')}
                    className="w-full text-left p-2.5 rounded-xl border border-dashed border-[#c58940] bg-[#faf7f2] hover:bg-[#f4eee2] transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-stone-700">
                      <Sparkles className="w-3.5 h-3.5 text-[#c58940]" />
                      <span>Use <strong>AKSHAY07</strong> for 5% OFF</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#8b4513] uppercase">
                      Tap to Apply
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-[#ebe0cd] shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal ({totalItemCount} items)</span>
                <span className="font-semibold text-stone-900">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <strong className="text-emerald-700 uppercase font-bold text-[11px]">
                      FREE
                    </strong>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-3 flex justify-between items-baseline">
              <div>
                <div className="text-sm font-bold text-stone-900">Total Payable:</div>
                <div className="text-[10px] text-stone-400">Inclusive of all taxes</div>
              </div>
              <div className="text-2xl font-serif font-bold text-[#1b4332]">
                ₹{finalTotal}
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 bg-[#1b4332] hover:bg-[#2d5a27] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-[10px] text-stone-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2d5a27]" />
              <span>Safe & Secure Checkout • Direct from Village Farms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
