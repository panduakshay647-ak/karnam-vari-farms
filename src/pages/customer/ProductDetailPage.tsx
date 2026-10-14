import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { Product, ProductVariant, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ProductCard } from '../../components/common/ProductCard';
import { CatalogLoadError } from '../../components/common/CatalogLoadError';
import {
  Star,
  ShoppingBag,
  Zap,
  Heart,
  Share2,
  CheckCircle2,
  Truck,
  ShieldCheck,
  ChevronRight,
  Info,
  Clock,
  MessageSquare,
  X,
  AlertCircle
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'storage'>('desc');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!slug) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    setLoadError(null);

    const loadProduct = async () => {
      try {
        const productData = await dataService.getProductBySlug(slug);
        if (!active) return;
        setProduct(productData);
        if (productData) {
          setSelectedVariant(productData.variants[0] || null);
          setActiveImage(productData.images[0]?.image_url || '');
          setQuantity(1);

          dataService.trackEvent('product_view', { product_name: productData.name }, productData.id, productData.category_id);

          dataService
            .getProducts({ categoryId: productData.category_id })
            .then(related => {
              if (active) setRelatedProducts(related.filter(item => item.id !== productData.id).slice(0, 4));
            })
            .catch(() => {
              if (active) setRelatedProducts([]);
            });

          dataService.getReviews(productData.id, 'approved').then(productReviews => {
            if (active) setReviews(productReviews);
          }).catch(() => {
            if (active) setReviews([]);
          });
        }
      } catch (error) {
        if (active) {
          setProduct(null);
          setLoadError(error instanceof Error ? error.message : 'Unable to load this farm product.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProduct();
    return () => {
      active = false;
    };
  }, [slug, retryCount]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#1b4332] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-stone-500 mt-3">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    if (loadError) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-16">
          <CatalogLoadError
            message={loadError}
            onRetry={() => setRetryCount(count => count + 1)}
          />
        </div>
      );
    }
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-800">Product Not Found</h2>
        <p className="text-xs text-stone-500">
          The requested farm delicacy may have been discontinued or moved.
        </p>
        <Link
          to="/shop"
          className="inline-block px-5 py-2.5 bg-[#1b4332] text-white rounded-xl text-xs font-semibold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price ?? product.base_price;
  const originalPrice = selectedVariant?.original_price ?? product.original_price;
  const currentStock = selectedVariant?.stock_quantity ?? product.stock_quantity;
  const isOutOfStock = currentStock <= 0;
  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedVariant || product.variants[0], quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedVariant || product.variants[0], quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    setReviewError(null);
    setReviewSubmitting(true);
    try {
      const newRev = await dataService.submitReview({
        product_id: product.id,
        user_name: reviewName,
        user_email: reviewEmail || 'guest@karnamvarifarms.com',
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        is_verified_purchase: false,
      });
      setReviewSuccess(true);
      if (newRev.status === 'approved') setReviews(prev => [newRev, ...prev]);

      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess(false);
        setReviewName('');
        setReviewTitle('');
        setReviewComment('');
      }, 1500);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Unable to submit your review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-[#1b4332]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link to="/shop" className="hover:text-[#1b4332]">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        {product.category_name && (
          <>
            <Link to={`/category/${product.category_id}`} className="hover:text-[#1b4332]">
              {product.category_name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </>
        )}
        <span className="text-stone-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2. Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-[#f4eee2] shadow-sm relative">
            <img
              src={activeImage || product.images[0]?.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {product.discount_percentage ? (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                {product.discount_percentage}% OFF
              </span>
            ) : null}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map(img => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-18 h-18 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img.image_url
                      ? 'border-[#1b4332] scale-95'
                      : 'border-transparent hover:border-stone-300'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#8b4513] bg-[#f4eee2] px-3 py-1 rounded-full">
              {product.category_name}
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold ml-1 text-stone-900">{product.rating || '4.9'}</span>
              </div>
              <span className="text-stone-400">•</span>
              <a href="#reviews" className="text-stone-500 hover:underline">
                {reviews.length || product.review_count || 12} Customer Reviews
              </a>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-tight">
            {product.name}
          </h1>

          {/* SKU & Stock Badge */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-stone-400">SKU: {selectedVariant?.sku || product.sku}</span>
            <span className="text-stone-300">|</span>
            {isOutOfStock ? (
              <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md">
                Out of Stock
              </span>
            ) : currentStock < 10 ? (
              <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                Only {currentStock} left in stock - order soon
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> In Stock & Ready to Dispatch
              </span>
            )}
          </div>

          {/* Price */}
          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#f4eee2] flex items-baseline gap-3">
            <span className="text-3xl font-serif font-bold text-stone-900">
              ₹{currentPrice}
            </span>
            {originalPrice && originalPrice > currentPrice && (
              <span className="text-base text-stone-400 line-through">
                ₹{originalPrice}
              </span>
            )}
            <span className="text-xs text-stone-500 ml-auto">Inclusive of all taxes</span>
          </div>

          {/* Package Size / Variant Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Select Package Size:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-[#1b4332] bg-[#f2f7f4] ring-1 ring-[#1b4332]'
                        : 'border-[#ebe0cd] bg-white hover:border-stone-400'
                    }`}
                  >
                    <div className="font-semibold text-xs text-stone-900">{v.title}</div>
                    <div className="text-xs font-serif font-bold text-[#1b4332] mt-0.5">₹{v.price}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Counter */}
              <div className="flex items-center border border-[#ebe0cd] rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3 py-2.5 text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold text-stone-800 min-w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock || isOutOfStock}
                  className="px-3 py-2.5 text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                >
                  +
                </button>
              </div>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  isFavorited
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-[#ebe0cd] bg-white text-stone-700 hover:bg-stone-50'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full py-3.5 px-6 bg-[#1b4332] hover:bg-[#2d5a27] disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3.5 px-6 bg-[#c58940] hover:bg-[#a06d29] disabled:bg-stone-200 disabled:text-stone-400 text-stone-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-stone-900" />
                <span>Buy Now with 1-Click</span>
              </button>
            </div>
          </div>

          {/* Delivery & Purity Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#f4eee2] text-xs text-stone-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#1b4332]" />
              <span>Free Express Delivery on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#1b4332]" />
              <span>Safe Food Grade Glass Packaging</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Product Tabs (Description / Ingredients / Storage) */}
      <div className="bg-white rounded-3xl border border-[#ebe0cd] p-6 sm:p-8 space-y-6">
        <div className="flex border-b border-[#f4eee2] gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'desc'
                ? 'border-[#1b4332] text-[#1b4332]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Product Overview & Story
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ingredients'
                ? 'border-[#1b4332] text-[#1b4332]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Pure Ingredients
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'storage'
                ? 'border-[#1b4332] text-[#1b4332]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Storage & Shelf Life
          </button>
        </div>

        {/* Tab Content */}
        <div className="text-sm text-stone-700 leading-relaxed max-w-3xl">
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <p>{product.full_description}</p>
              <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#f4eee2] flex items-start gap-3 text-xs text-stone-600">
                <Info className="w-4 h-4 text-[#8b4513] shrink-0 mt-0.5" />
                <span>
                  Our products are prepared in small family batches in clean hygienic village surroundings. Due to seasonal harvesting, variations in shade and aroma may occur naturally.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-3">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Full Ingredients List:
              </h4>
              <p className="bg-[#faf7f2] p-4 rounded-xl border border-[#f4eee2] text-xs font-mono leading-loose">
                {product.ingredients || 'Native Whole Farm Ingredients.'}
              </p>
              <p className="text-xs text-stone-500">
                Contains zero palm oil, zero artificial colors, zero synthetic flavor enhancers.
              </p>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-1">
                  Storage Recommendations:
                </h4>
                <p className="text-xs text-stone-600">
                  {product.storage_instructions || 'Store in an airtight jar in a cool, dry place. Keep away from moisture.'}
                </p>
              </div>
              <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-xs text-[#8b4513] font-medium">
                <Clock className="w-4 h-4" />
                <span>Shelf Life: {product.shelf_life || '6 months from manufacture date'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Customer Reviews Section */}
      <section id="reviews" className="bg-[#faf7f2] rounded-3xl p-6 sm:p-10 border border-[#ebe0cd] space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-serif font-bold text-stone-900">Customer Reviews</h3>
            <p className="text-xs text-stone-500 mt-1">
              {reviews.length} authentic ratings from patrons
            </p>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-5 py-2.5 bg-[#1b4332] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a27] transition-colors flex items-center gap-2 self-start cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(rev => (
              <div key={rev.id} className="bg-white p-5 rounded-2xl border border-[#f4eee2] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {rev.title && <h5 className="font-bold text-xs text-stone-900">{rev.title}</h5>}
                <p className="text-xs text-stone-600 leading-relaxed italic">{rev.comment}</p>
                <div className="pt-2 text-[11px] font-semibold text-stone-700">
                  {rev.user_name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500 text-center py-6">
            No customer reviews yet. Be the first to share your experience with this farm product!
          </p>
        )}
      </section>

      {/* 5. Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-stone-900">
            More Farm Delicacies You May Relish
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-stone-900">
              Share Your Experience
            </h3>

            {reviewSuccess ? (
              <div className="py-8 text-center text-emerald-700 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p className="font-semibold text-sm">Thank you. Your review was submitted for moderation.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewError && (
                  <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}
                {/* Rating selection */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Your Rating:
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Your Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={e => setReviewName(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full px-3 py-2 border border-[#ebe0cd] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Review Headline:
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={e => setReviewTitle(e.target.value)}
                    placeholder="e.g. Pure authentic taste!"
                    className="w-full px-3 py-2 border border-[#ebe0cd] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Your Comments:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Tell us about the aroma, texture, and taste..."
                    className="w-full px-3 py-2 border border-[#ebe0cd] rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-2.5 bg-[#1b4332] text-white text-xs font-bold rounded-xl hover:bg-[#2d5a27] transition-colors cursor-pointer"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};