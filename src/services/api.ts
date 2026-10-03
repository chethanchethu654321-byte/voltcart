import {
  Product,
  Category,
  Order,
  Address,
  Coupon,
  DeliveryPerson,
  InventoryLog,
  Review,
  User,
  OrderStatus,
  PaymentMethod,
  ReplacementRequest,
  StorePolicy,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_DELIVERY_PERSONNEL,
  INITIAL_ADDRESSES,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
} from '../data/mockData';

// LocalStorage Keys
const STORAGE_KEYS = {
  PRODUCTS: 'voltcart_products_v1',
  CATEGORIES: 'voltcart_categories_v1',
  COUPONS: 'voltcart_coupons_v1',
  DELIVERY_PERSONNEL: 'voltcart_delivery_v1',
  ADDRESSES: 'voltcart_addresses_v1',
  ORDERS: 'voltcart_orders_v1',
  REVIEWS: 'voltcart_reviews_v1',
  INVENTORY_LOGS: 'voltcart_inventory_logs_v1',
  USERS: 'voltcart_users_v1',
  CURRENT_USER: 'voltcart_current_user_v1',
  WISHLIST: 'voltcart_wishlist_v1',
  SEARCH_HISTORY: 'voltcart_search_history_v1',
  REPLACEMENTS: 'voltcart_replacements_v1',
  STORE_POLICY: 'voltcart_store_policy_v1',
};

// Safe storage helper
function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Storage read error:', e);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

// Initial default users
const DEFAULT_USERS: User[] = [
  {
    id: 'user-001',
    name: 'Chethan C',
    email: 'demo@voltcart.in',
    mobile: '9845098450',
    role: 'customer',
    createdAt: '2026-01-01T00:00:00Z',
    status: 'active',
    totalOrders: 2,
    totalSpent: 3997,
  },
  {
    id: 'admin-001',
    name: 'Store Administrator',
    email: 'admin@voltcart.in',
    mobile: '9845000000',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    status: 'active',
  },
  {
    id: 'del-001',
    name: 'Ramesh Kumar (Delivery)',
    email: 'delivery@voltcart.in',
    mobile: '9845012345',
    role: 'delivery',
    createdAt: '2026-01-01T00:00:00Z',
    status: 'active',
  },
];

// Seed initial data if empty
export function initializeStore() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    setStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
    setStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DELIVERY_PERSONNEL)) {
    setStorage(STORAGE_KEYS.DELIVERY_PERSONNEL, INITIAL_DELIVERY_PERSONNEL);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADDRESSES)) {
    setStorage(STORAGE_KEYS.ADDRESSES, INITIAL_ADDRESSES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    setStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    setStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }
}

// Ensure store is primed
initializeStore();

