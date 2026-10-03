import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { AuthModal } from './components/auth/AuthModal';
import { HeroBanner } from './components/home/HeroBanner';
import { CategoryGrid } from './components/home/CategoryGrid';
import { BrandShowcase } from './components/home/BrandShowcase';
import { TrustFeatures } from './components/home/TrustFeatures';
import { ProductCard } from './components/product/ProductCard';
import { ProductList } from './components/product/ProductList';
import { ProductDetail } from './components/product/ProductDetail';
import { CartPage } from './components/cart/CartPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderConfirmationPage } from './components/order/OrderConfirmationPage';
import { OrderTrackingModal } from './components/order/OrderTrackingModal';
import { AccountPage } from './components/account/AccountPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DeliveryPortal } from './components/delivery/DeliveryPortal';
import { Product3DViewer } from './components/product/Product3DViewer';
import { api } from './services/api';
import { Product, Order, MainCategory } from './types';
import { Sparkles, ArrowRight, Zap, Droplet, Star } from 'lucide-react';

const MainApp: React.FC = () => {
  const { role } = useAuth();

  const [currentPage, setCurrentPage] = useState<string>('home');
  const [navParams, setNavParams] = useState<any>({});
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Active PDP & Tracking State
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [active3DProduct, setActive3DProduct] = useState<Product | null>(null);

  // Home Featured & Deal Products
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [dealsProducts, setDealsProducts] = useState<Product[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadHomeData = async () => {
      const all = await api.getProducts();
      setFeaturedProducts(all.filter((p) => p.isFeatured).slice(0, 4));
      setDealsProducts(all.filter((p) => p.isDeal || p.discount >= 25).slice(0, 4));
      setBestsellerProducts(all.filter((p) => p.isBestSeller).slice(0, 4));
    };
    loadHomeData();
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
    setNavParams(params || {});
  };

  const handleSelectProduct = async (id: string) => {
    const prod = await api.getProductById(id);
    if (prod) {
      setSelectedProduct(prod);
      setSelectedProductId(id);
      setCurrentPage('product');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setLastPlacedOrder(order);
    setCurrentPage('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackOrder = (order: Order) => {
    setTrackedOrder(order);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        onOpenSearch={() => setSearchModalOpen(true)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* HOME PAGE */}
        {currentPage === 'home' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
            {/* 1. Hero Banner Offers Carousel */}
            <HeroBanner
              onNavigateCategory={(cat) => {
                if (cat === 'deals') {
                  handleNavigate('catalog', { dealsOnly: true });
                } else {
                  handleNavigate('catalog', { mainCategory: cat });
                }
              }}
            />

            {/* 2. Shop by Category Grid (Electrical vs Plumbing) */}
            <CategoryGrid
              onSelectCategory={(slug) => handleNavigate('catalog', { category: slug })}
              onSelectMainCategory={(mainCat) => handleNavigate('catalog', { mainCategory: mainCat })}
            />

            {/* 3. Today's Deals Section */}
            {dealsProducts.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        Today&apos;s Contractor Deals
                      </h2>
                      <p className="text-xs text-slate-500">
                        Top electrical &amp; plumbing discounts up to 40% OFF
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNavigate('catalog', { dealsOnly: true })}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <span>View All Deals</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {dealsProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelect={handleSelectProduct}
                      onBuyNow={handleBuyNow}
                      onOpen3D={(prod) => setActive3DProduct(prod)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 4. Best Sellers: Wires, Switches & CPVC Pipes */}
            {bestsellerProducts.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      Best Sellers &amp; Most Popular
                    </h2>
                    <p className="text-xs text-slate-500">
                      Standard items deployed in residential &amp; industrial projects
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavigate('catalog', { category: 'all' })}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <span>Explore Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {bestsellerProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelect={handleSelectProduct}
                      onBuyNow={handleBuyNow}
                      onOpen3D={(prod) => setActive3DProduct(prod)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 5. Shop by Official Brand */}
            <BrandShowcase
              onSelectBrand={(brandName) => handleNavigate('catalog', { brand: brandName })}
            />

            {/* 6. Why Choose VoltCart */}
            <TrustFeatures />
          </div>
        )}

        {/* CATALOG / SEARCH / CATEGORY LISTING */}
        {currentPage === 'catalog' && (
          <ProductList
            initialMainCategory={navParams.mainCategory}
            initialCategory={navParams.category}
            initialSearch={navParams.search}
            dealsOnly={navParams.dealsOnly}
            onSelectProduct={handleSelectProduct}
            onBuyNow={handleBuyNow}
            onOpen3D={(prod) => setActive3DProduct(prod)}
          />
        )}

        {/* PRODUCT DETAILS PAGE (PDP) */}
        {currentPage === 'product' && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => handleNavigate('home')}
            onSelectProduct={handleSelectProduct}
            onBuyNow={handleBuyNow}
          />
        )}

        {/* SHOPPING CART PAGE */}
        {currentPage === 'cart' && (
          <CartPage
            onContinueShopping={() => handleNavigate('catalog')}
            onProceedToCheckout={() => handleNavigate('checkout')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* CHECKOUT PAGE */}
        {currentPage === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onBackToCart={() => handleNavigate('cart')}
          />
        )}

        {/* ORDER CONFIRMATION PAGE */}
        {currentPage === 'order-confirmation' && lastPlacedOrder && (
          <OrderConfirmationPage
            order={lastPlacedOrder}
            onTrackOrder={handleTrackOrder}
            onContinueShopping={() => handleNavigate('home')}
          />
        )}

        {/* MY ACCOUNT / ORDERS / WISHLIST / ADDRESSES */}
        {(currentPage === 'account' || currentPage === 'wishlist') && (
          <AccountPage
            initialTab={currentPage === 'wishlist' ? 'wishlist' : navParams.tab || 'orders'}
            onTrackOrder={handleTrackOrder}
            onSelectProduct={handleSelectProduct}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {/* ADMIN MANAGEMENT PORTAL */}
        {currentPage === 'admin' && <AdminDashboard />}

        {/* DELIVERY PORTAL */}
        {currentPage === 'delivery' && <DeliveryPortal />}
      </main>

      {/* Global Modals */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectProduct={handleSelectProduct}
        onSearchSubmit={(q) => handleNavigate('catalog', { search: q })}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <OrderTrackingModal
        order={trackedOrder}
        onClose={() => setTrackedOrder(null)}
      />

      {/* Global 3D CAD & AI Spec Exploder Modal */}
      {active3DProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <Product3DViewer product={active3DProduct} onClose={() => setActive3DProduct(null)} />
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation (Home, Categories, Cart, Orders, Account) */}
      <BottomNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Footer (with Indian e-commerce policies and certified standards) */}
      <Footer
        onNavigateCategory={(slug) => handleNavigate('catalog', { category: slug })}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
