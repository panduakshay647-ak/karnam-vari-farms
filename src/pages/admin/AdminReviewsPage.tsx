import React, { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import { Review, Product } from '../../types';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Filter
} from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  const fetchReviews = async () => {
    setLoading(true);
    const [revs, prods] = await Promise.all([
      dataService.getReviews(undefined, 'all'),
      dataService.getProducts({ includeArchived: true }),
    ]);
    setReviews(revs);
    setProducts(prods);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    const unsub = dataService.subscribe('reviews', fetchReviews);
    return unsub;
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await dataService.updateReviewStatus(id, status);
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this customer review?')) return;
    await dataService.deleteReview(id);
    fetchReviews();
  };

  const prodMap = new Map(products.map(p => [p.id, p.name]));

  const filteredReviews = reviews.filter(r => (filter === 'all' ? true : r.status === filter));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebe0cd] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Patron Feedback
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Customer Reviews Moderation
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Approve, inspect, and moderate reviews left by verified farm buyers
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-white rounded-xl border border-[#ebe0cd] p-1 shadow-2xs self-start sm:self-auto">
          {(['all', 'approved', 'pending', 'rejected'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === st
                  ? 'bg-[#1b4332] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-[#ebe0cd] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf7f2] border-b border-[#ebe0cd] text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Review Content</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredReviews.map(r => (
                <tr key={r.id} className="hover:bg-[#fdfbf7] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-stone-800 max-w-44 truncate">
                    {prodMap.get(r.product_id) || 'Farm Product'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-900">{r.user_name}</div>
                    <div className="text-[10px] text-stone-400">{r.user_email}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    {r.title && <div className="font-bold text-stone-800 text-xs">{r.title}</div>}
                    <p className="text-stone-600 line-clamp-2 text-xs">{r.comment}</p>
                  </td>
                  <td className="py-3.5 px-4 text-stone-400">
                    {new Date(r.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        r.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'approved')}
                          className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'rejected')}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 text-stone-400 hover:text-stone-700 rounded"
                        title="Delete"
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
    </div>
  );
};
