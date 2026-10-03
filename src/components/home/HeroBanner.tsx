import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, Droplet, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroBannerProps {
  onNavigateCategory: (mainCat: 'electrical' | 'plumbing' | 'deals') => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onNavigateCategory }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 'electrical',
      title: 'Heavy Duty Electrical & Modular Systems',
      subtitle: 'ISI Certified Flame Retardant Wires, Modular Switches & BLDC Fans',
      offer: 'Up to 40% OFF + GST Invoice',
      bgGradient: 'from-slate-950 via-slate-900 to-amber-950/60',
      image: '/src/assets/images/hero_electrical_plumbing_1791008707980.jpg',
      ctaText: 'Shop Electrical Wires & Switchgear',
      icon: Zap,
      action: () => onNavigateCategory('electrical'),
    },
    {
      id: 'plumbing',
      title: 'Leak-Proof Plumbing & High-Pressure Piping',
      subtitle: 'Astral CPVC Pro, Supreme SWR Drainage, Jaquar Taps & Brass Valves',
      offer: 'Contractor Packs & Free Delivery on ₹999+',
      bgGradient: 'from-slate-950 via-slate-900 to-cyan-950/60',
      image: '/src/assets/images/plumbing_category_1791008731604.jpg',
      ctaText: 'Explore Plumbing Pipes & Valves',
      icon: Droplet,
      action: () => onNavigateCategory('plumbing'),
    },
    {
      id: 'deals',
      title: 'Tools, Solvents & Contractor Specials',
      subtitle: 'True RMS Multimeters, Pipe Wrenches, PTFE Tapes & Cements',
      offer: 'Flat ₹100 OFF with code FIRST100',
      bgGradient: 'from-slate-950 via-slate-900 to-emerald-950/60',
      image: '/src/assets/images/deals_banner_1791008743430.jpg',
      ctaText: 'View Today’s Deals',
      icon: ShieldCheck,
      action: () => onNavigateCategory('deals'),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full overflow-hidden bg-slate-950 rounded-xl sm:rounded-2xl shadow-xl border border-slate-800">
      {/* Slides Container */}
      <div className="relative min-h-[260px] sm:min-h-[340px] md:min-h-[380px] flex items-center">
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          const isActive = index === activeSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Backdrop Image */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-right opacity-35 sm:opacity-45 scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient}`} />
              </div>

              {/* Text & Action Content */}
              <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-8 md:px-12 py-6 max-w-2xl text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] sm:text-xs font-bold mb-2.5 w-fit">
                  <Icon className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{slide.offer}</span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {slide.title}
                </h2>

                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-lg">
                  {slide.subtitle}
                </p>

                <div className="mt-4 sm:mt-6 flex items-center gap-3">
                  <button
                    onClick={slide.action}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide Navigation Buttons */}
      <button
        onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700 active:scale-95 transition-colors hidden sm:flex"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700 active:scale-95 transition-colors hidden sm:flex"
        aria-label="Next banner"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeSlide ? 'w-6 bg-amber-400' : 'w-2 bg-slate-600'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
