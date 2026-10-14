import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { Order, Product } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const AdminOverviewPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | '90d' | 'custom'>('7d');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockList, setLowStockList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [analytics, orders, prods] = await Promise.all([
      dataService.getAnalytics(dateRange),
      dataService.getOrders(),
      dataService.getProducts(),
    ]);

    setAnalyticsData(analytics);
    setRecentOrders(orders.slice(0, 6));
    setLowStockList(prods.filter(p => p.stock_quantity <= 15 && !p.is_archived));
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const unsub = dataService.subscribe('*', loadData);
    return unsub;
  }, [dateRange]);

  if (loading && !analyticsData) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#1b4332] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-stone-500 mt-2">Loading administrative overview...</p>
      </div>
    );
  }

  const kpis = analyticsData?.kpis || {};
  const isPositiveGrowth = (kpis.revenueGrowthPct ?? 0) >= 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebe0cd] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Operations Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Dashboard Overview
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time sales, order fulfillment, and stock performance
          </p>
        </div>

        {/* Date Filter & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white rounded-xl border border-[#ebe0cd] p-1 shadow-2xs">
            {(['today', '7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors uppercase ${
                  dateRange === range
                    ? 'bg-[#1b4332] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            className="p-2 bg-white border border-[#ebe0cd] text-stone-600 hover:text-stone-900 rounded-xl shadow-2xs"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/admin/products"
            className="px-4 py-2 bg-[#1b4332] text-white font-semibold text-xs rounded-xl hover:bg-[#2d5a27] shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">
            ₹{kpis.totalRevenue?.toLocaleString('en-IN') || 0}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {isPositiveGrowth ? (
              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +{kpis.revenueGrowthPct}%
              </span>
            ) : (
              <span className="text-rose-600 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> {kpis.revenueGrowthPct}%
              </span>
            )}
            <span className="text-stone-400">vs previous {dateRange}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">
            {kpis.totalOrdersCount || 0}
          </div>
          <div className="text-xs text-stone-500">
            Avg Order Value: <strong>₹{kpis.averageOrderValue || 0}</strong>
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white p-5 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Units Dispatched</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">
            {kpis.totalUnitsSold || 0}
          </div>
          <div className="text-xs text-stone-500">
            Across Powders, Pachadlu, Oils
          </div>
        </div>

        {/* Visitors & Conversion */}
        <div className="bg-white p-5 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Conversion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">
            {kpis.conversionRate || 0}%
          </div>
          <div className="text-xs text-stone-500">
            {kpis.totalVisitors || 0} visitors tracked
          </div>
        </div>
      </div>

      {/* 3. Sales Growth Chart Preview */}
      <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Sales Trend ({dateRange.toUpperCase()})
            </h3>
            <p className="text-xs text-stone-500">
              Daily revenue comparison with previous period
            </p>
          </div>
          <Link
            to="/admin/sales"
            className="text-xs font-semibold text-[#1b4332] hover:text-[#c58940] flex items-center gap-1"
          >
            <span>Deep Sales Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData?.salesGrowthSeries || []}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1b4332" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1b4332" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e9dd" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={val => `₹${val}`} />
              <Tooltip
                formatter={(val: any) => [`₹${val}`, 'Sales']}
                contentStyle={{ backgroundColor: '#FAF7F2', borderRadius: '12px', border: '1px solid #ebe0cd' }}
              />
              <Area type="monotone" dataKey="currentSales" stroke="#1b4332" strokeWidth={2.5} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Split Section: Recent Orders (7 cols) + Low Stock Alerts (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Recent Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#1b4332] hover:underline"
            >
              View all orders &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-medium">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Payment</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#faf7f2] transition-colors">
                    <td className="py-3 font-mono font-bold text-[#1b4332]">
                      {order.order_id}
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-stone-800">{order.customer_name}</div>
                      <div className="text-[10px] text-stone-400">{order.shipping_address.city}</div>
                    </td>
                    <td className="py-3 font-serif font-bold text-stone-900">
                      ₹{order.final_total}
                    </td>
                    <td className="py-3">
                      <span className="capitalize text-[11px] text-stone-600">
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          order.order_status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.order_status === 'shipped'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.order_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/orders?highlight=${order.order_id}`}
                        className="text-[#8b4513] hover:underline font-semibold"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Low Stock Alerts
              </h3>
            </div>
            <Link
              to="/admin/inventory"
              className="text-xs font-semibold text-[#1b4332] hover:underline"
            >
              Restock &rarr;
            </Link>
          </div>

          {lowStockList.length > 0 ? (
            <div className="space-y-3">
              {lowStockList.slice(0, 5).map(prod => (
                <div key={prod.id} className="p-3 rounded-2xl bg-[#faf7f2] border border-[#f4eee2] flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <h5 className="font-semibold text-stone-800 truncate">{prod.name}</h5>
                    <span className="text-[10px] text-stone-400">{prod.category_name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-rose-600">
                      {prod.stock_quantity} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-stone-400">
              All farm products have healthy inventory levels (&gt; 15 units).
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
