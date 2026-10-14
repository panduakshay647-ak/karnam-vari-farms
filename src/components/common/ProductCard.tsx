import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useAuth();

  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id || ''
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  const selectedVariant =
    product.variants.find(v => v.id === selectedVariantId) ||
    product.variants[0];

  const primaryImage =
    product.images.find(img => img.is_primary)?.image_url ||
    product.images[0]?.image_url ||
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80';

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = (selectedVariant?.stock_quantity ?? product.stock_quantity) <= 0;

  const currentPrice = selectedVariant?.price ?? product.base_price;
  const originalPrice = selectedVariant?.original_price ?? product.original_price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart(product, selectedVariant, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-[#f4eee2] overflow-hidden hover:shadow-xl hover:border-[#ebe0cd] transition-all duration-300 flex flex-col h-full">
      {/* 1. Image & Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-[#faf7f2]">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.is_bestseller && (
            <span className="bg-[#1b4332] text-[#fdfbf7] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Bestseller
            </span>
          )}
          {product.is_featured && !product.is_bestseller && (
            <span className="bg-[#c58940] text-stone-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Featured
            </span>
          )}
          {product.discount_percentage ? (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              {product.discount_percentage}% OFF
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isFavorited
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900'
          }`}
          title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center">
            <span className="bg-white text-stone-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* 2. Product Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
          <span className="text-[#8b4513] font-medium tracking-wide uppercase text-[11px]">
            {product.category_name}
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating || '4.9'}</span>
            <span className="text-stone-400 font-normal">({product.review_count || 12})</span>
          </div>
        </div>

        {/* Product Name */}
        <Link
          to={`/product/${product.slug}`}
          className="font-serif font-bold text-stone-900 text-base group-hover:text-[#1b4332] line-clamp-1 transition-colors"
        >
          {product.name}
        </Link>

        {/* Short Description */}
        <p className="text-stone-500 text-xs line-clamp-2 mt-1 leading-relaxed">
          {product.short_description}
        </p>

        {/* Variant Selector (if more than 1 variant) */}
        {product.variants.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.variants.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantId(v.id)}
                className={`text-[11px] px-2 py-0.5 rounded-md border font-medium transition-colors ${
                  selectedVariant?.id === v.id
                    ? 'border-[#1b4332] bg-[#f2f7f4] text-[#1b4332]'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                {v.weight_or_size}
              </button>
            ))}
          </div>
        )}

        {/* Price & Action */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#f4eee2]">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-stone-900 font-serif">
                ₹{currentPrice}
              </span>
              {originalPrice && originalPrice > currentPrice && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-stone-400">
              {selectedVariant?.weight_or_size || product.weight_or_size} pack
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-700 text-white scale-95'
                : 'bg-[#1b4332] text-[#fdfbf7] hover:bg-[#2d5a27] active:scale-95 shadow-2xs'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
