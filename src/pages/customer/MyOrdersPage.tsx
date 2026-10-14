import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { Order } from '../../types';
import {
  Package,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight
} from 'lucide-react';

export const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getOrders().then(ords => {
      setOrders(ords);
      setLoading(false);
    });

    const unsub = dataService.subscribe('orders', () => {
      dataService.getOrders().then(setOrders);
    });
    return unsub;
  }, []);

  const filteredOrders = orders.filter(
    o =>
      o.order_id.toLowerCase().includes(searchVal.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchVal.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchVal.toLowerCase()) ||
      o.customer_phone.includes(searchVal)
  );

  const getStatusBadge = (status: Order['order_status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'processing':
      case 'packed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Title & Lookup */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#f4eee2] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Customer Tracking Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332] mt-1">
            My Farm Orders
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track and monitor dispatch progress of your orders
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Search by Order ID (AKFARMS...)"
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#1b4332] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-stone-500 mt-3">Loading orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ebe0cd] shadow-2xs hover:shadow-md transition-all space-y-4"
            >
              {/* Order Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f2f7f4] text-[#1b4332] flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-xs sm:text-sm text-stone-900">
                      {order.order_id}
                    </span>
                    <div className="text-[11px] text-stone-400">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusBadge(
                      order.order_status
                    )}`}
                  >
                    {order.order_status.replace(/_/g, ' ')}
                  </span>
                  <div className="text-right">
                    <div className="font-serif font-bold text-base text-[#1b4332]">
                      ₹{order.final_total}
                    </div>
                    <div className="text-[10px] text-stone-400 uppercase">
                      {order.payment_method}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              <div className="flex flex-wrap gap-3 items-center">
                {order.items.slice(0, 4).map(item => (
                  <div key={item.id} className="flex items-center gap-2 bg-[#faf7f2] p-1.5 pr-3 rounded-xl border border-[#f4eee2]">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover bg-stone-100"
                      />
                    )}
                    <span className="text-xs text-stone-800 font-medium truncate max-w-40">
                      {item.product_name}
                    </span>
                    <span className="text-[11px] text-stone-400 font-semibold">
                      ×{item.quantity}
                    </span>
                  </div>
                ))}
                {order.items.length > 4 && (
                  <span className="text-xs text-stone-400">
                    +{order.items.length - 4} more items
                  </span>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <span className="text-stone-500 text-[11px]">
                  Shipping to: {order.shipping_address.city}, {order.shipping_address.state}
                </span>
                <Link
                  to={`/order/${order.order_id}`}
                  className="font-semibold text-[#1b4332] hover:text-[#c58940] flex items-center gap-1 transition-colors"
                >
                  <span>View Details & Timeline</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#ebe0cd] p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#faf7f2] text-stone-400 flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-800">
            No orders found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            {searchVal
              ? `No orders matching "${searchVal}" were found.`
              : 'You have not placed any orders yet. Explore our farm catalog to place your first order!'}
          </p>
          <Link
            to="/shop"
            className="inline-block px-5 py-2.5 bg-[#1b4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a27]"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};
