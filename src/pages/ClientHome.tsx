import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Plus, Minus, Star, ChevronRight, RotateCcw } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import CartModal from '../components/client/CartModal';
import ProductModal from '../components/client/ProductModal';
import OrderTrackerModal from '../components/client/OrderTrackerModal';
import { motion, AnimatePresence } from 'framer-motion';
import { getEmpresaData } from '../lib/getEmpresa';
import { getTenantConfig } from '../lib/tenantConfig';
import { useTenantTheme } from '../lib/useTenantTheme';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import ErrorRetry from '../components/ui/ErrorRetry';
import Badge from '../components/ui/Badge';
import { resolveProductImage, resolveCategoryImage, resolveBannerImage } from '../lib/defaultCatalog';

/* ─── Interfaces ─── */
interface Empresa {
  id: string;
  name: string;
  phone: string;
  instagram_url: string;
  maps_url: string;
  alias?: string;
  cbu?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_active: boolean;
  sort_order?: number;
}

interface Banner {
  id: string;
  image_url: string;
  link?: string;
  title?: string;
  subtitle?: string;
}

export default function ClientHome() {
  const { empresaSlug } = useParams<{ empresaSlug?: string }>();
  const activeSlug = empresaSlug || 'alcione';

  /* ─── Tenant Config ─── */
  const config = getTenantConfig(activeSlug);
  const primaryColor = config.primaryColor;
  const bgColor = config.colors.background;

  // Aplica el tema dinámico (fuentes, colores CSS, favicon, title)
  useTenantTheme(config);

  /* ─── Data State ─── */
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [categories, setCategories] = useState<Category[]>(config.defaultCategories as unknown as Category[]);
  const [products, setProducts] = useState<Product[]>(config.defaultProducts as unknown as Product[]);
  const [banners, setBanners] = useState<Banner[]>([]);

  /* ─── UI State ─── */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [lastOrder, setLastOrder] = useState<any[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'todas'>('todas');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('todas');
  const [bannerIndex, setBannerIndex] = useState(0);

  /* ─── Cart ─── */
  const { items, setIsCartOpen, addToCart, removeFromCart, updateQuantity, clearCart, itemCount } = useCart();

  /* ─── Derived constants ─── */
  const displayBanners = banners.length > 0 ? banners : config.fallbackBanners;

  /* ─── Banner Auto-scroll ─── */
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    scrollIntervalRef.current = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const firstChild = scrollRef.current.children[0] as HTMLElement;
        const cardWidth = firstChild ? firstChild.offsetWidth + 16 : 320;
        
        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }
    }, 4000);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
  }, []);

  // Track banner scroll position for dot indicators
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 0) return;
      const ratio = scrollLeft / maxScroll;
      const totalSlides = displayBanners.length - 1;
      setBannerIndex(Math.round(ratio * totalSlides));
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [banners, displayBanners.length]);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  /* ─── Data Fetching ─── */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const empData = await getEmpresaData(activeSlug);
      if (empData) {
        setEmpresa(empData);

        const savedOrder = localStorage.getItem(`lastOrder_${empData.id}`);
        if (savedOrder) {
          try { setLastOrder(JSON.parse(savedOrder)); } catch {}
        }

        const activeOrder = localStorage.getItem(`activeOrder_${empData.id}`);
        if (activeOrder) setActiveOrderId(activeOrder);

        const [cats, prods, bans] = await Promise.all([
          supabase.from('categories').select('*').eq('empresa_id', empData.id),
          supabase.from('products').select('*').eq('empresa_id', empData.id).eq('is_active', true),
          supabase.from('banners').select('*').eq('empresa_id', empData.id).eq('is_active', true),
        ]);

        const cleanCategories = config.filterCategories(cats.data || []);
        const cleanProducts = config.filterProducts(prods.data || []);

        if (cleanCategories.length > 0) setCategories(cleanCategories as unknown as Category[]);
        if (cleanProducts.length > 0) setProducts(cleanProducts as unknown as Product[]);
        if (bans.data && bans.data.length > 0) {
          setBanners(bans.data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setShowSplash(false), 2600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ─── Derived State ─── */
  const activeCategoryName = activeCategory === 'todas'
    ? 'todas'
    : categories.find(c => c.id === activeCategory)?.name || 'todas';

  const availableKeywords = config.categoryKeywordsMap[activeCategoryName] || config.categoryKeywordsMap['todas'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'todas' || p.category_id === activeCategory;
    const matchesKeyword = selectedKeyword === 'todas' || 
                          p.name.toLowerCase().includes(selectedKeyword.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(selectedKeyword.toLowerCase()));
    return matchesSearch && matchesCategory && matchesKeyword;
  });

  const getProductQuantity = (productId: string) => {
    return items.filter(i => i.id === productId).reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    setSelectedKeyword('todas');
  };

  const handleReorder = () => {
    clearCart();
    lastOrder.forEach(item => {
      addToCart({ id: item.id, name: item.name, price: item.price }, item.quantity, item.notes);
    });
    setIsCartOpen(true);
  };

  /* ─── Splash Screen ─── */
  if (loading || showSplash) {
    return (
      <AnimatePresence>
        <motion.div
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          onClick={() => setShowSplash(false)}
          className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
          style={{ backgroundColor: bgColor }}
        >
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at center, ${primaryColor}14 0%, ${bgColor} 70%)` }}
          />
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 shadow-sm"
              style={{ backgroundColor: `${primaryColor}1A`, borderColor: `${primaryColor}50`, borderWidth: 1 }}
            >
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} aria-hidden="true" />
              <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>
                {config.splash.badge}
              </span>
            </motion.div>

            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
              className="relative mb-6"
            >
              <div 
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-xl overflow-hidden bg-white flex items-center justify-center relative z-10"
                style={{ borderWidth: 4, borderColor: primaryColor }}
              >
                <img 
                  src={config.logo}
                  alt={`${config.name} - ${config.tagline}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 uppercase tracking-tight font-display drop-shadow-sm">
                {config.name}
              </h1>
              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest mt-2" style={{ color: primaryColor }}>
                {config.tagline}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-6"
            >
              {config.splash.tags.map((tag, i) => (
                <span key={i} className="bg-white border border-stone-200 text-stone-700 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase shadow-sm">
                  {tag}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
              className="mt-8 flex flex-col items-center gap-2"
            >
              <span 
                className="text-white font-black text-base uppercase tracking-wider px-8 py-3.5 rounded-2xl active:scale-95 transition-transform"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${config.colors['primary-light']})`, boxShadow: `0 10px 25px -5px ${primaryColor}40` }}
              >
                {config.splash.ctaText}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                {config.splash.footerText}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ─── Error State ─── */
  if (error && !empresa) {
    return <ErrorRetry message={error} onRetry={loadData} fullScreen />;
  }

  if (!empresa) {
    return <ErrorRetry message="No se pudo cargar la empresa. Verificá la conexión." onRetry={loadData} fullScreen />;
  }

  /* ─── Loading Skeleton ─── */
  if (loading) {
    return (
      <div className="min-h-screen pb-28" style={{ backgroundColor: bgColor }}>
        <header className="bg-white/95 pt-6 pb-5 px-4 border-b border-stone-200">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-13 h-13 rounded-2xl bg-stone-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-stone-200 rounded animate-pulse" />
                <div className="h-3 w-48 bg-stone-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-12 bg-stone-200 rounded-2xl animate-pulse" />
          </div>
        </header>
        <main className="max-w-6xl mx-auto mt-4 px-4">
          <div className="flex gap-4 mb-8 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="shrink-0 w-[85vw] max-w-[340px] h-44 rounded-3xl bg-stone-200 animate-pulse" />
            ))}
          </div>
          <div className="flex gap-3 mb-8 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="shrink-0 w-36 h-28 rounded-2xl bg-stone-200 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <ProductCardSkeleton key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 font-sans text-stone-800" style={{ backgroundColor: bgColor }}>
      {/* ═══════ HEADER ═══════ */}
      <header className="bg-white/95 pt-6 pb-5 px-4 sticky top-0 z-40 border-b border-stone-200 backdrop-blur-xl shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3.5">
               <div 
                 className="w-13 h-13 bg-white rounded-2xl border-2 flex items-center justify-center shadow-sm overflow-hidden shrink-0 transition-transform hover:scale-105"
                 style={{ borderColor: primaryColor }}
               >
                  <img src={config.logo} alt={`${config.name} Logo`} className="w-full h-full object-cover" />
               </div>
               <div>
                 <h1 className="text-xl md:text-2xl font-black tracking-tight text-stone-900 font-display uppercase">
                   {config.name}
                 </h1>
                 <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 mt-0.5">
                   <span className="flex items-center gap-1 font-extrabold uppercase tracking-wider" style={{ color: primaryColor }}>
                     {config.tagline}
                   </span>
                   <span className="text-stone-300">&bull;</span>
                   <span className="flex items-center gap-1 text-stone-500">
                     <MapPin size={11} style={{ color: primaryColor }} aria-hidden="true" /> {config.contact.address || 'Envíos a todo el país'}
                   </span>
                 </div>
               </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <a 
                href={`https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(config.contact.whatsappMessage || '')}`}
                target="_blank" 
                rel="noreferrer"
                aria-label="Consultar por WhatsApp"
                className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm focus-ring"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:opacity-100" size={18} aria-hidden="true" style={{ color: 'var(--color-primary, #A12C25)' }} />
            <input 
              type="text" 
              placeholder={config.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar productos"
              className="w-full bg-stone-100 border border-stone-200 text-stone-900 rounded-2xl py-3.5 pl-12 pr-4 shadow-inner outline-none focus:bg-white transition-all text-sm placeholder:text-stone-400"
              style={{ borderColor: 'var(--color-primary, #A12C25)', '--tw-ring-color': `${primaryColor}26` } as React.CSSProperties}
              onFocus={(e) => { e.currentTarget.style.borderColor = primaryColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${primaryColor}26`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
            />
          </div>

          {activeOrderId && !searchQuery && (
            <motion.button 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setIsTrackerOpen(true)}
              aria-label="Seguir pedido en vivo"
              className="w-full mt-4 bg-amber-50 border border-amber-300 text-amber-800 py-3 px-4 rounded-xl flex items-center justify-between font-bold text-sm shadow-sm focus-ring"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3 mr-1" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                Sigue tu pedido en vivo
              </div>
              <ChevronRight size={18} aria-hidden="true" />
            </motion.button>
          )}
        </div>
      </header>

      <main className="mt-2 max-w-6xl mx-auto w-full">
        {/* ═══════ REORDER ═══════ */}
        {lastOrder.length > 0 && !searchQuery && (
          <section className="px-4 py-2 mt-2">
            <button 
              onClick={handleReorder}
              aria-label="Repetir último pedido"
              className="w-full bg-white border border-stone-200 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all focus-ring"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2.5 rounded-full" style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor }}>
                  <RotateCcw size={20} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Pedir lo mismo de nuevo</h3>
                  <p className="text-xs text-stone-500">Tu último pedido fue increíble.</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-stone-400" aria-hidden="true" />
            </button>
          </section>
        )}

        {/* ═══════ BANNERS CAROUSEL ═══════ */}
        {!searchQuery && (
          <section className="py-4 overflow-hidden relative group" aria-label="Banners promocionales">
            <div 
              ref={scrollRef}
              onTouchStart={stopAutoScroll}
              onTouchEnd={() => setTimeout(startAutoScroll, 5000)}
              onMouseEnter={stopAutoScroll}
              onMouseLeave={() => setTimeout(startAutoScroll, 5000)}
              className="flex gap-4 px-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2"
              style={{ scrollBehavior: 'smooth' }}
            >
              {displayBanners.map((banner, idx) => (
                <div 
                  key={banner.id} 
                  className="shrink-0 w-[85vw] max-w-[340px] md:w-96 h-44 rounded-3xl overflow-hidden relative border border-stone-200 shadow-md block bg-stone-900 snap-center group/banner cursor-pointer"
                >
                  <img 
                    src={resolveBannerImage(banner, idx)} 
                    alt={banner.title || `Promoción ${config.name}`} 
                    className="w-full h-full object-cover opacity-75 group-hover/banner:scale-105 transition-transform duration-500" 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/35 to-transparent"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <span 
                      className="inline-block text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-widest mb-1.5 shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {config.name}
                    </span>
                    {banner.title && (
                      <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tight drop-shadow-sm">
                        {banner.title}
                      </h3>
                    )}
                    {banner.subtitle && (
                      <p className="text-stone-200 text-xs font-medium mt-0.5 line-clamp-1">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Dot Indicators */}
            {displayBanners.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3" role="tablist" aria-label="Navegación de banners">
                {displayBanners.map((banner, idx) => (
                  <button
                    key={banner.id}
                    onClick={() => {
                      const el = scrollRef.current;
                      if (!el) return;
                      const child = el.children[idx] as HTMLElement;
                      if (child) child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                    }}
                    role="tab"
                    aria-selected={idx === bannerIndex}
                    aria-label={`Banner ${idx + 1} de ${displayBanners.length}`}
                    className={`w-2 h-2 rounded-full transition-all duration-300 focus-ring ${
                      idx === bannerIndex ? 'w-5' : 'bg-stone-300 hover:bg-stone-400'
                    }`}
                    style={idx === bannerIndex ? { backgroundColor: primaryColor } : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ═══════ CATEGORY SELECTOR ═══════ */}
        {!searchQuery && (
          <section className="px-4 mb-6">
            <h2 className="text-sm font-serif font-bold text-stone-900 mb-3.5 tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#D4A76A] rounded-full" aria-hidden="true"></span>
              Colecciones & Categorías
            </h2>
            
            <div className="flex overflow-x-auto hide-scrollbar gap-3.5 pb-3 -mx-4 px-4 snap-x snap-mandatory">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0 }}
                onClick={() => handleSelectCategory('todas')}
                aria-label="Seleccionar todas las categorías"
                className="snap-start shrink-0 focus-ring rounded-2xl group/all"
              >
                <div 
                  className={`w-36 h-52 sm:w-40 sm:h-60 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 border ${
                    activeCategory === 'todas'
                      ? 'ring-2 ring-[#D4A76A] ring-offset-2 shadow-xl scale-[1.03] border-[#D4A76A]'
                      : 'border-stone-200/80 shadow-md hover:shadow-xl hover:border-[#D4A76A]/60'
                  }`}
                >
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
                    alt="Todas las categorías"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/all:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-900/60 to-black/40" />
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-center">
                      <div className="w-7 h-7 rounded-full bg-[#D4A76A]/20 border border-[#D4A76A]/40 flex items-center justify-center text-[#D4A76A]">
                        <Star size={13} aria-hidden="true" />
                      </div>
                      {activeCategory === 'todas' && (
                        <span className="text-[9px] uppercase tracking-widest font-bold text-[#D4A76A] bg-black/70 px-2 py-0.5 rounded-full border border-[#D4A76A]/40 backdrop-blur-sm">
                          Activa
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-serif font-semibold text-white drop-shadow-md leading-tight tracking-wide mb-1">
                        Colección Completa
                      </h3>
                      <p className="text-[10px] text-[#D4A76A] font-medium tracking-wider uppercase">
                        {products.length} {products.length === 1 ? 'Pieza' : 'Piezas'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.button>

              {categories.map((cat, i) => {
                const isActive = activeCategory === cat.id;
                const productCount = products.filter(p => p.category_id === cat.id).length;
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * (i + 1) }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectCategory(cat.id)}
                    aria-label={`Categoría ${cat.name}`}
                    className="snap-start shrink-0 focus-ring rounded-2xl group/cat"
                  >
                    <div
                      className={`w-36 h-52 sm:w-40 sm:h-60 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 border ${
                        isActive
                          ? 'ring-2 ring-[#D4A76A] ring-offset-2 shadow-xl scale-[1.03] border-[#D4A76A]'
                          : 'border-stone-200/80 shadow-md hover:shadow-xl hover:border-[#D4A76A]/60'
                      }`}
                    >
                      <img
                        src={resolveCategoryImage(cat)}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/cat:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-900/50 to-black/30 transition-opacity duration-300 group-hover/cat:opacity-90" />
                      
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-center w-full">
                          <span className="w-6 h-0.5 bg-[#D4A76A] rounded-full" aria-hidden="true" />
                          {isActive && (
                            <span className="text-[9px] uppercase tracking-widest font-bold text-[#D4A76A] bg-black/70 px-2 py-0.5 rounded-full border border-[#D4A76A]/40 backdrop-blur-sm">
                              Activa
                            </span>
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-serif font-semibold text-white drop-shadow-md leading-tight tracking-wide mb-1">
                            {cat.name}
                          </h3>
                          <p className="text-[10px] text-stone-300 font-medium tracking-wider uppercase">
                            {productCount} {productCount === 1 ? 'Pieza' : 'Piezas'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════ KEYWORDS QUICK FILTER ═══════ */}
        <section className="px-4 mb-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                Búsqueda Rápida
              </span>
              {selectedKeyword !== 'todas' && (
                <button 
                  onClick={() => setSelectedKeyword('todas')}
                  className="text-[11px] font-bold hover:underline focus-ring"
                  style={{ color: primaryColor }}
                >
                  Limpiar filtro
                </button>
              )}
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-4 px-4">
              <button
                onClick={() => setSelectedKeyword('todas')}
                aria-label="Mostrar todos los productos"
                className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border focus-ring ${
                  selectedKeyword === 'todas'
                    ? 'text-white shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-primary hover:text-primary shadow-sm'
                }`}
                style={selectedKeyword === 'todas' ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
              >
                # Todos
              </button>
              {availableKeywords && availableKeywords.map(kw => (
                <button
                  key={kw}
                  onClick={() => setSelectedKeyword(selectedKeyword === kw ? 'todas' : kw)}
                  aria-label={`Filtrar por ${kw}`}
                  className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border focus-ring ${
                    selectedKeyword === kw
                      ? 'text-white shadow-sm scale-105'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-primary hover:text-primary shadow-sm'
                  }`}
                  style={selectedKeyword === kw ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                >
                  #{kw}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ PRODUCT LIST ═══════ */}
        <section className="px-4">
          {categories.map(category => {
            const categoryProducts = filteredProducts.filter(p => p.category_id === category.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category.id} className="mb-10">
                <h2 className="text-xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-3 tracking-wide">
                  <span className="w-1.5 h-6 bg-[#D4A76A] rounded-full" aria-hidden="true"></span>
                  <span>{category.name}</span>
                  <span className="text-xs font-sans font-semibold text-stone-400 uppercase tracking-widest ml-1">
                    ({categoryProducts.length} {categoryProducts.length === 1 ? 'pieza' : 'piezas'})
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryProducts.map((product, idx) => {
                    const qty = getProductQuantity(product.id);
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        key={product.id} 
                        onClick={() => setSelectedProduct(product)}
                        className="bg-white rounded-2xl border border-stone-200/90 hover:border-primary/40 p-3.5 flex gap-4 relative cursor-pointer active:scale-[0.99] transition-all duration-200 shadow-sm hover:shadow-md group focus-ring"
                        role="button"
                        tabIndex={0}
                        aria-label={`${product.name} - $${product.price.toLocaleString('es-AR')}`}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedProduct(product); }}
                        style={{ '--hover-border': `${primaryColor}66` } as React.CSSProperties}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${primaryColor}66`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                      >
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 
                              className="font-bold text-stone-900 text-[15px] leading-tight mb-1 pr-2 transition-colors"
                              onMouseEnter={(e) => { e.currentTarget.style.color = primaryColor; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                            >
                              {product.name}
                            </h3>
                            <p className="text-xs text-stone-500 line-clamp-2 mb-2 leading-relaxed">{product.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1">
                            <span className="font-black text-stone-900 text-lg tracking-tight">${product.price.toLocaleString('es-AR')}</span>
                            {qty > 0 && (
                              <Badge variant="primary" size="sm">
                                {qty} en pedido
                              </Badge>
                            )}
                          </div>

                          {qty > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cartItem = items.find(i => i.id === product.id);
                                  if (!cartItem) return;
                                  if (cartItem.quantity <= 1) {
                                    removeFromCart(product.id, cartItem.notes);
                                  } else {
                                    updateQuantity(product.id, cartItem.quantity - 1, cartItem.notes);
                                  }
                                }}
                                aria-label={`Reducir cantidad de ${product.name}`}
                                className="w-7 h-7 flex items-center justify-center bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 transition-colors border border-stone-200"
                              >
                                <Minus size={12} aria-hidden="true" />
                              </button>
                              <span className="font-bold text-sm w-5 text-center text-stone-900">{qty}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product, 1);
                                }}
                                aria-label={`Aumentar cantidad de ${product.name}`}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-white transition-colors"
                                style={{ backgroundColor: primaryColor }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = config.colors['primary-hover']; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryColor; }}
                              >
                                <Plus size={12} aria-hidden="true" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 bg-stone-100 rounded-xl relative overflow-hidden shadow-inner border border-stone-200 group-hover/border-primary/30 transition-all flex flex-col justify-between p-2"
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${primaryColor}50`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                        >
                          <div className="z-10 flex justify-between items-center w-full">
                            <span className="text-[10px] font-bold text-stone-300 tracking-widest uppercase">{category.name}</span>
                            <span 
                              className="bg-white/95 font-serif font-bold text-[9px] px-1.5 py-0.5 rounded border border-stone-200 tracking-wider uppercase shadow-sm"
                              style={{ color: '#D4A76A' }}
                            >
                              VIP
                            </span>
                          </div>

                          <img 
                            src={resolveProductImage(product)} 
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/65 via-transparent to-stone-900/10 pointer-events-none" />

                          {qty === 0 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1);
                              }}
                              aria-label={`Agregar ${product.name} al carrito`}
                              className="absolute bottom-1.5 right-1.5 z-20 w-8 h-8 flex items-center justify-center rounded-lg text-white shadow-md active:scale-90 hover:brightness-110 transition-all"
                              style={{ background: `linear-gradient(to right, ${primaryColor}, ${config.colors['primary-light']})`, boxShadow: `0 4px 6px -1px ${primaryColor}50` }}
                            >
                              <Plus size={16} strokeWidth={3} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 shadow-sm">
              <Search size={48} className="mx-auto text-stone-300 mb-4" aria-hidden="true" />
              <p className="text-base font-bold text-stone-800">No encontramos ningún producto</p>
              <p className="text-stone-500 text-sm">Prueba buscando con otras palabras o seleccionando otra categoría.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('todas'); setSelectedKeyword('todas'); }}
                className="mt-4 text-sm font-bold hover:underline focus-ring"
                style={{ color: primaryColor }}
              >
                Ver todos los productos
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ═══════ FLOATING CART BUTTON ═══════ */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 md:max-w-md md:mx-auto z-40"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              aria-label={`Abrir carrito con ${itemCount} productos`}
              className="w-full text-white p-4 rounded-2xl shadow-xl flex items-center justify-between transition-all hover:brightness-110 active:scale-95 border border-white/20 focus-ring"
              style={{ background: `linear-gradient(to right, ${primaryColor}, ${config.colors['primary-light']})`, boxShadow: `0 20px 25px -5px ${primaryColor}60` }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-black/25 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border border-white/20 shadow-inner">
                  {itemCount}
                </div>
                <div className="text-left">
                  <span className="block text-xs font-semibold text-red-100 uppercase tracking-wider">Tu Pedido</span>
                  <span className="font-black text-base">Ver Carrito</span>
                </div>
              </div>
              <div className="flex items-center gap-2 font-black text-lg">
                <span>Ir a Pagar</span>
                <ChevronRight size={20} aria-hidden="true" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ MODALS ═══════ */}
      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod, qty, notes) => addToCart(prod, qty, notes)}
        tenantName={config.name}
        tenantPrimaryColor={primaryColor}
        tenantTagline={config.tagline}
      />

      <CartModal 
        empresaId={empresa.id}
        empresaName={empresa.name}
        empresaPhone={empresa.phone}
        empresaAlias={empresa.alias || ''}
        empresaCbu={empresa.cbu || ''}
        tenantPrimaryColor={primaryColor}
        tenantName={config.name}
        onOrderPlaced={(orderId) => {
          setActiveOrderId(orderId);
          setIsTrackerOpen(true);
        }}
      />

      <OrderTrackerModal 
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        orderId={activeOrderId}
        onClearActiveOrder={() => setActiveOrderId(null)}
      />
    </div>
  );
}
