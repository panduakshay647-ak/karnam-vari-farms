import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  Package
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Product Inquiry');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setLoading(true);
    await dataService.submitContactMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      subject,
      message: message.trim(),
    });
    setLoading(false);
    setSubmitted(true);

    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
          We Are Here For You
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1b4332]">
          Get in Touch With Our Farm
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Have queries about product ingredients, bulk marriage or festival orders, or delivery status? Reach out directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-6">
          <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-100 pb-3">
            Send Us a Message
          </h3>

          {submitted ? (
            <div className="py-12 text-center text-emerald-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-serif font-bold text-lg">Message Received!</h4>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Thank you for contacting Karnam Vari Farms. Our team will review your inquiry and reply via email or phone within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-[#1b4332] text-white text-xs font-semibold rounded-xl"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                  >
                    <option value="Product Inquiry">Product Inquiry</option>
                    <option value="Order Tracking">Order Tracking</option>
                    <option value="Bulk / Festival Gifting">Bulk / Festival Gifting</option>
                    <option value="Feedback / Quality">Feedback / Quality</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="How can we assist you with our farm delicacies?"
                  className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1b4332] hover:bg-[#2d5a27] text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Sending...' : 'Send Message to Farm'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Contact Information & Quick Links (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#faf7f2] p-6 rounded-3xl border border-[#ebe0cd] space-y-5 text-xs text-stone-700">
            <h4 className="font-serif font-bold text-sm text-[#1b4332] uppercase tracking-wider">
              Farm Headquarters
            </h4>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#8b4513] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Farm Location:</strong>
                  <span>Karnam Vari Farms, Village Road, Guntur District, Andhra Pradesh - 522002</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#8b4513] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Phone Support:</strong>
                  <a href="tel:+919876543210" className="hover:underline text-[#1b4332] font-semibold">
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#8b4513] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Email Inquiries:</strong>
                  <a href="mailto:support@karnamvarifarms.com" className="hover:underline text-[#1b4332]">
                    support@karnamvarifarms.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#8b4513] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900">Working Hours:</strong>
                  <span>Monday to Saturday: 9:00 AM – 7:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#f4eee2] space-y-3">
            <h5 className="font-semibold text-xs text-stone-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#2d5a27]" />
              <span>Looking for Quick Answers?</span>
            </h5>
            <div className="space-y-1.5 text-xs">
              <Link to="/faq" className="block text-[#1b4332] hover:underline">
                &bull; Read our Frequently Asked Questions
              </Link>
              <Link to="/my-orders" className="block text-[#1b4332] hover:underline">
                &bull; Track an existing shipment
              </Link>
              <Link to="/shipping-policy" className="block text-[#1b4332] hover:underline">
                &bull; View shipping times & delivery charges
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
