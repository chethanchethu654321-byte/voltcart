import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
  onSearchSubmit: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSearchSubmit,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(api.getSearchHistory());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      const data = await api.getProducts({ search: query });
      setResults(data.slice(0, 6));
    };

    const timer = setTimeout(fetchResults, 150);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    api.addSearchHistory(searchTerm);
    onSearchSubmit(searchTerm);
    onClose();
  };

  const handleClearHistory = () => {
    api.clearSearchHistory();
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  const popularSearches = [
    '1.5 sq mm copper wire',
    'Astral CPVC pipe',
    'Havells 9W LED bulb',
    '1/2 inch brass ball valve',
    'Anchor Roma modular switch',
    'Jaquar bib cock tap',
    'Digital multimeter',
    '110mm PVC drainage pipe',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 p-2 sm:p-4 md:p-6 flex justify-center items-start pt-3 sm:pt-12">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="text-slate-400 pl-1">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(query)}
            placeholder="Search wires, switches, CPVC pipes, valves, LED..."
            className="flex-1 text-slate-800 text-sm sm:text-base placeholder-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
          >
            Close
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 space-y-5">
          {/* Real-time Matching Products */}
          {results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Matching Products ({results.length})
                </span>
                <button
                  onClick={() => handleSubmit(query)}
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                >
                  View All Results <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      api.addSearchHistory(product.name);
                      onSelectProduct(product.id);
                      onClose();
                    }}
                    className="py-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 rounded-xl px-2 -mx-2 transition-colors"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-contain rounded-lg border border-slate-100 bg-white p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {product.brand} · <span className="capitalize">{product.mainCategory}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-950">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{product.mrp.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">
                          {product.discount}% OFF
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If query has no result */}
          {query.trim().length > 1 && results.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-2">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No products found for &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching with general terms like &quot;wire&quot;, &quot;switch&quot;, &quot;pipe&quot;, or &quot;valve&quot;.
              </p>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Recent Searches
                </span>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-slate-400 hover:text-red-500 font-medium"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(term)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                  >
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular / Trending Searches */}
          {!query && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                Popular Electrical &amp; Plumbing Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(term)}
                    className="px-3 py-1.5 bg-amber-50/60 hover:bg-amber-100 border border-amber-200/60 rounded-lg text-xs font-medium text-amber-900 transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
