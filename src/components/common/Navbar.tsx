import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  User
} from 'lucide-react';
import { Logo } from './Logo';
import { CartDrawer } from './CartDrawer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { Category } from '../../types';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItemCount } = useCart();
  const { wishlist } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    dataService.getCategories().then(setCategories).catch(() => setCategories([]));

    const unsub = dataService.subscribe('categories', () => {
      dataService.getCategories().then(setCategories).catch(() => setCategories([]));
    });
    return unsub;
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-md border-b border-[#f4eee2] shadow-xs">
        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-2 sm:gap-4">
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

            {/* Right: Actions (Orders, Wishlist, Cart Drawer Trigger) */}
            <div className="flex items-center gap-0.5 sm:gap-2">
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
                className="relative rounded-full p-2 text-stone-700 transition-colors hover:bg-[#f4eee2] hover:text-[#1b4332] sm:p-2.5"
                title="My Wishlist"
              >
                <Heart className="w-5 h-5 text-stone-700" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#8b4513] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Button Opens Drawer */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative flex items-center gap-1.5 rounded-full bg-[#1b4332] px-2.5 py-2 text-sm font-medium text-[#fdfbf7] shadow-sm transition-all hover:bg-[#2d5a27] active:scale-95 sm:gap-2 sm:px-3.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">Cart</span>
                <span className="bg-[#c58940] text-stone-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItemCount}
                </span>
              </button>
            </div>
          </div>

          {/* Category Navigation Bar (Desktop) */}
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
          </nav>
        </div>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[80px] z-50 bg-black/40 backdrop-blur-xs flex">
            <div className="w-5/6 max-w-sm bg-[#faf7f2] h-full shadow-xl flex flex-col p-5 overflow-y-auto border-r border-[#ebe0cd]">
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
            </div>
            <div
              className="flex-1"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
          </div>
        )}
      </header>

      {/* Slide-over Cart Drawer */}
      <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
    </>
  );
};