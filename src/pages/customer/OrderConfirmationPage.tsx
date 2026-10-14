import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { dataService } from '../../services/dataService';
import { Order } from '../../types';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Truck,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Copy,
  Check
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigationOrder = (location.state as { order?: Order } | null)?.order;
  const initialOrder = navigationOrder?.order_id === orderId ? navigationOrder ?? null : null;
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1B4332', '#C58940', '#D4A373', '#2D5A27'],
      });
    } catch (e) {
      // ignore
    }

    let active = true;
    if (initialOrder) setOrder(initialOrder);
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(!initialOrder);
    dataService.getOrderById(orderId)
      .then(orderData => {
        if (active && orderData) setOrder(orderData);
      })
      .catch(() => {
        if (active && !initialOrder) setOrder(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId, location.state]);

  const copyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.order_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#1b4332] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-stone-500 mt-3">Loading order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-800">Order Not Found</h2>
        <p className="text-xs text-stone-500">
          We could not locate order details for {orderId}.
        </p>
        <Link
          to="/my-orders"
          className="inline-block px-5 py-2.5 bg-[#1b4332] text-white rounded-xl text-xs font-semibold"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* 1. Success Message Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ebe0cd] shadow-lg text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#f2f7f4] border-2 border-[#2d5a27] flex items-center justify-center text-[#1b4332]">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Order Successfully Placed
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Thank You For Supporting Karnam Vari Farms!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed pt-1">
            We have received your order and our village farm dispatch team is preparing your fresh small-batch package.
          </p>
        </div>

        {/* Order ID Box */}
        <div className="inline-flex items-center gap-3 bg-[#faf7f2] border border-[#c58940] px-5 py-2.5 rounded-2xl">
          <span className="text-xs text-stone-500 font-medium">Your Order ID:</span>
          <span className="font-mono font-bold text-sm text-[#1b4332] tracking-wider">
            {order.order_id}
          </span>
          <button
            onClick={copyOrderId}
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
            title="Copy Order ID"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
          <Link
            to={`/order/${order.order_id}`}
            state={{ order }}
            className="px-6 py-2.5 bg-[#1b4332] text-white font-semibold rounded-xl hover:bg-[#2d5a27] transition-colors"
          >
            Track Order Status
          </Link>
          <Link
            to="/shop"
            className="px-6 py-2.5 bg-[#f4eee2] text-stone-800 font-semibold rounded-xl hover:bg-[#ebe0cd] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* 2. Order Summary & Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ordered Items */}
        <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#1b4332]" />
            <span>Ordered Items ({order.items.length})</span>
          </h3>

          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-3 text-xs">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-stone-800 truncate">{item.product_name}</h5>
                  <div className="text-stone-400 text-[11px]">
                    {item.variant_title} × {item.quantity}
                  </div>
                </div>
                <div className="font-serif font-bold text-stone-900">
                  ₹{item.total_price}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 pt-3 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon Discount ({order.coupon_code}):</span>
                <span>- ₹{order.discount_amount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}</span>
            </div>
            <div className="border-t border-stone-100 pt-2 flex justify-between font-bold text-sm text-stone-900">
              <span>Final Total Paid / Due:</span>
              <span className="font-serif text-[#1b4332]">₹{order.final_total}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Destination */}
        <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#1b4332]" />
            <span>Shipping & Payment Information</span>
          </h3>

          <div className="space-y-3 text-xs text-stone-700">
            <div>
              <span className="text-stone-400 block text-[11px] mb-0.5">Recipient:</span>
              <div className="font-semibold text-stone-900">{order.customer_name}</div>
              <div className="flex items-center gap-1.5 text-stone-500 mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{order.customer_phone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-500 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{order.customer_email}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <span className="text-stone-400 block text-[11px] mb-0.5">Delivery Address:</span>
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8b4513] shrink-0 mt-0.5" />
                <span>
                  {order.shipping_address.address_line}
                  {order.shipping_address.landmark ? `, Near ${order.shipping_address.landmark}` : ''},{' '}
                  {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <span className="text-stone-400 block text-[11px] mb-0.5">Payment Method:</span>
              <span className="font-semibold text-stone-900 capitalize">
                {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Simulated Online / UPI'}
              </span>
              <span className="ml-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
