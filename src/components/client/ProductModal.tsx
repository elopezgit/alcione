import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus } from 'lucide-react';
import Badge from '../ui/Badge';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  stock?: number;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, notes: string) => void;
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setNotes('');
    }
  }, [isOpen, product]);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity, notes);
    onClose();
  };

  const getPlaceholder = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('chorizo')) return 'Ej: Bien sellado al vacío, listo para parrilla...';
    if (n.includes('salame')) return 'Ej: Enviar entero o cortado en rodajas...';
    if (n.includes('bondiola')) return 'Ej: Aclarar preferencia de pieza...';
    return 'Ej: Aclaraciones especiales para tu pedido...';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle de ${product.name}`}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white text-stone-900 rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh] md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:rounded-3xl shadow-2xl border border-stone-200"
          >
            <div className="relative h-60 bg-stone-900 shrink-0">
              <img 
                src={product.image_url || '/img/Catalogo/bondiola.png'} 
                alt={product.name}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent"></div>
              
              <div className="absolute bottom-4 left-6 z-10 flex flex-col items-start gap-1">
                <Badge variant="primary" size="sm">
                  MR CERDO &bull; OFICIAL
                </Badge>
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider drop-shadow-md mt-0.5">
                  ★ 100% PURO CERDO SELECCIONADO
                </div>
              </div>

              <button 
                onClick={onClose}
                aria-label="Cerrar detalle del producto"
                className="absolute top-4 right-4 p-2.5 bg-white/90 text-stone-900 rounded-full border border-stone-200 shadow-md hover:bg-[#A12C25] hover:text-white transition-colors z-20 focus-ring"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar p-6 bg-white">
              <h2 className="text-2xl font-black text-stone-900 mb-2 leading-tight">
                {product.name}
              </h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-black text-2xl text-[#A12C25]">
                  ${product.price.toLocaleString('es-AR')}
                </span>
              </div>
              <p className="text-stone-600 leading-relaxed mb-6 text-sm">
                {product.description || 'Charcutería y embutidos artesanales elaborados con pura carne de cerdo de selección.'}
              </p>

              <div className="mb-4">
                <label htmlFor="product-notes" className="block text-xs font-black uppercase tracking-wider text-[#A12C25] mb-2">
                  Instrucciones o preferencias del pedido
                </label>
                <textarea 
                  id="product-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={getPlaceholder(product.name)}
                  aria-label="Instrucciones para el pedido"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-900 focus:ring-2 focus:ring-[#A12C25]/20 focus:border-[#A12C25] outline-none transition-all resize-none h-20 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50/80 shrink-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white rounded-2xl p-1.5 border border-stone-200 shadow-sm">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label={`Reducir cantidad a ${Math.max(1, quantity - 1)}`}
                      className="w-10 h-10 flex items-center justify-center bg-stone-100 hover:bg-stone-200 rounded-xl shadow-sm text-stone-800 active:scale-95 transition-all focus-ring"
                    >
                      <Minus size={18} aria-hidden="true" />
                    </button>
                    <span className="font-black w-8 text-center text-stone-900 text-lg" aria-live="polite" aria-label={`Cantidad: ${quantity}`}>
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label={`Aumentar cantidad a ${quantity + 1}`}
                      className="w-10 h-10 flex items-center justify-center bg-[#A12C25] hover:bg-[#8B231E] rounded-xl shadow-sm text-white active:scale-95 transition-all focus-ring"
                    >
                      <Plus size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="text-2xl font-black text-stone-900" aria-live="polite" aria-label={`Total: $${(product.price * quantity).toLocaleString('es-AR')}`}>
                  ${(product.price * quantity).toLocaleString('es-AR')}
                </div>
              </div>

              <button 
                onClick={handleAdd}
                aria-label={`Agregar ${quantity} ${product.name} al pedido`}
                className="w-full bg-gradient-to-r from-[#A12C25] to-[#C93C32] hover:brightness-110 text-white py-4 rounded-2xl font-black uppercase tracking-wide text-base shadow-lg shadow-[#A12C25]/25 transition-all active:scale-[0.98] focus-ring"
              >
                Agregar al pedido
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
