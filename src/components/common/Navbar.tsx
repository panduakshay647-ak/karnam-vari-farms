import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { Category, StoreSettings } from '../../types';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItemCount, subtotal, freeShippingThreshold } = useCart();
  const { wishlist, isAdmin } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    dataService.getCategories().then(setCategories);
    dataService.getStoreSettings().then(setSettings);

    const unsub = dataService.subscribe('categories', () => {
      dataService.getCategories().then(setCategories);
    });
    return unsub;
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const amountNeededForFreeShipping = Math.max(0, (freeShippingThreshold || 999) - subtotal);

  return (
    <header className="sticky top-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-md border-b border-[#f4eee2] shadow-xs">
      {/* 1. Announcement Bar */}
      {settings?.announcement_bar_active && (
        <div className="bg-[#1b4332] text-[#fdfbf7] text-xs font-medium py-2 px-4 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-center">
            <div className="flex-1 flex items-center justify-center gap-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-[#c58940] shrink-0" />
              <span className="truncate">
                {amountNeededForFreeShipping > 0
                  ? `${settings.announcement_bar_text} • Add ₹${amountNeededForFreeShipping} more for FREE Delivery!`
                  : `🎉 Congratulations! Your order qualifies for FREE Express Shipping!`}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs font-normal text-cream-200">
              <span className="flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-[#d4a373]" />
                {settings.store_phone}
              </span>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 text-[#fdfbf7] bg-[#2d5a27] hover:bg-[#c58940] px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
              >
                <ShieldCheck className="w-3 h-3" />
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-[#1b4332] hover:bg-[#f4eee2] lg:hidden focus:outline-hidden"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Logo size="md" />
          </div>

          {/* Center: Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search podis, pachadlu, pure oils, vadiyalu..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ebe0cd] rounded-full text-sm placeholder-stone-400 focus:outline-hidden focus:border-[#2d5a27] focus:ring-1 focus:ring-[#2d5a27] transition-all shadow-2xs"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            {searchQuery && (
              <button
                type="submit"
                className="absolute right-2 top-1.5 px-3 py-1 bg-[#1b4332] text-white text-xs font-medium rounded-full hover:bg-[#2d5a27] transition-colors"
              >
                Search
              </button>
            )}
          </form>

          {/* Right: Actions (Orders, Wishlist, Cart, Admin) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/my-orders"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-[#1b4332] hover:bg-[#f4eee2] rounded-lg transition-colors"
              title="Track and view my orders"
            >
              <User className="w-4 h-4 text-[#2d5a27]" />
              <span>My Orders</span>
            </Link>

            <Link
              to="/shop?wishlist=true"
              className="relative p-2.5 text-stone-700 hover:text-[#1b4332] hover:bg-[#f4eee2] rounded-full transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5 text-stone-700" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#8b4513] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center gap-2 bg-[#1b4332] text-[#fdfbf7] hover:bg-[#2d5a27] px-3.5 py-2 rounded-full font-medium text-sm transition-all shadow-sm active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              <span className="bg-[#c58940] text-stone-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItemCount}
              </span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 bg-[#f4eee2] text-[#1b4332] hover:bg-[#ebe0cd] text-xs font-medium rounded-lg border border-[#ebe0cd] transition-colors ml-1"
              >
                <ShieldCheck className="w-4 h-4 text-[#2d5a27]" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* 3. Category Navigation Bar (Desktop) */}
        <nav className="hidden lg:flex items-center justify-between border-t border-[#f4eee2] py-2.5">
          <div className="flex items-center gap-8">
            <Link
              to="/shop"
              className={`text-sm font-medium transition-colors hover:text-[#2d5a27] ${
                location.pathname === '/shop' ? 'text-[#1b4332] font-semibold' : 'text-stone-700'
              }`}
            >
              All Products
            </Link>

            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`text-sm font-medium transition-colors hover:text-[#2d5a27] ${
                  location.pathname === `/category/${cat.slug}`
                    ? 'text-[#1b4332] font-semibold underline underline-offset-4 decoration-[#c58940]'
                    : 'text-stone-700'
                }`}
              >
                {cat.name}
              </Link>
            ))}

            <Link
              to="/about"
              className={`text-sm font-medium transition-colors hover:text-[#2d5a27] ${
                location.pathname === '/about' ? 'text-[#1b4332] font-semibold' : 'text-stone-700'
              }`}
            >
              Our Story
            </Link>

            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-[#2d5a27] ${
                location.pathname === '/contact' ? 'text-[#1b4332] font-semibold' : 'text-stone-700'
              }`}
            >
              Contact Us
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>100% Preservative Free Farm Delicacies</span>
          </div>
        </nav>
      </div>

      {/* 4. Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] z-50 bg-black/40 backdrop-blur-xs flex">
          <div className="w-5/6 max-w-sm bg-[#faf7f2] h-full shadow-xl flex flex-col p-5 overflow-y-auto border-r border-[#ebe0cd]">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mb-5 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search farm products..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#ebe0cd] rounded-lg text-sm"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            </form>

            <div className="space-y-1 mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 py-1">
                Explore Categories
              </div>
              <Link
                to="/shop"
                className="block px-3 py-2 text-sm font-medium text-stone-800 hover:bg-[#f4eee2] rounded-lg"
              >
                🌾 All Products
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="block px-3 py-2 text-sm font-medium text-stone-800 hover:bg-[#f4eee2] rounded-lg"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="space-y-1 mb-6 border-t border-[#ebe0cd] pt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 py-1">
                Customer Area
              </div>
              <Link
                to="/my-orders"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-[#f4eee2] rounded-lg"
              >
                <User className="w-4 h-4 text-[#2d5a27]" />
                My Orders & Tracking
              </Link>
              <Link
                to="/cart"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-[#f4eee2] rounded-lg"
              >
                <ShoppingBag className="w-4 h-4 text-[#2d5a27]" />
                Shopping Cart ({totalItemCount})
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-sm font-medium text-stone-800 hover:bg-[#f4eee2] rounded-lg"
              >
                About Karnam Vari Farms
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-sm font-medium text-stone-800 hover:bg-[#f4eee2] rounded-lg"
              >
                Contact & Support
              </Link>
              <Link
                to="/faq"
                className="block px-3 py-2 text-sm font-medium text-stone-800 hover:bg-[#f4eee2] rounded-lg"
              >
                Frequently Asked Questions
              </Link>
            </div>

            <div className="mt-auto border-t border-[#ebe0cd] pt-4">
              <Link
                to="/admin"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1b4332] text-white text-xs font-semibold rounded-lg hover:bg-[#2d5a27] transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-[#c58940]" />
                Admin Dashboard Portal
              </Link>
            </div>
          </div>
          <div
            className="flex-1"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}
    </header>
  );
};
