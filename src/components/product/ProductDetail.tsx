import React, { useState, useEffect } from 'react';
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
  Plus,
  Minus,
  MessageSquare,
  Share2,
  Box,
  Sparkles,
} from 'lucide-react';
import { Product, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ProductCard } from './ProductCard';
import { Product3DViewer } from './Product3DViewer';
import {
  playAddToCartSound,
  playBuyNowSound,
  triggerCartConfetti,
  triggerBuyNowConfetti,
} from '../../utils/audio';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onSelectProduct,
  onBuyNow,
}) => {
  const { cart, addToCart, updateQuantity, isInWishlist, toggleWishlist } = useCart();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [pincode, setPincode] = useState('560102');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>('Delivery available by 2-3 business days · FREE');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [bundleAdded, setBundleAdded] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const cartItem = cart.find((item) => item.productId === product.id);
  const isOutOfStock = product.stock <= 0;
  const replacementDays = product.replacementDays || 10;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedImage(product.image);
    setQuantity(1);

    const loadData = async () => {
      const revs = await api.getProductReviews(product.id);
      setReviews(revs);

      const all = await api.getProducts({ category: product.category });
      setRelatedProducts(all.filter((p) => p.id !== product.id).slice(0, 4));
    };

    loadData();
  }, [product]);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeStatus(`Available! Standard Delivery to ${pincode} in 2-3 days · COD Eligible`);
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (!isOutOfStock) {
      addToCart(product, quantity);
      playAddToCartSound();
      triggerCartConfetti(e);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleBuyNowClick = () => {
    if (!isOutOfStock) {
      playBuyNowSound();
      triggerBuyNowConfetti();
      addToCart(product, quantity);
      onBuyNow(product);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      const added = await api.submitReview({
        productId: product.id,
        userId: user?.id || 'guest',
        userName: user?.name || 'Verified Buyer',
        rating: newRating,
        title: newReviewTitle || 'Great purchase',
        comment: newReviewComment,
      });
      setReviews((prev) => [added, ...prev]);
      setShowReviewModal(false);
      setNewReviewTitle('');
      setNewReviewComment('');
    } catch (e) {
      console.error(e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Frequently bought together bundle (e.g. Teflon tape or wire accessories)
  const bundleAddon = relatedProducts[0];

  const handleAddBundle = () => {
    addToCart(product, 1);
    if (bundleAddon) {
      addToCart(bundleAddon, 1);
    }
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto no-scrollbar py-1">
        <button onClick={onBack} className="hover:text-amber-600 font-medium">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="capitalize font-medium">{product.mainCategory}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate max-w-[140px] sm:max-w-xs">{product.brand}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate max-w-[120px] text-slate-800 font-bold">{product.sku}</span>
      </nav>

      {/* Main PDP Grid: Gallery (Left) & Contiguous Purchase Module (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="relative bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 flex items-center justify-center aspect-square shadow-sm overflow-hidden">
            {product.discount > 0 && (
              <span className="absolute top-3 left-3 bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-1 rounded shadow-sm z-10">
                {product.discount}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-slate-400 hover:text-red-500 z-10 active:scale-95"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            <img
              src={selectedImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain max-h-[360px] sm:max-h-[420px]"
            />

            {/* 3D & AI Inspection Launch Button */}
            <button
              onClick={() => setShow3DViewer(true)}
              className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-amber-400 font-extrabold text-xs flex items-center gap-1.5 border border-amber-500/40 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            >
              <Box className="w-4 h-4 text-amber-400" />
              <span>✨ 3D Spatial &amp; AI Exploder</span>
            </button>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {/* Dedicated 3D Interactive Model Thumbnail */}
            <button
              onClick={() => setShow3DViewer(true)}
              className="w-16 h-16 rounded-xl border-2 border-amber-500/70 bg-slate-950 text-amber-400 shrink-0 flex flex-col items-center justify-center gap-0.5 shadow-sm hover:scale-105 transition-all group"
              title="Open Interactive 3D Model"
            >
              <Box className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="text-[9px] font-extrabold tracking-wider">3D VIEW</span>
            </button>

            {[product.image, '/src/assets/images/deals_banner_1791008743430.jpg'].map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-16 rounded-xl border-2 p-1 bg-white shrink-0 transition-all ${
                  selectedImage === img ? 'border-amber-500 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>

          {/* Trust Guarantees */}
          <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3.5 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-amber-600 mb-1" />
              <span className="font-bold text-slate-800">100% Genuine</span>
              <span className="text-[10px] text-slate-400">Direct OEM Stock</span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-200">
              <Truck className="w-5 h-5 text-blue-600 mb-1" />
              <span className="font-bold text-slate-800">Fast Delivery</span>
              <span className="text-[10px] text-slate-400">All India Hubs</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-emerald-600 mb-1" />
              <span className="font-bold text-slate-800">{replacementDays}-Day Return</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Free Replacement</span>
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module & Details */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Brand & Title */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                {product.brand}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-500 uppercase">SKU: {product.sku}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-500 capitalize">{product.mainCategory}</span>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Reviews Pill */}
            <div className="flex items-center gap-3 mt-2.5">
              <div className="inline-flex items-center gap-1 bg-emerald-700 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                <span>{product.rating.toFixed(1)}</span>
                <Star className="w-3 h-3 fill-white text-white" />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {product.reviewCount} Ratings &amp; Reviews
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Purchase
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200/80"></div>

          {/* Pricing Block */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 tabular-nums">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.price && (
                <span className="text-sm sm:text-base text-slate-400 line-through tabular-nums">
                  MRP ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
              {product.discount > 0 && (
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Save {product.discount}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Inclusive of all taxes ({product.gstRate}% GST included) · Tax invoice provided
            </p>

            {/* Stock Availability */}
            <div className="mt-3 flex items-center gap-2">
              {isOutOfStock ? (
                <span className="text-xs font-bold text-red-600 flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded">
                  <AlertCircle className="w-4 h-4" /> Currently Out of Stock
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded">
                  <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock} units available at Hub)
                </span>
              )}
            </div>
          </div>

          {/* Pincode Delivery Estimator */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Check Delivery Pincode &amp; COD Availability</span>
            </div>
            <form onSubmit={handlePincodeCheck} className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                {pincodeStatus}
              </p>
            )}
          </div>

          {/* Desktop Purchase Action Bar */}
          <div className="hidden sm:flex items-center gap-4 pt-2">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-slate-300 rounded-lg p-1 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold tabular-nums">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="w-8 h-8 rounded text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={(e) => handleAddToCart(e)}
              disabled={isOutOfStock}
              className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 ${
                justAdded
                  ? 'bg-emerald-600 text-white scale-[1.02] shadow-emerald-500/30 ring-2 ring-emerald-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>{cartItem ? `Add More (${quantity})` : 'Add to Cart'}</span>
                </>
              )}
            </button>

            {/* Buy Now */}
            <button
              onClick={handleBuyNowClick}
              disabled={isOutOfStock}
              className="flex-1 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Product Description */}
          <div className="mt-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Product Overview
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Technical Specifications Table */}
          <div className="mt-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700">
              Technical Specifications &amp; Attributes
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-2 px-4 py-2">
                <span className="text-slate-500 font-medium">Brand</span>
                <span className="text-slate-900 font-bold">{product.brand}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2 bg-slate-50/50">
                <span className="text-slate-500 font-medium">Model / Part Number</span>
                <span className="text-slate-900 font-bold">{product.modelNumber || product.sku}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2">
                <span className="text-slate-500 font-medium">Category</span>
                <span className="text-slate-900 font-bold capitalize">{product.category.replace('-', ' ')}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2 bg-slate-50/50">
                <span className="text-slate-500 font-medium">Material / Finish</span>
                <span className="text-slate-900 font-bold">{product.material || 'Engineering Grade'}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2">
                <span className="text-slate-500 font-medium">Warranty</span>
                <span className="text-slate-900 font-bold text-amber-700">{product.warranty}</span>
              </div>
              {product.dimensions && (
                <div className="grid grid-cols-2 px-4 py-2 bg-slate-50/50">
                  <span className="text-slate-500 font-medium">Dimensions / Size</span>
                  <span className="text-slate-900 font-bold">{product.dimensions}</span>
                </div>
              )}
              {product.boxContents && (
                <div className="grid grid-cols-2 px-4 py-2">
                  <span className="text-slate-500 font-medium">Package Contents</span>
                  <span className="text-slate-900 font-bold">{product.boxContents}</span>
                </div>
              )}
              {product.specifications.map((spec, i) => (
                <div key={i} className={`grid grid-cols-2 px-4 py-2 ${i % 2 === 0 ? 'bg-slate-50/50' : ''}`}>
                  <span className="text-slate-500 font-medium">{spec.label}</span>
                  <span className="text-slate-900 font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Bought Together Bundle */}
          {bundleAddon && (
            <div className="bg-amber-50/50 rounded-xl border border-amber-200/80 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                Frequently Bought Together
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain bg-white rounded-lg border border-slate-200 p-1"
                  />
                  <span className="text-lg font-bold text-slate-400">+</span>
                  <img
                    src={bundleAddon.image}
                    alt={bundleAddon.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain bg-white rounded-lg border border-slate-200 p-1"
                  />
                  <div className="text-xs ml-2">
                    <p className="font-bold text-slate-900 line-clamp-1">{bundleAddon.name}</p>
                    <p className="text-slate-500 font-medium">
                      Bundle Price: ₹{(product.price + bundleAddon.price).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAddBundle}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm whitespace-nowrap"
                >
                  {bundleAdded ? '✓ Bundle Added!' : 'Add Both to Cart'}
                </button>
              </div>
            </div>
          )}

          {/* Customer Reviews & Ratings Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Customer Ratings &amp; Reviews</h3>
                <p className="text-xs text-slate-500">Real feedback from verified contractors &amp; homeowners</p>
              </div>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Write a Review</span>
              </button>
            </div>

            {/* Rating Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 py-4 border-b border-slate-100 items-center">
              <div className="sm:col-span-4 text-center sm:text-left sm:border-r sm:border-slate-200 sm:pr-4">
                <div className="text-4xl font-extrabold text-slate-900 leading-none">
                  {product.rating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400">{product.reviewCount} total reviews</p>
              </div>

              <div className="sm:col-span-8 flex flex-col gap-1.5 text-xs">
                {[
                  { star: 5, pct: 78 },
                  { star: 4, pct: 15 },
                  { star: 3, pct: 5 },
                  { star: 2, pct: 1 },
                  { star: 1, pct: 1 },
                ].map((bar) => (
                  <div key={bar.star} className="flex items-center gap-2">
                    <span className="w-6 font-medium text-slate-600">{bar.star}★</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${bar.pct}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-right text-slate-400 tabular-nums">{bar.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            <div className="divide-y divide-slate-100 pt-2">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev.id} className="py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-0.5 bg-emerald-700 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">
                        <span>{rev.rating}</span>
                        <Star className="w-2.5 h-2.5 fill-white text-white" />
                      </div>
                      <span className="font-bold text-slate-900">{rev.title}</span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">{rev.comment}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-700">{rev.userName}</span>
                      <span>·</span>
                      <span>{rev.date}</span>
                      {rev.verifiedPurchase && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No written reviews yet. Be the first contractor or homeowner to review this product!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related & Similar Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Similar Products in {product.category.replace('-', ' ')}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelect={(id) => onSelectProduct(id)}
                onBuyNow={(prod) => onBuyNow(prod)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Bottom Buy Bar */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 shadow-2xl flex items-center justify-between gap-2 safe-area-pb">
        <div className="flex flex-col pl-1">
          <span className="text-xs font-bold text-slate-400">Total Price</span>
          <span className="text-base font-extrabold text-slate-950 tabular-nums leading-none">
            ₹{(product.price * quantity).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => handleAddToCart(e)}
            disabled={isOutOfStock}
            className={`py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-50 ${
              justAdded ? 'bg-emerald-600 text-white' : 'bg-slate-900 active:bg-slate-800 text-white'
            }`}
          >
            {justAdded ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-white animate-bounce" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
            <span>{justAdded ? 'Added!' : 'Add'}</span>
          </button>
          <button
            onClick={handleBuyNowClick}
            disabled={isOutOfStock}
            className="py-2.5 px-4 rounded-xl bg-amber-500 active:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* 3D CAD & AI Exploder Modal */}
      {show3DViewer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <Product3DViewer product={product} onClose={() => setShow3DViewer(false)} />
          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Write a Product Review</h3>
            <p className="text-xs text-slate-500 mb-4">{product.name}</p>

            <form onSubmit={handleSubmitReview} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{newRating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  placeholder="e.g. Excellent wire quality / Easy to install"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Review</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Share details about durability, installation, material quality and testing..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
