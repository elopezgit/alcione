import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getEmpresaId } from '../lib/getEmpresa';
import { filterAlcioneCategories, filterAlcioneProducts, resolveProductImage } from '../lib/defaultCatalog';
import { useCart } from '../lib/CartContext';
import { useToast } from '../hooks/useToast';
import { Search, Plus, Minus, Trash2, Wallet, CreditCard, Send, Coffee, X, CheckCircle } from 'lucide-react';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

/* ─── Interfaces ─── */
interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_active?: boolean;
  code?: string;
}

export default function POSHome({ empresaSlug }: { empresaSlug: string }) {
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'todas'>('todas');
  const [fastCode, setFastCode] = useState('');
  
  // Checkout states
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [globalComment, setGlobalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { items, addToCart, removeFromCart, updateQuantity, updateItemNotes, total, clearCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const id = await getEmpresaId(empresaSlug);
        if (!id) throw new Error('Empresa no encontrada.');
        
        setEmpresaId(id);

        const [cats, prods] = await Promise.all([
          supabase.from('categories').select('*').eq('empresa_id', id),
          supabase.from('products').select('*').eq('empresa_id', id).eq('is_active', true),
        ]);

        const loadedCats = filterAlcioneCategories(cats.data || []);
        setCategories(loadedCats);

        const loadedProds = filterAlcioneProducts(prods.data || []);
        setProducts(loadedProds);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (empresaSlug) loadData();
  }, [empresaSlug]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'todas' || p.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getProductQuantity = (productId: string) => {
    return items.filter(i => i.id === productId).reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const handleFastCodeSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!fastCode.trim()) return;
      const codeToSearch = fastCode.trim().toLowerCase();
      const prod = products.find(p => p.code?.toLowerCase() === codeToSearch);
      if (prod) {
        addToCart(prod, 1);
        toast.success('Producto agregado', `${prod.name} x1`);
        setFastCode('');
      } else {
        toast.error('Producto no encontrado', `Código: ${codeToSearch}`);
      }
    }
  };

  const handleSubmitOrder = async () => {
    if (!empresaId || items.length === 0) return;
    setIsSubmitting(true);

    const finalComment = `${paymentMethod === 'transferencia' ? '[TRANSFERENCIA] ' : '[EFECTIVO] '}${globalComment}`;

    try {
      const { error } = await supabase.from('orders').insert({
        empresa_id: empresaId,
        customer_name: 'Pedido en Caja',
        customer_phone: '0000000',
        delivery_address: 'En local',
        comment: finalComment,
        total: total,
        items: items,
        status: 'pendiente'
      });

      if (error) throw error;

      setOrderSuccess(true);
      clearCart();
      setGlobalComment('');

      toast.success('Pedido enviado', `Total: $${total.toLocaleString('es-AR')}`);

      setTimeout(() => {
        setShowSummaryModal(false);
        setOrderSuccess(false);
      }, 1500);
    } catch (err) {
      toast.error('Error al procesar el pedido');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Loading Skeleton ─── */
  if (loading) {
    return (
      <div className="flex h-screen bg-[#FAF8F5] overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white p-4 shadow-sm">
            <div className="flex gap-2 mb-4">
              <div className="flex-1 h-12 bg-stone-200 rounded-xl animate-pulse" />
              <div className="w-48 h-12 bg-stone-200 rounded-xl animate-pulse" />
            </div>
            <div className="flex gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-10 w-24 bg-stone-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => <ProductCardSkeleton key={i} />)}
            </div>
          </div>
        </div>
        <div className="w-[350px] shrink-0 bg-white border-l border-stone-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#FAF8F5]">
        <EmptyState
          icon="search"
          title="Error al cargar"
          description={error}
          action={{ label: 'Reintentar', onClick: () => window.location.reload() }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAF8F5] overflow-hidden text-stone-800">
      
      {/* ═══ LEFT PANE: Menu & Grid (70%) ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header & Filters */}
        <div className="bg-white/95 backdrop-blur-xl p-4 shadow-sm border-b border-stone-200">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} aria-hidden="true" />
              <input 
                type="text" 
                placeholder="Buscar producto..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Buscar producto"
                className="w-full bg-[#FAF8F5] border border-stone-200 text-stone-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:bg-white focus:border-[#A12C25] focus:ring-2 focus:ring-[#A12C25]/15 transition-all"
              />
            </div>
            <div className="relative w-48">
              <input 
                type="text" 
                placeholder="Cód. Rápido + Enter" 
                value={fastCode}
                onChange={(e) => setFastCode(e.target.value)}
                onKeyDown={handleFastCodeSubmit}
                aria-label="Código rápido de producto"
                className="w-full bg-[#FAF8F5] border border-stone-200 text-stone-800 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-[#A12C25] focus:ring-2 focus:ring-[#A12C25]/15 transition-all font-bold"
              />
            </div>
          </div>

          {/* Category Scroller */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
            <button
              onClick={() => setActiveCategory('todas')}
              aria-label="Todas las categorías"
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all focus-ring ${
                activeCategory === 'todas'
                  ? 'bg-gradient-to-r from-[#A12C25] to-[#D9381E] text-white shadow-md'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              Todas
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-label={`Categoría ${cat.name}`}
                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 focus-ring ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-[#A12C25] to-[#D9381E] text-white shadow-md'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                <span aria-hidden="true">{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#FAF8F5]">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const qty = getProductQuantity(product.id);
              return (
                <div 
                  key={product.id} 
                  onClick={() => {
                    addToCart(product, 1);
                    toast.success('Agregado', product.name);
                  }}
                  className="bg-white rounded-xl shadow-sm border border-stone-200 p-3 flex flex-col cursor-pointer hover:border-[#A12C25]/40 hover:shadow-md transition-all active:scale-95 group relative focus-ring"
                  role="button"
                  tabIndex={0}
                  aria-label={`${product.name} - $${product.price.toLocaleString('es-AR')}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      addToCart(product, 1);
                      toast.success('Agregado', product.name);
                    }
                  }}
                >
                  {qty > 0 && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge variant="primary" size="sm" dot={false}>
                        {qty}
                      </Badge>
                    </div>
                  )}
                  <div className="w-full h-24 bg-stone-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                    <img 
                      src={resolveProductImage(product)} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy" 
                    />
                  </div>
                  <h3 className="font-bold text-stone-800 text-sm leading-tight mb-1 line-clamp-2 flex-1">{product.name}</h3>
                  <p className="font-black text-[#A12C25]">${product.price.toLocaleString('es-AR')}</p>
                </div>
              );
            })}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <EmptyState
                icon="search"
                title="No hay productos"
                description="No hay productos que coincidan con la búsqueda."
              />
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT PANE: Cart (350px) ═══ */}
      <div className="w-[350px] shrink-0 bg-white border-l border-stone-200 flex flex-col shadow-xl z-20">
        <div className="p-4 border-b border-stone-100 bg-gradient-to-r from-[#A12C25] to-[#D9381E] text-white">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-lg flex items-center gap-2">
              <ShoppingCartIcon aria-hidden="true" /> Comanda
            </h2>
            <Badge variant="default" size="sm" className="!bg-white/20 !text-white !border-white/30">
              {items.length} ítems
            </Badge>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-3">
              <Coffee size={48} className="text-stone-200" aria-hidden="true" />
              <p className="font-bold text-sm text-stone-500">Comanda vacía</p>
              <p className="text-xs text-center px-4 text-stone-400">Toca los productos a la izquierda para agregarlos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={`${item.id}-${item.notes || 'default'}`} className="bg-stone-50 rounded-lg p-3 border border-stone-100 group">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-stone-800 flex-1 pr-2">{item.name}</h4>
                    <span className="font-black text-sm text-stone-800">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Ej: Notas del producto..."
                    value={item.notes || ''}
                    onChange={(e) => updateItemNotes(item.id, item.notes, e.target.value)}
                    aria-label={`Notas para ${item.name}`}
                    className="w-full bg-white border border-stone-200 text-stone-600 rounded px-2 py-1 text-xs outline-none focus:border-[#A12C25] mb-2 shadow-inner transition-colors"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.notes)}
                        aria-label={`Reducir cantidad de ${item.name}`}
                        className="p-1.5 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <span className="w-6 text-center font-bold text-sm text-stone-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.notes)}
                        aria-label={`Aumentar cantidad de ${item.name}`}
                        className="p-1.5 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.id, item.notes)}
                      aria-label={`Eliminar ${item.name} del carrito`}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout */}
        <div className="p-4 bg-white border-t border-stone-200 shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-stone-500 uppercase">Total Final</span>
            <span className="text-3xl font-black text-stone-800 tracking-tight">${total.toLocaleString('es-AR')}</span>
          </div>

          <div className="mb-4">
            <input 
              type="text" 
              placeholder="Notas generales (ej: sin sal)" 
              value={globalComment}
              onChange={(e) => setGlobalComment(e.target.value)}
              aria-label="Notas generales del pedido"
              className="w-full bg-[#FAF8F5] border border-stone-200 text-stone-800 rounded-lg p-3 outline-none focus:border-[#A12C25] focus:bg-white text-sm shadow-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button 
              onClick={() => setPaymentMethod('efectivo')}
              aria-label="Pago en efectivo"
              className={`flex items-center justify-center gap-1 p-2.5 rounded-lg font-bold text-xs transition-all border ${
                paymentMethod === 'efectivo'
                  ? 'bg-green-100 border-green-400 text-green-800 shadow-sm'
                  : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-100'
              }`}
            >
              <Wallet size={16} aria-hidden="true" /> Efectivo
            </button>
            <button 
              onClick={() => setPaymentMethod('transferencia')}
              aria-label="Pago por transferencia"
              className={`flex items-center justify-center gap-1 p-2.5 rounded-lg font-bold text-xs transition-all border ${
                paymentMethod === 'transferencia'
                  ? 'bg-blue-100 border-blue-400 text-blue-800 shadow-sm'
                  : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-100'
              }`}
            >
              <CreditCard size={16} aria-hidden="true" /> Transf.
            </button>
          </div>

          <button 
            onClick={() => setShowSummaryModal(true)}
            disabled={items.length === 0 || isSubmitting}
            aria-label="Revisar y enviar pedido"
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-lg transition-all shadow-lg focus-ring ${
              items.length > 0 && !isSubmitting
                ? 'bg-gradient-to-r from-[#A12C25] to-[#D9381E] text-white hover:brightness-110 active:scale-[0.98] shadow-[#A12C25]/25'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            Revisar y Enviar <Send size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ═══ SUMMARY MODAL ═══ */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-fade-in">
            <div className="bg-gradient-to-r from-[#A12C25] to-[#D9381E] p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {orderSuccess ? (
                  <>
                    <CheckCircle size={24} /> Pedido Enviado
                  </>
                ) : (
                  'Verificar Pedido'
                )}
              </h2>
              {!orderSuccess && (
                <button
                  onClick={() => setShowSummaryModal(false)}
                  aria-label="Cerrar"
                  className="p-1 hover:bg-black/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            {orderSuccess ? (
              <div className="p-12 text-center">
                <CheckCircle size={64} className="mx-auto text-green-500 mb-4" aria-hidden="true" />
                <p className="text-lg font-bold text-stone-800">Pedido enviado a cocina</p>
                <p className="text-stone-500 mt-1">Total: ${total.toLocaleString('es-AR')}</p>
              </div>
            ) : (
              <>
                <div className="p-6 overflow-y-auto max-h-[60vh] bg-stone-50">
                  <ul className="space-y-4">
                    {items.map((item, idx) => (
                      <li key={`${item.id}-${idx}`} className="flex justify-between items-start border-b border-stone-200 pb-3">
                        <div>
                          <div className="font-bold text-stone-800">
                            {item.quantity}x {item.name}
                          </div>
                          {item.notes && (
                            <div className="text-sm text-red-600 font-bold bg-red-50 inline-block px-2 py-0.5 rounded mt-1">
                              Nota: {item.notes}
                            </div>
                          )}
                        </div>
                        <div className="font-black text-stone-800">
                          ${(item.price * item.quantity).toLocaleString('es-AR')}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {globalComment && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <span className="font-bold text-yellow-800 text-sm block mb-1">Nota General:</span>
                      <span className="text-yellow-900 text-sm">{globalComment}</span>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-white border-t border-stone-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-stone-500 font-bold">Método de Pago:</span>
                    <span className="text-stone-800 font-black uppercase bg-stone-100 px-3 py-1 rounded-lg">
                      {paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-bold text-stone-800">Total a Cobrar:</span>
                    <span className="text-4xl font-black text-[#A12C25]">${total.toLocaleString('es-AR')}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowSummaryModal(false)}
                      className="py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors focus-ring"
                    >
                      Volver a Editar
                    </button>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="py-3 rounded-xl font-black text-white bg-gradient-to-r from-[#A12C25] to-[#D9381E] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg focus-ring disabled:opacity-70"
                    >
                      {isSubmitting ? 'Enviando...' : 'Confirmar y Enviar'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Inline SVG Carrito ─── */
function ShoppingCartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}
