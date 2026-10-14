import React, { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import { Product, InventoryLog } from '../../types';
import {
  Boxes,
  AlertTriangle,
  Search,
  CheckCircle2,
  RefreshCw,
  Plus,
  Minus,
  Clock,
  History,
  X
} from 'lucide-react';

export const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');

  // Adjustment Modal
  const [adjustingItem, setAdjustingItem] = useState<{
    productId: string;
    productName: string;
    variantId: string;
    variantTitle: string;
    currentStock: number;
  } | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('New batch arrived from farm');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [prods, inventoryLogs] = await Promise.all([
        dataService.getProducts(),
        dataService.getInventoryLogs(15),
      ]);
      setProducts(prods);
      setLogs(inventoryLogs);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    const unsub = dataService.subscribe('products', fetchInventory);
    return unsub;
  }, []);

  const openAdjustModal = (
    productId: string,
    productName: string,
    variantId: string,
    variantTitle: string,
    currentStock: number
  ) => {
    setAdjustingItem({ productId, productName, variantId, variantTitle, currentStock });
    setNewStockVal(currentStock);
    setAdjustReason('New batch arrived from farm');
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    setErrorMsg(null);
    setSubmitting(true);
    try {
      await dataService.updateVariantStock(
        adjustingItem.productId,
        adjustingItem.variantId,
        Math.max(0, newStockVal),
        adjustReason
      );
      setAdjustingItem(null);
      await fetchInventory();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to adjust inventory.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'low') return p.stock_quantity <= 15 && p.stock_quantity > 0;
    if (filterMode === 'out') return p.stock_quantity <= 0;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebe0cd] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Warehouse & Stock Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Inventory Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor real-time package stock levels and track warehouse adjustments
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-white rounded-xl border border-[#ebe0cd] p-1 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'all'
                ? 'bg-[#1b4332] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'low'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Low Stock (&le; 15)
          </button>
          <button
            onClick={() => setFilterMode('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'out'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stock Matrix Table */}
      <div className="bg-white rounded-3xl border border-[#ebe0cd] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#ebe0cd] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter inventory by product name..."
              className="w-full pl-9 pr-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          </div>
          <span className="text-xs text-stone-500">
            Showing {filteredProducts.length} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf7f2] border-b border-[#ebe0cd] text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Variant Size</th>
                <th className="py-3 px-4">Variant SKU</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map(p =>
                p.variants.map((v, i) => (
                  <tr key={v.id || i} className="hover:bg-[#fdfbf7] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900 max-w-xs truncate">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">{p.category_name}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-800">{v.title}</td>
                    <td className="py-3.5 px-4 font-mono text-stone-500 text-[11px]">{v.sku}</td>
                    <td className="py-3.5 px-4 font-serif font-bold text-sm text-stone-900">
                      {v.stock_quantity}
                    </td>
                    <td className="py-3.5 px-4">
                      {v.stock_quantity <= 0 ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Out of Stock
                        </span>
                      ) : v.stock_quantity <= 15 ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Low Stock
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() =>
                          openAdjustModal(p.id, p.name, v.id, v.title, v.stock_quantity)
                        }
                        className="px-3 py-1 bg-[#1b4332] text-white text-[11px] font-semibold rounded-lg hover:bg-[#2d5a27] transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Adjustment Audit Log */}
      <div className="bg-white rounded-3xl p-6 border border-[#ebe0cd] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <History className="w-4 h-4 text-[#1b4332]" />
          <h3 className="font-serif font-bold text-base text-stone-900">
            Recent Inventory Adjustments Log
          </h3>
        </div>

        {logs.length > 0 ? (
          <div className="divide-y divide-stone-100 text-xs">
            {logs.map(log => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-stone-800 truncate">
                    {log.product_name} {log.variant_title ? `(${log.variant_title})` : ''}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Reason: <strong>{log.reason}</strong> • Logged by {log.created_by || 'Admin'}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <span
                    className={`font-mono font-bold ${
                      log.change_quantity >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {log.change_quantity >= 0 ? `+${log.change_quantity}` : log.change_quantity}
                  </span>
                  <span className="text-stone-400 text-[11px]">
                    {new Date(log.created_at).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 py-4 text-center">
            No stock adjustments recorded yet.
          </p>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setAdjustingItem(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-stone-900">
              Adjust Variant Stock
            </h3>

            <div className="bg-[#faf7f2] p-3 rounded-xl border border-[#ebe0cd] text-xs space-y-1">
              <div className="font-bold text-stone-900">{adjustingItem.productName}</div>
              <div className="text-stone-500">Variant: {adjustingItem.variantTitle}</div>
              <div className="text-stone-500">
                Current Recorded Stock: <strong>{adjustingItem.currentStock} units</strong>
              </div>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  New Stock Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNewStockVal(Math.max(0, newStockVal - 5))}
                    className="p-2 border border-[#ebe0cd] rounded-lg hover:bg-stone-50 font-bold"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newStockVal}
                    onChange={e => setNewStockVal(Number(e.target.value))}
                    className="flex-1 px-3.5 py-2.5 bg-white border border-[#ebe0cd] rounded-xl text-center text-sm font-bold text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setNewStockVal(newStockVal + 5)}
                    className="p-2 border border-[#ebe0cd] rounded-lg hover:bg-stone-50 font-bold"
                  >
                    +5
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Adjustment Reason
                </label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
                >
                  <option value="New batch arrived from farm">New batch arrived from farm</option>
                  <option value="Inventory physical recount correction">Inventory physical recount correction</option>
                  <option value="Damaged / broken container disposal">Damaged / broken container disposal</option>
                  <option value="Reserved for farm exhibition / sample">Reserved for farm exhibition / sample</option>
                  <option value="Manual restock">Manual restock</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#1b4332] text-white text-xs font-bold rounded-xl hover:bg-[#2d5a27]"
                >
                  {submitting ? 'Updating...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
