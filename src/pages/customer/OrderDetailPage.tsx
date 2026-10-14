import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { Order, OrderStatus } from '../../types';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronLeft,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);

    dataService.getOrderById(orderId).then(ord => {
      setOrder(ord);
      setLoading(false);
    });

    const unsub = dataService.subscribe('orders', () => {
      dataService.getOrderById(orderId).then(setOrder);
    });
    return unsub;
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#1b4332] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-stone-500 mt-3">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-800">Order Not Found</h2>
        <p className="text-xs text-stone-500">
          We could not find an order matching reference {orderId}.
        </p>
        <Link
          to="/my-orders"
          className="inline-block px-5 py-2.5 bg-[#1b4332] text-white rounded-xl text-xs font-semibold"
        >
          Return to My Orders
        </Link>
      </div>
    );
  }

  // Stepper order sequence
  const standardSteps: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
  ];

  const currentStepIndex = standardSteps.indexOf(order.order_status);
  const isCancelled = order.order_status === 'cancelled';
  const isReturn = order.order_status === 'return_requested' || order.order_status === 'returned';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f4eee2] pb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/my-orders"
            className="p-2 hover:bg-[#f4eee2] rounded-xl text-stone-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg sm:text-xl text-[#1b4332]">
                {order.order_id}
              </span>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#f4eee2] text-[#8b4513] border border-[#ebe0cd]">
                {order.order_status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Placed on {new Date(order.created_at).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        <Link
          to="/contact"
          className="text-xs font-semibold text-[#8b4513] hover:underline self-start sm:self-auto"
        >
          Need help with this order? Contact Farm
        </Link>
      </div>

      {/* 2. Order Tracking Stepper */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebe0cd] shadow-2xs space-y-6">
        <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#1b4332]" />
          <span>Dispatch & Delivery Status</span>
        </h3>

        {isCancelled ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold">This order was cancelled.</span>
              <p className="mt-0.5 text-rose-600">
                Any pre-authorized amounts have been credited back according to our refund policy.
              </p>
            </div>
          </div>
        ) : isReturn ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center gap-3 text-xs">
            <RotateCcw className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold">Return Status: {order.order_status.replace(/_/g, ' ')}</span>
              <p className="mt-0.5 text-amber-700">
                Our farm customer care representative is reviewing the return inquiry.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
              {standardSteps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step} className="flex flex-col items-center space-y-2 relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors z-10 ${
                        isPassed
                          ? 'bg-[#1b4332] text-white shadow-sm'
                          : 'bg-stone-100 text-stone-400'
                      } ${isCurrent ? 'ring-4 ring-[#bcddc5]' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] capitalize ${
                        isCurrent
                          ? 'font-bold text-[#1b4332]'
                          : isPassed
                          ? 'font-semibold text-stone-700'
                          : 'text-stone-400'
                      }`}
                    >
                      {step.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Courier Tracking Info (if assigned) */}
        {order.courier_name && order.tracking_number && (
          <div className="bg-[#faf7f2] p-4 rounded-2xl border border-[#f4eee2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">
                Courier Partner
              </span>
              <div className="font-bold text-stone-900 mt-0.5">{order.courier_name}</div>
              <div className="text-stone-500 font-mono mt-0.5">
                AWB / Tracking: <strong>{order.tracking_number}</strong>
              </div>
            </div>

            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b4332] text-white font-semibold rounded-xl hover:bg-[#2d5a27] transition-colors self-start sm:self-auto"
              >
                <span>Live Courier Tracking</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* 3. Items & Pricing Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Ordered Items Table (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#1b4332]" />
            <span>Ordered Items Snapshot</span>
          </h3>

          <div className="divide-y divide-stone-100">
            {order.items.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h5 className="font-semibold text-stone-900 truncate">{item.product_name}</h5>
                    <div className="text-stone-400 text-[11px]">
                      {item.variant_title} • SKU: {item.sku}
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      ₹{item.unit_price} × {item.quantity}
                    </div>
                  </div>
                </div>

                <div className="font-serif font-bold text-sm text-[#1b4332] shrink-0">
                  ₹{item.total_price}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-stone-100 pt-4 space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-stone-900">₹{order.subtotal}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon Discount ({order.coupon_code}):</span>
                <span>- ₹{order.discount_amount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charges:</span>
              <span>{order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}</span>
            </div>
            <div className="border-t border-stone-100 pt-2 flex justify-between items-baseline font-bold text-stone-900 text-sm">
              <span>Total Amount:</span>
              <span className="font-serif text-xl text-[#1b4332]">₹{order.final_total}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4 text-xs">
            <h4 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
              Delivery Destination
            </h4>
            <div className="space-y-1 text-stone-700">
              <div className="font-semibold text-stone-900">{order.customer_name}</div>
              <div className="text-stone-500">{order.customer_phone}</div>
              <div className="text-stone-500">{order.customer_email}</div>
              <div className="pt-2 text-stone-600 leading-relaxed">
                {order.shipping_address.address_line}
                {order.shipping_address.landmark ? `, Near ${order.shipping_address.landmark}` : ''}
                <br />
                {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
              </div>
            </div>

            <h4 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-100 pt-3 pb-2">
              Payment Summary
            </h4>
            <div className="space-y-1 text-stone-700">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-semibold capitalize">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="uppercase font-bold text-[10px] text-emerald-700">
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
