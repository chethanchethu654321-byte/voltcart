import React, { useState } from 'react';
import { Star, Heart, ShoppingCart, Zap, Check, AlertCircle, Box, Sparkles, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { playAddToCartSound, playBuyNowSound, triggerCartConfetti, triggerBuyNowConfetti } from '../../utils/audio';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
  onBuyNow?: (product: Product) => void;
  onOpen3D?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onBuyNow,
  onOpen3D,
}) => {
  const { cart, addToCart, updateQuantity, isInWishlist, toggleWishlist } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = cart.find((item) => item.productId === product.id);
  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const replacementDays = product.replacementDays || 10;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
      playAddToCartSound();
      triggerCartConfetti(e);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1600);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem && cartItem.quantity < product.stock) {
      updateQuantity(product.id, cartItem.quantity + 1);
      playAddToCartSound();
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity - 1);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      playBuyNowSound();
      triggerBuyNowConfetti();
      if (!cartItem) {
        addToCart(product, 1);
      }
      if (onBuyNow) {
        onBuyNow(product);
      }
    }
  };

  const handleOpen3DClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpen3D) {
      onOpen3D(product);
    } else {
      onSelect(product.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(product.id)}
      className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer relative"
    >
      {/* Top badges: Discount & Wishlist */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
        {product.discount > 0 ? (
          <span className="bg-emerald-600 text-white font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded shadow-sm">
            {product.discount}% OFF
          </span>
        ) : (
          <div></div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="p-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-slate-200/60 hover:bg-white text-slate-400 hover:text-red-500 pointer-events-auto transition-transform active:scale-90"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${
              inWishlist ? 'fill-red-500 text-red-500' : 'text-slate-400'
            }`}
          />
        </button>
      </div>

      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-slate-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden border-b border-slate-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />

        {/* 3D & AI Inspection Button */}
        <button
          onClick={handleOpen3DClick}
          className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md hover:bg-slate-900 text-amber-400 font-extrabold text-[10px] flex items-center gap-1 border border-amber-500/40 shadow-md transition-transform hover:scale-105 active:scale-95"
          title="Inspect 360° 3D CAD Model & AI Specs"
        >
          <Box className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>3D AI</span>
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white/95 text-slate-900 text-xs font-bold px-3 py-1 rounded shadow">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            <span className="truncate max-w-[70%]">{product.brand}</span>
            <span className="capitalize text-slate-500 text-[10px]">
              {product.mainCategory === 'electrical' ? '⚡' : '🚰'}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 mt-0.5 leading-snug group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating & Review Count */}
          <div className="flex items-center gap-1.5 mt-1">
            <div className="inline-flex items-center gap-0.5 bg-emerald-700 text-white text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded">
              <span>{product.rating.toFixed(1)}</span>
              <Star className="w-2.5 h-2.5 fill-white text-white" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400">
              ({product.reviewCount})
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1.5">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.price && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through tabular-nums">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Stock & Admin Replacement Guarantee Notice */}
          <div className="mt-1 flex items-center justify-between flex-wrap gap-1">
            {isOutOfStock ? (
              <span className="text-[10px] font-medium text-red-600 flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" /> Out of stock
              </span>
            ) : isLowStock ? (
              <span className="text-[10px] font-bold text-amber-600">
                Only {product.stock} left!
              </span>
            ) : (
              <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-0.5">
                <Check className="w-3 h-3" /> In Stock
              </span>
            )}

            <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 inline-flex items-center gap-0.5" title="Admin guaranteed replacement period">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
              {replacementDays}D Replace
            </span>
          </div>
        </div>

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="pt-2 mt-auto border-t border-slate-100 flex flex-col gap-1.5">
          {cartItem ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between bg-amber-50 border border-amber-300 rounded-lg p-1 animate-in zoom-in-95 duration-150"
            >
              <button
                onClick={handleDecrement}
                className="w-7 h-7 rounded bg-white text-slate-800 font-bold text-sm shadow-sm flex items-center justify-center hover:bg-slate-100 active:scale-95"
              >
                -
              </button>
              <span className="text-xs sm:text-sm font-bold text-amber-950 tabular-nums px-2">
                {cartItem.quantity} in Cart
              </span>
              <button
                onClick={handleIncrement}
                disabled={cartItem.quantity >= product.stock}
                className="w-7 h-7 rounded bg-amber-500 text-slate-950 font-bold text-sm shadow-sm flex items-center justify-center hover:bg-amber-400 active:scale-95 disabled:opacity-50"
              >
                +
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-1.5 sm:py-2 px-2 rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all duration-200 active:scale-95 disabled:opacity-40 ${
                  justAdded
                    ? 'bg-emerald-600 text-white shadow-md scale-105'
                    : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white animate-bounce" />
                    <span className="truncate">Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-1.5 sm:py-2 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-40"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
                <span className="truncate">Buy Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
