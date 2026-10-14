import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
          Data Security & Trust
        </span>
        <h1 className="text-3xl font-serif font-bold text-[#1b4332] mt-1">
          Privacy Policy
        </h1>
        <p className="text-xs text-stone-500 mt-1">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ebe0cd] shadow-2xs space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            1. Information We Collect
          </h2>
          <p>
            When you visit or purchase from Karnam Vari Farms, we collect only the necessary details required to fulfill your order and provide customer support:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Order & Contact Details:</strong> Full name, delivery shipping address, telephone number, and email address.</li>
            <li><strong>Payment Information:</strong> We do not store sensitive payment card numbers or UPI PINs. Online payments are routed securely through compliant gateway partners.</li>
            <li><strong>Anonymous Visitor Analytics:</strong> Anonymous, aggregated session metrics (such as page views and cart additions) to evaluate website speed and conversion. We do not sell or trade your data to third-party ad brokers.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            2. How We Use Your Information
          </h2>
          <p>
            Your details are used exclusively to process and deliver your farm orders, communicate courier tracking numbers via SMS and email, and send occasional newsletters if you have explicitly subscribed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            3. Data Protection
          </h2>
          <p>
            Our store is safeguarded with SSL 256-bit encryption. All database records are protected by PostgreSQL Row Level Security (RLS) policies, preventing unauthorized access.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-base text-stone-900">
            4. Contacting Our Grievance Officer
          </h2>
          <p>
            For any queries or data deletion requests, contact our privacy officer at <strong>privacy@karnamvarifarms.com</strong> or write to:
            <br />
            Karnam Vari Farms, Village Road, Guntur District, Andhra Pradesh - 522002.
          </p>
        </section>
      </div>
    </div>
  );
};
