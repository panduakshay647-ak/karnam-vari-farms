import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/common/ProductCard';
import { dataService } from '../../services/dataService';
import { Product, Category, Review } from '../../types';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HeartHandshake,
  ChevronRight,
  Star,
  Copy,
  Check,
  Sun,
  Flame,
  Wheat,
  Leaf
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Record page view analytics
    dataService.trackEvent('page_view', { page: 'home' });

    Promise.all([
      dataService.getCategories(),
      dataService.getProducts({ isBestseller: true }),
      dataService.getProducts({ isFeatured: true }),
      dataService.getReviews(undefined, 'approved'),
    ]).then(([cats, bests, feats, revs]) => {
      setCategories(cats);
      setBestsellers(bests.slice(0, 4));
      setFeaturedProducts(feats.slice(0, 4));
      setReviews(revs.slice(0, 3));
      setLoading(false);
    });
  }, []);

  const copyCouponCode = () => {
    navigator.clipboard.writeText('AKSHAY07');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f4eee2] via-[#faf7f2] to-[#fdfbf7] py-12 md:py-20 border-b border-[#ebe0cd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#1b4332]/10 border border-[#1b4332]/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1b4332]">
                <Wheat className="w-4 h-4 text-[#c58940]" />
                <span>Authentic Andhra & South Indian Farm Delicacies</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-extrabold text-[#1b4332] tracking-tight leading-[1.15]">
                From Our Farms to <br className="hidden sm:inline" />
                <span className="text-[#8b4513] italic">Your Family Table</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Relish pure ancestral kitchen staples: stone-ground aromatic podis, hand-pounded sun-cured pickles in wood-churned oils, and traditional crispy vadiyalu. Zero preservatives, made in small unhurried batches.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1b4332] text-[#fdfbf7] hover:bg-[#2d5a27] font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Shop Farm Fresh</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#categories"
                  className="w-full sm:w-auto px-7 py-3.5 bg-white text-stone-800 hover:bg-[#f4eee2] border border-[#ebe0cd] font-semibold text-sm rounded-xl transition-all text-center"
                >
                  Explore Categories
                </a>
              </div>

              {/* USP Checklist Badges */}
              <div className="pt-6 border-t border-[#ebe0cd]/70 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2d5a27] shrink-0" />
                  <span className="text-xs font-medium text-stone-700">Wooden Ghani Oils</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2d5a27] shrink-0" />
                  <span className="text-xs font-medium text-stone-700">Stone Ground Podis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2d5a27] shrink-0" />
                  <span className="text-xs font-medium text-stone-700">Zero Artificial Additives</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80"
                    alt="Traditional Indian Pickle and Cold-Pressed Spices"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Heritage Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-[#f4eee2] max-w-[210px] hidden sm:block">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <p className="text-xs font-bold text-stone-900 font-serif">
                    “The taste of childhood in every spoonful.”
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1">— Verified Telugu Patron</p>
                </div>

                {/* Floating Launch Offer Pill */}
                <div className="absolute -top-4 -right-4 bg-[#c58940] text-stone-900 font-bold px-4 py-2 rounded-2xl shadow-lg text-xs uppercase tracking-wider flex items-center gap-1.5 animate-bounce">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Pan-India Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CATEGORIES GRID */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Curated Farm Collections
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1b4332] mt-1.5">
            Four Pillars of Authentic Heritage
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Every product is hand-made with seasonal farm ingredients, following traditional village methods.
          </p>
        </div>

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
                  <span>Explore {cat.product_count ?? 6} Items</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. PROMO OFFER STRIP (AKSHAY07) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#1b4332] via-[#244b20] to-[#132e23] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-[#2d5a27]">
          {/* Subtle pattern background */}
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
                <span className="font-mono font-bold text-sm tracking-wider text-white">AKSHAY07</span>
                <button
                  onClick={copyCouponCode}
                  className="p-1.5 hover:bg-[#2d5a27] rounded text-[#d4a373] hover:text-white transition-colors"
                  title="Copy coupon code"
                >
                  {copiedCoupon ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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

      {/* 4. BESTSELLING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
              Loved Across Households
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332] mt-1">
              Bestselling Farm Staples
            </h2>
          </div>
          <Link
            to="/shop?filter=bestseller"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1b4332] hover:text-[#c58940] transition-colors"
          >
            <span>View All Bestsellers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. WHY CHOOSE KARNAM VARI FARMS */}
      <section className="bg-[#f4eee2] py-16 border-y border-[#ebe0cd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
              Ancestral Integrity
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1b4332] mt-1.5">
              Why Karnam Vari Farms?
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              We preserve age-old farming, oil extraction, and spice grinding wisdom passed down through generations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#f2f7f4] text-[#1b4332] flex items-center justify-center">
                <Sun className="w-6 h-6 text-[#c58940]" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Natural Sun-Curing
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Vadiyalu and pickle ingredients are cured in raw sunshine on clean muslin fabric, letting solar warmth preserve natural minerals.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#f2f7f4] text-[#1b4332] flex items-center justify-center">
                <Leaf className="w-6 h-6 text-[#2d5a27]" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Wooden Ghani Cold-Press
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Vaagai wood pestles rotate below 40°C. No steam heating, zero chemical deodorizing, retaining authentic nut fragrance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#f2f7f4] text-[#1b4332] flex items-center justify-center">
                <Flame className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Slow Wood-Embers Roasting
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Lentils and spices are dry-roasted on gentle wood flame until evenly fragrant before stone pulverizing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#ebe0cd] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#f2f7f4] text-[#1b4332] flex items-center justify-center">
                <HeartHandshake className="w-6 h-6 text-[#8b4513]" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Direct Village Fair Trade
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every purchase directly empowers local rural women artisans, farmers, and traditional oil pressers in Guntur and surrounding regions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURED DELICACIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
              Handcrafted Treasures
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332] mt-1">
              Featured Farm Delicacies
            </h2>
          </div>
          <Link
            to="/shop?filter=featured"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1b4332] hover:text-[#c58940] transition-colors"
          >
            <span>View All Featured</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. FARM-TO-HOME PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h4 className="font-semibold text-stone-900 text-sm">Native Farm Harvest</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Plump groundnuts, native sesame, sour green mangoes, and sorrel leaves picked at peak maturity.
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#1b4332] text-white font-serif font-bold text-lg flex items-center justify-center shadow-md">
                2
              </div>
              <h4 className="font-semibold text-stone-900 text-sm">Traditional Processing</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Stone grinding, wooden ghani churning, and sun drying without high-speed industrial cutters.
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#1b4332] text-white font-serif font-bold text-lg flex items-center justify-center shadow-md">
                3
              </div>
              <h4 className="font-semibold text-stone-900 text-sm">Glass & Tin Curing</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Stored in sterile food-grade glass jars and virgin tins to preserve fragile essential aromas.
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#c58940] text-stone-900 font-serif font-bold text-lg flex items-center justify-center shadow-md">
                4
              </div>
              <h4 className="font-semibold text-stone-900 text-sm">Safe Express Dispatch</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Dispatched with multi-layer protective packaging right to your city address in 3–5 working days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            From Happy Families
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332] mt-1.5">
            What Our Patrons Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(rev => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-[#f4eee2] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  “{rev.title || 'Authentic and heavenly!'}”
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed italic">
                  {rev.comment}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800">{rev.user_name}</span>
                <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FAQ ACCORDION PREVIEW */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Common Queries
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332] mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <details className="group bg-white p-5 rounded-2xl border border-[#ebe0cd] cursor-pointer">
            <summary className="font-serif font-semibold text-sm text-stone-900 flex items-center justify-between list-none">
              <span>Do your pickles contain vinegar or artificial chemical preservatives?</span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              Never. We use only ancestral preservation: unrefined cold-pressed sesame or groundnut oil, naturally sun-cured rock salt, and authentic sour tamarind or gongura leaves.
            </p>
          </details>

          <details className="group bg-white p-5 rounded-2xl border border-[#ebe0cd] cursor-pointer">
            <summary className="font-serif font-semibold text-sm text-stone-900 flex items-center justify-between list-none">
              <span>How are Karnam Vari Farms cold-pressed oils extracted?</span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              We extract our oils using traditional wooden mortars (Marachekku) carved from Vaagai wood. The friction never exceeds room temperature, keeping sensitive nutrients, unrefined antioxidants, and natural aroma intact.
            </p>
          </details>

          <details className="group bg-white p-5 rounded-2xl border border-[#ebe0cd] cursor-pointer">
            <summary className="font-serif font-semibold text-sm text-stone-900 flex items-center justify-between list-none">
              <span>What is the delivery time across India?</span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              Orders within Andhra Pradesh & Telangana deliver in 2-3 business days. Metro cities across India (Bengaluru, Chennai, Mumbai, Delhi) take 3-5 business days. Remote locations may take 5-7 business days.
            </p>
          </details>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/faq"
            className="text-xs font-semibold text-[#1b4332] hover:text-[#c58940] underline underline-offset-4"
          >
            Read all customer FAQs &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
};
