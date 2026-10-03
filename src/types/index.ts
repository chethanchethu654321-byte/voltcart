export type Role = 'customer' | 'admin' | 'delivery';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
  status: 'active' | 'suspended';
}

export type MainCategory = 'electrical' | 'plumbing';

export interface Category {
  id: string;
  name: string;
  slug: string;
  mainCategory: MainCategory;
  description: string;
  iconName: string;
  image?: string;
  subcategories: string[];
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  mainCategory: MainCategory;
  sku: string;
  price: number;
  mrp: number;
  discount: number;
  stock: number;
  image: string;
  additionalImages?: string[];
  rating: number;
  reviewCount: number;
  description: string;
  specifications: ProductSpecification[];
  warranty: string;
  gstRate: number; // percentage, e.g. 18
  status: 'active' | 'inactive';
  isFeatured?: boolean;
  isDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  material?: string;
  dimensions?: string;
  modelNumber?: string;
  boxContents?: string;
  replacementDays?: number; // Admin-controlled replacement guarantee days
  isReplaceable?: boolean;
  model3DType?: 'wire_spool' | 'modular_switch' | 'cpvc_valve' | 'pipe_fitting' | 'led_bulb' | 'bldc_fan';
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Address {
  id: string;
  fullName: string;
  mobile: string;
  alternateMobile?: string;
  houseFlat: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'Home' | 'Work' | 'Site / Workshop';
  isDefault: boolean;
}

export type OrderStatus =
  | 'Placed'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export type PaymentMethod = 'COD' | 'ONLINE_RAZORPAY';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  deliveryAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryCharge: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistory[];
  assignedDeliveryPersonId?: string;
  assignedDeliveryPersonName?: string;
  codCollected?: boolean;
  createdAt: string;
  estimatedDelivery: string;
  replacementRequested?: boolean;
  replacementStatus?: 'None' | 'Pending' | 'Approved' | 'Rejected' | 'Exchange_Scheduled' | 'Completed';
  replacementId?: string;
}

export interface ReplacementRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productImage: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  reason: 'Defective / Not working' | 'Damaged in transit' | 'Wrong gauge or size' | 'Fitting / Thread mismatch' | 'Missing accessories' | 'Other';
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Exchange_Scheduled' | 'Completed';
  createdAt: string;
  allowedDays: number;
  deliveryDate: string;
  adminNotes?: string;
  assignedDeliveryPerson?: string;
}

export interface StorePolicy {
  defaultReplacementDays: number;
  enableSoundEffects: boolean;
  allowSelfServiceReplacement: boolean;
  replacementPolicyNotice: string;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  description: string;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleNumber?: string;
  activeOrdersCount: number;
  status: 'active' | 'inactive';
  zone: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  change: number;
  newStock: number;
  reason: string;
  date: string;
  adminName: string;
}
