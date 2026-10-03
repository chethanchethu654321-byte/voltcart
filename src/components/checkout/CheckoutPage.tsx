import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  CheckCircle2,
  CreditCard,
  Banknote,
  ShieldCheck,
  Truck,
  ArrowRight,
  Edit2,
  Trash2,
  Lock,
  Smartphone,
  Building,
  Check,
} from 'lucide-react';
import { Address, Order, PaymentMethod } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order) => void;
  onBackToCart: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onOrderSuccess,
  onBackToCart,
}) => {
  const { cart, appliedCoupon, subtotal, couponDiscount, deliveryCharge, gstAmount, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Address Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [houseFlat, setHouseFlat] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560102');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Site / Workshop'>('Home');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Razorpay Simulation Modal State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [selectedUpi, setSelectedUpi] = useState('gpay');
  const [onlineTab, setOnlineTab] = useState<'upi' | 'card' | 'netbanking'>('upi');

  useEffect(() => {
    const loadAddresses = async () => {
      const addrs = await api.getAddresses();
      setAddresses(addrs);
      if (addrs.length > 0) {
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        setSelectedAddressId(def.id);
      }
    };
    loadAddresses();
  }, []);

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setFullName(user?.name || '');
    setMobile(user?.mobile || '');
    setHouseFlat('');
    setStreet('');
    setArea('');
    setCity('Bengaluru');
    setState('Karnataka');
    setPincode('560102');
    setAddressType('Home');
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setFullName(addr.fullName);
    setMobile(addr.mobile);
    setHouseFlat(addr.houseFlat);
    setStreet(addr.street);
    setArea(addr.area);
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setAddressType(addr.addressType);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await api.saveAddress({
      id: editingAddress?.id,
      fullName,
      mobile,
      houseFlat,
      street,
      area,
      city,
      state,
      pincode,
      addressType,
    });

    const addrs = await api.getAddresses();
    setAddresses(addrs);
    setSelectedAddressId(saved.id);
    setShowAddressModal(false);
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.deleteAddress(id);
    const addrs = await api.getAddresses();
    setAddresses(addrs);
    if (selectedAddressId === id && addrs.length > 0) {
      setSelectedAddressId(addrs[0].id);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handlePlaceOrder = async (finalPaymentMethod: PaymentMethod, paymentId?: string) => {
    if (!selectedAddress) {
      setErrorMsg('Please select or add a delivery address.');
      setCurrentStep(1);
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const order = await api.createOrder({
        userId: user?.id || 'guest',
        customerName: selectedAddress.fullName,
        customerMobile: selectedAddress.mobile,
        customerEmail: user?.email || 'customer@voltcart.in',
        deliveryAddress: selectedAddress,
        items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
        couponCode: appliedCoupon?.code,
        paymentMethod: finalPaymentMethod,
        paymentId,
      });

      clearCart();
      onOrderSuccess(order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowRazorpayModal(false);
    }
  };

  const handleRazorpayPaymentClick = () => {
    // Open the simulated Indian Payment Gateway (Razorpay)
    setShowRazorpayModal(true);
  };

  const handleSimulatedRazorpaySuccess = async () => {
    const mockRzpPaymentId = `pay_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await handlePlaceOrder('ONLINE_RAZORPAY', mockRzpPaymentId);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-4xl mx-auto">
      {/* Checkout Step Indicator */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep >= 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-500'
              }`}
            >
              1
            </span>
            <span className={`text-xs sm:text-sm font-bold ${currentStep === 1 ? 'text-slate-900' : 'text-slate-500'}`}>
              Delivery Address
            </span>
          </div>

          <div className="w-8 sm:w-16 h-0.5 bg-slate-200"></div>

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep >= 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </span>
            <span className={`text-xs sm:text-sm font-bold ${currentStep === 2 ? 'text-slate-900' : 'text-slate-500'}`}>
              Order Summary
            </span>
          </div>

          <div className="w-8 sm:w-16 h-0.5 bg-slate-200"></div>

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep >= 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </span>
            <span className={`text-xs sm:text-sm font-bold ${currentStep === 3 ? 'text-slate-900' : 'text-slate-500'}`}>
              Payment
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: DELIVERY ADDRESS */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Select Delivery Address</h2>
              <p className="text-xs text-slate-500">Fast doorstep transit with verified package seal</p>
            </div>
            <button
              onClick={handleOpenAddAddress}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-lg flex items-center gap-1 border border-amber-200/80"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/20 shadow-sm'
                      : 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{addr.fullName}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                          {addr.addressType}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-amber-600 fill-amber-100" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {addr.houseFlat}, {addr.street}, {addr.area}, {addr.city}, {addr.state} -{' '}
                      <span className="font-bold text-slate-900">{addr.pincode}</span>
                    </p>

                    <p className="text-xs font-semibold text-slate-700 mt-2">
                      Mobile: +91 {addr.mobile}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/70 text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditAddress(addr);
                      }}
                      className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    {addresses.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteAddress(addr.id, e)}
                        className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={onBackToCart}
              className="text-xs font-bold text-slate-600 hover:underline"
            >
              &larr; Back to Cart
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!selectedAddress}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              <span>DELIVER TO THIS ADDRESS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ORDER SUMMARY */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Review Order Details</h2>
              <p className="text-xs text-slate-500">
                Delivering to: <span className="font-bold text-slate-800">{selectedAddress?.fullName}</span> ({selectedAddress?.pincode})
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              Change Address
            </button>
          </div>

          {/* Itemized List */}
          <div className="divide-y divide-slate-100">
            {cart.map((item) => (
              <div key={item.productId} className="py-3 flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-contain rounded-lg border border-slate-200 p-1 bg-slate-50"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                  <div className="text-slate-500 mt-0.5">
                    Qty: <span className="font-bold text-slate-800">{item.quantity}</span> · Brand: {item.product.brand}
                  </div>
                  <div className="text-slate-950 font-extrabold mt-0.5 tabular-nums">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-bold tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span className="tabular-nums">- ₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Delivery Fee</span>
              <span className="font-bold text-emerald-600">
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>18% GST Included</span>
              <span className="tabular-nums">₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm sm:text-base font-extrabold text-slate-950">
              <span>Final Payable Amount</span>
              <span className="text-lg tabular-nums">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs font-bold text-slate-600 hover:underline"
            >
              &larr; Back to Address
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <span>CONTINUE TO PAYMENT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PAYMENT METHOD */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Select Payment Method</h2>
              <p className="text-xs text-slate-500">
                Total Payable: <span className="font-extrabold text-slate-900 text-sm">₹{totalAmount.toLocaleString('en-IN')}</span>
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Secure &amp; Verified
            </span>
          </div>

          {/* Payment Options Radio Cards */}
          <div className="space-y-3">
            {/* 1. Cash on Delivery (COD) */}
            <div
              onClick={() => setPaymentMethod('COD')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                paymentMethod === 'COD'
                  ? 'border-amber-500 bg-amber-50/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  paymentMethod === 'COD' ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                }`}
              >
                {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Popular
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Pay cash or scan UPI at your doorstep upon receiving the shipment. Inspect the package before paying.
                </p>
              </div>
            </div>

            {/* 2. Online Payment (Razorpay) */}
            <div
              onClick={() => setPaymentMethod('ONLINE_RAZORPAY')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                paymentMethod === 'ONLINE_RAZORPAY'
                  ? 'border-amber-500 bg-amber-50/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  paymentMethod === 'ONLINE_RAZORPAY' ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                }`}
              >
                {paymentMethod === 'ONLINE_RAZORPAY' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-900">
                    Online Payment (UPI, Cards, Net Banking)
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Instant Confirmation
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Fast &amp; encrypted checkout via Razorpay Indian Gateway. Supports GPay, PhonePe, Paytm, Visa, RuPay &amp; Net Banking.
                </p>
              </div>
            </div>
          </div>

          {/* Place Order CTA Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="text-xs font-bold text-slate-600 hover:underline"
            >
              &larr; Back to Summary
            </button>

            {paymentMethod === 'COD' ? (
              <button
                onClick={() => handlePlaceOrder('COD')}
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                <span>{isProcessing ? 'Placing Order...' : 'CONFIRM COD ORDER'}</span>
                <Check className="w-4 h-4 stroke-[3px]" />
              </button>
            ) : (
              <button
                onClick={handleRazorpayPaymentClick}
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 flex items-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                <span>{isProcessing ? 'Verifying...' : `PAY ₹${totalAmount.toLocaleString('en-IN')} ONLINE`}</span>
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* RAZORPAY TEST PAYMENT MODAL SIMULATION */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
            {/* Razorpay Brand Bar */}
            <div className="bg-blue-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-blue-700 font-extrabold text-sm">
                  R
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight">VoltCart Payments</h3>
                  <p className="text-[10px] text-blue-200">Secured by Razorpay Sandbox</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-blue-200">Amount</span>
                <p className="text-base font-extrabold leading-none tabular-nums">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Mode selection tabs */}
            <div className="flex items-center border-b border-slate-100 bg-slate-50 text-xs font-bold">
              <button
                onClick={() => setOnlineTab('upi')}
                className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                  onlineTab === 'upi'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500'
                }`}
              >
                UPI QR &amp; Apps
              </button>
              <button
                onClick={() => setOnlineTab('card')}
                className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                  onlineTab === 'card'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500'
                }`}
              >
                Cards (Visa/RuPay)
              </button>
              <button
                onClick={() => setOnlineTab('netbanking')}
                className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                  onlineTab === 'netbanking'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500'
                }`}
              >
                Net Banking
              </button>
            </div>

            <div className="p-4 space-y-3">
              {onlineTab === 'upi' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-500 font-medium">Select Instant UPI App:</p>
                  {[
                    { id: 'gpay', name: 'Google Pay (Tez)', sub: 'Instant bank transfer' },
                    { id: 'phonepe', name: 'PhonePe', sub: 'Fast UPI authorization' },
                    { id: 'paytm', name: 'Paytm UPI', sub: 'Wallet or Linked Bank' },
                    { id: 'bhim', name: 'BHIM / Any UPI ID', sub: 'Enter standard VPA' },
                  ].map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedUpi(app.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedUpi === app.id
                          ? 'border-blue-500 bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{app.name}</p>
                          <p className="text-[10px] text-slate-400">{app.sub}</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={selectedUpi === app.id}
                        onChange={() => setSelectedUpi(app.id)}
                        className="accent-blue-600"
                      />
                    </div>
                  ))}
                </div>
              )}

              {onlineTab === 'card' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Card Number (Sandbox)</label>
                    <input
                      type="text"
                      readOnly
                      value="4111 2222 3333 4444"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Expiry</label>
                      <input
                        type="text"
                        readOnly
                        value="12/28"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">CVV</label>
                      <input
                        type="text"
                        readOnly
                        value="888"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {onlineTab === 'netbanking' && (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-500">Popular Indian Commercial Banks:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((b) => (
                      <div key={b} className="p-2 border border-slate-200 rounded-lg font-bold text-slate-700 text-center bg-slate-50">
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSimulatedRazorpaySuccess}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <span>{isProcessing ? 'Verifying...' : `Simulate Successful Payment`}</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter complete address for safe transit of hardware &amp; plumbing pipes
            </p>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Chethan C"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number (10 digits)</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9845098450"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Flat, House no., Building</label>
                <input
                  type="text"
                  required
                  value={houseFlat}
                  onChange={(e) => setHouseFlat(e.target.value)}
                  placeholder="Flat 402, Green Orchid Apartments"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Area, Street, Sector</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="14th Main Road, Sector 2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Home', 'Work', 'Site / Workshop'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setAddressType(t)}
                      className={`py-1.5 rounded-lg font-bold border transition-colors ${
                        addressType === t
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
