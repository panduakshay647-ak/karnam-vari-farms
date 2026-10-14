import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/common/ProductCard';
import { dataService } from '../../services/dataService';
import { Product, Category } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Filter, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state from URL or defaults
  const selectedCat = searchParams.get('category') || 'all';
  const filterType = searchParams.get('filter') || '';
  const isWishlistOnly = searchParams.get('wishlist') === 'true';

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    dataService.trackEvent('page_view', { page: 'shop' });
    dataService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    dataService
      .getProducts({
        categoryId: selectedCat !== 'all' ? selectedCat : undefined,
        search: search.trim() || undefined,
        maxPrice,
        inStock: inStockOnly,
        isBestseller: filterType === 'bestseller' ? true : undefined,
        isFeatured: filterType === 'featured' ? true : undefined,
        sortBy,
      })
      .then(prods => {
        let finalProds = prods;
        if (isWishlistOnly) {
          finalProds = prods.filter(p => wishlist.includes(p.id));
        }
        setProducts(finalProds);
        setLoading(false);
      });
  }, [selectedCat, filterType, isWishlistOnly, search, sortBy, inStockOnly, maxPrice, wishlist]);

  const handleCategorySelect = (catId: string) => {
    const next = new URLSearchParams(searchParams);
    if (catId === 'all') {
      next.delete('category');
    } else {
      next.set('category', catId);
    }
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearch('');
    setMaxPrice(2000);
    setInStockOnly(false);
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* 1. Header & Title */}
      <div className="border-b border-[#f4eee2] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Pure Farm Delicacies
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1b4332] mt-1">
            {isWishlistOnly
              ? 'My Saved Wishlist'
              : filterType === 'bestseller'
              ? 'Bestselling Farm Favorites'
              : filterType === 'featured'
              ? 'Featured Harvest Specialties'
              : selectedCat !== 'all'
              ? categories.find(c => c.id === selectedCat)?.name || 'Farm Delicacies'
              : 'Shop All Farm Products'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Showing {products.length} authentic handcrafted farm products
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-[#ebe0cd] rounded-xl text-xs font-semibold text-stone-700 shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-[#1b4332]" />
            <span>Filters</span>
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-[#ebe0cd] text-stone-700 text-xs font-medium py-2.5 pl-3.5 pr-8 rounded-xl focus:outline-hidden focus:border-[#1b4332] shadow-2xs cursor-pointer"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="newest">Sort: Newest First</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
            </select>
            <SlidersHorizontal className="absolute right-2.5 top-3 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Main Layout: Filters Sidebar + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div
          className={`md:block space-y-6 ${
            showMobileFilters
              ? 'block fixed inset-0 z-50 bg-[#faf7f2] p-6 overflow-y-auto'
              : 'hidden'
          }`}
        >
          {showMobileFilters && (
            <div className="flex items-center justify-between pb-4 border-b border-[#ebe0cd]">
              <span className="font-serif font-bold text-lg text-[#1b4332]">Filters</span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-xs font-semibold px-3 py-1 bg-[#1b4332] text-white rounded-lg"
              >
                Apply & Close
              </button>
            </div>
          )}

          {/* Quick Search */}
          <div className="bg-white p-4 rounded-2xl border border-[#f4eee2] shadow-2xs space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Search Catalog
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Name, ingredients..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-lg text-xs"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-4 rounded-2xl border border-[#f4eee2] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Categories
              </span>
              {selectedCat !== 'all' && (
                <button
                  onClick={() => handleCategorySelect('all')}
                  className="text-[11px] text-[#8b4513] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  selectedCat === 'all'
                    ? 'bg-[#1b4332] text-[#fdfbf7] font-semibold'
                    : 'text-stone-600 hover:bg-[#faf7f2]'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCat === cat.id
                      ? 'bg-[#1b4332] text-[#fdfbf7] font-semibold'
                      : 'text-stone-600 hover:bg-[#faf7f2]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">
                    ({cat.product_count ?? 6})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="bg-white p-4 rounded-2xl border border-[#f4eee2] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Price Cap (Under ₹{maxPrice})
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#1b4332] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>₹100</span>
              <span>₹1,000</span>
              <span>₹2,000</span>
            </div>
          </div>

          {/* Stock Availability */}
          <div className="bg-white p-4 rounded-2xl border border-[#f4eee2] shadow-2xs">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="rounded text-[#1b4332] focus:ring-[#1b4332]"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>

        {/* 3. Products Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 border border-[#f4eee2] animate-pulse space-y-3 aspect-3/4"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#ebe0cd] p-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#f4eee2] text-[#8b4513] flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-xl text-stone-800">
                No matching farm products found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                We couldn't find any items matching your active filter criteria. Try adjusting the price cap or search keyword.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#1b4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a27] transition-colors"
              >
                Reset Filters & View All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
