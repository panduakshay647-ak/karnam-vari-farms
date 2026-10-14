import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  Truck,
  Sparkles,
  Heart
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1b4332] text-[#fdfbf7] pt-16 pb-8 border-t-4 border-[#c58940]">
      {/* 1. Value Proposition Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-[#2d5a27]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2d5a27] text-[#c58940] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#fdfbf7]">100% Traditional Recipes</h4>
              <p className="text-xs text-[#dcece1] mt-1 leading-relaxed">
                Handcrafted using ancestral family techniques without chemicals or shortcuts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2d5a27] text-[#c58940] flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#fdfbf7]">Zero Artificial Preservatives</h4>
              <p className="text-xs text-[#dcece1] mt-1 leading-relaxed">
                Naturally preserved with wood-pressed oils, sun cure, and sea salt.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2d5a27] text-[#c58940] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#fdfbf7]">Pan-India Safe Packaging</h4>
              <p className="text-xs text-[#dcece1] mt-1 leading-relaxed">
                Leak-proof food-grade glass & virgin pouches delivered securely to your doorstep.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2d5a27] text-[#c58940] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#fdfbf7]">Direct From The Farm</h4>
              <p className="text-xs text-[#dcece1] mt-1 leading-relaxed">
                Straight from native farms to your dining table, guaranteeing maximum freshness.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Col 1: Brand Logo */}
          <div className="space-y-4">
            <Logo variant="light" size="lg" />
          </div>

          {/* Col 2: Customer Care & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#d4a373] mb-4">
              Help & Policies
            </h4>
            <ul className="space-y-2.5 text-sm text-[#dcece1]">
              <li>
                <Link to="/my-orders" className="hover:text-white transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="hover:text-white transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Farm Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#d4a373] mb-4">
              Contact Our Farm
            </h4>
            <ul className="space-y-3 text-xs text-[#dcece1]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c58940] shrink-0 mt-0.5" />
                <span>
                  1-14, Bhogaram Village, Kosgi Mandal, Narayanpet District, Telangana - 509339
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c58940] shrink-0" />
                <a href="tel:+918332093750" className="hover:text-white">
                  +91 83320 93750
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c58940] shrink-0" />
                <a href="mailto:panduakshay647@gmail.com" className="hover:text-white">
                  panduakshay647@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#c58940] shrink-0" />
                <span>Mon – Sat: 9:00 AM – 7:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Legal & Notice Bar */}
        <div className="mt-12 pt-8 border-t border-[#2d5a27] flex flex-col md:flex-row items-center justify-between text-xs text-[#bcddc5] gap-4">
          <p>© {new Date().getFullYear()} Karnam Vari Farms. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px] text-[#bcddc5]/80">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>for authentic Indian farm purity & tradition</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/admin" className="text-[#c58940] hover:underline font-medium">
              Administrator Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};