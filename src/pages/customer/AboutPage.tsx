import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wheat,
  Sun,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  ArrowRight,
  Leaf
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-16 py-8 md:py-16">
      {/* 1. Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
          Our Heritage & Ethos
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1b4332] leading-tight">
          Reviving Traditional Indian Farm Delicacies
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          Karnam Vari Farms was established with a singular, heartfelt vision: to preserve the authentic flavours of our childhood village kitchens and deliver them pure, unadulterated, and fresh to modern families.
        </p>
      </section>

      {/* 2. Visual Story Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <img
              src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80"
              alt="Traditional stone grinding and spices"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-[#f2f7f4] text-[#1b4332] px-3 py-1 rounded-full text-xs font-semibold">
              <Leaf className="w-3.5 h-3.5 text-[#2d5a27]" />
              <span>Rooted in Village Wisdom</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-snug">
              No Shortcuts, No High-Speed Blades, Zero Chemicals
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              In an era dominated by hyper-processed food, industrial high-heat expellers, and synthetic preservatives, the soul of Indian culinary heritage was disappearing. At Karnam Vari Farms, we return to the timeless fundamentals:
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2d5a27] shrink-0 mt-0.5" />
                <span>
                  <strong>Marachekku Wood Pressing:</strong> Pure oils extracted using traditional Vaagai wood pestles below 40°C.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2d5a27] shrink-0 mt-0.5" />
                <span>
                  <strong>Stone Ground Pounding:</strong> Podis roasted over slow wood flame and pounded slowly so spice essential oils do not evaporate.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2d5a27] shrink-0 mt-0.5" />
                <span>
                  <strong>Sun-Cured In Sunshine:</strong> Pickles and vadiyalu cured under the Indian sun in traditional ceramic jars (Jaadi).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Community Fair Trade */}
      <section className="bg-[#f4eee2] py-16 border-y border-[#ebe0cd]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <HeartHandshake className="w-12 h-12 text-[#8b4513] mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Empowering Rural Artisans & Women Self-Help Groups
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Our pickles and sun-dried vadiyalu are hand-prepared by experienced village grandmothers and women artisans in Guntur district. Every jar sold helps sustain rural livelihoods and preserves traditional culinary crafts.
          </p>
          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1b4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a27] shadow-md transition-all"
            >
              <span>Explore Our Handcrafted Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
