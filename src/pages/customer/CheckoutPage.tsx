import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { PaymentMethod, ShippingAddress } from '../../types';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotal, discountAmount, deliveryCharge, finalTotal, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Andhra Pradesh');
  const [pincode, setPincode] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    dataService.trackEvent('checkout_start', {
      subtotal,
      itemCount: cart.length,
    });
  }, [subtotal, cart.length]);

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900">
          Your cart is currently empty
        </h2>
        <p className="text-xs text-stone-500">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="inline-block px-5 py-2.5 bg-[#1b4332] text-white rounded-xl text-xs font-semibold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
    if (!fullName.trim() || !email.trim() || !phone.trim() || !addressLine.trim() || !city.trim() || !pincode.trim()) {
      setErrorMsg('Please fill in all required shipping and contact details.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (pincode.replace(/\D/g, '').length !== 6) {
      setErrorMsg('Please enter a valid 6-digit Indian postal PIN code.');
      return;
    }

    setLoading(true);

    const shippingAddress: ShippingAddress = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address_line: addressLine.trim(),
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };

    const orderPayload = {
      customer_name: fullName.trim(),
      customer_email: email.trim(),
      customer_phone: phone.trim(),
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      coupon_code: appliedCoupon?.code,
      items: cart.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      })),
    };

    try {
      const result = await dataService.placeOrder(orderPayload);
      if (result.success && result.order) {
        clearCart();
        navigate(`/order-confirmation/${result.order.order_id}`);
      } else {
        setErrorMsg(result.error || 'Failed to place order. Please review your cart.');
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during checkout.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#f4eee2] pb-4">
        <Link to="/cart" className="p-2 hover:bg-[#f4eee2] rounded-xl text-stone-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Secure Checkout
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Safe farm direct dispatch • SSL 256-bit encrypted checkout
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer & Address Information (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Contact Info */}
          <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white text-xs flex items-center justify-center font-sans">
                1
              </span>
              Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Venkata Rao Karnam"
                  className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Mobile Number (for Courier Tracking SMS) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#ebe0cd] bg-stone-100 text-stone-600 text-xs">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="flex-1 px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-r-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white text-xs flex items-center justify-center font-sans">
                2
              </span>
              Delivery Address
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Flat, House No, Building, Street *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={e => setAddressLine(e.target.value)}
                  placeholder="e.g. Flat 302, Sai Balaji Enclave, Main Road"
                  className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  placeholder="e.g. Near Ramalayam Temple"
                  className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Guntur"
                    className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                  >
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Delhi">Delhi / NCR</option>
                    <option value="Other States">Other States</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 522002"
                    className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white text-xs flex items-center justify-center font-sans">
                3
              </span>
              Payment Method
            </h3>

            <div className="space-y-3">
              {/* COD Option */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#1b4332] bg-[#f2f7f4] ring-1 ring-[#1b4332]'
                    : 'border-[#ebe0cd] bg-white hover:bg-[#faf7f2]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-[#1b4332] focus:ring-[#1b4332]"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-stone-900">
                    <Banknote className="w-4 h-4 text-[#2d5a27]" />
                    <span>Cash on Delivery (Pay at Doorstep)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Pay securely in cash or UPI QR scan when our delivery courier reaches your address.
                  </p>
                </div>
              </label>

              {/* Simulated Online Payment */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'simulated_online'
                    ? 'border-[#1b4332] bg-[#f2f7f4] ring-1 ring-[#1b4332]'
                    : 'border-[#ebe0cd] bg-white hover:bg-[#faf7f2]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="simulated_online"
                  checked={paymentMethod === 'simulated_online'}
                  onChange={() => setPaymentMethod('simulated_online')}
                  className="mt-1 text-[#1b4332] focus:ring-[#1b4332]"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-stone-900">
                    <CreditCard className="w-4 h-4 text-[#c58940]" />
                    <span>Simulated Online Payment / UPI (Demo Mode)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Tests instant digital confirmation without real credit charges. Architecture is production-ready for Razorpay/Cashfree.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Review & Confirmation (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-28">
          <div className="bg-white rounded-3xl p-6 border border-[#ebe0cd] shadow-md space-y-5">
            <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-100 pb-3">
              Order Review ({cart.length} items)
            </h3>

            {/* Compact items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.image_url}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-stone-800 truncate">{item.product_name}</h5>
                    <div className="text-stone-400 text-[11px]">
                      {item.variant_title} × {item.quantity}
                    </div>
                  </div>
                  <div className="font-serif font-bold text-stone-900">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-stone-100 pt-3 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <strong className="text-emerald-700 font-bold uppercase text-[11px]">
                      FREE
                    </strong>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>

              <div className="border-t border-stone-100 pt-2 flex justify-between items-baseline text-stone-900">
                <span className="font-bold text-sm">Final Amount:</span>
                <span className="font-serif font-bold text-2xl text-[#1b4332]">
                  ₹{finalTotal}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-[#1b4332] hover:bg-[#2d5a27] disabled:bg-stone-300 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span>Generating Order AKFARMS...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Order (₹{finalTotal})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-[11px] text-stone-400 text-center leading-relaxed">
              By clicking Place Order, your order ID (AKFARMS0000X) will be generated and validated on the backend.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
