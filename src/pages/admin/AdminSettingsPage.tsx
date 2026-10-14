import React, { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { StoreSettings } from '../../types';
import {
  Settings,
  Save,
  CheckCircle2,
  Database,
  ShieldCheck,
  Truck,
  Bell,
  Phone,
  Mail,
  MapPin,
  Sparkles
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    dataService.getStoreSettings().then(st => {
      setSettings(st);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    await dataService.updateStoreSettings(settings);
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center text-xs text-stone-500">
        Loading store configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#ebe0cd] pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            System Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Store & Infrastructure Settings
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure delivery charges, announcements, and view database connection status
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Database Connection Status */}
        <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1b4332]" />
              <span>Backend & Database Connection Mode</span>
            </h3>
            {isSupabaseConfigured ? (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Supabase PostgreSQL Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Local Persistent Engine (Ready for Supabase Keys)
              </span>
            )}
          </div>

          <div className="text-xs text-stone-600 leading-relaxed space-y-2">
            <p>
              {isSupabaseConfigured
                ? 'Your website is actively connected to Supabase PostgreSQL with real-time subscriptions, Row Level Security, and atomic order placement RPCs.'
                : 'Your application is operating seamlessly using the built-in resilient persistent database adapter with cross-tab real-time sync. When you are ready to connect to real Supabase, add your project credentials to .env.'}
            </p>
            <div className="bg-[#faf7f2] p-3 rounded-xl border border-[#ebe0cd] text-[11px] font-mono text-stone-700">
              VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
            </div>
          </div>
        </div>

        {/* 2. Shipping & Thresholds */}
        <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#1b4332]" />
            <span>Shipping Fees & Free Delivery Threshold</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={settings.shipping_standard_fee}
                onChange={e =>
                  setSettings({ ...settings, shipping_standard_fee: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Applied to orders below the free shipping threshold
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Free Shipping Cart Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={settings.free_shipping_threshold}
                onChange={e =>
                  setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Orders equal or exceeding this subtotal qualify for free shipping
              </span>
            </div>
          </div>
        </div>

        {/* 3. Announcement Bar */}
        <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1b4332]" />
              <span>Customer Announcement Bar</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={settings.announcement_bar_active}
                onChange={e =>
                  setSettings({ ...settings, announcement_bar_active: e.target.checked })
                }
                className="rounded text-[#1b4332]"
              />
              <span>Display on Header</span>
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Banner Text Message
            </label>
            <input
              type="text"
              required
              value={settings.announcement_bar_text}
              onChange={e =>
                setSettings({ ...settings, announcement_bar_text: e.target.value })
              }
              placeholder="e.g. Free shipping on orders over ₹999. Use coupon AKSHAY07!"
              className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
            />
          </div>
        </div>

        {/* 4. Farm Contact Information */}
        <div className="bg-white p-6 rounded-3xl border border-[#ebe0cd] shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1b4332]" />
            <span>Store Contact & Public Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Customer Support Phone
              </label>
              <input
                type="text"
                required
                value={settings.store_phone}
                onChange={e => setSettings({ ...settings, store_phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Customer Support Email
              </label>
              <input
                type="email"
                required
                value={settings.store_email}
                onChange={e => setSettings({ ...settings, store_email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Farm Address Line
              </label>
              <input
                type="text"
                required
                value={settings.store_address}
                onChange={e => setSettings({ ...settings, store_address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#1b4332] hover:bg-[#2d5a27] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
