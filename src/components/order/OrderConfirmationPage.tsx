import React from 'react';
import { CheckCircle2, Truck, ArrowRight, ShieldCheck, MapPin, Calendar, CreditCard, Banknote } from 'lucide-react';
import { Order } from '../../types';

interface OrderConfirmationPageProps {
  order: Order;
  onTrackOrder: (order: Order) => void;
  onContinueShopping: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onTrackOrder,
  onContinueShopping,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 pt-4 animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center shadow-sm relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
          Order Verified &amp; Confirmed
        </span>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
          Thank you! Your Order is Placed
        </h1>

        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          We have reserved the items in our warehouse. You will receive live SMS and tracking updates on +91 {order.customerMobile}.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            onClick={() => onTrackOrder(order)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Timeline</span>
          </button>
          <button
            onClick={onContinueShopping}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Order Summary Receipt Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 text-xs">
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          Order Receipt Details
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-slate-400 font-medium">Order ID</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{order.orderNumber}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Estimated Delivery</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {order.estimatedDelivery}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Payment Mode</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1">
              {order.paymentMethod === 'COD' ? (
                <>
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  COD (Pay on Delivery)
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Online (Paid)
                </>
              )}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Total Paid / Payable</span>
            <p className="font-extrabold text-slate-900 text-sm mt-0.5 tabular-nums">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-slate-600">
          <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">
              {order.deliveryAddress.fullName} (+91 {order.deliveryAddress.mobile})
            </span>
            <p className="mt-0.5">
              {order.deliveryAddress.houseFlat}, {order.deliveryAddress.street}, {order.deliveryAddress.area}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
            </p>
          </div>
        </div>

        {/* Item List */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
            Ordered Items ({order.items.length})
          </span>
          <div className="divide-y divide-slate-100">
            {order.items.map((item, i) => (
              <div key={i} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={item.image}
                    alt={item.productName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-contain rounded bg-slate-50 border border-slate-200 p-0.5"
                  />
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-1">{item.productName}</p>
                    <p className="text-slate-400">Qty: {item.quantity} · {item.brand}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{item.total.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
