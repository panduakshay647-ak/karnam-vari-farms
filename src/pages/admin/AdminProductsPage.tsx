import React, { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import { Product, Category, ProductVariant, ProductImage } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Star,
  Sparkles,
  AlertCircle,
  X,
  Layers,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [sku, setSku] = useState('');
  const [basePrice, setBasePrice] = useState<number>(199);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [weightOrSize, setWeightOrSize] = useState('250g');
  const [stockQuantity, setStockQuantity] = useState<number>(25);
  const [ingredients, setIngredients] = useState('');
  const [storageInstructions, setStorageInstructions] = useState('');
  const [shelfLife, setShelfLife] = useState('6 months');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Variants & Images
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<ProductImage[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCatalog = async () => {
    setLoading(true);
    setCatalogError(null);
    try {
      const [prods, cats] = await Promise.all([
        dataService.getProducts({ includeArchived: true }),
        dataService.getCategories(true),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : 'Unable to load the product catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
    const unsub = dataService.subscribe('products', fetchCatalog);
    return unsub;
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setShortDesc('');
    setFullDesc('');
    setSku(`KVF-${Math.floor(100 + Math.random() * 900)}`);
    setBasePrice(199);
    setOriginalPrice(239);
    setWeightOrSize('250g');
    setStockQuantity(25);
    setIngredients('Native Farm Ingredients, Spices, Salt.');
    setStorageInstructions('Keep in cool dry airtight container.');
    setShelfLife('6 months');
    setIsFeatured(false);
    setIsBestseller(false);
    setIsActive(true);

    const defaultVar: ProductVariant = {
      id: 'var-temp-1',
      product_id: '',
      title: '250 Grams Standard Pack',
      weight_or_size: '250g',
      sku: 'KVF-STD-250G',
      price: 199,
      original_price: 239,
      stock_quantity: 25,
      is_active: true,
    };
    setVariants([defaultVar]);

    const defaultImg: ProductImage = {
      id: 'img-temp-1',
      product_id: '',
      image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      is_primary: true,
      display_order: 1,
    };
    setImages([defaultImg]);
    setImageUrlInput('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.category_id);
    setShortDesc(p.short_description);
    setFullDesc(p.full_description);
    setSku(p.sku);
    setBasePrice(p.base_price);
    setOriginalPrice(p.original_price);
    setWeightOrSize(p.weight_or_size);
    setStockQuantity(p.stock_quantity);
    setIngredients(p.ingredients || '');
    setStorageInstructions(p.storage_instructions || '');
    setShelfLife(p.shelf_life || '');
    setIsFeatured(p.is_featured);
    setIsBestseller(p.is_bestseller);
    setIsActive(p.is_active);
    setVariants(p.variants || []);
    setImages(p.images || []);
    setImageUrlInput('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    const newVar: ProductVariant = {
      id: 'var-temp-' + Date.now(),
      product_id: editingProduct?.id || '',
      title: 'New Variant Pack',
      weight_or_size: '500g',
      sku: `${sku || 'KVF'}-${Date.now().toString().slice(-4)}`,
      price: basePrice,
      original_price: originalPrice,
      stock_quantity: 15,
      is_active: true,
    };
    setVariants([...variants, newVar]);
  };

  const handleUpdateVariant = (idx: number, field: keyof ProductVariant, val: any) => {
    const updated = [...variants];
    (updated[idx] as any)[field] = val;
    setVariants(updated);
  };

  const handleRemoveVariant = (idx: number) => {
    if (variants.length <= 1) {
      alert('Every product must have at least one variant.');
      return;
    }
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    const newImg: ProductImage = {
      id: 'img-' + Date.now(),
      product_id: editingProduct?.id || '',
      image_url: imageUrlInput.trim(),
      is_primary: images.length === 0,
      display_order: images.length + 1,
    };
    setImages([...images, newImg]);
    setImageUrlInput('');
  };

  const handleSetPrimaryImage = (idx: number) => {
    setImages(
      images.map((img, i) => ({
        ...img,
        is_primary: i === idx,
      }))
    );
  };

  const handleRemoveImage = (idx: number) => {
    const filtered = images.filter((_, i) => i !== idx);
    if (filtered.length > 0 && !filtered.some(img => img.is_primary)) {
      filtered[0].is_primary = true;
    }
    setImages(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim() || !sku.trim()) {
      setErrorMsg('Product name and SKU are required.');
      return;
    }

    setSubmitting(true);
    try {
      const totalStock = variants.reduce((sum, v) => sum + Number(v.stock_quantity), 0);
      await dataService.saveProduct({
        id: editingProduct?.id,
        name: name.trim(),
        category_id: categoryId,
        short_description: shortDesc.trim(),
        full_description: fullDesc.trim(),
        sku: sku.trim(),
        base_price: Number(basePrice),
        original_price: originalPrice ? Number(originalPrice) : undefined,
        weight_or_size: weightOrSize.trim(),
        stock_quantity: totalStock,
        ingredients: ingredients.trim(),
        storage_instructions: storageInstructions.trim(),
        shelf_life: shelfLife.trim(),
        is_featured: isFeatured,
        is_bestseller: isBestseller,
        is_active: isActive,
        variants,
        images,
      });

      setIsModalOpen(false);
      fetchCatalog();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product.');
      await fetchCatalog();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    if (
      !window.confirm(
        `Are you sure you want to archive "${p.name}"? It will be safely hidden from active customer listings while preserving historical orders.`
      )
    )
      return;

    setCatalogError(null);
    try {
      const archived = await dataService.deleteProduct(p.id);
      if (!archived) throw new Error('Product was not found in the database.');
      await fetchCatalog();
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : 'Unable to archive product.');
    }
  };

  const handleRestoreProduct = async (product: Product) => {
    setCatalogError(null);
    try {
      const restored = await dataService.restoreProduct(product.id);
      if (!restored) throw new Error('Product was not found in the database.');
      await fetchCatalog();
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : 'Unable to restore product.');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebe0cd] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#8b4513]">
            Store Inventory & Variants
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
            Product Catalog Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage product images, multi-size package variants, and live pricing
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#1b4332] text-white font-semibold text-xs rounded-xl hover:bg-[#2d5a27] shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Farm Product</span>
        </button>
      </div>

      {catalogError && (
        <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{catalogError}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ebe0cd] shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by product name, SKU..."
            className="w-full pl-9 pr-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="text-stone-500 font-medium">Category:</label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-[#faf7f2] border border-[#ebe0cd] px-3 py-2 rounded-xl text-xs font-semibold text-stone-700"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#ebe0cd] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf7f2] border-b border-[#ebe0cd] text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Variants</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map(prod => {
                const primaryImg =
                  prod.images.find(img => img.is_primary)?.image_url ||
                  prod.images[0]?.image_url;

                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-[#fdfbf7] transition-colors ${
                      prod.is_archived ? 'opacity-50 bg-stone-50' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <img
                        src={primaryImg}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-stone-100"
                      />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-stone-900 text-sm truncate">
                        {prod.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                        <span className="font-mono">{prod.sku}</span>
                        <span>•</span>
                        <span>{prod.weight_or_size}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-700">
                      {prod.category_name}
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-stone-900">
                      ₹{prod.base_price}
                    </td>
                    <td className="py-3.5 px-4">
                      {prod.stock_quantity <= 0 ? (
                        <span className="text-rose-600 font-bold text-[11px] bg-rose-50 px-2 py-0.5 rounded">
                          0 Out of Stock
                        </span>
                      ) : prod.stock_quantity <= 15 ? (
                        <span className="text-amber-600 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded">
                          {prod.stock_quantity} Low Stock
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[11px]">
                          {prod.stock_quantity} available
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {prod.variants.length} sizes
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {prod.is_bestseller && (
                          <span className="bg-[#1b4332] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Bestseller
                          </span>
                        )}
                        {prod.is_featured && (
                          <span className="bg-[#c58940] text-stone-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                        {!prod.is_active && (
                          <span className="bg-stone-200 text-stone-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-stone-600 hover:text-[#1b4332] hover:bg-[#f4eee2] rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {prod.is_archived ? (
                          <button
                            onClick={() => handleRestoreProduct(prod)}
                            className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore product"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Archive product safely"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-5">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#1b4332]" />
              <span>{editingProduct ? 'Edit Farm Product' : 'Add New Farm Product'}</span>
            </h3>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Basic Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b4513] border-b border-stone-100 pb-1">
                  1. Basic Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Traditional Gongura Pachadi"
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Category *
                    </label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={e => setSku(e.target.value)}
                      placeholder="e.g. KVF-PAC-001"
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs font-mono focus:outline-hidden focus:border-[#1b4332]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Base Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={basePrice}
                      onChange={e => setBasePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Original Price (Optional ₹)
                    </label>
                    <input
                      type="number"
                      value={originalPrice || ''}
                      onChange={e => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="e.g. 299"
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Short Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={shortDesc}
                    onChange={e => setShortDesc(e.target.value)}
                    placeholder="Brief 1-sentence summary for cards..."
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Full Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={fullDesc}
                    onChange={e => setFullDesc(e.target.value)}
                    placeholder="Ancestral story, preparation technique, pair with hot rice..."
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                  />
                </div>
              </div>

              {/* Section 2: Ingredients & Storage */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b4513] border-b border-stone-100 pb-1">
                  2. Ingredients & Storage Info
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Ingredients
                    </label>
                    <textarea
                      rows={2}
                      value={ingredients}
                      onChange={e => setIngredients(e.target.value)}
                      placeholder="e.g. Toor Dal, Guntur Chillies, Cumin..."
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Storage & Shelf Life
                    </label>
                    <textarea
                      rows={2}
                      value={storageInstructions}
                      onChange={e => setStorageInstructions(e.target.value)}
                      placeholder="Store in airtight dry jar..."
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs focus:outline-hidden focus:border-[#1b4332]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Product Variants (Sizes & Stock) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b4513]">
                    3. Package Sizes & Variant Inventory
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs text-[#1b4332] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size Variant</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="p-3 rounded-xl bg-[#faf7f2] border border-[#ebe0cd] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                    >
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={v.title}
                          onChange={e => handleUpdateVariant(idx, 'title', e.target.value)}
                          placeholder="e.g. 500 Grams"
                          className="w-full px-2 py-1.5 bg-white border border-[#ebe0cd] rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={v.weight_or_size}
                          onChange={e => handleUpdateVariant(idx, 'weight_or_size', e.target.value)}
                          placeholder="500g"
                          className="w-full px-2 py-1.5 bg-white border border-[#ebe0cd] rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          value={v.price}
                          onChange={e => handleUpdateVariant(idx, 'price', Number(e.target.value))}
                          placeholder="Price ₹"
                          className="w-full px-2 py-1.5 bg-white border border-[#ebe0cd] rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          value={v.stock_quantity}
                          onChange={e => handleUpdateVariant(idx, 'stock_quantity', Number(e.target.value))}
                          placeholder="Stock"
                          className="w-full px-2 py-1.5 bg-white border border-[#ebe0cd] rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2 font-mono text-[10px] text-stone-500 truncate">
                        {v.sku}
                      </div>
                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1 text-stone-400 hover:text-rose-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Images */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b4513] border-b border-stone-100 pb-1">
                  4. Product Images
                </h4>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={e => setImageUrlInput(e.target.value)}
                    placeholder="Enter image URL (Unsplash or Supabase Storage)..."
                    className="flex-1 px-3 py-2 bg-[#faf7f2] border border-[#ebe0cd] rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-[#1b4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a27]"
                  >
                    Add Image
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 ${
                        img.is_primary ? 'border-[#1b4332] ring-2 ring-[#bcddc5]' : 'border-stone-200'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="p-1 bg-white rounded text-[10px] font-bold text-stone-800"
                          title="Set Primary"
                        >
                          Star
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 bg-rose-600 rounded text-white"
                          title="Delete"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {img.is_primary && (
                        <span className="absolute bottom-0 inset-x-0 bg-[#1b4332] text-white text-[8px] font-bold text-center py-0.5">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Badges & Store Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={e => setIsBestseller(e.target.checked)}
                    className="rounded text-[#1b4332] focus:ring-[#1b4332]"
                  />
                  <span>Mark as Bestseller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="rounded text-[#1b4332] focus:ring-[#1b4332]"
                  />
                  <span>Mark as Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="rounded text-[#1b4332] focus:ring-[#1b4332]"
                  />
                  <span>Active (Live on Customer Site)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#1b4332] text-white text-xs font-bold rounded-xl hover:bg-[#2d5a27]"
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};