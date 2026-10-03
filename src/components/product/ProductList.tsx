import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
  Zap,
  Droplet,
  Check,
  Search,
} from 'lucide-react';
import { Product, Category, MainCategory } from '../../types';
import { api } from '../../services/api';
import { ProductCard } from './ProductCard';
import { BRANDS } from '../../data/mockData';

interface ProductListProps {
  initialMainCategory?: MainCategory;
  initialCategory?: string;
  initialSearch?: string;
  dealsOnly?: boolean;
  onSelectProduct: (productId: string) => void;
  onBuyNow: (product: Product) => void;
  onOpen3D?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  initialMainCategory,
  initialCategory,
  initialSearch,
  dealsOnly,
  onSelectProduct,
  onBuyNow,
  onOpen3D,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [mainCatFilter, setMainCatFilter] = useState<MainCategory | 'all'>(
    initialMainCategory || 'all'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory || 'all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(5000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [minDiscount, setMinDiscount] = useState<number>(dealsOnly ? 20 : 0);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [sortBy, setSortBy] = useState<
    'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'discount'
  >(dealsOnly ? 'discount' : 'relevance');

  // Mobile Filter Drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (initialMainCategory) setMainCatFilter(initialMainCategory);
    if (initialCategory) setCategoryFilter(initialCategory);
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialMainCategory, initialCategory, initialSearch]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        api.getCategories(),
        api.getProducts({
          mainCategory: mainCatFilter === 'all' ? undefined : mainCatFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          brand: brandFilter === 'all' ? undefined : brandFilter,
          maxPrice: priceMax,
          inStockOnly,
          minRating: minRating > 0 ? minRating : undefined,
          search: searchQuery,
          sortBy,
        }),
      ]);

      setCategories(cats);

      let filtered = prods;
      if (minDiscount > 0) {
        filtered = filtered.filter((p) => p.discount >= minDiscount);
      }
      setProducts(filtered);
      setLoading(false);
    };

    fetchData();
  }, [
    mainCatFilter,
    categoryFilter,
    brandFilter,
    priceMax,
    inStockOnly,
    minRating,
    minDiscount,
    searchQuery,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setMainCatFilter('all');
    setCategoryFilter('all');
    setBrandFilter('all');
    setPriceMax(5000);
    setInStockOnly(false);
    setMinRating(0);
    setMinDiscount(0);
    setSearchQuery('');
    setSortBy('relevance');
  };

  const activeFilterCount =
    (mainCatFilter !== 'all' ? 1 : 0) +
    (categoryFilter !== 'all' ? 1 : 0) +
    (brandFilter !== 'all' ? 1 : 0) +
    (priceMax < 5000 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Top Banner & Title Bar */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {dealsOnly
                ? "Today's Deals & Contractor Specials"
                : searchQuery
                ? `Search: "${searchQuery}"`
                : mainCatFilter === 'electrical'
                ? 'Electrical Store'
                : mainCatFilter === 'plumbing'
                ? 'Plumbing Store'
                : 'All Electrical & Plumbing Products'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing <span className="font-bold text-slate-800">{products.length}</span> verified supplies · 100% Genuine Certified
          </p>
        </div>

        {/* Sort and Mobile Filter Trigger */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Mobile Filter Sheet Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-amber-400 text-slate-950 font-extrabold text-[10px] rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" /> Clear All ({activeFilterCount})
          </button>

          {mainCatFilter !== 'all' && (
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 font-medium">
              Category: {mainCatFilter}
              <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setMainCatFilter('all')} />
            </span>
          )}

          {categoryFilter !== 'all' && (
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 font-medium">
              Sub: {categoryFilter}
              <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setCategoryFilter('all')} />
            </span>
          )}

          {brandFilter !== 'all' && (
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 font-medium">
              Brand: {brandFilter}
              <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setBrandFilter('all')} />
            </span>
          )}

          {inStockOnly && (
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 font-medium">
              In Stock Only
              <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setInStockOnly(false)} />
            </span>
          )}

          {minRating > 0 && (
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 font-medium">
              {minRating}★ &amp; Above
              <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setMinRating(0)} />
            </span>
          )}
        </div>
      )}

      {/* Main Grid: Sidebar (Desktop) + Product Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-5 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" /> Filters
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Main Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Department
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setMainCatFilter(mainCatFilter === 'electrical' ? 'all' : 'electrical')}
                className={`py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  mainCatFilter === 'electrical' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Electrical
              </button>
              <button
                onClick={() => setMainCatFilter(mainCatFilter === 'plumbing' ? 'all' : 'plumbing')}
                className={`py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  mainCatFilter === 'plumbing' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                <Droplet className="w-3.5 h-3.5" /> Plumbing
              </button>
            </div>
          </div>

          {/* Subcategories */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Categories
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`w-full text-left px-2 py-1.5 rounded-md font-medium transition-colors ${
                  categoryFilter === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                All Categories
              </button>
              {categories
                .filter((c) => (mainCatFilter === 'all' ? true : c.mainCategory === mainCatFilter))
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.slug)}
                    className={`w-full text-left px-2 py-1.5 rounded-md font-medium transition-colors truncate ${
                      categoryFilter === cat.slug
                        ? 'bg-slate-900 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Brand
            </label>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
              <button
                onClick={() => setBrandFilter('all')}
                className={`w-full text-left px-2 py-1 rounded-md font-medium ${
                  brandFilter === 'all' ? 'text-amber-700 font-bold bg-amber-50' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Brands
              </button>
              {BRANDS.filter((b) => (mainCatFilter === 'all' ? true : b.mainCategory === mainCatFilter)).map((b) => (
                <button
                  key={b.name}
                  onClick={() => setBrandFilter(b.name)}
                  className={`w-full text-left px-2 py-1 rounded-md font-medium truncate ${
                    brandFilter === b.name ? 'text-amber-700 font-bold bg-amber-50' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-slate-500">Max Price</span>
              <span className="font-extrabold text-slate-900 tabular-nums">₹{priceMax.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={200}
              max={5000}
              step={100}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Availability */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Customer Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[0, 4, 4.5].map((val) => (
                <button
                  key={val}
                  onClick={() => setMinRating(val)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-colors ${
                    minRating === val
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {val === 0 ? 'All' : `${val}★+`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Cards Grid (9 cols on desktop, full on mobile) */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                  <div className="aspect-square bg-slate-100 rounded-xl"></div>
                  <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  onBuyNow={onBuyNow}
                  onOpen3D={onOpen3D}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No products match your current filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your price range, removing subcategory constraints, or checking out all products.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-95"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/70 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-2.5"></div>

            {/* Header */}
            <div className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" /> Filter Supplies
              </span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable filters body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Department */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Department
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setMainCatFilter('all')}
                    className={`py-1.5 rounded-md font-bold ${
                      mainCatFilter === 'all' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setMainCatFilter('electrical')}
                    className={`py-1.5 rounded-md font-bold flex items-center justify-center gap-1 ${
                      mainCatFilter === 'electrical' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-600'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" /> Electrical
                  </button>
                  <button
                    onClick={() => setMainCatFilter('plumbing')}
                    className={`py-1.5 rounded-md font-bold flex items-center justify-center gap-1 ${
                      mainCatFilter === 'plumbing' ? 'bg-cyan-600 text-white shadow' : 'text-slate-600'
                    }`}
                  >
                    <Droplet className="w-3.5 h-3.5" /> Plumbing
                  </button>
                </div>
              </div>

              {/* Price Max */}
              <div>
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-slate-500 uppercase">Max Budget</span>
                  <span className="text-slate-900 tabular-nums">₹{priceMax.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={5000}
                  step={100}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* In Stock & Ratings */}
              <div className="flex items-center justify-between py-2 border-y border-slate-100">
                <label className="flex items-center gap-2 font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>In Stock Only</span>
                </label>

                <div className="flex items-center gap-1">
                  {[0, 4].map((v) => (
                    <button
                      key={v}
                      onClick={() => setMinRating(v)}
                      className={`px-2 py-1 rounded font-bold border ${
                        minRating === v ? 'bg-amber-500 text-slate-950 border-amber-500' : 'border-slate-200'
                      }`}
                    >
                      {v === 0 ? 'All' : `${v}★+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100 flex items-center gap-3 bg-slate-50">
              <button
                onClick={handleResetFilters}
                className="w-1/3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 bg-white"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-2/3 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20"
              >
                Apply Filters ({products.length} Items)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
