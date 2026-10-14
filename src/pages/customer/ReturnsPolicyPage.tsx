import React from 'react';
import { RotateCcw, AlertCircle, ShieldCheck } from 'lucide-react';

export const ReturnsPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
          Customer Assurance
        </span>
        <h1 className="text-3xl font-serif font-bold text-[#1b4332] mt-1">
          Return and Refund Policy
        </h1>
        <p className="text-xs text-stone-500 mt-1">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ebe0cd] shadow-2xs space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            1. Perishable Food Nature
          </h2>
          <p>
            Due to the consumable and perishable nature of traditional culinary products (such as stone-ground spice powders, homemade pickles, and cold-pressed edible oils), we do not accept returns once a package has been opened, in order to maintain uncompromising food safety and hygiene for all patrons.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            2. Damaged or Broken in Transit
          </h2>
          <p>
            While we take extraordinary care in packing with heavy-duty padding and glass bubble wraps, accidents during courier handling can occasionally occur. If you receive a broken glass jar or a punctured package:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Please take clear photographs/video of the outer shipping box and the damaged product within <strong>48 hours</strong> of delivery.</li>
            <li>Email the pictures along with your Order ID (e.g., <strong>AKFARMS00001</strong>) to <strong>support@karnamvarifarms.com</strong> or WhatsApp +91 98765 43210.</li>
            <li>Upon verification, we will immediately dispatch a fresh replacement jar at zero extra charge, or issue a 100% full refund to your original payment method.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            3. Order Cancellations
          </h2>
          <p>
            Orders can be cancelled free of charge at any time <strong>before</strong> the shipment has been packed and handed over to our courier partner (order status "Confirmed" or "Processing"). Once an order has been marked as "Shipped", cancellation is no longer possible.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            4. Refund Processing Time
          </h2>
          <p>
            Approved refunds are initiated within <strong>24 to 48 hours</strong>. For online payments, the funds will reflect in your bank account or UPI within 5 to 7 business days, depending on your banking provider.
          </p>
        </section>
      </div>
    </div>
  );
};
