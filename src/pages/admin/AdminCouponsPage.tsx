import React, { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import { Coupon } from '../../types';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Sparkles,
  Percent,
  Banknote
} from 'lucide-react';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(5);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(399);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | undefined>(200);
  const [usageLimit, setUsageLimit] = useState<number | undefined>(500);
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    const data = await dataService.getCoupons();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
    const unsub = dataService.subscribe('coupons', fetchCoupons);
    return unsub;
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode('FARM10');
    setDescription('10% OFF on traditional farm delicacies');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinOrderAmount(499);
    setMaxDiscountAmount(250);
    setUsageLimit(500);
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDescription(c.description);
    setDiscountType(c.discount_type);
    setDiscountValue(c.discount_value);
    setMinOrderAmount(c.min_order_amount);
    setMaxDiscountAmount(c.max_discount_amount);
    setUsageLimit(c.usage_limit);
    setIsActive(c.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountValue <= 0) {
      setErrorMsg('Valid code and discount value are required.');
      return;
    }

    setSubmitting(true);
    try {
      await dataService.saveCoupon({
        id: editingCoupon?.id,
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: Number(minOrderAmount),
        max_discount_amount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        usage_limit: usageLimit ? Number(usageLimit) : undefined,
        is_active: isActive,
      });
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: Coupon) => {
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    await dataService.deleteCoupon(c.id);
    fetchCoupons();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebe0cd] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Promotions & Discounts
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Coupon Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure promotional discount codes (e.g. AKSHAY07) and monitor usage metrics
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#1b4332] text-white font-semibold text-xs rounded-xl hover:bg-[#2d5a27] shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-[#ebe0cd] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf7f2] border-b border-[#ebe0cd] text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min. Cart</th>
                <th className="py-3 px-4">Times Used</th>
                <th className="py-3 px-4">Total Granted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-[#fdfbf7] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#1b4332]">
                    {c.code}
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 max-w-xs">
                    {c.description}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-stone-900">
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                    </span>
                    {c.max_discount_amount ? (
                      <span className="text-[10px] text-stone-400 block">
                        Max ₹{c.max_discount_amount}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3.5 px-4 text-stone-700">
                    ₹{c.min_order_amount}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    {c.total_used_count} orders
                  </td>
                  <td className="py-3.5 px-4 font-serif font-bold text-emerald-800">
                    ₹{c.total_discount_granted}
                  </td>
                  <td className="py-3.5 px-4">
                    {c.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
                        <XCircle className="w-3 h-3" /> Disabled
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-stone-600 hover:text-[#1b4332] hover:bg-[#f4eee2] rounded-lg transition-colors"
                        title="Edit coupon"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#1b4332]" />
              <span>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</span>
            </h3>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. AKSHAY07"
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs font-mono uppercase focus:outline-hidden focus:border-[#1b4332]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. 5% discount on all farm delicacies"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Min Cart (₹)
                  </label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={e => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Max Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={maxDiscountAmount || ''}
                    onChange={e => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="rounded text-[#1b4332] focus:ring-[#1b4332]"
                  />
                  <span>Coupon is Active and usable at checkout</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#1b4332] text-white text-xs font-bold rounded-xl hover:bg-[#2d5a27]"
                >
                  {submitting ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
