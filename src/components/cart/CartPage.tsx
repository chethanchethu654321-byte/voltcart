import React, { useState } from 'react';
import {
  Trash2,
  Bookmark,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  ShoppingBag,
  Sparkles,
  Truck,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { INITIAL_COUPONS } from '../../data/mockData';

interface CartPageProps {
  onContinueShopping: () => void;
  onProceedToCheckout: () => void;
  onSelectProduct: (productId: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onContinueShopping,
  onProceedToCheckout,
  onSelectProduct,
}) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    toggleWishlist,
    isInWishlist,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    couponDiscount,
    deliveryCharge,
    gstAmount,
    totalAmount,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (code: string) => {
    setApplying(true);
    setCouponError(null);
    setCouponSuccess(null);
    const res = await applyCoupon(code);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
    setApplying(false);
  };

  const handleSaveForLater = (productId: string) => {
    toggleWishlist(productId);
    removeFromCart(productId);
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-14 text-center max-w-lg mx-auto shadow-sm my-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Explore our range of heavy-duty copper wires, modular switches, and certified CPVC plumbing pipes.
        </p>
        <button
          onClick={onContinueShopping}
          className="mt-6 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all inline-flex items-center gap-2"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Free shipping threshold (₹999)
  const freeShippingThreshold = 999;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prices include GST and standard manufacturer warranty
          </p>
        </div>
        <button
          onClick={onContinueShopping}
          className="text-xs font-bold text-amber-600 hover:underline hidden sm:block"
        >
          &larr; Continue Shopping
        </button>
      </div>

      {/* Free Delivery Meter */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
          <span className="flex items-center gap-1.5 text-slate-700">
            <Truck className="w-4 h-4 text-amber-500" />
            {amountToFreeShipping > 0 ? (
              <span>
                Add <span className="font-extrabold text-slate-900">₹{amountToFreeShipping}</span> more for <span className="text-emerald-700 font-bold">FREE Delivery</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Congratulations! You unlocked FREE Delivery!
              </span>
            )}
          </span>
          <span className="text-slate-400 tabular-nums">{freeShippingPct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-500 rounded-full"
            style={{ width: `${freeShippingPct}%` }}
          />
        </div>
      </div>

      {/* Cart Layout: Left Items + Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Items List (Left Column) */}
        <div className="lg:col-span-8 space-y-3">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center"
            >
              {/* Product Thumbnail */}
              <div
                onClick={() => onSelectProduct(item.productId)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>{item.product.brand}</span>
                  <span>·</span>
                  <span className="capitalize">{item.product.mainCategory}</span>
                </div>

                <h3
                  onClick={() => onSelectProduct(item.productId)}
                  className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-600 cursor-pointer line-clamp-2 mt-0.5"
                >
                  {item.product.name}
                </h3>

                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                  {item.product.mrp > item.price && (
                    <span className="text-xs text-slate-400 line-through tabular-nums">
                      ₹{item.product.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  {item.product.discount > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {item.product.discount}% OFF
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 mt-0.5">
                  Standard Warranty: {item.product.warranty}
                </p>

                {/* Mobile actions row */}
                <div className="flex items-center justify-between sm:hidden w-full pt-3 mt-2 border-t border-slate-100">
                  <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded text-slate-700 bg-white font-bold flex items-center justify-center shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-7 h-7 rounded text-slate-700 bg-white font-bold flex items-center justify-center shadow-xs disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSaveForLater(item.productId)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Stepper & Actions */}
              <div className="hidden sm:flex flex-col items-end gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900 tabular-nums">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center border border-slate-300 rounded-lg p-0.5 bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 rounded bg-white text-slate-800 font-bold flex items-center justify-center shadow-xs hover:bg-slate-100"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold tabular-nums">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="w-7 h-7 rounded bg-white text-slate-800 font-bold flex items-center justify-center shadow-xs hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <button
                    onClick={() => handleSaveForLater(item.productId)}
                    className="text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Save for Later
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Continue shopping banner */}
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">
              Need conduit fittings, solvent glue, or heavy electrical tape?
            </span>
            <button
              onClick={onContinueShopping}
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              Add More Items
            </button>
          </div>
        </div>

        {/* Order Summary & Coupon (Right Column) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Code Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-500" /> Apply Promo / Contractor Coupon
            </h3>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-emerald-800">{appliedCoupon.code}</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Applied! You save ₹{couponDiscount}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 rounded-full text-emerald-700 hover:bg-emerald-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (couponInput) handleApplyCoupon(couponInput);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. VOLT10 or FIRST100"
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-bold uppercase"
                  />
                  <button
                    type="submit"
                    disabled={applying || !couponInput}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg disabled:opacity-40 shrink-0"
                  >
                    Apply
                  </button>
                </form>

                {couponError && <p className="text-xs text-red-600 font-medium mt-1.5">{couponError}</p>}
                {couponSuccess && <p className="text-xs text-emerald-600 font-medium mt-1.5">{couponSuccess}</p>}

                {/* Available Quick Coupon Codes */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Available Offers
                  </span>
                  {INITIAL_COUPONS.slice(0, 2).map((c) => (
                    <div
                      key={c.code}
                      onClick={() => handleApplyCoupon(c.code)}
                      className="p-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-extrabold text-amber-900">{c.code}</span>
                        <p className="text-[10px] text-amber-800 line-clamp-1">{c.description}</p>
                      </div>
                      <span className="text-[11px] font-bold text-amber-700">Apply</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Price Details
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Price ({cart.length} items)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span className="tabular-nums">- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Delivery Charges</span>
                {deliveryCharge === 0 ? (
                  <span className="font-bold text-emerald-600 uppercase">FREE</span>
                ) : (
                  <span className="font-bold text-slate-900 tabular-nums">₹{deliveryCharge}</span>
                )}
              </div>

              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Estimated GST Included (18%)</span>
                <span className="tabular-nums">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between text-sm sm:text-base font-extrabold text-slate-950">
                <span>Total Amount</span>
                <span className="text-lg font-extrabold text-slate-950 tabular-nums">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={onProceedToCheckout}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-transform active:scale-[0.98]"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe &amp; Secure 256-Bit SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
