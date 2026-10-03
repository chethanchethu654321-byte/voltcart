import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  Truck,
  Calendar,
  CreditCard,
  Banknote,
  LogOut,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  ShoppingCart,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { Order, Address, Product } from '../../types';
import { playAddToCartSound } from '../../utils/audio';

interface AccountPageProps {
  initialTab?: 'orders' | 'profile' | 'addresses' | 'wishlist';
  onTrackOrder: (order: Order) => void;
  onSelectProduct: (productId: string) => void;
  onNavigateHome: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  initialTab = 'orders',
  onTrackOrder,
  onSelectProduct,
  onNavigateHome,
}) => {
  const { user, logout, updateProfile, switchRole } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'wishlist'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editMobile, setEditMobile] = useState(user?.mobile || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Replacement Request State
  const [replacementModalOrder, setReplacementModalOrder] = useState<Order | null>(null);
  const [selectedItemForReplacement, setSelectedItemForReplacement] = useState<string>('');
  const [replacementReason, setReplacementReason] = useState<string>('Defective / Not working');
  const [replacementDescription, setReplacementDescription] = useState<string>('');
  const [replacementSubmitting, setReplacementSubmitting] = useState(false);
  const [replacementSuccess, setReplacementSuccess] = useState(false);
  const [storePolicyDays, setStorePolicyDays] = useState(10);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [ordList, addrList, allProds, policy] = await Promise.all([
        api.getOrders(),
        api.getAddresses(),
        api.getProducts(),
        api.getStorePolicy(),
      ]);

      setOrders(ordList);
      setAddresses(addrList);
      setWishlistProducts(allProds.filter((p) => wishlist.includes(p.id)));
      setStorePolicyDays(policy.defaultReplacementDays);
      setLoading(false);
    };

    fetchData();
  }, [wishlist]);

  const handleOpenReplacementModal = (order: Order) => {
    setReplacementModalOrder(order);
    setSelectedItemForReplacement(order.items[0]?.productId || '');
    setReplacementReason('Defective / Not working');
    setReplacementDescription('');
    setReplacementSuccess(false);
  };

  const handleConfirmReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacementModalOrder) return;
    setReplacementSubmitting(true);

    const targetItem =
      replacementModalOrder.items.find((i) => i.productId === selectedItemForReplacement) ||
      replacementModalOrder.items[0];

    try {
      await api.createReplacementRequest({
        orderId: replacementModalOrder.id,
        orderNumber: replacementModalOrder.orderNumber,
        productId: targetItem.productId,
        productName: targetItem.productName,
        productImage: targetItem.image,
        customerName: user?.name || replacementModalOrder.customerName,
        customerEmail: user?.email || replacementModalOrder.customerEmail,
        customerMobile: user?.mobile || replacementModalOrder.customerMobile,
        reason: replacementReason as any,
        description: replacementDescription || 'Customer submitted replacement claim for damaged/defective unit.',
        allowedDays: storePolicyDays,
        deliveryDate: replacementModalOrder.createdAt,
      });

      playAddToCartSound();
      setReplacementSuccess(true);
      const updatedOrders = await api.getOrders();
      setOrders(updatedOrders);
      setTimeout(() => {
        setReplacementModalOrder(null);
        setReplacementSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setReplacementSubmitting(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: editName, mobile: editMobile });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleMoveToCart = (prod: Product) => {
    addToCart(prod, 1);
    toggleWishlist(prod.id);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Account Header Hero */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-extrabold text-xl flex items-center justify-center shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
              <span>{user?.name || 'Customer Profile'}</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded uppercase">
                {user?.role || 'Customer'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.email} · +91 {user?.mobile}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-auto px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'addresses'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'wishlist'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'profile'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">You haven&apos;t placed any orders yet</p>
              <button
                onClick={onNavigateHome}
                className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900">{order.orderNumber}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full capitalize ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      ● {order.orderStatus}
                    </span>

                    {/* Replacement status or claim button */}
                    {order.orderStatus === 'Delivered' && (
                      order.replacementRequested ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1">
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                          <span>Replacement: {order.replacementStatus || 'Pending'}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenReplacementModal(order)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                          title="Claim free item replacement under store warranty"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Free Replacement ({storePolicyDays}D)</span>
                        </button>
                      )
                    )}

                    <button
                      onClick={() => onTrackOrder(order)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Track Order</span>
                    </button>
                  </div>
                </div>

                {/* Items preview */}
                <div className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-slate-50 p-1 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 line-clamp-1">{item.productName}</p>
                          <p className="text-slate-400">Qty: {item.quantity} · Brand: {item.brand}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 tabular-nums shrink-0">
                        ₹{item.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Details */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Delivery Address: </span>
                    <span className="font-semibold text-slate-800">
                      {order.deliveryAddress.houseFlat}, {order.deliveryAddress.street}, {order.deliveryAddress.city} ({order.deliveryAddress.pincode})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-slate-400">Total:</span>
                    <span className="text-base font-extrabold text-slate-950 tabular-nums">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                  {addr.addressType}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {addr.houseFlat}, {addr.street}, {addr.area}, {addr.city}, {addr.state} -{' '}
                <span className="font-bold text-slate-900">{addr.pincode}</span>
              </p>
              <p className="font-semibold text-slate-800">Mobile: +91 {addr.mobile}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Your wishlist is empty</p>
              <p className="text-xs text-slate-400 mt-1">
                Save your preferred copper wires, plumbing valves, and fittings for quick checkout.
              </p>
              <button
                onClick={onNavigateHome}
                className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {wishlistProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-contain rounded-lg border border-slate-200 p-1 bg-slate-50 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{p.brand}</span>
                      <h4
                        onClick={() => onSelectProduct(p.id)}
                        className="text-xs font-bold text-slate-900 hover:text-amber-600 cursor-pointer line-clamp-2"
                      >
                        {p.name}
                      </h4>
                      <p className="text-sm font-extrabold text-slate-900 mt-1 tabular-nums">
                        ₹{p.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleMoveToCart(p)}
                      className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm max-w-lg">
          <h3 className="text-base font-bold text-slate-900 mb-4">Edit Profile Information</h3>
          {profileSaved && (
            <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={editMobile}
                onChange={(e) => setEditMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm"
            >
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* REQUEST REPLACEMENT MODAL */}
      {replacementModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Request Item Replacement</h3>
                  <p className="text-[11px] text-slate-500">
                    Order {replacementModalOrder.orderNumber} · Covered by {storePolicyDays}-Day Guarantee
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplacementModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {replacementSuccess ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900">Replacement Request Registered!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  VoltCart Store Admin is processing your request. An exchange delivery agent will be dispatched to your address.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmReplacement} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Item to Replace</label>
                  <select
                    value={selectedItemForReplacement}
                    onChange={(e) => setSelectedItemForReplacement(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  >
                    {replacementModalOrder.items.map((item) => (
                      <option key={item.productId} value={item.productId}>
                        {item.productName} (Qty: {item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason for Replacement</label>
                  <select
                    value={replacementReason}
                    onChange={(e) => setReplacementReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="Defective / Not working">Defective / Not working properly</option>
                    <option value="Damaged in transit">Damaged in transit / Crushed insulation</option>
                    <option value="Wrong gauge or size">Wrong gauge or size specification</option>
                    <option value="Fitting / Thread mismatch">Fitting / Thread thread mismatch</option>
                    <option value="Missing accessories">Missing box accessory / Screws</option>
                    <option value="Other">Other technical fault</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Details &amp; Notes</label>
                  <textarea
                    required
                    rows={3}
                    value={replacementDescription}
                    onChange={(e) => setReplacementDescription(e.target.value)}
                    placeholder="Please explain the defect, joint leak, or size specification required for replacement..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Free Doorstep Exchange Guarantee</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Our delivery executive will pick up the original item and hand over the replacement simultaneously.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setReplacementModalOrder(null)}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={replacementSubmitting}
                    className="px-5 py-2 font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50"
                  >
                    {replacementSubmitting ? 'Registering...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
