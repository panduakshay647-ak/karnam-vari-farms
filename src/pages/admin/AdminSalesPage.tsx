import React, { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  ShoppingBag,
  CreditCard,
  PieChart as PieIcon,
  PackageCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const AdminSalesPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | '90d' | 'custom'>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [top10Metric, setTop10Metric] = useState<'units' | 'revenue'>('revenue');
  const [loading, setLoading] = useState(true);

  const fetchSalesData = async () => {
    setLoading(true);
    const data = await dataService.getAnalytics(dateRange, customStart, customEnd);
    setAnalytics(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSalesData();
    const unsub = dataService.subscribe('orders', fetchSalesData);
    return unsub;
  }, [dateRange, customStart, customEnd]);

  const kpis = analytics?.kpis || {};
  const isPositiveGrowth = (kpis.revenueGrowthPct ?? 0) >= 0;

  const handleExportCSV = async () => {
    const orders = await dataService.getOrders();
    const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Phone', 'City', 'State', 'Subtotal', 'Discount', 'Delivery', 'Final Total', 'Payment Method', 'Payment Status', 'Order Status'];
    const rows = orders.map(o => [
      o.order_id,
      new Date(o.created_at).toISOString(),
      `"${o.customer_name}"`,
      o.customer_email,
      o.customer_phone,
      `"${o.shipping_address.city}"`,
      `"${o.shipping_address.state}"`,
      o.subtotal,
      o.discount_amount,
      o.delivery_charge,
      o.final_total,
      o.payment_method,
      o.payment_status,
      o.order_status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `karnam_vari_farms_sales_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CATEGORY_COLORS = ['#1B4332', '#C58940', '#8B4513', '#2D5A27', '#6F4E37'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebe0cd] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Revenue Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Sales Analytics & Graphs
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Deep reporting on revenue trends, best-selling farm products, and category growth
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date range filter */}
          <div className="flex bg-white rounded-xl border border-[#ebe0cd] p-1 shadow-2xs">
            {(['today', '7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors ${
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
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-[#ebe0cd] text-[#1b4332] font-semibold text-xs rounded-xl hover:bg-[#faf7f2] shadow-2xs flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#c58940]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Selected Period Revenue
          </span>
          <div className="text-3xl font-serif font-bold text-[#1b4332]">
            ₹{kpis.totalRevenue?.toLocaleString('en-IN') || 0}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className={isPositiveGrowth ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
              {isPositiveGrowth ? `+${kpis.revenueGrowthPct}%` : `${kpis.revenueGrowthPct}%`}
            </span>
            <span className="text-stone-400">vs comparison window</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Comparison Period Revenue
          </span>
          <div className="text-3xl font-serif font-bold text-stone-600">
            ₹{kpis.prevRevenue?.toLocaleString('en-IN') || 0}
          </div>
          <div className="text-xs text-stone-400">
            Calculated over preceding {dateRange} window
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Units Dispatched
          </span>
          <div className="text-3xl font-serif font-bold text-stone-900">
            {kpis.totalUnitsSold || 0} units
          </div>
          <div className="text-xs text-stone-500">
            Across {kpis.totalOrdersCount || 0} confirmed orders
          </div>
        </div>
      </div>

      {/* 3. Graph 1: Sales Growth (Area Chart with comparison period) */}
      <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Graph 1: Sales Growth Over Time
            </h3>
            <p className="text-xs text-stone-500">
              Daily revenue comparison with previous period
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#1b4332]">
              <span className="w-3 h-3 rounded-full bg-[#1b4332]" /> Current Period
            </span>
            <span className="flex items-center gap-1.5 text-stone-400">
              <span className="w-3 h-3 rounded-full bg-stone-300" /> Comparison Period
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.salesGrowthSeries || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e9dd" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={val => `₹${val}`} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  `₹${val}`,
                  name === 'currentSales' ? 'Current Period' : 'Previous Period',
                ]}
                contentStyle={{ backgroundColor: '#FAF7F2', borderRadius: '12px', border: '1px solid #ebe0cd' }}
              />
              <Area type="monotone" dataKey="prevSales" stroke="#9ca3af" strokeWidth={1.5} fill="#f3ece0" fillOpacity={0.4} />
              <Area type="monotone" dataKey="currentSales" stroke="#1b4332" strokeWidth={2.5} fill="#bcddc5" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Split Row: Graph 2 (Best-Selling Table) + Graph 3 (Category Sales Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Graph 2: Best-Selling Products */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Graph 2: Best-Selling Farm Products
            </h3>
            <p className="text-xs text-stone-500">
              Ranked by total actual units sold in the selected period
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase text-[10px]">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Product Name</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-center">Units Sold</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {(analytics?.bestSellers || []).slice(0, 6).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#faf7f2] transition-colors">
                    <td className="py-2.5 font-bold text-stone-400">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 font-bold text-stone-900 truncate max-w-48">
                      {item.name}
                    </td>
                    <td className="py-2.5 text-stone-500">{item.category}</td>
                    <td className="py-2.5 text-center font-bold text-stone-900">
                      {item.units}
                    </td>
                    <td className="py-2.5 text-right font-serif font-bold text-[#1b4332]">
                      ₹{item.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Graph 3: Category Sales Comparison (Donut Chart) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Graph 3: Category Sales Breakdown
            </h3>
            <p className="text-xs text-stone-500">
              Revenue distribution across farm categories
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categorySales || []}
                  dataKey="sales"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {(analytics?.categorySales || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#FAF7F2', borderRadius: '12px', border: '1px solid #ebe0cd' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Graph 4: Category Performance Over Time (Multi-line chart) */}
      <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <h3 className="font-serif font-bold text-base text-stone-900">
            Graph 4: Category Performance Over Time
          </h3>
          <p className="text-xs text-stone-500">
            Sales trends comparing Powders, Dry Items, Pachadlu, and Oils across the timeframe
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.categoryPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e9dd" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={val => `₹${val}`} />
              <Tooltip
                formatter={(val: any) => [`₹${val}`, 'Sales']}
                contentStyle={{ backgroundColor: '#FAF7F2', borderRadius: '12px', border: '1px solid #ebe0cd' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="Powders" stroke="#1B4332" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Dry Items" stroke="#C58940" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Pachadlu" stroke="#8B4513" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Oils" stroke="#2D5A27" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Graph 5: Category Product Inventory Matrix */}
      <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <h3 className="font-serif font-bold text-base text-stone-900">
            Graph 5: Category Product Inventory Matrix
          </h3>
          <p className="text-xs text-stone-500">
            Available vs out-of-stock products and revenue per active category
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf7f2] border-b border-[#ebe0cd] text-stone-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Active Products</th>
                <th className="py-3 px-4">In-Stock Products</th>
                <th className="py-3 px-4">Out-of-Stock</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(analytics?.categoryInventory || []).map((item: any) => (
                <tr key={item.category} className="hover:bg-[#fdfbf7]">
                  <td className="py-3 px-4 font-bold text-stone-900">{item.category}</td>
                  <td className="py-3 px-4 font-semibold text-stone-700">{item.totalProducts}</td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">{item.available}</td>
                  <td className="py-3 px-4 text-rose-600 font-semibold">{item.outOfStock}</td>
                  <td className="py-3 px-4 font-bold">{item.unitsSold}</td>
                  <td className="py-3 px-4 text-right font-serif font-bold text-[#1b4332]">
                    ₹{item.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Graph 6: Top 10 Products Ranking (Toggle between Units & Revenue) */}
      <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Graph 6: Top 10 Products Ranking Chart
            </h3>
            <p className="text-xs text-stone-500">
              Top farm performers by units or revenue generated
            </p>
          </div>

          <div className="flex bg-[#faf7f2] rounded-xl border border-[#ebe0cd] p-1">
            <button
              onClick={() => setTop10Metric('revenue')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                top10Metric === 'revenue'
                  ? 'bg-[#1b4332] text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              By Revenue (₹)
            </button>
            <button
              onClick={() => setTop10Metric('units')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                top10Metric === 'units'
                  ? 'bg-[#1b4332] text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              By Units Sold
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={(analytics?.top10Products || []).map((p: any) => ({
                name: p.name.length > 20 ? p.name.slice(0, 18) + '...' : p.name,
                units: p.units,
                revenue: p.revenue,
              }))}
              margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e9dd" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} angle={-15} textAnchor="end" />
              <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={val => (top10Metric === 'revenue' ? `₹${val}` : val)} />
              <Tooltip
                formatter={(val: any) => [top10Metric === 'revenue' ? `₹${val}` : val, top10Metric === 'revenue' ? 'Revenue' : 'Units']}
                contentStyle={{ backgroundColor: '#FAF7F2', borderRadius: '12px', border: '1px solid #ebe0cd' }}
              />
              <Bar dataKey={top10Metric} fill="#1B4332" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
