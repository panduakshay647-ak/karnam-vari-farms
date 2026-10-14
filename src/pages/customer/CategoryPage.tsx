import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { Category, Product } from '../../types';
import { ProductCard } from '../../components/common/ProductCard';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    dataService.getCategoryBySlug(slug).then(cat => {
      setCategory(cat);
      if (cat) {
        dataService.trackEvent('category_view', { category_slug: slug, category_name: cat.name }, undefined, cat.id);
        dataService
          .getProducts({
            categoryId: cat.id,
            sortBy,
          })
          .then(prods => {
            setProducts(prods);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  }, [slug, sortBy]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#1b4332] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-stone-500 mt-3">Loading farm category...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-800">Category Not Found</h2>
        <p className="text-xs text-stone-500">
          The requested category might have been updated or moved.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b4332] text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-[#1b4332]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link to="/shop" className="hover:text-[#1b4332]">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-semibold">{category.name}</span>
      </nav>

      {/* 2. Category Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1b4332] to-[#244b20] text-white p-8 sm:p-12 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c58940]">
            Karnam Vari Farms Specialty
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm text-[#dcece1] leading-relaxed">
            {category.description}
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-[#bcddc5]">
            <span>{products.length} Authentic Products Available</span>
            <span>•</span>
            <span>100% Preservative Free</span>
          </div>
        </div>

        {/* Category Image in backdrop */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden md:block">
          <img
            src={category.image_url}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 3. Toolbar (Sort) */}
      <div className="flex items-center justify-between border-b border-[#f4eee2] pb-4">
        <span className="text-xs font-medium text-stone-600">
          Showing all {products.length} items in <strong className="text-stone-900">{category.name}</strong>
        </span>

        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-500 hidden sm:inline">Sort by:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-white border border-[#ebe0cd] text-xs font-medium px-3 py-1.5 rounded-lg text-stone-700"
          >
            <option value="popular">Most Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* 4. Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#ebe0cd] p-12 text-center space-y-3">
          <p className="text-sm text-stone-600">No products found in this category currently.</p>
          <Link
            to="/shop"
            className="text-xs font-semibold text-[#1b4332] hover:underline"
          >
            Browse all products &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};
