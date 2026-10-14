import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
          Legal Agreement
        </span>
        <h1 className="text-3xl font-serif font-bold text-[#1b4332] mt-1">
          Terms and Conditions
        </h1>
        <p className="text-xs text-stone-500 mt-1">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ebe0cd] shadow-2xs space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or purchasing from Karnam Vari Farms ("Website", "we", "us"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            2. Product Descriptions & Pricing
          </h2>
          <p>
            All prices listed on the website are in <strong>Indian National Rupees (₹ / INR)</strong> and include applicable local taxes unless explicitly stated otherwise. We make every effort to display accurate product images, weight sizes, ingredients, and pricing. Because our products are hand-prepared in small batches with seasonal crops, minor natural variations in colour and aroma may occur.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            3. Order Acceptance and Sequential Identification
          </h2>
          <p>
            Upon successful placement of an order, the system generates a sequential Order ID (prefixed with <strong>AKFARMS</strong> followed by numeric digits, e.g. AKFARMS00001). Receipt of an order confirmation does not signify our final acceptance; we reserve the right to decline or cancel orders in cases of stock shortages, pricing errors, or undeliverable postal codes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            4. Promotional Coupons
          </h2>
          <p>
            Promotional codes (such as AKSHAY07 or WELCOME10) must be entered at checkout before placing the order. Coupons cannot be applied retrospectively after an order has been submitted. We reserve the right to modify or expire coupon programs at our discretion.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            5. Governing Law and Jurisdiction
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Guntur District, Andhra Pradesh, India</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};
