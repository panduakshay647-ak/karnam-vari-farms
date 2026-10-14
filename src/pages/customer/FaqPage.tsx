import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'purity' | 'shipping' | 'orders'>('all');

  const faqs = [
    {
      category: 'purity',
      q: 'Do your pachadlu (pickles) contain vinegar or chemical preservatives?',
      a: 'Absolutely not. At Karnam Vari Farms, we rely entirely on ancestral natural preservation methods: authentic wooden-ghani sesame or groundnut oils, unrefined sea rock salt, and natural sun curing in ceramic jars (Jaadi). No sodium benzoate, no vinegar, and no artificial colorants.',
    },
    {
      category: 'purity',
      q: 'How are your oils extracted?',
      a: 'All our edible oils (Groundnut, Sesame, Coconut, Mustard) are cold-pressed in traditional wooden mortars (Marachekku / Wooden Ghani) made of native Vaagai wood. The speed is kept deliberately low to ensure heat never rises above 40°C, locking in live enzymes, micronutrients, and pure aroma.',
    },
    {
      category: 'purity',
      q: 'Are the spice powders (podis) roasted on gas flames or traditional wood?',
      a: 'We gently dry-roast lentils, whole spices, and red chillies over low wood embers and allow them to cool naturally before coarse stone-grinding. This prevents the delicate volatile oils from burning off.',
    },
    {
      category: 'shipping',
      q: 'How long does shipping take across India?',
      a: 'We dispatch all orders within 24–48 hours of packaging. Andhra Pradesh and Telangana addresses usually receive orders within 2–3 business days. Major metropolitan cities (Bengaluru, Chennai, Mumbai, Pune, Delhi NCR) take 3–5 business days. Other regions typically take 5–7 business days.',
    },
    {
      category: 'shipping',
      q: 'How are fragile glass jars protected during courier transit?',
      a: 'We take packaging very seriously. Glass pickle bottles and oil containers are sealed with induction-foil caps, wrapped in multi-layer biodegradable bubble cushioning, and packed into heavy-duty 5-ply corrugated carton boxes with reinforced corner guards.',
    },
    {
      category: 'shipping',
      q: 'What are your delivery charges?',
      a: 'We provide FREE Delivery across India on all orders of ₹999 and above. For orders below ₹999, a flat nominal delivery fee of ₹70 is applied to cover safe courier transport.',
    },
    {
      category: 'orders',
      q: 'How can I track my order once placed?',
      a: 'Every order receives an Order ID in the format AKFARMS0000X. You can view real-time status and courier tracking anytime by visiting the "My Orders" tab on our website or clicking the tracking link sent via SMS/Email.',
    },
    {
      category: 'orders',
      q: 'What payment methods do you accept?',
      a: 'We accept Cash on Delivery (COD) as well as simulated online payments / UPI (Google Pay, PhonePe, Paytm, Net Banking, and Debit/Credit Cards).',
    },
    {
      category: 'orders',
      q: 'Can I change my delivery address after placing an order?',
      a: 'If your order has not yet been marked as "Shipped", contact our farm support team at support@karnamvarifarms.com or call +91 98765 43210 immediately and we will update your delivery destination.',
    },
  ];

  const filteredFaqs = activeTab === 'all' ? faqs : faqs.filter(f => f.category === activeTab);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
          Help & Answers
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1b4332]">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Everything you need to know about our farm ingredients, extraction, and pan-India delivery.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'all' ? 'bg-[#1b4332] text-white' : 'bg-white text-stone-600 hover:bg-[#faf7f2]'
          }`}
        >
          All Questions
        </button>
        <button
          onClick={() => setActiveTab('purity')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'purity' ? 'bg-[#1b4332] text-white' : 'bg-white text-stone-600 hover:bg-[#faf7f2]'
          }`}
        >
          Purity & Ingredients
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'shipping' ? 'bg-[#1b4332] text-white' : 'bg-white text-stone-600 hover:bg-[#faf7f2]'
          }`}
        >
          Shipping & Delivery
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'orders' ? 'bg-[#1b4332] text-white' : 'bg-white text-stone-600 hover:bg-[#faf7f2]'
          }`}
        >
          Orders & Payment
        </button>
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, i) => (
          <details
            key={i}
            className="group bg-white p-5 rounded-2xl border border-[#ebe0cd] shadow-2xs cursor-pointer"
          >
            <summary className="font-serif font-semibold text-sm text-stone-900 flex items-center justify-between list-none">
              <span>{faq.q}</span>
              <ChevronDown className="w-4 h-4 text-stone-400 group-open:rotate-180 transition-transform shrink-0 ml-3" />
            </summary>
            <p className="text-xs text-stone-600 mt-3 leading-relaxed border-t border-stone-100 pt-3">
              {faq.a}
            </p>
          </details>
        ))}
      </div>

      {/* Still need help banner */}
      <div className="bg-[#faf7f2] rounded-3xl p-6 sm:p-8 border border-[#ebe0cd] text-center space-y-3">
        <h4 className="font-serif font-bold text-base text-stone-900">
          Have an unlisted question?
        </h4>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Our farm team is happy to answer any questions about our traditional recipes, bulk quantities, or dietary restrictions.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1b4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a27]"
        >
          <span>Contact Farm Support</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
