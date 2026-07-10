import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Search, Info, MapPin, Plus, Star, ChevronRight, RotateCcw } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import CartModal from '../components/client/CartModal';
import ProductModal from '../components/client/ProductModal';
import OrderTrackerModal from '../components/client/OrderTrackerModal';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '../utils/brandLogos';
import { getEmpresaData } from '../lib/getEmpresa';

interface Empresa {
  id: string;
  name: string;
  phone: string;
  instagram_url: string;
  maps_url: string;
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
  const { empresaSlug } = useParams<{ empresaSlug: string }>();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  
  const [lastOrder, setLastOrder] = useState<any[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'todas'>('todas');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('todas');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('todas');

  const getProductBrand = (product: Product): string => {
    const match = product.name.match(/^\[(.*?)\]/);
    if (match) return match[1].trim();
    const knownBrands = ['STAR NUTRITION', 'ENA SPORT', 'GENERATION FIT', 'NUTRILAB', 'BODY ADVANCED', 'VITAMIN WAY', 'MERVICK', 'XTRENGHT', 'GOLD NUTRITION', 'HOCH SPORT', 'NATULIV'];
    for (const b of knownBrands) {
      if (product.name.toUpperCase().includes(b)) return b;
    }
    return 'Otras';
  };

  const getCleanProductName = (product: Product): string => {
    return product.name.replace(/^\[.*?\]\s*/, '').trim();
  };

  const categoryColors: Record<string, { from: string; to: string; shadow: string }> = {
    'Proteínas': { from: '#991B1B', to: '#DC2626', shadow: 'rgba(220,38,38,0.4)' },
    'Creatinas': { from: '#C2410C', to: '#F97316', shadow: 'rgba(249,115,22,0.4)' },
    'Pre-Entrenos': { from: '#B91C1C', to: '#FF1E27', shadow: 'rgba(255,30,39,0.4)' },
    'Quemadores': { from: '#9A3412', to: '#EA580C', shadow: 'rgba(234,88,12,0.4)' },
    'Aminoácidos & BCAA': { from: '#7C2D12', to: '#D97706', shadow: 'rgba(217,119,6,0.4)' },
    'Vitaminas & Minerales': { from: '#4C0519', to: '#E11D48', shadow: 'rgba(225,29,72,0.4)' },
    'Colágenos & Belleza': { from: '#831843', to: '#F43F5E', shadow: 'rgba(244,63,94,0.4)' },
    'Ganadores & Energía': { from: '#9A3412', to: '#FF5C00', shadow: 'rgba(255,92,0,0.4)' },
    'Accesorios & Snacks': { from: '#1E293B', to: '#334155', shadow: 'rgba(51,65,85,0.4)' },
  };

  const getCategoryStyle = (catName: string) => {
    return categoryColors[catName] || { from: '#6B7280', to: '#9CA3AF', shadow: 'rgba(107,114,128,0.3)' };
  };

  const { items, setIsCartOpen, addToCart, clearCart } = useCart();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoScroll = () => {
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
  };

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, []);

