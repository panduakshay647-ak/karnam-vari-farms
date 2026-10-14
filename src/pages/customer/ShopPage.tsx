import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/common/ProductCard';
import { CatalogLoadError } from '../../components/common/CatalogLoadError';
import { dataService } from '../../services/dataService';
import { Product, Category } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Filter, Search, RotateCcw } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Filters state from URL or defaults
  const selectedCat = searchParams.get('category') || 'all';
  const filterType = searchParams.get('filter') || '';
  const isWishlistOnly = searchParams.get('wishlist') === 'true';

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const hasActiveFilters =
    selectedCat !== 'all' ||
    filterType !== '' ||
    isWishlistOnly ||
    search.trim() !== '';

  useEffect(() => {
    dataService.trackEvent('page_view', { page: 'shop' });
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);

    Promise.all([
      dataService.getCategories(),
      dataService.getProducts({
        categoryId: selectedCat !== 'all' ? selectedCat : undefined,
        search: search.trim() || undefined,
        isBestseller: filterType === 'bestseller' ? true : undefined,
        isFeatured: filterType === 'featured' ? true : undefined,
        sortBy: 'popular',
      }),
    ])
      .then(([cats, prods]) => {
        if (!active) return;
        setCategories(cats);
        let finalProds = prods;
        if (isWishlistOnly) {
          finalProds = prods.filter(p => wishlist.includes(p.id));
        }
        setProducts(finalProds);
      })
      .catch(error => {
        if (!active) return;
        setCategories([]);
        setProducts([]);
        setLoadError(error instanceof Error ? error.message : 'Unable to load farm products.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCat, filterType, isWishlistOnly, search, wishlist, retryCount]);

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
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* 1. Header & Title */}
      <div className="border-b border-[#f4eee2] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1b4332]">
            {isWishlistOnly
              ? 'My Saved Wishlist'
              : filterType === 'bestseller'
              ? 'Bestselling Farm Favorites'
              : filterType === 'featured'
              ? 'Featured Harvest Specialties'
              : selectedCat !== 'all'
              ? categories.find(c => c.id === selectedCat)?.name || 'Farm Delicacies'
              : 'Karnam Vari Farm Products'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Showing {products.length} authentic handcrafted farm products
          </p>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-[#ebe0cd] rounded-xl text-xs font-semibold text-stone-700 shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-[#1b4332]" />
            <span>Filters</span>
          </button>
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
              Search Items
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
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
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
          ) : loadError ? (
            <CatalogLoadError
              message={loadError}
              onRetry={() => setRetryCount(count => count + 1)}
            />
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
                {hasActiveFilters ? 'No matching farm products found' : 'No farm products available yet'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                {hasActiveFilters
                  ? "We couldn't find any items matching your active filter criteria. Try adjusting your search keyword."
                  : 'The catalog is currently empty. Please check back soon for this season’s farm products.'}
              </p>
              <button
                onClick={() => {
                  if (hasActiveFilters) handleResetFilters();
                  else setRetryCount(count => count + 1);
                }}
                className="px-5 py-2.5 bg-[#1b4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a27] transition-colors"
              >
                {hasActiveFilters ? 'Reset Filters & View All' : 'Refresh Catalog'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};