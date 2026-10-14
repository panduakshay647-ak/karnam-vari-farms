import React, { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import {
  Users,
  Eye,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export const AdminAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | '90d' | 'custom'>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    const data = await dataService.getAnalytics(dateRange, customStart, customEnd);
    setAnalytics(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
    const unsub = dataService.subscribe('analytics', fetchAnalytics);
    return unsub;
  }, [dateRange, customStart, customEnd]);

  const kpis = analytics?.kpis || {};

  // Funnel Data
  const funnelData = [
    { step: '1. Store Visits', count: kpis.totalVisitors || 0, color: '#1B4332' },
    { step: '2. Product Views', count: kpis.productViews || 0, color: '#244B20' },
    { step: '3. Added to Cart', count: kpis.addToCartCount || 0, color: '#2D5A27' },
    { step: '4. Started Checkout', count: kpis.checkoutStarts || 0, color: '#C58940' },
    { step: '5. Successful Orders', count: kpis.totalOrdersCount || 0, color: '#132E23' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebe0cd] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Traffic & Funnel Conversion
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Website Visitors & Conversion Analytics
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real visitor session tracking, page view events, and conversion funnel drop-off
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {(['today', '7d', '30d', '90d', 'custom'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                dateRange === range
                  ? 'bg-[#1b4332] text-white'
                  : 'bg-white border border-[#ebe0cd] text-stone-600 hover:bg-[#faf7f2]'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Pickers (if custom selected) */}
      {dateRange === 'custom' && (
        <div className="bg-white p-4 rounded-2xl border border-[#ebe0cd] flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium">Start Date:</span>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="px-3 py-1.5 border border-[#ebe0cd] rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium">End Date:</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 border border-[#ebe0cd] rounded-lg"
            />
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-1.5 bg-[#1b4332] text-white rounded-lg font-semibold"
          >
            Filter Custom Window
          </button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-500 uppercase">Total Visitors</span>
          <div className="text-xl font-serif font-bold text-stone-900">{kpis.totalVisitors || 0}</div>
          <span className="text-[10px] text-stone-400">Total sessions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-500 uppercase">Unique Visitors</span>
          <div className="text-xl font-serif font-bold text-stone-900">{kpis.uniqueVisitors || 0}</div>
          <span className="text-[10px] text-stone-400">Unique devices</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-500 uppercase">Product Views</span>
          <div className="text-xl font-serif font-bold text-stone-900">{kpis.productViews || 0}</div>
          <span className="text-[10px] text-stone-400">Item detail views</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-500 uppercase">Category Views</span>
          <div className="text-xl font-serif font-bold text-stone-900">{kpis.categoryViews || 0}</div>
          <span className="text-[10px] text-stone-400">Browsing intent</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-500 uppercase">Add To Cart</span>
          <div className="text-xl font-serif font-bold text-stone-900">{kpis.addToCartCount || 0}</div>
          <span className="text-[10px] text-stone-400">Cart additions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-500 uppercase">Conversion Rate</span>
          <div className="text-xl font-serif font-bold text-emerald-800">{kpis.conversionRate || 0}%</div>
          <span className="text-[10px] text-stone-400">Orders / Visitors</span>
        </div>
      </div>

      {/* Visitor Conversion Funnel */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ebe0cd] shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Customer Journey & Conversion Funnel
            </h3>
            <p className="text-xs text-stone-500">
              Event progression from initial landing to final successful order confirmation
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#faf7f2] px-3 py-1.5 rounded-xl border border-[#ebe0cd] text-xs text-stone-600">
            <Info className="w-4 h-4 text-[#8b4513]" />
            <span>Conversion = (Total Orders &divide; Total Visitors) &times; 100</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ left: 30, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0e9dd" />
              <XAxis type="number" stroke="#9ca3af" fontSize={11} />
              <YAxis dataKey="step" type="category" stroke="#1b4332" fontSize={11} width={130} />
              <Tooltip
                formatter={(val: any) => [val, 'Events']}
                contentStyle={{ backgroundColor: '#FAF7F2', borderRadius: '12px', border: '1px solid #ebe0cd' }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
