import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Truck,
  Tag,
  AlertTriangle,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Filter,
  Eye,
  Check,
  Zap,
  Droplet,
  Banknote,
  CreditCard,
  Phone,
  ShieldCheck,
  Wallet,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import {
  Product,
  Order,
  DeliveryPerson,
  Coupon,
  OrderStatus,
  Category,
  MainCategory,
  ReplacementRequest,
  StorePolicy,
} from '../../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'inventory' | 'orders' | 'delivery' | 'payments' | 'coupons' | 'replacements'
  >('overview');

  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState<DeliveryPerson[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [replacements, setReplacements] = useState<ReplacementRequest[]>([]);
  const [storePolicy, setStorePolicy] = useState<StorePolicy>({
    defaultReplacementDays: 10,
    enableSoundEffects: true,
    allowSelfServiceReplacement: true,
    replacementPolicyNotice: '10-Day free replacement guaranteed on all contractor orders.',
  });
  const [policyDaysInput, setPolicyDaysInput] = useState<number>(10);
  const [policyNoticeInput, setPolicyNoticeInput] = useState<string>('');
  const [policySavedToast, setPolicySavedToast] = useState(false);
  const [loading, setLoading] = useState(true);

  // Product Add / Edit Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState<any>({
    name: '',
    brand: 'Polycab',
    category: 'wires-cables',
    subcategory: 'Standard',
    mainCategory: 'electrical' as MainCategory,
    sku: '',
    price: 999,
    mrp: 1299,
    discount: 23,
    stock: 50,
    warranty: '2 Years Manufacturer Warranty',
    description: '',
    material: '',
    dimensions: '',
    modelNumber: '',
    replacementDays: 10,
  });

  // Stock Adjustment Modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(20);
  const [stockReason, setStockReason] = useState<string>('Restock shipment received from supplier');

  // Order Detail / Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignDeliveryId, setAssignDeliveryId] = useState<string>('');

  // Add Delivery Person Modal
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [delName, setDelName] = useState('');
  const [delPhone, setDelPhone] = useState('');
  const [delEmail, setDelEmail] = useState('');
  const [delVehicle, setDelVehicle] = useState('');
  const [delZone, setDelZone] = useState('Bengaluru South Hub');

  // Add Coupon Modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState(15);
  const [newCouponMin, setNewCouponMin] = useState(599);
  const [newCouponMax, setNewCouponMax] = useState(300);

  const loadAll = async () => {
    setLoading(true);
    const [st, prods, ords, deliv, coup, reps, pol] = await Promise.all([
      api.getAdminStats(),
      api.getProducts(),
      api.getOrders(),
      api.getDeliveryPersonnel(),
      api.getCoupons(),
      api.getReplacementRequests(),
      api.getStorePolicy(),
    ]);

    setStats(st);
    setProducts(prods);
    setOrders(ords);
    setDeliveryPersonnel(deliv);
    setCoupons(coup);
    setReplacements(reps);
    setStorePolicy(pol);
    setPolicyDaysInput(pol.defaultReplacementDays);
    setPolicyNoticeInput(pol.replacementPolicyNotice);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Update Store Policy (Admin Master Control)
  const handleSaveStorePolicy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = await api.updateStorePolicy({
      defaultReplacementDays: policyDaysInput,
      replacementPolicyNotice: policyNoticeInput,
    });
    setStorePolicy(updated);
    setPolicySavedToast(true);
    setTimeout(() => setPolicySavedToast(false), 2500);

    // Also update all existing active products with new default replacement days if requested
    const allProds = await api.getProducts();
    for (const p of allProds) {
      if (!p.replacementDays || p.replacementDays === storePolicy.defaultReplacementDays) {
        await api.updateProduct(p.id, { replacementDays: policyDaysInput });
      }
    }
    loadAll();
  };

  const handleQuickSetDays = async (days: number) => {
    setPolicyDaysInput(days);
    const updated = await api.updateStorePolicy({ defaultReplacementDays: days });
    setStorePolicy(updated);
    setPolicySavedToast(true);
    setTimeout(() => setPolicySavedToast(false), 2500);
    loadAll();
  };

  const handleUpdateReplacementStatus = async (
    id: string,
    status: ReplacementRequest['status'],
    adminNotes?: string,
    assignedDeliv?: string
  ) => {
    await api.updateReplacementStatus(id, status, adminNotes, assignedDeliv);
    loadAll();
  };

  // Stock Adjustment Handler
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct) return;
    await api.adjustStock(stockProduct.id, stockDelta, stockReason, 'VoltCart Admin');
    setShowStockModal(false);
    loadAll();
  };

  // Product Save Handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.saveProduct({
      id: editingProduct?.id,
      ...prodForm,
      price: Number(prodForm.price),
      mrp: Number(prodForm.mrp),
      stock: Number(prodForm.stock),
      discount: Math.round(((prodForm.mrp - prodForm.price) / prodForm.mrp) * 100),
    });
    setShowProductModal(false);
    loadAll();
  };

  const handleToggleProductStatus = async (prod: Product) => {
    await api.saveProduct({
      ...prod,
      status: prod.status === 'active' ? 'inactive' : 'active',
    });
    loadAll();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.deleteProduct(id);
      loadAll();
    }
  };

  // Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await api.updateOrderStatus(orderId, status, undefined, assignDeliveryId || undefined);
    loadAll();
    if (selectedOrder && selectedOrder.id === orderId) {
      const updated = await api.getOrderById(orderId);
      setSelectedOrder(updated);
    }
  };

  // Delivery Person Add
  const handleAddDeliveryPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addDeliveryPerson({
      name: delName,
      phone: delPhone,
      email: delEmail,
      vehicleNumber: delVehicle,
      zone: delZone,
      status: 'active',
    });
    setShowDeliveryModal(false);
    setDelName('');
    setDelPhone('');
    setDelEmail('');
    setDelVehicle('');
    loadAll();
  };

  // Coupon Add
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.saveCoupon({
      code: newCouponCode.toUpperCase().trim(),
      discountPercent: newCouponPercent,
      minOrderValue: newCouponMin,
      maxDiscount: newCouponMax,
      expiryDate: '2026-12-31',
      isActive: true,
      description: `${newCouponPercent}% off on orders above ₹${newCouponMin} (Max ₹${newCouponMax})`,
    });
    setShowCouponModal(false);
    setNewCouponCode('');
    loadAll();
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    await api.saveCoupon({
      ...coupon,
      isActive: !coupon.isActive,
    });
    loadAll();
  };

  const handleAdminReceivePayment = async (orderId: string) => {
    await api.markCodCollected(orderId);
    loadAll();
  };

  const handleVerifyOnlinePayment = async (orderId: string) => {
    const ordersList = await api.getOrders();
    const ord = ordersList.find((o) => o.id === orderId);
    if (ord) {
      await api.updateOrderStatus(orderId, ord.orderStatus, 'Payment verified and settled into Admin account');
      loadAll();
    }
  };

  const filteredOrders =
    statusFilter === 'all' ? orders : orders.filter((o) => o.orderStatus === statusFilter);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Admin Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-400/30">
              Store Owner &amp; Administrator
            </span>
            <span className="text-[11px] text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
              ✓ Full Power of Control &amp; Payments
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-2 tracking-tight flex items-center gap-2">
            <span>VoltCart Admin Operations Hub</span>
          </h1>

          <div className="flex items-center gap-3 mt-1 text-xs text-slate-300 flex-wrap">
            <span className="font-mono text-amber-300 font-semibold">admin@voltcart.in</span>
            <span className="text-slate-600">·</span>
            <span>Store Operations &amp; Inventory Management</span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setEditingProduct(null);
              setProdForm({
                name: '',
                brand: 'Polycab',
                category: 'wires-cables',
                subcategory: '1.5 sq mm FR Wire',
                mainCategory: 'electrical',
                sku: `VC-${Date.now().toString().slice(-6)}`,
                price: 999,
                mrp: 1299,
                discount: 23,
                stock: 50,
                warranty: '2 Years Manufacturer Warranty',
                description: '',
              });
              setShowProductModal(true);
            }}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Dashboard & Metrics', icon: LayoutDashboard },
          { id: 'payments', label: `Payments & Revenue Control`, icon: Banknote },
          { id: 'products', label: `Products (${products.length})`, icon: Package },
          { id: 'inventory', label: `Inventory & Stock (${stats?.lowStockCount || 0} Low)`, icon: Layers },
          { id: 'orders', label: `Orders Management (${orders.length})`, icon: ShoppingBag },
          { id: 'delivery', label: `Delivery Fleet (${deliveryPersonnel.length})`, icon: Truck },
          { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
          {
            id: 'replacements',
            label: `Replacement Control (${replacements.filter((r) => r.status === 'Pending').length} Pending)`,
            icon: RotateCcw,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS & CHARTS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-5">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sales</span>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-950 tabular-nums mt-1">
                ₹{stats.totalSales.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> ₹{stats.todaySales.toLocaleString('en-IN')} today
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-950 tabular-nums mt-1">
                {stats.totalOrders}
              </p>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                {stats.pendingOrders} Active / In Transit
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivered Orders</span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 tabular-nums mt-1">
                {stats.deliveredOrders}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {stats.cancelledOrders} Cancelled orders
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inventory Status</span>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-600 tabular-nums mt-1">
                {stats.lowStockCount} Low Stock
              </p>
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {stats.outOfStockCount} Out of stock
              </p>
            </div>
          </div>

          {/* Visual Sales & Order Status Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Daily Sales Bar Graph */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Weekly Revenue &amp; Contractor Volume</h3>
                  <p className="text-xs text-slate-500">Daily sales in Indian Rupees (INR)</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  +18.4% vs last week
                </span>
              </div>

              <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                {[
                  { day: 'Mon', val: 32000, height: '45%' },
                  { day: 'Tue', val: 48000, height: '65%' },
                  { day: 'Wed', val: 41000, height: '55%' },
                  { day: 'Thu', val: 62000, height: '85%' },
                  { day: 'Fri', val: 54000, height: '75%' },
                  { day: 'Sat', val: 78000, height: '100%' },
                  { day: 'Sun', val: 49000, height: '68%' },
                ].map((bar) => (
                  <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                      ₹{(bar.val / 1000).toFixed(0)}k
                    </span>
                    <div
                      style={{ height: bar.height }}
                      className="w-full max-w-[42px] bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg shadow-xs hover:from-amber-600 hover:to-amber-500 transition-colors cursor-pointer"
                    ></div>
                    <span className="text-xs font-bold text-slate-700">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100">
                  Category Revenue Share
                </h3>

                <div className="space-y-4 pt-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="flex items-center gap-1 text-amber-700">
                        <Zap className="w-3.5 h-3.5" /> Electrical (Wires, Switches, Lighting)
                      </span>
                      <span className="tabular-nums">58%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="flex items-center gap-1 text-cyan-800">
                        <Droplet className="w-3.5 h-3.5" /> Plumbing (CPVC, Valves, Drainage)
                      </span>
                      <span className="tabular-nums">42%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-600 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-800">Top Velocity SKUs:</span>
                <p className="text-slate-600">1. Polycab 1.5 sq mm FR Red (90m)</p>
                <p className="text-slate-600">2. Astral CPVC Pro SDR 11 3/4&quot;</p>
                <p className="text-slate-600">3. Zoloto Brass Ball Valve 1/2&quot;</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PAYMENTS & REVENUE CONTROL (ADMIN POWER OF CONTROL & RECEIVE PAYMENT) */}
      {activeTab === 'payments' && (
        <div className="space-y-5">
          {/* Revenue & Recipient Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Settled Revenue</span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 tabular-nums mt-1">
                ₹{orders
                  .filter((o) => o.paymentStatus === 'Paid' || o.codCollected)
                  .reduce((acc, o) => acc + o.totalAmount, 0)
                  .toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Settled to Admin Account
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending COD Doorstep Cash</span>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-600 tabular-nums mt-1">
                ₹{orders
                  .filter((o) => o.paymentMethod === 'COD' && !o.codCollected && o.orderStatus !== 'Cancelled')
                  .reduce((acc, o) => acc + o.totalAmount, 0)
                  .toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {orders.filter((o) => o.paymentMethod === 'COD' && !o.codCollected && o.orderStatus !== 'Cancelled').length} orders awaiting cash handover
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-4 shadow-sm border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  Receiver &amp; Merchant Identity
                </span>
                <p className="text-xs font-bold text-white mt-1">VoltCart Merchant Services</p>
                <p className="text-[11px] font-mono text-slate-300 mt-0.5">admin@voltcart.in</p>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center justify-between">
                <span>Razorpay &amp; Cash Collections</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">Verified</span>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Payment Ledger &amp; Cash Collection Control
                </h3>
                <p className="text-xs text-slate-500">
                  Admin power to receive cash on delivery, approve payments, and verify online gateway settlements
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Order &amp; Customer</th>
                    <th className="px-4 py-3">Payment Mode</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Transaction / Status</th>
                    <th className="px-4 py-3 text-right">Admin Power Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => {
                    const isCollected = ord.paymentStatus === 'Paid' || ord.codCollected;
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-extrabold text-slate-900">{ord.orderNumber}</div>
                          <div className="text-[11px] text-slate-500">
                            {ord.customerName} (+91 {ord.customerMobile})
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ord.paymentMethod === 'COD'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {ord.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Razorpay'}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-extrabold text-slate-900 tabular-nums">
                          ₹{ord.totalAmount.toLocaleString('en-IN')}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isCollected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                              }`}
                            ></span>
                            <span className="font-bold text-slate-800 capitalize">
                              {isCollected ? 'Payment Received' : 'Pending Collection'}
                            </span>
                          </div>
                          {ord.paymentId && (
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              ID: {ord.paymentId}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {ord.paymentMethod === 'COD' && !ord.codCollected ? (
                            <button
                              onClick={() => handleAdminReceivePayment(ord.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center gap-1 ml-auto"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Receive &amp; Approve Payment</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Settled to Admin
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Product Catalog Management</h3>
              <p className="text-xs text-slate-500">Edit prices, MRP, stock levels, and active status</p>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProdForm({
                  name: '',
                  brand: 'Polycab',
                  category: 'wires-cables',
                  subcategory: '1.5 sq mm FR Wire',
                  mainCategory: 'electrical',
                  sku: `VC-${Date.now().toString().slice(-6)}`,
                  price: 999,
                  mrp: 1299,
                  discount: 23,
                  stock: 50,
                  warranty: '2 Years Manufacturer Warranty',
                  description: '',
                });
                setShowProductModal(true);
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Brand &amp; SKU</th>
                  <th className="px-4 py-3">Price / MRP</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 max-w-sm">
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-contain rounded bg-slate-50 border border-slate-200 p-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{p.name}</p>
                          <span className="text-[10px] text-slate-400 capitalize">{p.mainCategory} · {p.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      <div>{p.brand}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums font-bold text-slate-900">
                      ₹{p.price.toLocaleString('en-IN')}
                      <span className="text-slate-400 font-normal line-through ml-1">₹{p.mrp}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-bold tabular-nums px-2 py-0.5 rounded text-[11px] ${
                          p.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : p.stock < 15
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleProductStatus(p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          p.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setStockProduct(p);
                            setStockDelta(25);
                            setShowStockModal(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700 text-[11px]"
                          title="Adjust stock"
                        >
                          + Stock
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProdForm({ ...p });
                            setShowProductModal(true);
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-amber-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY & LOW STOCK AUDIT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-950">Automated Inventory Management</p>
                <p className="text-amber-800">
                  Stock levels reduce automatically when customers confirm orders. Alerts trigger when stock falls below 15 units.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
              Low Stock &amp; Critical Inventory Watchlist
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {products
                .filter((p) => p.stock < 30)
                .sort((a, b) => a.stock - b.stock)
                .map((p) => (
                  <div key={p.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-contain rounded bg-slate-50 border border-slate-200 p-0.5"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku} · Brand: {p.brand}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Current Stock</span>
                        <span
                          className={`font-extrabold text-sm tabular-nums ${
                            p.stock === 0 ? 'text-red-600' : p.stock < 15 ? 'text-amber-600' : 'text-slate-900'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setStockProduct(p);
                          setStockDelta(50);
                          setShowStockModal(true);
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-xs"
                      >
                        Adjust Stock
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Status Filter Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {['all', 'Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors shrink-0 ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                Customer Orders ({filteredOrders.length})
              </h3>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {filteredOrders.map((ord) => (
                <div key={ord.id} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{ord.orderNumber}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 font-semibold">{ord.customerName} (+91 {ord.customerMobile})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="text-slate-500 flex flex-wrap gap-2 text-[11px]">
                    <span>Items: {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="text-slate-500">
                      Payment: <span className="font-bold text-slate-800">{ord.paymentMethod}</span> ({ord.paymentStatus}) ·{' '}
                      Executive: <span className="font-semibold text-slate-800">{ord.assignedDeliveryPersonName || 'Unassigned'}</span>
                    </div>

                    {/* Status updater quick buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Update Status:</span>
                      {(['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'] as OrderStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleUpdateOrderStatus(ord.id, s)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                            ord.orderStatus === s
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DELIVERY PERSONNEL & DISPATCH CONTROL */}
      {activeTab === 'delivery' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Delivery Fleet &amp; Dispatch Control</h3>
              <p className="text-xs text-slate-500">Admin assigns orders, tracks delivery executives, and oversees doorsteps</p>
            </div>
            <button
              onClick={() => setShowDeliveryModal(true)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Delivery Executive</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {deliveryPersonnel.map((dp) => (
              <div
                key={dp.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{dp.name}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded uppercase">
                    {dp.status}
                  </span>
                </div>
                <p className="text-slate-500">Phone: {dp.phone}</p>
                <p className="text-slate-500">Vehicle: {dp.vehicleNumber || 'Standard Two Wheeler'}</p>
                <p className="text-slate-700 font-semibold">Zone: {dp.zone}</p>
                <div className="pt-2 border-t border-slate-100 text-slate-500 text-[11px] flex items-center justify-between">
                  <span>Assigned Deliveries:</span>
                  <span className="font-extrabold text-slate-900">
                    {orders.filter((o) => o.assignedDeliveryPersonId === dp.id && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length} Active
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Active Orders Dispatch Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">Active Shipments &amp; Executive Assignment</h4>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {orders
                .filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled')
                .map((ord) => (
                  <div key={ord.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{ord.orderNumber}</span>
                        <span className="font-semibold text-slate-700">· {ord.customerName}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                          {ord.orderStatus}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">
                        Destination: {ord.deliveryAddress.street}, {ord.deliveryAddress.city} ({ord.deliveryAddress.pincode})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={ord.assignedDeliveryPersonId || ''}
                        onChange={(e) => {
                          const dp = deliveryPersonnel.find((d) => d.id === e.target.value);
                          if (dp) {
                            api.updateOrderStatus(ord.id, ord.orderStatus, `Assigned to ${dp.name}`, dp.id);
                            loadAll();
                          }
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                      >
                        <option value="">Select Delivery Executive</option>
                        {deliveryPersonnel.map((dp) => (
                          <option key={dp.id} value={dp.id}>
                            {dp.name} ({dp.zone})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'Delivered')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs"
                      >
                        Mark Delivered
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Discount Coupons &amp; Contractor Promos</h3>
            <button
              onClick={() => setShowCouponModal(true)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {coupons.map((c) => (
              <div
                key={c.code}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-amber-700 font-mono">{c.code}</span>
                  <button
                    onClick={() => handleToggleCoupon(c)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <p className="text-slate-600">{c.description}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Min Order: ₹{c.minOrderValue}</span>
                  <span>Expires: {c.expiryDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: REPLACEMENT POLICY & CUSTOMER CLAIMS (Admin Master Control) */}
      {activeTab === 'replacements' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Admin Policy Controls Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Storewide Master Policy
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-amber-400" />
                  <span>Product Replacement Window &amp; Claims Management</span>
                </h3>
                <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
                  Set how many days customers have after delivery to claim a free replacement for defective wires, valves, sockets, or mismatched fittings.
                </p>
              </div>

              {policySavedToast && (
                <div className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 animate-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 fill-slate-950 text-emerald-500" />
                  <span>Policy Saved!</span>
                </div>
              )}
            </div>

            {/* Quick Set Days Pills */}
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Current Active Replacement Guarantee Window:
              </label>

              <div className="flex items-center gap-2 flex-wrap">
                {[7, 10, 15, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => handleQuickSetDays(days)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      policyDaysInput === days
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105 ring-2 ring-amber-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <span>{days} Days Guarantee</span>
                    {policyDaysInput === days && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-slate-400">Custom Days:</span>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={policyDaysInput}
                    onChange={(e) => setPolicyDaysInput(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-400 font-bold text-center text-xs tabular-nums"
                  />
                  <button
                    onClick={() => handleSaveStorePolicy()}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Notice text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Public Storefront Guarantee Notice
                </label>
                <input
                  type="text"
                  value={policyNoticeInput}
                  onChange={(e) => setPolicyNoticeInput(e.target.value)}
                  placeholder="e.g. 10-day replacement on electrical & plumbing fixtures for manufacturing defects"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div>
                  <p className="font-bold text-slate-200">Self-Service Replacement Claims</p>
                  <p className="text-[11px] text-slate-400">
                    Buyers can request replacements directly from their My Orders screen
                  </p>
                </div>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase border border-emerald-500/30">
                  ENABLED
                </span>
              </div>
            </div>
          </div>

          {/* Replacement Requests Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Active Customer Replacement Requests
                </h3>
                <p className="text-xs text-slate-500">
                  Review claims, verify defects, and dispatch delivery personnel for free item exchange
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full w-fit">
                {replacements.length} Total Claims ({replacements.filter((r) => r.status === 'Pending').length} Pending)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Claim ID &amp; Order</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Product Claimed</th>
                    <th className="py-3 px-4">Reason &amp; Issue</th>
                    <th className="py-3 px-4">Replacement Window</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {replacements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No replacement claims submitted yet.
                      </td>
                    </tr>
                  ) : (
                    replacements.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 font-mono block">{req.id}</span>
                          <span className="text-[11px] text-amber-700 font-semibold">{req.orderNumber}</span>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{req.customerName}</p>
                          <p className="text-[11px] text-slate-500">{req.customerMobile}</p>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={req.productImage}
                              alt=""
                              className="w-9 h-9 object-contain rounded border border-slate-200 bg-slate-50 shrink-0"
                            />
                            <span className="font-semibold text-slate-800 line-clamp-2 leading-tight">
                              {req.productName}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px] block w-fit mb-1">
                            {req.reason}
                          </span>
                          <p className="text-[11px] text-slate-600 line-clamp-2">{req.description}</p>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] block w-fit">
                            ✓ {req.allowedDays || 10} Days Window
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            Requested {new Date(req.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              req.status === 'Approved' || req.status === 'Exchange_Scheduled'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : req.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            ● {req.status}
                          </span>
                          {req.assignedDeliveryPerson && (
                            <span className="text-[10px] text-slate-500 block mt-1">
                              Agent: {req.assignedDeliveryPerson}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {req.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateReplacementStatus(
                                      req.id,
                                      'Approved',
                                      'Approved by Admin for free customer exchange',
                                      deliveryPersonnel[0]?.name || 'Ramesh Kumar'
                                    )
                                  }
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-xs"
                                >
                                  Approve &amp; Dispatch
                                </button>
                                <button
                                  onClick={() => {
                                    const note = prompt('Enter rejection reason for customer:');
                                    if (note) {
                                      handleUpdateReplacementStatus(req.id, 'Rejected', note);
                                    }
                                  }}
                                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-lg"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {req.status === 'Approved' && (
                              <button
                                onClick={() => handleUpdateReplacementStatus(req.id, 'Completed')}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg shadow-xs"
                              >
                                Mark Completed
                              </button>
                            )}

                            {req.status === 'Completed' && (
                              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 justify-end">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Exchange Done
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {showStockModal && stockProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Adjust Inventory Stock</h3>
            <p className="text-xs text-slate-500 mb-3 truncate">{stockProduct.name}</p>

            <form onSubmit={handleAdjustStock} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Current Stock:</span>
                <span className="text-sm font-extrabold text-slate-900">{stockProduct.stock} units</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Stock Adjustment (+ or -)</label>
                <input
                  type="number"
                  required
                  value={stockDelta}
                  onChange={(e) => setStockDelta(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold tabular-nums"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  New resulting stock: {Math.max(0, stockProduct.stock + stockDelta)} units
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Audit Reason</label>
                <input
                  type="text"
                  required
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT ADD / EDIT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              {editingProduct ? 'Edit Product' : 'Add New Hardware Product'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Complete technical specifications for electrical/plumbing catalog</p>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="e.g. Polycab 1.5 sq mm Flame Retardant Wire"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={prodForm.mainCategory}
                    onChange={(e) => setProdForm({ ...prodForm, mainCategory: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                  >
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.mrp}
                    onChange={(e) => setProdForm({ ...prodForm, mrp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock (Units)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">SKU Code</label>
                <input
                  type="text"
                  required
                  value={prodForm.sku}
                  onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Warranty</label>
                  <input
                    type="text"
                    value={prodForm.warranty}
                    onChange={(e) => setProdForm({ ...prodForm, warranty: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Replacement Window (Days)</label>
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={prodForm.replacementDays ?? 10}
                    onChange={(e) => setProdForm({ ...prodForm, replacementDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DELIVERY PERSON MODAL */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Add Delivery Executive</h3>
            <p className="text-xs text-slate-500 mb-3">Register new delivery personnel for order dispatch</p>

            <form onSubmit={handleAddDeliveryPerson} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={delName}
                  onChange={(e) => setDelName(e.target.value)}
                  placeholder="Ramesh Kumar"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={delPhone}
                  onChange={(e) => setDelPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vehicle Plate / Type</label>
                <input
                  type="text"
                  value={delVehicle}
                  onChange={(e) => setDelVehicle(e.target.value)}
                  placeholder="KA-01-EX-4492"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Zone</label>
                <input
                  type="text"
                  required
                  value={delZone}
                  onChange={(e) => setDelZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeliveryModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm"
                >
                  Add Executive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Create Discount Coupon</h3>
            <p className="text-xs text-slate-500 mb-3">Set promotional discount rules for checkout</p>

            <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MONSOON20"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    required
                    value={newCouponPercent}
                    onChange={(e) => setNewCouponPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCouponMax}
                    onChange={(e) => setNewCouponMax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold tabular-nums"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Min Order Value (₹)</label>
                <input
                  type="number"
                  required
                  value={newCouponMin}
                  onChange={(e) => setNewCouponMin(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold tabular-nums"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
