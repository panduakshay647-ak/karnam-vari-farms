import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { Order, OrderStatus } from '../../types';
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(highlightId || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('confirmed');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await dataService.getOrders();
    setOrders(data);

    // Auto open highlight order if requested in URL
    if (highlightId) {
      const target = data.find(o => o.order_id === highlightId);
      if (target) openOrderModal(target);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const unsub = dataService.subscribe('orders', fetchOrders);
    return unsub;
  }, []);

  const openOrderModal = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.order_status);
    setCourierName(ord.courier_name || 'DTDC Express');
    setTrackingNumber(ord.tracking_number || '');
    setTrackingUrl(ord.tracking_url || '');
    setAdminNotes('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const updated = await dataService.updateOrderStatus(
        selectedOrder.id,
        newStatus,
        adminNotes,
        courierName,
        trackingNumber,
        trackingUrl
      );
      setSelectedOrder(updated);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.order_id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping_address.city.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && o.order_status !== statusFilter) return false;
    return true;
  });

  const allStatuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'return_requested',
    'returned',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebe0cd] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Customer Fulfillment
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Order Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Process incoming orders, update dispatch timelines, and track delivery courier status
          </p>
        </div>

        {/* Status Quick Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
          {['all', 'confirmed', 'processing', 'packed', 'shipped', 'delivered'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#1b4332] text-white'
                  : 'bg-white border border-[#ebe0cd] text-stone-600 hover:bg-[#faf7f2]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ebe0cd] shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Order ID (AKFARMS...), customer, phone..."
            className="w-full pl-9 pr-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span>Showing {filteredOrders.length} orders</span>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-[#8b4513] font-semibold hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#ebe0cd] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf7f2] border-b border-[#ebe0cd] text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-[#fdfbf7] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#1b4332]">
                    {order.order_id}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">
                    <div>
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {new Date(order.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-900">{order.customer_name}</div>
                    <div className="text-[11px] text-stone-500">{order.customer_phone}</div>
                    <div className="text-[11px] text-stone-400 truncate max-w-36">{order.customer_email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    <div className="font-semibold text-stone-800">{order.shipping_address.city}</div>
                    <div className="text-[11px] text-stone-400">{order.shipping_address.state}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-stone-800">{order.items.length} items</span>
                    <div className="text-[10px] text-stone-400 truncate max-w-32">
                      {order.items[0]?.product_name}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-serif font-bold text-stone-900 text-sm">
                      ₹{order.final_total}
                    </div>
                    {order.discount_amount > 0 && (
                      <span className="text-[10px] text-emerald-700 font-semibold block">
                        Saved ₹{order.discount_amount}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize font-semibold text-stone-700 block">
                      {order.payment_method === 'cod' ? 'COD' : 'Online / UPI'}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        order.payment_status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        order.order_status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.order_status === 'shipped' || order.order_status === 'out_for_delivery'
                          ? 'bg-sky-100 text-sky-800'
                          : order.order_status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.order_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openOrderModal(order)}
                      className="px-3 py-1 bg-[#1b4332] text-white text-[11px] font-semibold rounded-lg hover:bg-[#2d5a27] transition-colors"
                    >
                      Inspect & Fulfill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspector & Status Updater Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <ClipboardList className="w-6 h-6 text-[#1b4332]" />
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Order Details: {selectedOrder.order_id}
                </h3>
                <span className="text-xs text-stone-500">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#faf7f2] p-4 rounded-2xl border border-[#ebe0cd] text-xs">
              <div>
                <span className="text-stone-400 font-semibold block uppercase text-[10px]">Customer:</span>
                <div className="font-bold text-stone-900 mt-0.5">{selectedOrder.customer_name}</div>
                <div className="text-stone-500">{selectedOrder.customer_phone}</div>
                <div className="text-stone-500">{selectedOrder.customer_email}</div>
              </div>

              <div>
                <span className="text-stone-400 font-semibold block uppercase text-[10px]">Shipping Destination:</span>
                <div className="text-stone-700 mt-0.5 leading-relaxed">
                  {selectedOrder.shipping_address.address_line}
                  <br />
                  {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                </div>
              </div>

              <div>
                <span className="text-stone-400 font-semibold block uppercase text-[10px]">Payment Summary:</span>
                <div className="font-serif font-bold text-base text-[#1b4332] mt-0.5">
                  ₹{selectedOrder.final_total}
                </div>
                <div className="text-stone-600 capitalize">
                  {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Simulated Online / UPI'}
                </div>
                <div className="text-[10px] uppercase font-bold text-emerald-700">
                  Status: {selectedOrder.payment_status}
                </div>
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b4513]">
                Ordered Items ({selectedOrder.items.length})
              </h4>
              <div className="border border-[#ebe0cd] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf7f2] text-stone-500 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Variant Size</th>
                      <th className="py-2.5 px-3">Unit Price</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {selectedOrder.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-semibold text-stone-900">
                          {item.product_name}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">{item.variant_title}</td>
                        <td className="py-2.5 px-3">₹{item.unit_price}</td>
                        <td className="py-2.5 px-3 font-bold">{item.quantity}</td>
                        <td className="py-2.5 px-3 font-serif font-bold text-stone-900 text-right">
                          ₹{item.total_price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status Update & Courier Tracking Form */}
            <form onSubmit={handleUpdateStatus} className="bg-white p-5 rounded-2xl border-2 border-[#1b4332]/20 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1b4332]">
                Update Order Status & Dispatch Info
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Order Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs font-semibold text-stone-800"
                  >
                    {allStatuses.map(st => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={e => setCourierName(e.target.value)}
                    placeholder="e.g. BlueDart / DTDC / Delhivery"
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Tracking / AWB Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BLD99210345"
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Courier Tracking URL
                  </label>
                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={e => setTrackingUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Status Note / Internal Remarks
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="e.g. Handed over to BlueDart courier vehicle for express transit."
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 bg-[#1b4332] text-white text-xs font-bold rounded-xl hover:bg-[#2d5a27] shadow-sm transition-colors"
                >
                  {updating ? 'Saving...' : 'Apply Status Update'}
                </button>
              </div>
            </form>

            {/* Status History Audit Trail */}
            {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Status History Trail
                </h4>
                <div className="space-y-1.5 text-xs text-stone-600">
                  {selectedOrder.status_history.map(hist => (
                    <div key={hist.id} className="flex items-center justify-between bg-[#faf7f2] p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 capitalize">
                          {hist.status.replace(/_/g, ' ')}
                        </span>
                        <span>—</span>
                        <span className="text-stone-500">{hist.note}</span>
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {new Date(hist.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
