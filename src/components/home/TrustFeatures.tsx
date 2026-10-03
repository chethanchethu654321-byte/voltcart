import React from 'react';
import { ShieldCheck, Truck, Banknote, RotateCcw, Headphones, FileCheck } from 'lucide-react';

export const TrustFeatures: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: '100% Genuine Certified',
      description: 'IS 694 & ASTM compliant products sourced directly from OEM authorized channels.',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: Truck,
      title: 'Express Doorstep Delivery',
      description: 'Fast dispatch from regional hubs across Indian metros & tier 2/3 industrial zones.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Banknote,
      title: 'Cash on Delivery (COD)',
      description: 'Pay cash or scan UPI upon doorstep delivery. Inspect your package with zero upfront risk.',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: RotateCcw,
      title: '7-Day Easy Returns',
      description: 'Hassle-free replacement for defective, damaged, or incorrect hardware items.',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: FileCheck,
      title: 'GST Invoicing Ready',
      description: 'Input tax credit (ITC) eligible tax invoice provided automatically for contractors & businesses.',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
    },
    {
      icon: Headphones,
      title: 'Technical Support',
      description: 'Electrical engineers & plumbing specialists on call 9 AM - 8 PM IST for technical sizing.',
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
    },
  ];

  return (
    <div className="bg-slate-900 text-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-xl border border-slate-800">
      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
          Why India Trusts <span className="text-amber-400">VoltCart</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Building safety and plumbing integrity require authentic, uncompromised quality
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6">
        {features.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-start gap-3 p-3 sm:p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition-colors"
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${item.bgColor} ${item.color} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
