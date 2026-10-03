import React, { useState, useEffect } from 'react';
import {
  Truck,
  Phone,
  MapPin,
  Banknote,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Package,
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';

export const DeliveryPortal: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'active' | 'completed'>('active');

  const loadOrders = async () => {
    const ords = await api.getOrders();
    setOrders(ords);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await api.updateOrderStatus(orderId, status);
    loadOrders();
  };

  const handleCollectCod = async (orderId: string) => {
    await api.markCodCollected(orderId);
    loadOrders();
  };

  const activeOrders = orders.filter((o) => ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.orderStatus));
  const completedOrders = orders.filter((o) => ['Delivered', 'Cancelled'].includes(o.orderStatus));

  const displayList = filter === 'active' ? activeOrders : completedOrders;

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-lg">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
              Bengaluru South Delivery Hub
            </span>
            <h1 className="text-base sm:text-lg font-bold text-white mt-1">
              Ramesh Kumar · Delivery Executive
            </h1>
            <p className="text-xs text-slate-400">Assigned Deliveries: {activeOrders.length} pending</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filter === 'active'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Active Deliveries ({activeOrders.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filter === 'completed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Completed / Past ({completedOrders.length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {displayList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No {filter} deliveries in your queue</p>
          </div>
        ) : (
          displayList.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3 text-xs"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{ord.orderNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      ord.orderStatus === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    ● {ord.orderStatus}
                  </span>
                </div>
                <span className="font-extrabold text-slate-900 text-sm tabular-nums">
                  ₹{ord.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Customer Info & Phone Call Shortcut */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{ord.customerName}</p>
                  <p className="text-slate-600 mt-0.5">
                    {ord.deliveryAddress.houseFlat}, {ord.deliveryAddress.street}, {ord.deliveryAddress.city} -{' '}
                    <span className="font-bold text-slate-900">{ord.deliveryAddress.pincode}</span>
                  </p>
                </div>

                <a
                  href={`tel:${ord.customerMobile}`}
                  className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Customer</span>
                </a>
              </div>

              {/* Items Summary */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                <span className="font-bold text-slate-800">Items: </span>
                {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
              </div>

              {/* COD Collection Section */}
              {ord.paymentMethod === 'COD' && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-amber-700" />
                    <div>
                      <span className="font-bold text-amber-950">Cash to Collect at Doorstep</span>
                      <p className="text-[10px] text-amber-800">
                        {ord.codCollected ? '✓ Payment Received & Verified' : 'Amount pending from customer'}
                      </p>
                    </div>
                  </div>

                  {ord.codCollected ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Collected
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCollectCod(ord.id)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-xs"
                    >
                      Mark Cash Collected
                    </button>
                  )}
                </div>
              )}

              {/* Action Controls: Out for Delivery & Delivered */}
              {ord.orderStatus !== 'Delivered' && ord.orderStatus !== 'Cancelled' && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  {ord.orderStatus !== 'Out for Delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'Out for Delivery')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl"
                    >
                      Mark &quot;Out for Delivery&quot;
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateStatus(ord.id, 'Delivered')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Handover &amp; Deliver</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
