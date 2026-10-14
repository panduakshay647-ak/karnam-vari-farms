import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { supabase } from '../../lib/supabase';
import { Logo } from '../common/Logo';
import {
  LayoutDashboard,
  Layers,
  ShoppingBag,
  Boxes,
  ClipboardList,
  Tag,
  Users,
  LineChart,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, authReady, loginAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Badge counts
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    if (!authReady || !isAdmin) return;
    let active = true;

    const refreshBadges = async () => {
      try {
        const [orders, products] = await Promise.all([
          dataService.getOrders(),
          dataService.getProducts(),
        ]);
        if (!active) return;
        setPendingOrdersCount(orders.filter(o => o.order_status === 'pending' || o.order_status === 'confirmed').length);
        setLowStockCount(products.filter(p => p.stock_quantity <= 15).length);
      } catch {
        if (!active) return;
        setPendingOrdersCount(0);
        setLowStockCount(0);
      }
    };

    void refreshBadges();
    const unsubOrders = dataService.subscribe('orders', refreshBadges);
    const unsubProducts = dataService.subscribe('products', refreshBadges);

    return () => {
      active = false;
      unsubOrders();
      unsubProducts();
    };
  }, [authReady, isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await loginAdmin(emailInput, passwordInput);
      if (!res.success) setLoginError(res.error || 'Invalid credentials');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    setLogoutError(null);
    try {
      if (supabase) {
        await supabase.auth.signOut({ scope: 'global' });
      }
      await logout();
      navigate('/admin', { replace: true });
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Unable to sign out. Please try again.');
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#132e23] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-[#c58940] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#bcddc5]">Checking administrator session...</p>
        </div>
      </div>
    );
  }

  // If not authenticated as Admin, show high-security Admin Portal Login
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#132e23] flex items-center justify-center p-4">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl border border-[#2d5a27] space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block p-3 rounded-2xl bg-[#1b4332] text-[#fdfbf7] shadow-md mb-2">
              <ShieldCheck className="w-8 h-8 text-[#c58940]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#1b4332]">
              Administrator Portal
            </h2>
            <p className="text-xs text-stone-500">
              Karnam Vari Farms Management Dashboard
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="Enter admin email"
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebe0cd] rounded-xl text-xs text-stone-900 focus:outline-hidden focus:border-[#1b4332]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white border border-[#ebe0cd] rounded-xl text-xs text-stone-900 focus:outline-hidden focus:border-[#1b4332]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#1b4332] hover:bg-[#2d5a27] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="text-xs font-semibold text-[#8b4513] hover:underline flex items-center justify-center gap-1"
            >
              <span>Return to Public Customer Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes, badge: lowStockCount },
    { label: 'Orders', path: '/admin/orders', icon: ClipboardList, badge: pendingOrdersCount },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Visitor Analytics', path: '/admin/analytics', icon: LineChart },
    { label: 'Sales Reports', path: '/admin/sales', icon: BarChart3 },
    { label: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
    { label: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col lg:flex-row text-stone-900">
      {/* 1. Mobile Top Bar */}
      <div className="lg:hidden bg-[#1b4332] text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1 rounded-lg hover:bg-[#2d5a27]"
          >
            {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Logo variant="light" size="sm" showSubtitle={false} />
        </div>
        <span className="text-xs bg-[#c58940] text-stone-900 font-bold px-2.5 py-0.5 rounded-full uppercase">
          Admin
        </span>
      </div>

      {/* 2. Admin Sidebar */}
      <aside
        className={`w-64 bg-[#1b4332] text-[#fdfbf7] flex flex-col shrink-0 z-40 lg:min-h-screen fixed lg:static inset-y-0 left-0 transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Logo Header */}
        <div className="p-6 border-b border-[#2d5a27]">
          <Logo variant="light" size="md" />
          <div className="mt-3 flex items-center justify-between text-xs text-[#bcddc5] pt-2 border-t border-[#2d5a27]/60">
            <span className="truncate max-w-36">{user?.email}</span>
            <span className="bg-[#c58940] text-stone-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
              Superadmin
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#c58940] text-stone-900 shadow-sm'
                    : 'text-[#dcece1] hover:bg-[#2d5a27] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#1b4332] text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#2d5a27] space-y-2">
          {logoutError && (
            <p role="alert" className="text-[11px] text-rose-200">{logoutError}</p>
          )}
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#bcddc5] hover:bg-[#2d5a27] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Customer Store</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#c58940]">Preview</span>
          </Link>

          <button
            onClick={() => void handleAdminLogout()}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/30 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Dashboard Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};