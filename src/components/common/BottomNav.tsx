import React from 'react';
import { Home, Grid, ShoppingCart, PackageCheck, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const { cartCount } = useCart();
  const { role } = useAuth();

  // If in admin role, show admin mobile navigation
  if (role === 'admin') {
    return (
      <nav
        aria-label="Admin quick mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-900 border-t border-slate-800 shadow-2xl py-1 px-4 flex items-center justify-around"
      >
        <button
          onClick={() => onNavigate('admin')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] ${
            currentPage === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Admin Control</span>
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-slate-400 hover:text-white"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Customer View</span>
        </button>
      </nav>
    );
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'catalog', label: 'Categories', icon: Grid, params: { category: 'all' } },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
    { id: 'orders', label: 'Orders', icon: PackageCheck, page: 'account', params: { tab: 'orders' } },
    { id: 'account', label: 'Account', icon: User, page: 'account', params: { tab: 'profile' } },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 safe-area-pb"
    >
      <div className="grid grid-cols-5 items-center justify-items-center h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const targetPage = item.page || item.id;
          const isActive =
            currentPage === targetPage ||
            (item.id === 'orders' && currentPage === 'account') ||
            (item.id === 'home' && currentPage === 'home');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(targetPage, item.params)}
              className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] w-full relative transition-colors ${
                isActive ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
