import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CatalogLoadError } from '../../components/common/CatalogLoadError';
import { dataService } from '../../services/dataService';
import { Category } from '../../types';
import {
  ArrowRight,
  Copy,
  Check,
  Sun,
  Flame,
  Wheat,
  Leaf
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setCatalogError(null);

    dataService.trackEvent('page_view', { page: 'home' });

    dataService.getCategories()
      .then(cats => {
        if (!active) return;
        setCategories(cats);
      })
      .catch(error => {
        if (!active) return;
        setCategories([]);
        setCatalogError(
          error instanceof Error
            ? error.message
            : 'Unable to load the farm catalog.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const copyCouponCode = () => {
    navigator.clipboard.writeText('AKSHAY07');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  return (
    <div className="space-y-14 md:space-y-20">

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#ebe0cd] bg-[#f4eee2]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdfbf7] via-[#f4eee2] to-[#ebe0cd]" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-16">

          <div className="space-y-6 lg:col-span-6">
            <div className="space-y-4">
              <h1 className="max-w-2xl font-serif text-4xl font-bold leading-[1.08] tracking-tight text-[#1b4332] sm:text-5xl lg:text-6xl">
                Good food, rooted in{' '}
                <span className="text-[#8b4513] italic">tradition.</span>
              </h1>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <Link
                to="/shop"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1b4332] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#244b20] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b4332]"
              >
                Shop Products
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:col-span-6 lg:max-w-none">
            <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-[#c58940]/20 blur-2xl sm:h-40 sm:w-40" />
            <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-[#1b4332]/10 blur-2xl sm:h-44 sm:w-44" />

            <div className="relative overflow-hidden rounded-[1.75rem] border-[6px] border-white shadow-2xl sm:rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80"
                alt="A traditional Indian meal with pickles and spices"
                className="aspect-[4/3] w-full object-cover sm:aspect-[16/10] lg:aspect-[4/3]"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* LOADING MESSAGE */}
      {loading && (
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          role="status"
          aria-live="polite"
        >
          <p className="text-center text-sm text-stone-500">
            Loading today's farm catalog...
          </p>
        </section>
      )}

      {/* CATALOG ERROR */}
      {catalogError && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CatalogLoadError
            message={catalogError}
            onRetry={() => setRetryCount(count => count + 1)}
          />
        </section>
      )}

      {/* 2. MAIN CATEGORIES GRID */}
      {categories.length > 0 && (
        <section
          id="categories"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group relative bg-white rounded-2xl border border-[#f4eee2] overflow-hidden hover:shadow-xl hover:border-[#ebe0cd] transition-all duration-300 flex flex-col"
              >
                <div className="aspect-4/3 overflow-hidden bg-[#faf7f2] relative">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <span className="absolute bottom-3 left-4 text-white font-serif font-bold text-xl drop-shadow-sm">
                    {cat.name}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="mt-auto pt-3 flex items-center justify-between text-xs font-semibold text-[#1b4332] group-hover:text-[#c58940] transition-colors">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. PROMO OFFER STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#1b4332] via-[#244b20] to-[#132e23] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-[#2d5a27]">

          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <Wheat className="w-80 h-80" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-block bg-[#c58940] text-stone-900 text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
              Special Launch Offer
            </span>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
              Get an Extra 5% OFF on Your Entire Farm Order
            </h3>

            <p className="text-sm text-[#dcece1] leading-relaxed">
              Use promotional coupon code at checkout. Valid on all traditional powders, pickles, vadiyalu, and wood-pressed oils.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="bg-[#132e23] border border-[#c58940] px-4 py-2.5 rounded-xl flex items-center gap-3">
                <span className="text-xs text-[#d4a373]">Coupon Code:</span>
                <span className="font-mono font-bold text-sm tracking-wider text-white">
                  AKSHAY07
                </span>

                <button
                  onClick={copyCouponCode}
                  className="p-1.5 hover:bg-[#2d5a27] rounded text-[#d4a373] hover:text-white transition-colors"
                  title="Copy coupon code"
                >
                  {copiedCoupon ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <Link
                to="/shop"
                className="bg-[#c58940] hover:bg-[#a06d29] text-stone-900 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Claim Offer & Shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE KARNAM VARI FARMS */}
      <section className="bg-[#f4eee2] py-16 border-y border-[#ebe0cd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
              Our Promise
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1b4332] mt-1.5">
              Why Karnam Vari Farms?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#f2f7f4] text-[#1b4332] flex items-center justify-center">
                <Leaf className="w-6 h-6 text-[#2d5a27]" />
              </div>

              <h3 className="font-serif font-bold text-base text-stone-900">
                Grown & Sourced by Us
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed">
                We carefully select fresh ingredients from our own farm and trusted village harvests so only clean, natural produce goes into your food.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#f2f7f4] text-[#1b4332] flex items-center justify-center">
                <Flame className="w-6 h-6 text-rose-600" />
              </div>

              <h3 className="font-serif font-bold text-base text-stone-900">
                Made by Our Own Hands
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed">
                Every podi, pachadi, and vadiyalu batch is roasted, ground, and mixed by our family at home using our own traditional Andhra recipes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#f2f7f4] text-[#1b4332] flex items-center justify-center">
                <Sun className="w-6 h-6 text-[#c58940]" />
              </div>

              <h3 className="font-serif font-bold text-base text-stone-900">
                Pure & Homemade Quality
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed">
                We sun-dry our ingredients naturally and extract pure cold-pressed oils without any artificial colors, flavours, or factory shortcuts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#f2f7f4] text-[#1b4332] flex items-center justify-center">
                <Wheat className="w-6 h-6 text-[#8b4513]" />
              </div>

              <h3 className="font-serif font-bold text-base text-stone-900">
                Packed Fresh for Your Home
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed">
                We prepare our items in small batches and pack them hygienically ourselves so they reach your dining table with real homemade taste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FARM-TO-HOME PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[#faf7f2] rounded-3xl p-8 sm:p-12 border border-[#ebe0cd]">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
              Transparent Journey
            </span>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332] mt-1.5">
              The Farm-to-Home Journey
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#1b4332] text-white font-serif font-bold text-lg flex items-center justify-center shadow-md">
                1
              </div>

              <h4 className="font-semibold text-stone-900 text-sm">
                Native Farm Harvest
              </h4>

              <p className="text-xs text-stone-500 leading-relaxed">
                Plump groundnuts, native sesame, sour green mangoes, and sorrel leaves picked at peak maturity.
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#1b4332] text-white font-serif font-bold text-lg flex items-center justify-center shadow-md">
                2
              </div>

              <h4 className="font-semibold text-stone-900 text-sm">
                Traditional Processing
              </h4>

              <p className="text-xs text-stone-500 leading-relaxed">
                Stone grinding, wooden ghani churning, and sun drying without high-speed industrial cutters.
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#1b4332] text-white font-serif font-bold text-lg flex items-center justify-center shadow-md">
                3
              </div>

              <h4 className="font-semibold text-stone-900 text-sm">
                Glass & Tin Curing
              </h4>

              <p className="text-xs text-stone-500 leading-relaxed">
                Stored in sterile food-grade glass jars and virgin tins to preserve fragile essential aromas.
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#c58940] text-stone-900 font-serif font-bold text-lg flex items-center justify-center shadow-md">
                4
              </div>

              <h4 className="font-semibold text-stone-900 text-sm">
                Safe Express Dispatch
              </h4>

              <p className="text-xs text-stone-500 leading-relaxed">
                Dispatched with multi-layer protective packaging right to your city address in 3–5 working days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};