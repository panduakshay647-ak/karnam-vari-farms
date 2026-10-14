import React from 'react';
import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
          Customer Information
        </span>
        <h1 className="text-3xl font-serif font-bold text-[#1b4332] mt-1">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-stone-500 mt-1">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ebe0cd] shadow-2xs space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            1. Dispatch Timelines
          </h2>
          <p>
            At Karnam Vari Farms, all traditional powders, pickles, and oils are packed in fresh batches to ensure maximum shelf freshness. Orders are typically processed, packed, and handed over to our verified courier partners (BlueDart, DTDC, Delhivery, India Post) within <strong>24 to 48 hours</strong> of order placement, excluding Sundays and public holidays.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            2. Estimated Transit Times Across India
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Andhra Pradesh & Telangana:</strong> 2 to 3 business days</li>
            <li><strong>South India Metros (Bengaluru, Chennai):</strong> 2 to 4 business days</li>
            <li><strong>Rest of India (Mumbai, Pune, Delhi NCR, Kolkata):</strong> 3 to 5 business days</li>
            <li><strong>North-East & Remote Regions:</strong> 5 to 7 business days</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            3. Delivery Charges & Free Shipping Threshold
          </h2>
          <p>
            We offer <strong>FREE Shipping</strong> across India on all cart subtotals of <strong>₹999 or more</strong>. For orders below ₹999, a flat delivery fee of <strong>₹70</strong> is levied to cover secure multi-layer transit cushioning and courier handling charges.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            4. Glass Container Safety & Leak-Proof Packaging
          </h2>
          <p>
            Pickles and edible oils are packed in food-grade, heavy-weight glass bottles or sealed food-grade tins with induction foil leak-proofing. The containers are nested inside shock-absorbent eco-bubble sleeves and sturdy 5-ply corrugated shipper cartons to ensure safe arrival.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            5. Tracking Your Shipment
          </h2>
          <p>
            Once your package is dispatched, your unique Order ID (e.g. <strong>AKFARMS00001</strong>) and the carrier's AWB tracking number will be updated in the "My Orders" section of our website and notified via SMS/email.
          </p>
        </section>
      </div>
    </div>
  );
};