export const api = {
  // PRODUCTS
  async getProducts(params?: {
    search?: string;
    category?: string;
    subcategory?: string;
    brand?: string;
    mainCategory?: 'electrical' | 'plumbing';
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStockOnly?: boolean;
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'discount';
  }): Promise<Product[]> {
    let products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);

    if (!params) return products;

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.specifications.some((s) => s.value.toLowerCase().includes(q))
      );
    }

    if (params.mainCategory) {
      products = products.filter((p) => p.mainCategory === params.mainCategory);
    }

    if (params.category && params.category !== 'all') {
      products = products.filter((p) => p.category === params.category);
    }

    if (params.subcategory) {
      products = products.filter((p) => p.subcategory === params.subcategory);
    }

    if (params.brand && params.brand !== 'all') {
      products = products.filter((p) => p.brand.toLowerCase() === params.brand?.toLowerCase());
    }

    if (params.minPrice !== undefined) {
      products = products.filter((p) => p.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= params.maxPrice!);
    }

    if (params.minRating) {
      products = products.filter((p) => p.rating >= params.minRating!);
    }

    if (params.inStockOnly) {
      products = products.filter((p) => p.stock > 0);
    }

    // Sort
    switch (params.sortBy) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'discount':
        products.sort((a, b) => b.discount - a.discount);
        break;
      default:
        // Relevance / default: featured and bestsellers first
        products.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return products;
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return products.find((p) => p.id === id) || null;
  },

  async saveProduct(productData: Partial<Product>): Promise<Product> {
    const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    let updated: Product;

    if (productData.id) {
      // Edit
      const index = products.findIndex((p) => p.id === productData.id);
      if (index === -1) throw new Error('Product not found');
      updated = { ...products[index], ...productData } as Product;
      products[index] = updated;
    } else {
      // Create new
      updated = {
        id: `prod-${Date.now()}`,
        name: productData.name || 'New Product',
        brand: productData.brand || 'Generic',
        category: productData.category || 'wires-cables',
        subcategory: productData.subcategory || 'Standard',
        mainCategory: productData.mainCategory || 'electrical',
        sku: productData.sku || `VC-${Date.now().toString().slice(-6)}`,
        price: Number(productData.price) || 0,
        mrp: Number(productData.mrp) || Number(productData.price) || 0,
        discount: productData.discount || 0,
        stock: Number(productData.stock) || 0,
        image: productData.image || '/src/assets/images/electrical_category_1791008720192.jpg',
        rating: 5.0,
        reviewCount: 0,
        description: productData.description || '',
        specifications: productData.specifications || [],
        warranty: productData.warranty || '1 Year Warranty',
        gstRate: productData.gstRate || 18,
        status: productData.status || 'active',
        createdAt: new Date().toISOString(),
      };
      products.unshift(updated);
    }

    setStorage(STORAGE_KEYS.PRODUCTS, products);
    return updated;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const filtered = products.filter((p) => p.id !== id);
    setStorage(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },

  // INVENTORY ADJUSTMENT
  async adjustStock(productId: string, change: number, reason: string, adminName: string): Promise<Product> {
    const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) throw new Error('Product not found');

    const previousStock = products[index].stock;
    const newStock = Math.max(0, previousStock + change);
    products[index].stock = newStock;
    setStorage(STORAGE_KEYS.PRODUCTS, products);

    // Record log
    const logs = getStorage<InventoryLog[]>(STORAGE_KEYS.INVENTORY_LOGS, []);
    logs.unshift({
      id: `log-${Date.now()}`,
      productId,
      productName: products[index].name,
      previousStock,
      change,
      newStock,
      reason,
      date: new Date().toISOString(),
      adminName,
    });
    setStorage(STORAGE_KEYS.INVENTORY_LOGS, logs);

    return products[index];
  },

  async getInventoryLogs(): Promise<InventoryLog[]> {
    return getStorage<InventoryLog[]>(STORAGE_KEYS.INVENTORY_LOGS, []);
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    return getStorage<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  // ADDRESSES
  async getAddresses(): Promise<Address[]> {
    return getStorage<Address[]>(STORAGE_KEYS.ADDRESSES, INITIAL_ADDRESSES);
  },

  async saveAddress(addressData: Partial<Address>): Promise<Address> {
    const addresses = getStorage<Address[]>(STORAGE_KEYS.ADDRESSES, INITIAL_ADDRESSES);
    let updated: Address;

    if (addressData.id) {
      const idx = addresses.findIndex((a) => a.id === addressData.id);
      if (idx === -1) throw new Error('Address not found');
      updated = { ...addresses[idx], ...addressData } as Address;
      addresses[idx] = updated;
    } else {
      updated = {
        id: `addr-${Date.now()}`,
        fullName: addressData.fullName || '',
        mobile: addressData.mobile || '',
        alternateMobile: addressData.alternateMobile,
        houseFlat: addressData.houseFlat || '',
        street: addressData.street || '',
        area: addressData.area || '',
        city: addressData.city || '',
        state: addressData.state || '',
        pincode: addressData.pincode || '',
        addressType: addressData.addressType || 'Home',
        isDefault: addresses.length === 0 || addressData.isDefault || false,
      };
      if (updated.isDefault) {
        addresses.forEach((a) => (a.isDefault = false));
      }
      addresses.push(updated);
    }

    setStorage(STORAGE_KEYS.ADDRESSES, addresses);
    return updated;
  },

  async deleteAddress(id: string): Promise<boolean> {
    const addresses = getStorage<Address[]>(STORAGE_KEYS.ADDRESSES, INITIAL_ADDRESSES);
    const filtered = addresses.filter((a) => a.id !== id);
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    setStorage(STORAGE_KEYS.ADDRESSES, filtered);
    return true;
  },

  // ORDERS & CHECKOUT
  async getOrders(userId?: string): Promise<Order[]> {
    const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    if (userId) {
      return orders.filter((o) => o.userId === userId);
    }
    return orders;
  },

  async getOrderById(id: string): Promise<Order | null> {
    const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return orders.find((o) => o.id === id || o.orderNumber === id) || null;
  },

  async createOrder(orderPayload: {
    userId: string;
    customerName: string;
    customerMobile: string;
    customerEmail: string;
    deliveryAddress: Address;
    items: Array<{ productId: string; quantity: number }>;
    couponCode?: string;
    paymentMethod: PaymentMethod;
    paymentId?: string;
  }): Promise<Order> {
    const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);

    // Verify stock and prepare order items
    let subtotal = 0;
    const orderItems = [];

    for (const item of orderPayload.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) throw new Error(`Product not found`);
      if (prod.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}`);
      }

      // Decrement stock
      prod.stock -= item.quantity;
      const itemTotal = prod.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        brand: prod.brand,
        image: prod.image,
        price: prod.price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // Save updated stock
    setStorage(STORAGE_KEYS.PRODUCTS, products);

    // Calculate discounts
    let discount = 0;
    if (orderPayload.couponCode) {
      const coupons = getStorage<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
      const coupon = coupons.find((c) => c.code === orderPayload.couponCode && c.isActive);
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.discountAmount) {
          discount = coupon.discountAmount;
        } else if (coupon.discountPercent) {
          discount = (subtotal * coupon.discountPercent) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        }
      }
    }

    const deliveryCharge = subtotal >= 999 ? 0 : 79;
    const gstAmount = Math.round((subtotal * 0.18 * 100) / 118); // GST included in price
    const totalAmount = Math.max(0, subtotal - discount + deliveryCharge);

    const now = new Date();
    const estDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const estFormatted = estDate.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const isCod = orderPayload.paymentMethod === 'COD';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `VC-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: orderPayload.userId,
      customerName: orderPayload.customerName,
      customerMobile: orderPayload.customerMobile,
      customerEmail: orderPayload.customerEmail,
      deliveryAddress: orderPayload.deliveryAddress,
      items: orderItems,
      subtotal,
      discount,
      couponCode: orderPayload.couponCode,
      deliveryCharge,
      gstAmount,
      totalAmount,
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: isCod ? 'Pending' : 'Paid',
      paymentId: orderPayload.paymentId || (isCod ? undefined : `pay_rzp_${Date.now()}`),
      orderStatus: 'Confirmed',
      statusHistory: [
        {
          status: 'Placed',
          timestamp: now.toISOString(),
          note: isCod ? 'Order placed via Cash on Delivery' : 'Order placed with online payment verification',
        },
        {
          status: 'Confirmed',
          timestamp: now.toISOString(),
          note: 'Order confirmed and inventory reserved',
        },
      ],
      assignedDeliveryPersonId: 'del-001',
      assignedDeliveryPersonName: 'Ramesh Kumar',
      codCollected: false,
      createdAt: now.toISOString(),
      estimatedDelivery: estFormatted,
    };

    const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    orders.unshift(newOrder);
    setStorage(STORAGE_KEYS.ORDERS, orders);

    return newOrder;
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    assignedDeliveryPersonId?: string
  ): Promise<Order> {
    const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const order = orders[index];
    order.orderStatus = status;

    if (assignedDeliveryPersonId) {
      const deliveryPersonnel = getStorage<DeliveryPerson[]>(STORAGE_KEYS.DELIVERY_PERSONNEL, INITIAL_DELIVERY_PERSONNEL);
      const dp = deliveryPersonnel.find((d) => d.id === assignedDeliveryPersonId);
      if (dp) {
        order.assignedDeliveryPersonId = dp.id;
        order.assignedDeliveryPersonName = dp.name;
      }
    }

    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${status}`,
    });

    orders[index] = order;
    setStorage(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  async markCodCollected(orderId: string): Promise<Order> {
    const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    orders[index].codCollected = true;
    orders[index].paymentStatus = 'Paid';
    orders[index].statusHistory.push({
      status: orders[index].orderStatus,
      timestamp: new Date().toISOString(),
      note: 'Cash payment collected at doorstep by delivery executive',
    });

    setStorage(STORAGE_KEYS.ORDERS, orders);
    return orders[index];
  },

  // ONLINE PAYMENT SIMULATION (Razorpay Flow)
  async createRazorpayOrder(amount: number) {
    // Generates simulated Razorpay order ID
    return {
      id: `order_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      entity: 'order',
      amount: amount * 100, // paise
      currency: 'INR',
      status: 'created',
      receipt: `rcpt_${Date.now()}`,
    };
  },

  async verifyRazorpayPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
    // Backend verification simulation:
    // In production Flask backend, we compute hmac_sha256(order_id + "|" + payment_id, secret)
    if (!razorpayPaymentId || !razorpayOrderId) {
      return { success: false, message: 'Invalid payment parameters' };
    }
    return {
      success: true,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      verifiedAt: new Date().toISOString(),
    };
  },

  // COUPONS
  async getCoupons(): Promise<Coupon[]> {
    return getStorage<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string }> {
    const coupons = getStorage<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon requires minimum order value of ₹${coupon.minOrderValue}.`,
      };
    }

    let discount = 0;
    if (coupon.discountAmount) {
      discount = coupon.discountAmount;
    } else if (coupon.discountPercent) {
      discount = Math.round((subtotal * coupon.discountPercent) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    return {
      valid: true,
      discount,
      message: `Coupon "${coupon.code}" applied! You save ₹${discount}`,
    };
  },

  async saveCoupon(coupon: Coupon): Promise<Coupon> {
    const coupons = getStorage<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    const index = coupons.findIndex((c) => c.code === coupon.code);
    if (index !== -1) {
      coupons[index] = coupon;
    } else {
      coupons.push(coupon);
    }
    setStorage(STORAGE_KEYS.COUPONS, coupons);
    return coupon;
  },

  // REVIEWS
  async getProductReviews(productId: string): Promise<Review[]> {
    const reviews = getStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    return reviews.filter((r) => r.id.startsWith('rev-') && (r as any).productId === productId);
  },

  async submitReview(review: {
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    title: string;
    comment: string;
  }): Promise<Review> {
    const reviews = getStorage<any[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const newRev = {
      id: `rev-${Date.now()}`,
      ...review,
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true,
    };
    reviews.unshift(newRev);
    setStorage(STORAGE_KEYS.REVIEWS, reviews);

    // Update product rating
    const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const pIndex = products.findIndex((p) => p.id === review.productId);
    if (pIndex !== -1) {
      const prod = products[pIndex];
      const newCount = prod.reviewCount + 1;
      const newAvg = Number(((prod.rating * prod.reviewCount + review.rating) / newCount).toFixed(1));
      prod.rating = newAvg;
      prod.reviewCount = newCount;
      products[pIndex] = prod;
      setStorage(STORAGE_KEYS.PRODUCTS, products);
    }

    return newRev;
  },

  // DELIVERY PERSONNEL
  async getDeliveryPersonnel(): Promise<DeliveryPerson[]> {
    return getStorage<DeliveryPerson[]>(STORAGE_KEYS.DELIVERY_PERSONNEL, INITIAL_DELIVERY_PERSONNEL);
  },

  async addDeliveryPerson(data: Omit<DeliveryPerson, 'id' | 'activeOrdersCount'>): Promise<DeliveryPerson> {
    const personnel = getStorage<DeliveryPerson[]>(STORAGE_KEYS.DELIVERY_PERSONNEL, INITIAL_DELIVERY_PERSONNEL);
    const newPerson: DeliveryPerson = {
      id: `del-${Date.now()}`,
      activeOrdersCount: 0,
      ...data,
    };
    personnel.push(newPerson);
    setStorage(STORAGE_KEYS.DELIVERY_PERSONNEL, personnel);
    return newPerson;
  },

  // SEARCH HISTORY
  getSearchHistory(): string[] {
    return getStorage<string[]>(STORAGE_KEYS.SEARCH_HISTORY, [
      '1.5 sq mm wire',
      'Astral CPVC pipe',
      'Havells 9W bulb',
      'Jaquar bib tap',
      'Ball valve',
    ]);
  },

  addSearchHistory(term: string): void {
    if (!term || term.trim().length < 2) return;
    const history = this.getSearchHistory().filter((t) => t.toLowerCase() !== term.toLowerCase());
    history.unshift(term.trim());
    setStorage(STORAGE_KEYS.SEARCH_HISTORY, history.slice(0, 8));
  },

  clearSearchHistory(): void {
    setStorage(STORAGE_KEYS.SEARCH_HISTORY, []);
  },

  // STORE POLICY & REPLACEMENT CONTROLS (Admin managed)
  async getStorePolicy(): Promise<StorePolicy> {
    return getStorage<StorePolicy>(STORAGE_KEYS.STORE_POLICY, {
      defaultReplacementDays: 10,
      enableSoundEffects: true,
      allowSelfServiceReplacement: true,
      replacementPolicyNotice:
        'Hassle-free 10-day replacement on all certified electrical & plumbing products for defects or transit damage.',
    });
  },

  async updateStorePolicy(updates: Partial<StorePolicy>): Promise<StorePolicy> {
    const current = await this.getStorePolicy();
    const updated = { ...current, ...updates };
    setStorage(STORAGE_KEYS.STORE_POLICY, updated);
    return updated;
  },

  // REPLACEMENT REQUESTS
  async getReplacementRequests(): Promise<ReplacementRequest[]> {
    const defaultReplacements: ReplacementRequest[] = [
      {
        id: 'rep-101',
        orderId: 'ord-1002',
        orderNumber: 'VC-2026-9481',
        productId: 'wire-havells-15',
        productName: 'Havells 1.5 sq mm LifeLine Plus FR Copper Wire (90m Red)',
        productImage: '/src/assets/images/hero_electrical_plumbing_1791008707980.jpg',
        customerName: 'Chethan',
        customerEmail: 'chethanchethu654321@gmail.com',
        customerMobile: '8431653614',
        reason: 'Wrong gauge or size',
        description: 'Customer requested 2.5 sq mm instead of 1.5 sq mm for contractor main board installation.',
        status: 'Pending',
        createdAt: '2026-03-29T10:00:00Z',
        allowedDays: 10,
        deliveryDate: '2026-03-28T14:30:00Z',
        adminNotes: 'Awaiting stock check for 2.5 sq mm exchange',
      },
      {
        id: 'rep-102',
        orderId: 'ord-1001',
        orderNumber: 'VC-2026-8912',
        productId: 'valve-astral-brass-1',
        productName: 'Astral FlowGuard Plus CPVC Brass Ball Valve (1 Inch)',
        productImage: '/src/assets/images/plumbing_category_1791008731604.jpg',
        customerName: 'Customer Demo',
        customerEmail: 'customer@voltcart.in',
        customerMobile: '9845098450',
        reason: 'Fitting / Thread mismatch',
        description: 'Need internal BSP female thread coupler variation for bathroom connection.',
        status: 'Approved',
        createdAt: '2026-03-27T16:00:00Z',
        allowedDays: 10,
        deliveryDate: '2026-03-25T11:00:00Z',
        adminNotes: 'Approved for free delivery boy exchange pickup',
        assignedDeliveryPerson: 'Ramesh Kumar',
      },
    ];

    return getStorage<ReplacementRequest[]>(STORAGE_KEYS.REPLACEMENTS, defaultReplacements);
  },

  async createReplacementRequest(
    data: Omit<ReplacementRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<ReplacementRequest> {
    const all = await this.getReplacementRequests();
    const newReq: ReplacementRequest = {
      ...data,
      id: `rep-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    all.unshift(newReq);
    setStorage(STORAGE_KEYS.REPLACEMENTS, all);

    // Update corresponding order flag
    const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderIndex = orders.findIndex((o) => o.id === data.orderId || o.orderNumber === data.orderNumber);
    if (orderIndex !== -1) {
      orders[orderIndex].replacementRequested = true;
      orders[orderIndex].replacementStatus = 'Pending';
      orders[orderIndex].replacementId = newReq.id;
      setStorage(STORAGE_KEYS.ORDERS, orders);
    }

    return newReq;
  },

  async updateReplacementStatus(
    id: string,
    status: ReplacementRequest['status'],
    adminNotes?: string,
    assignedDeliveryPerson?: string
  ): Promise<ReplacementRequest | null> {
    const all = await this.getReplacementRequests();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) return null;

    all[index].status = status;
    if (adminNotes !== undefined) all[index].adminNotes = adminNotes;
    if (assignedDeliveryPerson !== undefined) all[index].assignedDeliveryPerson = assignedDeliveryPerson;
    setStorage(STORAGE_KEYS.REPLACEMENTS, all);

    // Sync order replacementStatus
    const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderIndex = orders.findIndex((o) => o.id === all[index].orderId || o.orderNumber === all[index].orderNumber);
    if (orderIndex !== -1) {
      orders[orderIndex].replacementStatus = status;
      setStorage(STORAGE_KEYS.ORDERS, orders);
    }

    return all[index];
  },

  // ADMIN ANALYTICS METRICS
  async getAdminStats() {
    const orders = getStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const replacements = await this.getReplacementRequests();

    const totalSales = orders.reduce((acc, o) => (o.orderStatus !== 'Cancelled' ? acc + o.totalAmount : acc), 0);
    const pendingOrders = orders.filter((o) => ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.orderStatus)).length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled').length;
    const lowStockProducts = products.filter((p) => p.stock < 15);
    const outOfStockProducts = products.filter((p) => p.stock === 0);
    const pendingReplacements = replacements.filter((r) => r.status === 'Pending').length;

    return {
      totalSales,
      todaySales: Math.round(totalSales * 0.15),
      totalOrders: orders.length,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalCustomers: users.filter((u) => u.role === 'customer').length,
      lowStockProducts,
      pendingReplacements,
      totalReplacements: replacements.length,
    };
  },
};