  const handleTouchStart = () => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      startAutoScroll();
    }, 5000);
  };

  useEffect(() => {
    async function loadData() {
      if (!empresaSlug) return;
      try {
        const empData = await getEmpresaData(empresaSlug);

        if (!empData) throw new Error('La tienda no existe o la base de datos no tiene datos cargados. Por favor ejecuta el script SQL seed_suplementos.sql.');
        
        setEmpresa(empData);

        // Check for last order in localStorage
        const savedOrder = localStorage.getItem(`lastOrder_${empData.id}`);
        if (savedOrder) {
          try {
            setLastOrder(JSON.parse(savedOrder));
          } catch(e) {}
        }

        // Check for active order tracking
        const activeOrder = localStorage.getItem(`activeOrder_${empData.id}`);
        if (activeOrder) {
          setActiveOrderId(activeOrder);
        }

        const [cats, prods, bans] = await Promise.all([
          supabase.from('categories').select('*').eq('empresa_id', empData.id),
          supabase.from('products').select('*').eq('empresa_id', empData.id).eq('is_active', true),
          supabase.from('banners').select('*').eq('empresa_id', empData.id).eq('is_active', true)
        ]);

        if (cats.data) setCategories(cats.data);
        if (prods.data) setProducts(prods.data);
        if (bans.data) {
          // Sort banners by sort_order in memory so it doesn't crash if column doesn't exist yet
          const sortedBans = bans.data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setBanners(sortedBans);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        setTimeout(() => setShowSplash(false), 3500); // Dar más tiempo para la animación completa
      }
    }
    loadData();
  }, [empresaSlug]);



  if (loading || showSplash) {
    return (
      <AnimatePresence>
        <motion.div 
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={() => setShowSplash(false)}
          className="min-h-screen bg-[#09090E] flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
        >
          {/* Cyber Gym Glowing Radial Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,30,39,0.22)_0%,_rgba(9,9,14,1)_70%)] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#FF1E27] to-[#FF5C00]" />
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF5C00] via-[#FF1E27] to-transparent" />
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-lg mx-auto">
            {/* Glowing Brand Tag Top */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#FF1E27]/15 border border-[#FF1E27]/40 px-4 py-1.5 rounded-full mb-6 shadow-[0_0_20px_rgba(255,30,39,0.3)]"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF1E27] animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white">
                ⚡ DISTRIBUCIÓN MAYORISTA & MINORISTA ⚡
              </span>
            </motion.div>

            {/* Logo Animator with Double Neon Halo */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
              className="relative mb-6"
            >
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#FF1E27] to-[#FF5C00] opacity-40 blur-xl animate-pulse" />
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full border-4 border-[#FF1E27] shadow-[0_0_50px_rgba(255,30,39,0.5)] overflow-hidden bg-[#0D0D14] flex items-center justify-center relative z-10">
                <img 
                  src="/logo.jfif" 
                  alt="Titan Fuel Suplementos" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = '/img/logo/logo.jfif';
                  }} 
                />
              </div>
            </motion.div>

            {/* Title & Brand Phrase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-display drop-shadow-[0_4px_15px_rgba(255,30,39,0.4)]">
                TITAN FUEL SUPLEMENTOS
              </h1>
              <p className="text-xs sm:text-sm font-extrabold text-[#FF5C00] uppercase tracking-widest mt-2">
                🔥 COMBUSTIBLE DE TITANES • ALTO RENDIMIENTO 💪
              </p>
            </motion.div>

            {/* Gym & Fitness Pillars Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-6"
            >
              <span className="bg-[#141420] border border-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase">
                ⚡ Proteínas & Creatinas
              </span>
              <span className="bg-[#141420] border border-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase">
                🏋️ Pre-Entrenos & BCAA
              </span>
              <span className="bg-[#141420] border border-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase">
                🇦🇷 Envíos a todo el país
              </span>
            </motion.div>

            {/* Call To Action Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
              className="mt-8 flex flex-col items-center gap-2.5"
            >
              <span className="bg-gradient-to-r from-[#FF1E27] via-[#DC2626] to-[#FF5C00] text-white font-black text-lg uppercase tracking-wider px-8 py-3.5 rounded-2xl shadow-[0_10px_35px_rgba(255,30,39,0.55)] border border-white/20 active:scale-95 transition-transform">
                ⚡ ENTRAR AL CATÁLOGO ⚡
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Toca en cualquier lugar para ingresar
              </span>
            </motion.div>

          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (error || !empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-surface p-8 rounded-3xl shadow-2xl text-center max-w-sm border border-amber-200">
          <Info size={48} className="mx-auto text-primary mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Ops! Algo salió mal</h1>
          <p className="text-slate-600 break-words">{error}</p>
        </div>
      </div>
    );
  }

  const activeCategoryName = activeCategory === 'todas'
    ? 'todas'
    : categories.find(c => c.id === activeCategory)?.name || 'todas';

  const categoryProductsRaw = activeCategory === 'todas'
    ? products
    : products.filter(p => p.category_id === activeCategory);

  const availableBrands = Array.from(
    new Set(categoryProductsRaw.map(p => getProductBrand(p)))
  ).filter(b => b !== 'Otras').sort();

  const categoryKeywordsMap: Record<string, string[]> = {
    'Proteínas': ['Whey', 'Isolate', 'Hidrolizada', 'Vegana', 'Caseína', '1kg', '2lbs'],
    'Creatinas': ['Monohidrato', 'Micronizada', '300g', '500g', '1kg', 'Capsulas'],
    'Pre-Entrenos': ['Cafeína', 'Beta Alanina', 'Óxido Nítrico', 'Citrulina', 'Arginina'],
    'Quemadores': ['L-Carnitina', 'CLA', 'Café Verde', 'Termogénico'],
    'Aminoácidos & BCAA': ['BCAA', 'Glutamina', 'EAA', 'HMB', 'Polvo'],
    'Vitaminas & Minerales': ['Magnesio', 'ZMA', 'Omega 3', 'Vitamina C', 'Vitamina D', 'Multivitamínico'],
    'Colágenos & Belleza': ['Hidrolizado', 'Ácido Hialurónico', 'Polvo', 'Limon', 'Naranja'],
    'Ganadores & Energía': ['Mass', 'Carbo', '1.5kg', '3kg', 'Energy'],
    'Accesorios & Snacks': ['Bar', 'Shaker', '12x', 'Caja'],
    'todas': ['Whey', 'Creatina', 'Pre-Entreno', 'Magnesio', 'BCAA', 'Colágeno', 'Omega 3']
  };

  const availableKeywords = categoryKeywordsMap[activeCategoryName] || categoryKeywordsMap['todas'];

  const filteredProducts = products.filter(p => {
    const brand = getProductBrand(p);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'todas' || p.category_id === activeCategory;
    const matchesBrand = selectedBrand === 'todas' || brand === selectedBrand;
    const matchesKeyword = selectedKeyword === 'todas' || 
                          p.name.toLowerCase().includes(selectedKeyword.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(selectedKeyword.toLowerCase()));
    return matchesSearch && matchesCategory && matchesBrand && matchesKeyword;
  });

  const getProductQuantity = (productId: string) => {
    return items.filter(i => i.id === productId).reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    setSelectedBrand('todas');
    setSelectedKeyword('todas');
  };

  const handleReorder = () => {
    clearCart();
    lastOrder.forEach(item => {
      // Recreamos el producto simulando que se agregó
      addToCart({ id: item.id, name: item.name, price: item.price }, item.quantity, item.notes);
    });
    setIsCartOpen(true);
  };

  const displayBanners = banners.length > 0 ? banners : [
    { 
      id: '1', 
      image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
      title: 'COMBUSTIBLE DE TITANES',
      subtitle: 'Envíos a todo el país mayorista y minorista'
    },
    { 
      id: '2', 
      image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80',
      title: 'POTENCIA TU RENDIMIENTO',
      subtitle: 'Las mejores marcas oficiales al mejor precio'
    },
    { 
      id: '3', 
      image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&q=80',
      title: '100% PURA CREATINA & WHEY',
      subtitle: 'Calidad superior en suplementación deportiva'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-28 font-sans text-slate-100">
      {/* 1. HERO HEADER */}
      <header className="bg-surface/95 pt-6 pb-5 px-4 sticky top-0 z-40 border-b border-red-500/20 backdrop-blur-2xl shadow-2xl">
         <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF1E27] to-[#FF5C00]" />
         <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3.5">
             <div className="w-14 h-14 bg-[#09090D] rounded-2xl border-2 border-[#FF1E27] flex items-center justify-center shadow-[0_0_20px_rgba(255,30,39,0.4)] overflow-hidden shrink-0 transition-transform hover:scale-105">
                <img src="/logo.jfif" alt="Titan Fuel Logo" className="w-full h-full object-cover" onError={(e) => {
                  e.currentTarget.src = '/img/logo/logo.jfif';
                }} />
             </div>
             <div>
               <h1 className="text-xl md:text-2xl font-black tracking-tight text-white font-display uppercase drop-shadow-[0_2px_10px_rgba(255,30,39,0.35)]">
                 TITAN FUEL SUPLEMENTOS
               </h1>
               <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mt-0.5">
                 <span className="flex items-center gap-1 font-extrabold text-[#FF1E27] uppercase tracking-wider">
                   ⚡ Combustible de Titanes
                 </span>
                 <span className="text-slate-600">•</span>
                 <span className="flex items-center gap-1 text-slate-400">
                   <MapPin size={11} className="text-[#FF5C00]"/> Envíos a todo el país
                 </span>
               </div>
             </div>
          </div>
          
          {/* Social & WhatsApp Contact */}
          <div className="flex items-center gap-2.5">
            <a 
              href={`https://wa.me/5493814751620?text=${encodeURIComponent('¡Hola Titan Fuel! Quisiera consultar sobre suplementos deportivos.')}`}
              target="_blank" 
              rel="noreferrer"
              title="Consultar por WhatsApp"
              className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
            </a>
            <a 
              href="https://www.instagram.com/titanfuelsuplementos" 
              target="_blank" 
              rel="noreferrer"
              title="Instagram Oficial"
              className="w-10 h-10 rounded-xl bg-[#181824] border border-slate-700/60 flex items-center justify-center text-slate-300 hover:border-[#FF1E27] hover:text-[#FF1E27] transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF1E27] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar proteína, creatina, pre-entreno, marca (Star, ENA, Gold)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161622] border border-slate-700/80 text-white rounded-2xl py-3.5 pl-12 pr-4 shadow-inner outline-none focus:border-[#FF1E27] focus:ring-2 focus:ring-[#FF1E27]/20 transition-all text-sm placeholder:text-slate-500"
          />
        </div>

        {/* Active Order Tracker Button */}
        {activeOrderId && !searchQuery && (
          <motion.button 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setIsTrackerOpen(true)}
            className="w-full mt-4 bg-primary/20 border border-primary text-primary py-3 px-4 rounded-xl flex items-center justify-between font-bold text-sm shadow-[0_0_15px_rgba(255,184,0,0.2)] animate-pulse"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              Sigue tu pedido en vivo
            </div>
            <ChevronRight size={18} />
          </motion.button>
        )}
      </header>

      <main className="mt-2">
        {/* REORDER BUTTON (If last order exists) */}
        {lastOrder.length > 0 && !searchQuery && (
          <section className="px-4 py-2 mt-2">
            <button 
              onClick={handleReorder}
              className="w-full bg-gradient-to-r from-amber-100 to-white border border-primary/50 p-4 rounded-2xl flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="bg-primary/20 p-2 rounded-full text-primary">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Pedir lo mismo de nuevo</h3>
                  <p className="text-xs text-slate-600">Tu último pedido fue increíble.</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-primary" />
            </button>
          </section>
        )}

        {/* 2. BANNERS CAROUSEL (Manual & Auto Scroll) */}
        {!searchQuery && (
          <section className="py-4 overflow-hidden relative group">
            <div 
              ref={scrollRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={handleTouchStart}
              onMouseLeave={handleTouchEnd}
              className="flex gap-4 px-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2"
              style={{ scrollBehavior: 'smooth' }}
            >
              {displayBanners.map((banner) => {
                return (
                  <div 
                    key={banner.id} 
                    className="shrink-0 w-[85vw] max-w-[340px] md:w-96 h-44 rounded-3xl overflow-hidden relative border border-slate-800 shadow-2xl block bg-slate-950 snap-center group/banner cursor-pointer"
                  >
                    <img 
                      src={banner.image_url} 
                      alt={banner.title || "Promo Titan Fuel"} 
                      className="w-full h-full object-cover opacity-65 group-hover/banner:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent"></div>
                    
                    <div className="absolute bottom-4 left-4 right-4 text-left">
                      <span className="inline-block bg-primary text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-widest mb-1.5 shadow-md">
                        TITAN FUEL
                      </span>
                      {banner.title && (
                        <h3 className="text-white font-black text-lg leading-tight uppercase tracking-tight drop-shadow-md">
                          {banner.title}
                        </h3>
                      )}
                      {banner.subtitle && (
                        <p className="text-slate-300 text-xs font-medium mt-0.5 line-clamp-1">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. CATEGORY SELECTOR — MODERN CARD DESIGN */}
        {!searchQuery && (
          <section className="px-4 mb-6">
            <h2 className="text-lg font-black text-white mb-3.5 tracking-tight uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF1E27] animate-pulse"></span>
              Categorías Oficiales
            </h2>
            
            <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4 snap-x snap-mandatory">
              {/* "Todas" compact card */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0 }}
                onClick={() => handleSelectCategory('todas')}
                className="snap-start shrink-0"
              >
                <div className={`w-18 h-24 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 border ${activeCategory === 'todas' ? 'bg-gradient-to-br from-[#FF1E27] to-[#FF5C00] text-white border-red-400 shadow-[0_0_20px_rgba(255,30,39,0.4)] scale-105' : 'bg-[#14141E] border-slate-800 text-slate-300 hover:border-[#FF1E27]/50 hover:text-white'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeCategory === 'todas' ? 'bg-black/25 text-white' : 'bg-[#1C1C2A] text-[#FF1E27]'}`}>
                    <Star size={18} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Todas</span>
                </div>
              </motion.button>

              {/* Featured category cards with gradients */}
              {categories.filter(c => ['Proteínas', 'Creatinas'].includes(c.name)).map((cat, i) => {
                const colors = getCategoryStyle(cat.name);
                const isActive = activeCategory === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * (i + 1) }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="snap-start shrink-0"
                  >
                    <div
                      className={`w-36 h-32 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-200 border border-white/10 ${isActive ? 'ring-2 ring-[#FF1E27] ring-offset-2 ring-offset-[#0A0A0F] shadow-[0_0_25px_rgba(255,30,39,0.4)] scale-[1.03]' : 'hover:shadow-lg hover:-translate-y-0.5'}`}
                      style={{
                        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                        boxShadow: isActive ? `0 8px 25px ${colors.shadow}` : '0 4px 15px rgba(0,0,0,0.5)',
                      }}
                    >
                      <div className="absolute -right-4 -top-4 text-6xl opacity-20 select-none">
                        {cat.icon}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/15 shadow-inner">
                          {cat.icon}
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-black text-white drop-shadow-sm leading-tight uppercase">{cat.name}</span>
                          <span className="text-[10px] text-white/80 font-semibold">{products.filter(p => p.category_id === cat.id).length} productos</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}

              {/* Regular category cards */}
              {categories.filter(c => !['Proteínas', 'Creatinas'].includes(c.name)).map((cat, i) => {
                const colors = getCategoryStyle(cat.name);
                const isActive = activeCategory === cat.id;
                const featured = ['Pre-Entrenos', 'Quemadores'].includes(cat.name);
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * (i + 3) }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="snap-start shrink-0"
                  >
                    <div
                      className={`${featured ? 'w-32 h-28' : 'w-28 h-24'} rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden transition-all duration-200 border border-white/10 ${isActive ? 'ring-2 ring-[#FF1E27] ring-offset-2 ring-offset-[#0A0A0F] shadow-[0_0_20px_rgba(255,30,39,0.35)] scale-[1.03]' : 'hover:shadow-lg hover:-translate-y-0.5'}`}
                      style={{
                        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                        boxShadow: isActive ? `0 8px 25px ${colors.shadow}` : '0 4px 12px rgba(0,0,0,0.4)',
                      }}
                    >
                      <div className="absolute -right-3 -top-3 text-5xl opacity-15 select-none">
                        {cat.icon}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg shadow-inner">
                          {cat.icon}
                        </div>
                        <div className="text-left">
                          <span className="block text-xs font-black text-white drop-shadow-sm leading-tight">{cat.name}</span>
                          <span className="text-[9px] text-white/70 font-medium">{products.filter(p => p.category_id === cat.id).length} prod.</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}

        {/* SUB-FILTROS DE MARCAS Y PALABRAS CLAVE */}
        <section className="px-4 mb-8">
          {/* Filtro por Marca */}
          {availableBrands.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  🏷️ Filtrar por Marca Oficial
                </span>
                {selectedBrand !== 'todas' && (
                  <button 
                    onClick={() => setSelectedBrand('todas')}
                    className="text-[11px] font-bold text-[#FF1E27] hover:underline"
                  >
                    Ver todas las marcas
                  </button>
                )}
              </div>
              <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-4 px-4">
                <button
                  onClick={() => setSelectedBrand('todas')}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                    selectedBrand === 'todas'
                      ? 'bg-gradient-to-r from-[#FF1E27] to-[#FF5C00] text-white border-red-400 shadow-[0_0_15px_rgba(255,30,39,0.4)] scale-105'
                      : 'bg-[#14141E] text-slate-300 border-slate-800 hover:border-[#FF1E27]/50 hover:text-white'
                  }`}
                >
                  ⚡ Todas las Marcas
                </button>
                {availableBrands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(selectedBrand === brand ? 'todas' : brand)}
                    className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                      selectedBrand === brand
                        ? 'bg-gradient-to-r from-[#FF1E27] to-[#FF5C00] text-white border-red-400 shadow-[0_0_15px_rgba(255,30,39,0.4)] scale-105'
                        : 'bg-[#14141E] text-slate-300 border-slate-800 hover:border-[#FF1E27]/50 hover:text-white'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtro Rápido por Palabra Clave */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                ⚡ Búsqueda Rápida
              </span>
              {selectedKeyword !== 'todas' && (
                <button 
                  onClick={() => setSelectedKeyword('todas')}
                  className="text-[11px] font-bold text-[#FF1E27] hover:underline"
                >
                  Limpiar palabra clave
                </button>
              )}
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-4 px-4">
              <button
                onClick={() => setSelectedKeyword('todas')}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedKeyword === 'todas'
                    ? 'bg-[#FF1E27] text-white border-[#FF1E27] shadow-md shadow-[#FF1E27]/30'
                    : 'bg-[#181824] text-slate-400 border-slate-800 hover:border-[#FF5C00] hover:text-[#FF5C00]'
                }`}
              >
                # Todo
              </button>
              {availableKeywords.map(kw => (
                <button
                  key={kw}
                  onClick={() => setSelectedKeyword(selectedKeyword === kw ? 'todas' : kw)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedKeyword === kw
                      ? 'bg-[#FF1E27] text-white border-[#FF1E27] shadow-md shadow-[#FF1E27]/30 scale-105'
                      : 'bg-[#181824] text-slate-300 border-slate-800 hover:border-[#FF5C00] hover:text-[#FF5C00]'
                  }`}
                >
                  #{kw}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 4. PRODUCT LIST */}
        <section className="px-4">
          {[...categories].sort((a, b) => {
            const order = ['Proteínas', 'Creatinas', 'Pre-Entrenos', 'Quemadores', 'Aminoácidos & BCAA', 'Vitaminas & Minerales', 'Colágenos & Belleza', 'Ganadores & Energía', 'Accesorios & Snacks'];
            return order.indexOf(a.name) - order.indexOf(b.name);
          }).map(category => {
            const categoryProducts = filteredProducts.filter(p => p.category_id === category.id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category.id} className="mb-10">
                <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2.5 uppercase tracking-wide">
                  <span className="w-8 h-8 rounded-xl bg-[#1C1C2A] border border-slate-800 flex items-center justify-center text-lg">{category.icon}</span> 
                  <span>{category.name}</span>
                </h2>
                
                <div className="flex flex-col gap-3.5">
                  {categoryProducts.map((product, idx) => {
                    const qty = getProductQuantity(product.id);
                    const brand = getProductBrand(product);
                    const cleanName = getCleanProductName(product);
                    const formattedDesc = (product.description || '')
                      .replace(/Lisa Mayorista \/ Suplementos AR\.?/gi, 'TITAN FUEL SUPLEMENTOS')
                      .replace(/Suplementos AR\.?/gi, 'TITAN FUEL SUPLEMENTOS') ||
                      `Línea oficial ${brand}. Producto 100% original con garantía de autenticidad en TITAN FUEL SUPLEMENTOS.`;
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        key={product.id} 
                        onClick={() => setSelectedProduct(product)}
                        className="bg-[#13131F] rounded-2xl border border-slate-800/80 hover:border-[#FF1E27]/60 p-3.5 flex gap-4 relative cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-xl hover:shadow-[0_10px_30px_rgba(255,30,39,0.15)] group"
                      >
                        {/* Text Content Area (Left) */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            {brand !== 'Otras' && (
                              <div className="mb-1.5">
                                <BrandLogo brand={brand} size="sm" />
                              </div>
                            )}
                            <h3 className="font-bold text-white group-hover:text-[#FF1E27] text-[15px] leading-tight mb-1 pr-2 transition-colors">{cleanName}</h3>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">{formattedDesc}</p>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1">
                            <span className="font-black text-white text-lg tracking-tight">${product.price.toLocaleString('es-AR')}</span>
                            {qty > 0 && (
                              <span className="bg-[#FF1E27]/20 text-[#FF1E27] font-bold text-[10px] px-2.5 py-0.5 rounded-md border border-[#FF1E27]/40 uppercase tracking-wider">
                                {qty} en pedido
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Image & Official Brand Seal Area (Right) */}
                        <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 bg-[#0B0B10] rounded-xl relative overflow-hidden shadow-inner border border-slate-800 group-hover:border-[#FF1E27]/50 transition-all flex flex-col justify-between p-2">
                          {/* Top Tag */}
                          <div className="z-10 flex justify-between items-center w-full">
                            <span className="text-sm select-none">{category.icon}</span>
                            <span className="bg-black/85 text-[#FF1E27] font-black text-[9px] px-1.5 py-0.5 rounded border border-[#FF1E27]/40 tracking-wider uppercase">
                              OFICIAL
                            </span>
                          </div>

                          {/* Center Official Brand Logo */}
                          <div className="z-10 my-auto flex justify-center w-full">
                            <BrandLogo brand={brand} size="sm" />
                          </div>

                          {/* Background image with overlay */}
                          <img 
                            src={product.image_url || `https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80`} 
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50 pointer-events-none" />

                          {/* Add Button inside image corner */}
                          <button 
                            className="absolute bottom-1.5 right-1.5 z-20 w-8 h-8 flex items-center justify-center bg-gradient-to-r from-[#FF1E27] to-[#FF5C00] rounded-lg text-white shadow-lg shadow-[#FF1E27]/40 active:scale-90 hover:brightness-110 transition-all"
                          >
                            <Plus size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-[#13131F] rounded-3xl border border-slate-800">
              <Search size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-lg font-bold text-white">No encontramos ningún producto</p>
              <p className="text-slate-500 text-sm">Prueba buscando con otras palabras.</p>
            </div>
          )}
        </section>
      </main>

      {/* FLOATING CART BUTTON */}
      <AnimatePresence>
        {cartItemCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 md:max-w-md md:mx-auto z-40"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gradient-to-r from-[#FF1E27] via-[#DC2626] to-[#FF5C00] text-white p-4 rounded-2xl shadow-[0_10px_35px_rgba(255,30,39,0.5)] flex items-center justify-between transition-all hover:brightness-110 active:scale-95 border border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="bg-black/35 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border border-white/20 shadow-inner">
                  {cartItemCount}
                </div>
                <span className="font-black text-lg tracking-tight uppercase">Ver mi pedido</span>
              </div>
              <ShoppingCart size={24} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={addToCart}
      />

      <CartModal 
        empresaId={empresa.id} 
        empresaName={empresa.name} 
        empresaPhone={empresa.phone || '5493814751620'} 
        onOrderPlaced={(id) => {
          setActiveOrderId(id);
          setIsTrackerOpen(true); // Open it immediately to surprise the user
        }}
      />

      <OrderTrackerModal 
        orderId={activeOrderId}
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onClearActiveOrder={() => {
          localStorage.removeItem(`activeOrder_${empresa.id}`);
          setActiveOrderId(null);
        }}
      />

      {/* FOOTER - ADMIN QUICK ACCESS */}
      <footer className="py-12 text-center border-t border-slate-900/80 mt-16 bg-[#09090E]">
        <a
          href={`/admin/${empresaSlug || 'titanfuel'}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-[#FF1E27]/20 border border-slate-800 hover:border-[#FF1E27]/50 text-xs font-bold text-slate-400 hover:text-white transition-all shadow-md"
        >
          <span>🔒 Acceso Administración y POS</span>
        </a>
      </footer>
    </div>
  );
}
