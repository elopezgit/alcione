import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Search, Info, MapPin, Plus, Star, ChevronRight, RotateCcw } from 'lucide-react';
import { useCart } from '../lib/CartContext';
import CartModal from '../components/client/CartModal';
import ProductModal from '../components/client/ProductModal';
import { motion, AnimatePresence } from 'framer-motion';

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
}

interface Banner {
  id: string;
  image_url: string;
  link_url?: string;
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

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'todas'>('todas');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { items, setIsCartOpen, addToCart, clearCart } = useCart();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      if (!empresaSlug) return;
      try {
        const { data: empData, error: empError } = await supabase
          .from('empresas')
          .select('*')
          .eq('slug', empresaSlug)
          .eq('is_active', true)
          .maybeSingle();

        if (empError) throw empError;
        if (!empData) throw new Error('El restaurante no existe o la base de datos no tiene datos cargados.');
        
        setEmpresa(empData);

        // Check for last order in localStorage
        const savedOrder = localStorage.getItem(`lastOrder_${empData.id}`);
        if (savedOrder) {
          try {
            setLastOrder(JSON.parse(savedOrder));
          } catch(e) {}
        }

        const [cats, prods, bans] = await Promise.all([
          supabase.from('categories').select('*').eq('empresa_id', empData.id),
          supabase.from('products').select('*').eq('empresa_id', empData.id).eq('is_active', true),
          supabase.from('banners').select('*').eq('empresa_id', empData.id).eq('is_active', true)
        ]);

        if (cats.data) setCategories(cats.data);
        if (prods.data) setProducts(prods.data);
        if (bans.data) setBanners(bans.data);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        setTimeout(() => setShowSplash(false), 3500); // Dar más tiempo para la animación completa
      }
    }
    loadData();
  }, [empresaSlug]);

  // Auto-scroll Banners
  useEffect(() => {
    if (!carouselRef.current || banners.length <= 1) return;
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const maxScroll = scrollWidth - clientWidth;
        // Si llegó al final, vuelve al inicio, sino avanza 1 tarjeta (aprox 320px)
        if (scrollLeft >= maxScroll - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4000); // Rota cada 4 segundos
    return () => clearInterval(interval);
  }, [banners]);

  if (loading || showSplash) {
    return (
      <AnimatePresence>
        <motion.div 
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/30 via-black to-black"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
            {/* Logo Animator */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
              className="w-56 h-56 rounded-full shadow-[0_0_80px_rgba(255,184,0,0.4)] flex items-center justify-center p-2 mb-6 bg-black border border-yellow-500/20"
            >
               <img src="/img/logo/logook.jfif" alt="TopeDeBar Logo" className="w-full h-full object-contain rounded-full" onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 if (e.currentTarget.nextElementSibling) {
                   (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                 }
               }} />
               <h1 style={{display: 'none'}} className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-primary to-yellow-600 leading-tight">TOPE<br/><span className="text-xl text-white">DE</span><br/>BAR</h1>
            </motion.div>

            {/* Phrase 1 */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-2xl font-bold text-white mb-2"
            >
              ¡Hacé tu pedido aquí!
            </motion.h2>

            {/* Phrase 2: SI SI !! */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.6, type: "spring", bounce: 0.6 }}
              className="mt-4"
            >
              <span className="bg-primary text-black font-black text-4xl px-6 py-2 rounded-2xl transform -rotate-6 inline-block shadow-[0_10px_30px_rgba(255,184,0,0.5)] border-2 border-yellow-300">
                SI SI !!
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
        <div className="bg-surface p-8 rounded-3xl shadow-2xl text-center max-w-sm border border-slate-800">
          <Info size={48} className="mx-auto text-primary mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Ops! Algo salió mal</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'todas' || p.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const promosCategory = categories.find(c => c.name.toLowerCase().includes('promo'));
  const regularCategories = categories.filter(c => c.id !== promosCategory?.id);

  const getProductQuantity = (productId: string) => {
    return items.filter(i => i.id === productId).reduce((acc, curr) => acc + curr.quantity, 0);
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
    { id: '1', image_url: '/img/Banner/bannertupedido.png' },
    { id: '2', image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80' }
  ];

  return (
    <div className="min-h-screen bg-background pb-24 font-sans text-slate-200">
      {/* 1. HERO HEADER */}
      <header className="bg-surface pt-8 pb-4 px-4 sticky top-0 z-40 border-b border-slate-800/50 backdrop-blur-xl bg-surface/80">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="w-14 h-14 bg-black rounded-full border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
                <img src="/img/logo/logook.jfif" alt="Logo" className="w-full h-full object-cover" onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                  }
                }} />
                <span style={{display: 'none'}} className="text-sm font-black text-primary leading-none text-center">TdB</span>
             </div>
             <div>
               <h1 className="text-xl font-black tracking-tight text-white">{empresa.name}</h1>
               <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                 <span className="flex items-center gap-1"><MapPin size={10} className="text-primary"/> Envío a Domicilio</span>
               </div>
             </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="¿Qué vas a pedir hoy?" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-slate-700 text-white rounded-2xl py-3 pl-12 pr-4 shadow-inner outline-none focus:border-primary transition-all text-sm placeholder:text-slate-500"
          />
        </div>
      </header>

      <main className="mt-2">
        {/* REORDER BUTTON (If last order exists) */}
        {lastOrder.length > 0 && !searchQuery && (
          <section className="px-4 py-2 mt-2">
            <button 
              onClick={handleReorder}
              className="w-full bg-gradient-to-r from-slate-900 to-black border border-primary/50 p-4 rounded-2xl flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="bg-primary/20 p-2 rounded-full text-primary">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Pedir lo mismo de nuevo</h3>
                  <p className="text-xs text-slate-400">Tu último pedido fue increíble.</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-primary" />
            </button>
          </section>
        )}

        {/* 2. BANNERS CAROUSEL (Auto-scrolling) */}
        {!searchQuery && (
          <section className="px-4 py-4">
            <div ref={carouselRef} className="flex overflow-x-auto hide-scrollbar gap-3 snap-x snap-mandatory">
              {displayBanners.map(banner => (
                <a 
                  key={banner.id} 
                  href={banner.link_url || '#'} 
                  className="shrink-0 w-[85vw] md:w-80 h-44 rounded-3xl overflow-hidden snap-center relative border border-slate-800 shadow-xl block"
                >
                  <img src={banner.image_url} alt="Promo" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  {banner.link_url && (
                    <div className="absolute bottom-4 left-4 bg-primary text-black text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-primary/30">
                      Ver más <ChevronRight size={14} />
                    </div>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* 3. CATEGORY SELECTOR (App Style Layout) */}
        {!searchQuery && (
           <section className="pl-4 mb-8">
              <h2 className="text-lg font-bold text-white mb-3 pr-4">Categorías</h2>
              
              <div className="flex overflow-x-auto hide-scrollbar gap-3 pr-4 pb-2">
                <button
                  onClick={() => setActiveCategory('todas')}
                  className={`shrink-0 w-24 h-28 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${activeCategory === 'todas' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-surface border border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                >
                  <Star size={24} className={activeCategory === 'todas' ? 'text-black' : 'text-primary'} />
                  <span className="text-xs font-bold">Todas</span>
                </button>

                {/* Tarjeta grande y animada para Promociones */}
                {promosCategory && (
                  <motion.button
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    onClick={() => setActiveCategory(promosCategory.id)}
                    className={`shrink-0 w-48 h-28 rounded-2xl p-4 flex flex-col justify-end relative overflow-hidden transition-all ${activeCategory === promosCategory.id ? 'border-2 border-primary' : 'border border-primary/50'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/40 to-red-900/40 z-0"></div>
                    <div className="absolute -right-4 -top-4 opacity-20 text-[80px] z-0">🔥</div>
                    <div className="relative z-10 text-left">
                      <span className="text-3xl mb-1 block">{promosCategory.icon}</span>
                      <span className="text-sm font-black uppercase tracking-wider text-white drop-shadow-md">Promociones</span>
                    </div>
                  </motion.button>
                )}

                {/* Tarjetas normales para el resto */}
                {regularCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 w-24 h-28 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${activeCategory === cat.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-surface border border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                  >
                    <span className="text-3xl drop-shadow-sm">{cat.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center px-1 truncate w-full">{cat.name}</span>
                  </button>
                ))}
              </div>
           </section>
        )}

        {/* 4. PRODUCT LIST */}
        <section className="px-4">
          {[...categories]
            .sort((a, b) => {
              const aIsPromo = a.name.toLowerCase().includes('promo');
              const bIsPromo = b.name.toLowerCase().includes('promo');
              if (aIsPromo && !bIsPromo) return -1;
              if (!aIsPromo && bIsPromo) return 1;
              return 0;
            })
            .map(category => {
            const categoryProducts = filteredProducts.filter(p => p.category_id === category.id);
            if (categoryProducts.length === 0) return null;

            const isPromo = category.name.toLowerCase().includes('promo');

            return (
              <div key={category.id} className="mb-10">
                <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                  <span>{category.icon}</span> {category.name}
                  {isPromo && <span className="bg-primary text-black text-[10px] px-2 py-0.5 rounded-sm font-black uppercase tracking-widest ml-2">Especial</span>}
                </h2>
                
                <div className="flex flex-col gap-4">
                  {categoryProducts.map((product, idx) => {
                    const qty = getProductQuantity(product.id);
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={product.id} 
                        onClick={() => setSelectedProduct(product)}
                        className="bg-surface rounded-2xl border border-slate-800/80 p-3 flex gap-4 relative cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        {/* Text Content Area (Left) */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-white text-[15px] leading-tight mb-1 pr-2">{product.name}</h3>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">{product.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1">
                            <span className="font-black text-white text-base tracking-tight">${product.price.toLocaleString('es-AR')}</span>
                            {qty > 0 && (
                              <span className="bg-primary/20 text-primary font-bold text-[10px] px-2 py-0.5 rounded-md border border-primary/30 uppercase tracking-wider">
                                {qty} en pedido
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Image & Add Button Area (Right) */}
                        <div className="w-28 h-28 shrink-0 bg-black rounded-xl relative overflow-hidden shadow-inner border border-slate-800">
                           <img 
                             src={product.image_url || `https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80`} 
                             alt={product.name}
                             className="w-full h-full object-cover opacity-90"
                           />
                           
                           {/* Small Add Button inside image corner */}
                           <button 
                             className="absolute bottom-1 right-1 w-8 h-8 flex items-center justify-center bg-white rounded-full text-black shadow-md active:scale-90 transition-transform"
                           >
                             <Plus size={18} strokeWidth={3} />
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
            <div className="text-center py-16 bg-surface rounded-3xl border border-slate-800">
              <Search size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-lg font-bold text-slate-300">No encontramos nada</p>
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
              className="w-full bg-primary text-black p-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(255,184,0,0.6)] flex items-center justify-between transition-transform active:scale-95 border border-primary/50"
            >
              <div className="flex items-center gap-3">
                <div className="bg-black text-primary w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-inner">
                  {cartItemCount}
                </div>
                <span className="font-black text-lg tracking-tight uppercase">Ver mi pedido</span>
              </div>
              <ShoppingCart size={24} className="text-black" />
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
        empresaPhone={empresa.phone} 
      />
    </div>
  );
}
