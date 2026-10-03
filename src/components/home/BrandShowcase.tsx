import React from 'react';
import { BRANDS } from '../../data/mockData';

interface BrandShowcaseProps {
  onSelectBrand: (brandName: string) => void;
}

export const BrandShowcase: React.FC<BrandShowcaseProps> = ({ onSelectBrand }) => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Shop by Official Brand
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct from authorized national manufacturers with standard factory warranty
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 pt-4">
        {BRANDS.map((brand) => (
          <button
            key={brand.name}
            onClick={() => onSelectBrand(brand.name)}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all group text-center active:scale-[0.98]"
          >
            <div className="font-extrabold text-sm sm:text-base tracking-wider text-slate-800 group-hover:text-amber-600 transition-colors uppercase">
              {brand.logoText}
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1 line-clamp-1">
              {brand.name}
            </span>
            <span
              className={`text-[9px] font-bold mt-1 px-1.5 py-0.2 rounded uppercase ${
                brand.mainCategory === 'electrical'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-cyan-50 text-cyan-800'
              }`}
            >
              {brand.mainCategory}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
