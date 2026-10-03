import React, { useState } from 'react';
import {
  Zap,
  Droplet,
  ToggleRight,
  Lightbulb,
  Wind,
  ShieldAlert,
  Wrench,
  Grid,
  Layers,
  Thermometer,
  GitBranch,
  CloudRain,
  Shield,
  Columns,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { MainCategory } from '../../types';

interface CategoryGridProps {
  onSelectCategory: (categorySlug: string) => void;
  onSelectMainCategory: (mainCat: MainCategory) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  onSelectMainCategory,
}) => {
  const [activeTab, setActiveTab] = useState<MainCategory>('electrical');

  const electricalCategories = [
    { slug: 'wires-cables', name: 'Wires & Cables', icon: Zap, sub: 'Polycab, Finolex FR wires' },
    { slug: 'switches-sockets', name: 'Switches & Sockets', icon: ToggleRight, sub: 'Anchor Roma, modular' },
    { slug: 'led-lighting', name: 'LED Bulbs & Lights', icon: Lightbulb, sub: 'Havells, Philips panels' },
    { slug: 'fans', name: 'Ceiling & BLDC Fans', icon: Wind, sub: 'Crompton 5-star BEE' },
    { slug: 'mcb-distribution', name: 'MCB & Isolators', icon: ShieldAlert, sub: 'Schneider, SP/DP breakers' },
    { slug: 'modular-accessories', name: 'Modular Plates', icon: Grid, sub: 'Dimmers, bells, USBs' },
    { slug: 'electrical-tools', name: 'Electrical Tools', icon: Wrench, sub: 'Multimeters, strippers' },
    { slug: 'conduits', name: 'PVC Conduits', icon: Columns, sub: '20mm & 25mm heavy pipes' },
  ];

  const plumbingCategories = [
    { slug: 'cpvc-pipes', name: 'CPVC Pipes & Fittings', icon: Thermometer, sub: 'Astral FlowGuard SDR 11' },
    { slug: 'pvc-pipes', name: 'PVC Drainage Pipes', icon: Layers, sub: 'Supreme 110mm SWR' },
    { slug: 'taps-valves', name: 'Taps & Ball Valves', icon: Droplet, sub: 'Jaquar bib cocks, Zoloto' },
    { slug: 'pipe-fittings', name: 'Plumbing Fittings', icon: GitBranch, sub: 'Elbows, tees & unions' },
    { slug: 'water-connectors', name: 'Braided Inlets', icon: Activity, sub: 'SS geyser & basin pipes' },
    { slug: 'showers-bath', name: 'Shower & Faucets', icon: CloudRain, sub: '8" Rain showers, jets' },
    { slug: 'plumbing-tools', name: 'Plumbing Tools', icon: Wrench, sub: '14" Stillson wrenches' },
    { slug: 'sealants', name: 'Solvents & Teflon', icon: Shield, sub: 'M-Seal, Astral cement' },
  ];

  const currentList = activeTab === 'electrical' ? electricalCategories : plumbingCategories;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-sm">
      {/* Category Header & Main Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Shop by Category</span>
            <span className="text-xs font-normal text-slate-500 hidden sm:inline">
              · Genuine branded supplies
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select high-conductivity electrical supplies or certified plumbing solutions
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto border border-slate-200/60">
          <button
            onClick={() => {
              setActiveTab('electrical');
              onSelectMainCategory('electrical');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'electrical'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Electrical ({electricalCategories.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('plumbing');
              onSelectMainCategory('plumbing');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'plumbing'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>Plumbing ({plumbingCategories.length})</span>
          </button>
        </div>
      </div>

      {/* Grid of Categories (Optimized 2 cols mobile, 4 cols desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5 pt-4">
        {currentList.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className="flex items-center gap-2.5 p-2.5 sm:p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50 text-left transition-all group active:scale-[0.98]"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                  activeTab === 'electrical'
                    ? 'bg-amber-100/80 text-amber-700'
                    : 'bg-cyan-100/80 text-cyan-800'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-amber-600">
                  {cat.name}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                  {cat.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom quick link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 hidden sm:inline">
          Need contractor bulk pricing? Contact VoltCart Trade Desk.
        </span>
        <button
          onClick={() => onSelectMainCategory(activeTab)}
          className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 ml-auto"
        >
          <span>View All {activeTab === 'electrical' ? 'Electrical' : 'Plumbing'} Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
