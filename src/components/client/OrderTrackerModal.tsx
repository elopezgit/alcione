import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { X, Clock, ChefHat, CheckCircle2, XCircle, BellRing } from 'lucide-react';

interface OrderTrackerModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onClearActiveOrder: () => void;
}

const STATUS_STEPS = ['pendiente', 'en_preparacion', 'entregado'] as const;
type OrderStatus = typeof STATUS_STEPS[number];

const STEP_CONFIG: Record<OrderStatus, { icon: React.ReactNode; label: string; description: string }> = {
  pendiente: { icon: <Clock size={24} />, label: 'Pendiente', description: 'Estamos revisando tu pedido.' },
  en_preparacion: { icon: <ChefHat size={24} />, label: 'En Preparación', description: '¡Tu pedido ya está siendo preparado!' },
  entregado: { icon: <CheckCircle2 size={24} />, label: 'Entregado', description: 'Tu pedido está listo o en camino.' },
};

export default function OrderTrackerModal({ orderId, isOpen, onClose, onClearActiveOrder }: OrderTrackerModalProps) {
  const [status, setStatus] = useState<string>('pendiente');
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status, total')
        .eq('id', orderId)
        .maybeSingle();
      if (data && !error) {
        setStatus(data.status);
        setTotal(data.total);
      }
      setIsLoading(false);
    };

    fetchStatus();

    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [isOpen, orderId]);

  const handleClose = () => {
    if (status === 'entregado' || status === 'cancelado') {
      onClearActiveOrder();
    }
    onClose();
  };

  // Map 'en_camino' to 'entregado' position in the progress bar,
  // and 'cancelado' to 0% (cancel UI is rendered separately)
  const progressStatus = status === 'en_camino' ? 'entregado' : status;
  const currentStepIndex = progressStatus === 'cancelado' ? -1 : STATUS_STEPS.indexOf(progressStatus as OrderStatus);
  const progressHeight = currentStepIndex >= 0 ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` : '0%';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-white/80 z-[100] backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-label="Seguimiento de pedido"
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-md bg-surface z-[101] rounded-t-3xl shadow-2xl flex flex-col border border-amber-200"
          >
            <div className="p-5 border-b border-amber-200 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <BellRing size={22} className="text-primary" aria-hidden="true" /> Tu Pedido
              </h2>
              <button 
                onClick={handleClose}
                aria-label="Cerrar seguimiento"
                className="p-2 bg-amber-100 text-slate-700 rounded-full hover:bg-slate-700 hover:text-white transition-colors focus-ring"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="p-8">
              {isLoading ? (
                <div className="text-center text-slate-600 py-8" role="status">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" aria-hidden="true" />
                  Cargando estado...
                </div>
              ) : status === 'cancelado' ? (
                <div className="text-center py-8">
                  <XCircle size={64} className="text-red-500 mx-auto mb-4" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Pedido Cancelado</h3>
                  <p className="text-slate-600 text-sm">Tu pedido ha sido cancelado. Por favor contáctate por WhatsApp para más información.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline Bar Background */}
                  <div className="absolute left-6 top-6 bottom-6 w-1 bg-amber-100 rounded-full z-0" aria-hidden="true" />
                  
                  {/* Timeline Progress */}
                  <div 
                    className="absolute left-6 top-6 w-1 bg-primary rounded-full z-0 transition-all duration-1000 ease-out"
                    style={{ height: progressHeight }}
                    aria-hidden="true"
                  />

                  {/* Steps */}
                  {STATUS_STEPS.map((step) => {
                    const config = STEP_CONFIG[step];
                    const isActive = currentStepIndex >= STATUS_STEPS.indexOf(step);
                    const isCurrent = status === step;
                    
                    return (
                      <div key={step} className="relative z-10 flex items-start gap-6 mb-12 last:mb-0">
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 ${
                            isActive ? 'bg-primary text-black' : 'bg-amber-100 text-slate-500'
                          } ${isCurrent ? 'ring-4 ring-amber-200 scale-110' : ''}`}
                          aria-hidden="true"
                        >
                          {config.icon}
                        </div>
                        <div className="pt-2">
                          <h4 className={`font-bold text-lg transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                            {config.label}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1">
                            {isCurrent ? config.description : (isActive ? 'Completado' : 'Pendiente')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-amber-200 bg-white/50 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">
                Orden #{orderId?.split('-')[0].toUpperCase()}
              </p>
              <p className="text-sm font-medium text-slate-700">
                Total del pedido: <span className="font-bold text-slate-900">${total.toLocaleString('es-AR')}</span>
              </p>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
