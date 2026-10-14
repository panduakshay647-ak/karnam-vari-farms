import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { Product } from '../../types';
import { ProductCard } from '../../components/common/ProductCard';
import { Search, ArrowLeft } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInputVal(query);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    dataService.trackEvent('page_view', { page: 'search', query });

    dataService
      .getProducts({
        search: query.trim(),
      })
      .then(prods => {
        setResults(prods);
        setLoading(false);
      });
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* 1. Search Box Bar */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
          Catalog Search
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
          Search Farm Delicacies
        </h1>

        <form onSubmit={handleSearchSubmit} className="relative mt-2">
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Search by podi name, pickle, ingredients (e.g. sesame, garlic, amla)..."
            className="w-full pl-11 pr-24 py-3.5 bg-white border border-[#ebe0cd] rounded-2xl text-sm shadow-xs focus:outline-hidden focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332]"
          />
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-2 bg-[#1b4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a27] transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* 2. Results Header */}
      <div className="border-b border-[#f4eee2] pb-4 flex items-center justify-between">
        <p className="text-sm text-stone-600">
          {query ? (
            <>
              Found <strong className="text-stone-900">{results.length}</strong> matching products for "
              <strong className="text-[#1b4332]">{query}</strong>"
            </>
          ) : (
            'Enter a search term above to explore our farm catalog.'
          )}
        </p>

        <Link to="/shop" className="text-xs font-semibold text-[#8b4513] hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Shop All</span>
        </Link>
      </div>

      {/* 3. Results Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-stone-500">
          Searching Karnam Vari Farms catalog...
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : query ? (
        <div className="bg-white rounded-2xl border border-[#ebe0cd] p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#f4eee2] text-[#8b4513] flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-800">No results found</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            We couldn't find any products matching "<strong>{query}</strong>". Try checking for typos or searching for a broader term like "podi", "oil", or "pachadi".
          </p>
          <Link
            to="/shop"
            className="inline-block px-4 py-2 bg-[#1b4332] text-white text-xs font-semibold rounded-xl"
          >
            Explore Complete Catalog
          </Link>
        </div>
      ) : null}
    </div>
  );
};
