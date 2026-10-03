import React from 'react';
import {
  Zap,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

interface FooterProps {
  onNavigateCategory: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateCategory }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-xs">
      {/* Top Value Assurance Ribbon */}
      <div className="border-b border-slate-800/80 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">100% Genuine Certified</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">IS 694 &amp; ASTM verified original goods</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">7-Day Easy Returns</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Doorstep pickup &amp; replacement</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">GST Input Tax Credit</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated tax invoices for contractors</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Engineer Helpdesk</h4>
              <a
                href="tel:18002668658"
                className="text-[11px] text-amber-400 hover:underline block mt-0.5 font-semibold"
              >
                1800-266-VOLT (Toll Free)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand Col */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Volt<span className="text-amber-400">Cart</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            India’s dedicated online marketplace for heavy-duty electrical wiring, switchgears, BLDC fans, CPVC high-pressure plumbing, valves, and professional installation tools.
          </p>

          <div className="space-y-1.5 text-[11px] text-slate-400 pt-2">
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              VoltCart Logistics Hub, Peenya Industrial Area, Bengaluru, KA 560058
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <a href="mailto:support@voltcart.in" className="hover:text-amber-400">
                support@voltcart.in
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <a
                href="tel:18002668658"
                className="text-emerald-400 hover:underline font-semibold"
              >
                1800-266-VOLT / +91 98450 12345
              </a>
            </p>
          </div>
        </div>

        {/* Electrical Categories */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
            ⚡ Electrical Store
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li>
              <button onClick={() => onNavigateCategory('wires-cables')} className="hover:text-amber-400">
                Wires &amp; FR Cables
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateCategory('switches-sockets')} className="hover:text-amber-400">
                Modular Switches &amp; Sockets
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateCategory('led-lighting')} className="hover:text-amber-400">
                LED Bulbs &amp; Panels
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateCategory('fans')} className="hover:text-amber-400">
                BLDC Energy Fans
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateCategory('mcb-distribution')} className="hover:text-amber-400">
                MCBs &amp; Distribution Boards
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateCategory('electrical-tools')} className="hover:text-amber-400">
                Digital Multimeters &amp; Testers
              </button>
            </li>
          </ul>
        </div>

        {/* Plumbing Categories */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
            🚰 Plumbing Store
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li>
              <button onClick={() => onNavigateCategory('cpvc-pipes')} className="hover:text-cyan-400">
                Astral CPVC Pro Pipes
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateCategory('pvc-pipes')} className="hover:text-cyan-400">
                Supreme SWR Drainage
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateCategory('taps-valves')} className="hover:text-cyan-400">
                Jaquar Taps &amp; Zoloto Valves
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateCategory('water-connectors')} className="hover:text-cyan-400">
                SS Geyser Flexible Pipes
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateCategory('sealants')} className="hover:text-cyan-400">
                PTFE Tape &amp; Solvent Cements
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateCategory('plumbing-tools')} className="hover:text-cyan-400">
                Stillson Pipe Wrenches
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Service & Policies */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
            Support &amp; Policies
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li className="hover:text-white cursor-pointer">Track Your Shipment</li>
            <li className="hover:text-white cursor-pointer">Shipping &amp; Delivery Policy</li>
            <li className="hover:text-white cursor-pointer">Return &amp; Refund Policy</li>
            <li className="hover:text-white cursor-pointer">Contractor Bulk Discounts</li>
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer">Terms &amp; Conditions</li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-slate-900 py-4 px-4 sm:px-6 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} VoltCart India Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>GSTIN: 29AABCV1029K1Z4</span>
            <span>·</span>
            <span>FSSAI / BIS Certified Partner</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
