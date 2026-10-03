import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Home,
  User,
  Phone,
  ShieldCheck,
  Banknote,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

const TIMELINE_STEPS: Array<{ status: OrderStatus; label: string; icon: any; description: string }> = [
  { status: 'Placed', label: 'Order Placed', icon: Clock, description: 'Order received and logged in system' },
  { status: 'Confirmed', label: 'Order Confirmed', icon: CheckCircle2, description: 'Inventory reserved & payment verified' },
  { status: 'Packed', label: 'Packed & Sealed', icon: Package, description: 'Tamper-evident packaging applied' },
  { status: 'Shipped', label: 'Dispatched / In Transit', icon: Truck, description: 'In transit to local delivery hub' },
  { status: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, description: 'With delivery executive for doorstep drop' },
  { status: 'Delivered', label: 'Delivered', icon: Home, description: 'Package handed over and signed' },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Placed':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Packed':
        return 2;
      case 'Shipped':
        return 3;
      case 'Out for Delivery':
        return 4;
      case 'Delivered':
        return 5;
      default:
        return 1;
    }
  };

  const currentIdx = getStepIndex(order.orderStatus);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 font-extrabold uppercase">Live Order Tracking</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-mono font-bold">{order.orderNumber}</span>
            </div>
            <h2 className="text-base font-extrabold text-white mt-0.5">
              Status: <span className="text-amber-400 capitalize">{order.orderStatus}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          {/* Timeline */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {TIMELINE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const isFuture = idx > currentIdx;

              // Find matching history item if available
              const historyItem = order.statusHistory?.find((h) => h.status === step.status);

              return (
                <div key={step.status} className="relative flex items-start gap-3">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-amber-500 text-slate-950 animate-pulse'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>

                  {/* Step Text */}
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <h4
                        className={`text-xs font-extrabold ${
                          isCurrent
                            ? 'text-amber-600 text-sm'
                            : isPast
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      {historyItem && (
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {new Date(historyItem.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isFuture ? 'text-slate-400' : 'text-slate-600'}`}>
                      {historyItem?.note || step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assigned Delivery Person Contact Box */}
          {order.assignedDeliveryPersonName && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Assigned Delivery Executive
                  </span>
                  <p className="font-bold text-slate-900 text-xs">{order.assignedDeliveryPersonName}</p>
                </div>
              </div>
              <a
                href="tel:9845012345"
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Phone className="w-3 h-3" />
                <span>Call Executive</span>
              </a>
            </div>
          )}

          {/* COD Collection Card */}
          {order.paymentMethod === 'COD' && (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-amber-700" />
                <div>
                  <span className="font-bold text-amber-950">Cash to Collect on Doorstep</span>
                  <p className="text-[10px] text-amber-800">
                    Status: {order.codCollected ? '✓ Payment Received' : 'Pending Doorstep Handover'}
                  </p>
                </div>
              </div>
              <span className="font-extrabold text-sm text-slate-950 tabular-nums">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
