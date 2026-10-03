import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  MapPin,
  ChevronDown,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { getSoundEnabled, setSoundEnabled, playAddToCartSound } from '../../utils/audio';

interface HeaderProps {
  onOpenSearch: () => void;
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onNavigate, currentPage }) => {
  const { cartCount, wishlist } = useCart();
  const { user, role, switchRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [pincode, setPincode] = useState('560102');
  const [editingPincode, setEditingPincode] = useState(false);
  const [soundOn, setSoundOn] = useState(() => getSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playAddToCartSound();
    }
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPincode.length === 6) {
      setPincode(tempPincode);
      setEditingPincode(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
      {/* Top Bar with Genuine Guarantee & WhatsApp Support */}
      <div className="bg-slate-950 border-b border-slate-800 text-[11px] py-1 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-1">
          <div className="flex items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
              100% Certified Electrical &amp; Plumbing
            </span>
            <span className="hidden md:inline text-slate-500">·</span>
            <span className="hidden md:inline">Free Delivery on ₹999+</span>
            <span className="hidden md:inline text-slate-500">·</span>
            <span className="hidden md:inline">GST Invoicing Available</span>
          </div>

          <div className="flex items-center gap-3 ml-auto text-slate-300">
            <button
              onClick={() => onNavigate('admin')}
              className="hover:text-amber-400 transition-colors flex items-center gap-1 font-medium"
            >
              <span>Admin Portal</span>
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => onNavigate('delivery')}
              className="hover:text-amber-400 transition-colors flex items-center gap-1 font-medium"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Delivery Portal</span>
            </button>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <button
              onClick={handleToggleSound}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${
                soundOn
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={soundOn ? 'Interactive Audio FX Active (Click to Mute)' : 'Interactive Audio FX Muted (Click to Enable)'}
            >
              {soundOn ? (
                <>
                  <Volume2 className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-bold">Sound: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px]">Sound: OFF</span>
                </>
              )}
            </button>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <a
              href="tel:18002668658"
              className="hover:text-amber-400 transition-colors hidden sm:inline"
            >
              Toll-Free: 1800-266-VOLT
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-1 text-slate-200 hover:text-white rounded-lg active:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* VoltCart Brand Identity */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 focus:outline-none group text-left shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight flex items-center">
                Volt<span className="text-amber-400">Cart</span>
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wider text-slate-400 font-medium uppercase -mt-1 hidden sm:block">
                Electrical &amp; Plumbing
              </span>
            </div>
          </button>

          {/* Delivery Pincode Selector (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 border-l border-slate-700 pl-4 py-0.5">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Deliver to</span>
              {editingPincode ? (
                <form onSubmit={handlePincodeSubmit} className="flex items-center gap-1">
                  <input
                    type="text"
                    maxLength={6}
                    value={tempPincode}
                    onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-16 bg-slate-800 text-white text-xs px-1 py-0.5 rounded border border-slate-600 focus:outline-none focus:border-amber-400"
                    placeholder="Pincode"
                    autoFocus
                  />
                  <button type="submit" className="text-amber-400 text-xs font-semibold">
                    Save
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setEditingPincode(true)}
                  className="font-semibold text-white hover:text-amber-400 flex items-center gap-0.5 text-left"
                >
                  {pincode}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Search Bar (Center / Desktop & Tablet) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div
              onClick={onOpenSearch}
              className="relative flex items-center w-full bg-white rounded-lg shadow-inner cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all text-slate-500"
            >
              <div className="pl-3.5 pr-2 text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                readOnly
                placeholder='Search 1.5 sq mm wire, CPVC pipes, brass valves, Havells LED...'
                className="w-full py-2.5 bg-transparent text-sm text-slate-800 placeholder-slate-400 cursor-pointer focus:outline-none font-medium"
              />
              <span className="mr-3 px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded">
                Search
              </span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Trigger for Mobile */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 text-slate-200 hover:text-white rounded-lg active:bg-slate-800"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="p-2 text-slate-200 hover:text-white rounded-lg hover:bg-slate-800 relative transition-colors"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={() => onNavigate('cart')}
              className="flex items-center gap-1.5 p-2 text-slate-200 hover:text-white rounded-lg hover:bg-slate-800 relative transition-colors"
              aria-label="Cart"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-amber-400 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold hidden lg:inline">Cart</span>
            </button>

            {/* User Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-200"
              >
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                  {user ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {user ? `Hello, ${user.name.split(' ')[0]}` : 'Sign In'}
                  </span>
                  <span className="text-xs font-semibold text-white leading-tight">
                    {role === 'admin' ? 'Store Admin' : role === 'delivery' ? 'Delivery Agent' : 'My Account'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Account Dropdown Menu */}
              {accountDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setAccountDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Guest User'}</p>
                    <p className="text-[11px] text-amber-600 font-medium capitalize">Role: {role}</p>
                  </div>

                  <div className="py-1 text-sm">
                    {role === 'customer' && (
                      <>
                        <button
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            onNavigate('account', { tab: 'orders' });
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between"
                        >
                          <span>My Orders</span>
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Tracking</span>
                        </button>
                        <button
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            onNavigate('account', { tab: 'profile' });
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50"
                        >
                          Profile &amp; Addresses
                        </button>
                        <button
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            onNavigate('wishlist');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50"
                        >
                          Wishlist ({wishlist.length})
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-amber-50 text-amber-700 font-semibold flex items-center justify-between"
                    >
                      <span>Admin Management Portal</span>
                      <span className="text-[10px] bg-amber-100 font-bold px-1.5 py-0.5 rounded">Admin Hub</span>
                    </button>
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        onNavigate('delivery');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                    >
                      <span>Delivery Fleet Portal</span>
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    {user ? (
                      <button
                        onClick={() => {
                          logout();
                          setAccountDropdownOpen(false);
                          onNavigate('home');
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-xs font-semibold"
                      >
                        Sign Out
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          onNavigate('login');
                        }}
                        className="w-full text-left px-4 py-2 text-amber-600 hover:bg-amber-50 font-semibold"
                      >
                        Sign In / Register
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Trigger Row */}
      <div className="md:hidden px-3 pb-2.5">
        <div
          onClick={onOpenSearch}
          className="flex items-center w-full bg-white text-slate-500 rounded-lg px-3 py-2 shadow-inner text-xs font-medium"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <span className="truncate text-slate-400">
            Search Wires, Switches, CPVC Pipes, Valves...
          </span>
        </div>
      </div>

      {/* Desktop Secondary Category Navigation Ribbon */}
      <nav className="hidden md:block bg-slate-800 border-t border-slate-700/60 text-xs font-medium text-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center gap-6 whitespace-nowrap">
            <button
              onClick={() => onNavigate('catalog', { category: 'all' })}
              className={`hover:text-amber-400 transition-colors ${
                currentPage === 'catalog' ? 'text-amber-400 font-bold' : ''
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => onNavigate('catalog', { mainCategory: 'electrical' })}
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Electrical Store
            </button>
            <button
              onClick={() => onNavigate('catalog', { category: 'wires-cables' })}
              className="hover:text-amber-400 transition-colors"
            >
              Wires &amp; Cables
            </button>
            <button
              onClick={() => onNavigate('catalog', { category: 'switches-sockets' })}
              className="hover:text-amber-400 transition-colors"
            >
              Switches &amp; Sockets
            </button>
            <button
              onClick={() => onNavigate('catalog', { category: 'led-lighting' })}
              className="hover:text-amber-400 transition-colors"
            >
              LED Lighting
            </button>
            <button
              onClick={() => onNavigate('catalog', { mainCategory: 'plumbing' })}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Plumbing Store
            </button>
            <button
              onClick={() => onNavigate('catalog', { category: 'cpvc-pipes' })}
              className="hover:text-cyan-400 transition-colors"
            >
              CPVC &amp; UPVC Pipes
            </button>
            <button
              onClick={() => onNavigate('catalog', { category: 'taps-valves' })}
              className="hover:text-cyan-400 transition-colors"
            >
              Taps &amp; Valves
            </button>
            <button
              onClick={() => onNavigate('catalog', { category: 'electrical-tools' })}
              className="hover:text-amber-400 transition-colors"
            >
              Tools &amp; Hardware
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0 pl-4 border-l border-slate-700">
            <button
              onClick={() => onNavigate('catalog', { dealsOnly: true })}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Today&apos;s Deals
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-4/5 max-w-sm h-full bg-slate-900 text-white shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-slate-950" />
                  </div>
                  <span className="text-lg font-bold">VoltCart Navigation</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Delivery location in mobile drawer */}
              <div className="p-3 bg-slate-800/60 border-b border-slate-800 flex items-center gap-2 text-xs">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-400">Delivering to: </span>
                  <span className="font-bold text-white">{pincode} (Bengaluru)</span>
                </div>
              </div>

              {/* Portals Access */}
              <div className="p-3 bg-slate-800/60 border-b border-slate-800 space-y-1.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold hover:bg-amber-500/20 flex items-center justify-between transition-colors"
                >
                  <span>Admin Dashboard</span>
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">ADMIN</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('delivery');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-between transition-colors"
                >
                  <span>Delivery Agent Portal</span>
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="py-2">
                <div className="px-4 py-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Categories
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('catalog', { category: 'all' });
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>All Products Catalog</span>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-slate-500" />
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('catalog', { mainCategory: 'electrical' });
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 flex items-center justify-between text-amber-400"
                >
                  <span className="font-semibold">⚡ Electrical Products</span>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-slate-500" />
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('catalog', { mainCategory: 'plumbing' });
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 flex items-center justify-between text-cyan-400"
                >
                  <span className="font-semibold">🚰 Plumbing Products</span>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-slate-500" />
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('catalog', { category: 'wires-cables' });
                  }}
                  className="w-full text-left px-6 py-2 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Wires &amp; Cables
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('catalog', { category: 'switches-sockets' });
                  }}
                  className="w-full text-left px-6 py-2 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Switches &amp; Sockets
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('catalog', { category: 'cpvc-pipes' });
                  }}
                  className="w-full text-left px-6 py-2 text-xs text-slate-300 hover:bg-slate-800"
                >
                  CPVC &amp; UPVC Pipes
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('catalog', { category: 'taps-valves' });
                  }}
                  className="w-full text-left px-6 py-2 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Taps, Bib Cocks &amp; Valves
                </button>

                <div className="border-t border-slate-800 my-2"></div>

                <div className="px-4 py-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  My Orders &amp; Account
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('account', { tab: 'orders' });
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>My Orders &amp; Live Tracking</span>
                  <Truck className="w-4 h-4 text-amber-400" />
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('wishlist');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>Saved Wishlist</span>
                  <span className="text-xs bg-slate-800 px-2 py-0.5 rounded">{wishlist.length}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('cart');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>Shopping Cart</span>
                  <span className="text-xs bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded">
                    {cartCount} items
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom info */}
            <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Verified Indian Suppliers</span>
              </div>
              <p className="text-[11px]">VoltCart · Fast-Track Electrical &amp; Plumbing</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
