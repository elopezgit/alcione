import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../lib/CartContext';
import { supabase } from '../../lib/supabase';
import { X, Minus, Plus, Trash2, MapPin, Wallet, CreditCard, Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface CartModalProps {
  empresaId: string;
  empresaName: string;
  empresaPhone: string;
  empresaAlias?: string;
  empresaCbu?: string;
  tenantPrimaryColor?: string;
  tenantName?: string;
  onOrderPlaced?: (orderId: string) => void;
}

export default function CartModal({ 
  empresaId, 
  empresaName, 
  empresaPhone, 
  empresaAlias, 
  empresaCbu,
  tenantPrimaryColor = '#1A5B6B',
  tenantName = 'Alcione — Deco & Hogar',
  onOrderPlaced 
}: CartModalProps) {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const toast = useToast();
  const primaryColor = tenantPrimaryColor;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCbu, setCopiedCbu] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const displayAlias = empresaAlias || 'alcione.mp';
  const displayTitular = tenantName || empresaName || 'Alcione — Deco & Hogar';

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(displayAlias);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCbu = () => {
    if (empresaCbu) {
      navigator.clipboard.writeText(empresaCbu);
      setCopiedCbu(true);
      setTimeout(() => setCopiedCbu(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const fullComment = `${paymentMethod === 'transferencia' ? '[PAGA CON TRANSFERENCIA] ' : '[PAGA EN EFECTIVO] '}${comment}`;

    try {
      const { data: orderData, error } = await supabase
        .from('orders')
        .insert({
          empresa_id: empresaId,
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddress,
          comment: fullComment,
          total: total,
          items: items,
          status: 'pendiente'
        })
        .select()
        .single();

      if (error) throw error;

      let wpMessage = `*NUEVO PEDIDO - ${empresaName}*\n`;
      wpMessage += `Orden #${orderData.id.split('-')[0].toUpperCase()}\n\n`;
      wpMessage += `*Cliente:* ${customerName}\n`;
      wpMessage += `*Teléfono:* ${customerPhone}\n`;
      if (deliveryAddress) wpMessage += `*Dirección:* ${deliveryAddress}\n`;
      wpMessage += `\n*Detalle del pedido:*\n`;
      items.forEach(item => {
        wpMessage += `• ${item.quantity}x ${item.name} ($${item.price})\n`;
        if (item.notes) wpMessage += `  _Nota: ${item.notes}_\n`;
      });
      wpMessage += `\n*Medio de Pago:* ${paymentMethod.toUpperCase()}`;
      if (comment) wpMessage += `\n*Comentarios:* ${comment}`;
      wpMessage += `\n\n*TOTAL: $${total.toLocaleString('es-AR')}*`;

      const wpUrl = `https://wa.me/${empresaPhone.replace(/\D/g, '')}?text=${encodeURIComponent(wpMessage)}`;
      window.open(wpUrl, '_blank');

      // Save order to localStorage for the "Reorder" feature
      localStorage.setItem(`lastOrder_${empresaId}`, JSON.stringify(items));
      // Save order id for Tracking feature
      localStorage.setItem(`activeOrder_${empresaId}`, orderData.id);

      if (onOrderPlaced) onOrderPlaced(orderData.id);

      clearCart();
      setIsCartOpen(false);
    } catch (err) {
      console.error(err);
      setSubmitError('Hubo un error al procesar el pedido. Por favor intenta de nuevo.');
      toast.error('Error al procesar', 'Hubo un error al procesar el pedido. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 top-12 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-xl md:max-h-[88vh] bg-white text-stone-900 z-[101] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200"
          >
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
              <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                Mi Pedido VIP
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                aria-label="Cerrar carrito"
                className="p-2 bg-white text-stone-500 border border-stone-200 rounded-xl hover:bg-stone-900 hover:text-white transition-colors focus-ring"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar bg-white">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-stone-400">
                  <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center mb-4 text-stone-300 font-serif font-bold text-lg">VIP</div>
                  <p className="text-base font-serif font-bold text-stone-800">Tu pedido está vacío</p>
                  <p className="text-xs mt-1 text-stone-500 text-center max-w-[220px]">Explora nuestras colecciones y selecciona tus piezas exclusivas</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start border-b border-stone-200/80 pb-3 last:border-0 last:pb-0">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-900 text-sm">{item.name}</h4>
                          {item.notes && <p className="text-[11px] font-medium mt-0.5" style={{ color: primaryColor }}>"{item.notes}"</p>}
                          <div className="font-extrabold text-stone-800 mt-0.5 text-sm">${(item.price * item.quantity).toLocaleString('es-AR')}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            onClick={() => removeFromCart(item.id, item.notes)}
                            aria-label={`Eliminar ${item.name}`}
                            className="text-stone-400 hover:text-red-600 transition-colors focus-ring"
                          >
                            <Trash2 size={15} />
                          </button>
                          <div className="flex items-center bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.notes)}
                              aria-label={`Reducir cantidad de ${item.name}`}
                              className="w-7 h-7 flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors focus-ring"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-bold text-xs w-5 text-center text-stone-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.notes)}
                              aria-label={`Aumentar cantidad de ${item.name}`}
                              className="w-7 h-7 flex items-center justify-center text-white hover:brightness-110 transition-all focus-ring"
                              style={{ backgroundColor: primaryColor }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Form */}
                  <form id="checkout-form" onSubmit={handleSubmit} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3" noValidate>
                    <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider border-b border-stone-200 pb-2 font-display">Datos de entrega</h3>

                    {submitError && (
                      <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-3 rounded-xl">
                        {submitError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-0.5 uppercase tracking-wider" htmlFor="customer-name">Nombre</label>
                        <input
                          id="customer-name"
                          required
                          type="text"
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          className="w-full bg-white border border-stone-200 text-stone-900 rounded-xl p-2.5 text-sm focus:ring-1 outline-none placeholder:text-stone-400 shadow-sm transition-all"
                          style={{ borderColor: customerName ? primaryColor : undefined }}
                          placeholder="Juan Pérez"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-0.5 uppercase tracking-wider" htmlFor="customer-phone">WhatsApp</label>
                        <input
                          id="customer-phone"
                          required
                          type="tel"
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          className="w-full bg-white border border-stone-200 text-stone-900 rounded-xl p-2.5 text-sm focus:ring-1 outline-none placeholder:text-stone-400 shadow-sm transition-all"
                          style={{ borderColor: customerPhone ? primaryColor : undefined }}
                          placeholder="381 123 4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-0.5 uppercase tracking-wider flex items-center gap-1" htmlFor="delivery-address">
                        <MapPin size={12} style={{ color: primaryColor }} /> Dirección
                      </label>
                      <input
                        id="delivery-address"
                        type="text"
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        className="w-full bg-white border border-stone-200 text-stone-900 rounded-xl p-2.5 text-sm focus:ring-1 outline-none placeholder:text-stone-400 shadow-sm transition-all"
                        style={{ borderColor: deliveryAddress ? primaryColor : undefined }}
                        placeholder="Calle 123 (opcional si retira)"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-0.5 uppercase tracking-wider" htmlFor="comment">Comentario</label>
                      <textarea
                        id="comment"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="w-full bg-white border border-stone-200 text-stone-900 rounded-xl p-2.5 text-sm focus:ring-1 outline-none resize-none h-14 placeholder:text-stone-400 shadow-sm transition-all"
                        style={{ borderColor: comment ? primaryColor : undefined }}
                        placeholder="Instrucciones especiales para el pedido..."
                      />
                    </div>

                    <div className="pt-3 border-t border-stone-200">
                      <label className="block text-[10px] font-bold text-stone-500 mb-2 uppercase tracking-wider">Método de pago</label>
                      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Método de pago">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('efectivo')}
                          aria-label="Pagar en efectivo"
                          aria-pressed={paymentMethod === 'efectivo'}
                          className={`flex items-center justify-center gap-2 p-2.5 font-bold text-xs rounded-xl transition-all border shadow-sm focus-ring ${paymentMethod === 'efectivo' ? 'text-white' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'}`}
                          style={paymentMethod === 'efectivo' ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                        >
                          <Wallet size={14} /> Efectivo
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('transferencia')}
                          aria-label="Pagar con transferencia"
                          aria-pressed={paymentMethod === 'transferencia'}
                          className={`flex items-center justify-center gap-2 p-2.5 font-bold text-xs rounded-xl transition-all border shadow-sm focus-ring ${paymentMethod === 'transferencia' ? 'text-white' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'}`}
                          style={paymentMethod === 'transferencia' ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                        >
                          <CreditCard size={14} /> Transferencia
                        </button>
                      </div>

                      {paymentMethod === 'transferencia' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-stone-900 text-white shadow-inner"
                        >
                          <div className="p-2.5 bg-black/40 text-[#D4A76A] text-[10px] font-bold text-center uppercase tracking-wider border-b border-stone-800 flex items-center justify-center gap-1.5">
                            <CreditCard size={13} className="text-[#D4A76A]" /> Datos para Transferencia VIP
                          </div>
                          <div className="p-3.5 flex flex-col gap-2.5">
                            <div className="flex justify-between items-center bg-stone-950/80 rounded-lg p-3 border border-stone-800">
                              <span className="text-[11px] text-stone-400 font-medium">Titular / Cuenta</span>
                              <span className="text-xs font-serif font-bold tracking-wide text-white">{displayTitular}</span>
                            </div>
                            <div className="flex justify-between items-center bg-stone-950/80 rounded-lg p-3 border border-stone-800">
                              <span className="text-[11px] text-stone-400 font-medium">Alias MP</span>
                              <div className="flex items-center gap-2.5">
                                <span className="text-sm font-bold tracking-wider text-[#D4A76A] font-mono">{displayAlias}</span>
                                <button
                                  type="button"
                                  onClick={handleCopyAlias}
                                  className="p-1.5 bg-[#D4A76A]/20 text-[#D4A76A] hover:bg-[#D4A76A]/40 rounded-md transition-colors focus-ring"
                                  title="Copiar Alias"
                                  aria-label="Copiar alias"
                                >
                                  {copied ? <CheckCircle2 size={15} className="text-green-400" /> : <Copy size={15} />}
                                </button>
                              </div>
                            </div>
                            {empresaCbu && (
                              <div className="flex justify-between items-center bg-stone-950/80 rounded-lg p-3 border border-stone-800">
                                <span className="text-[11px] text-stone-400 font-medium">CBU / CVU</span>
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-bold tracking-wider text-stone-300 font-mono">{empresaCbu}</span>
                                  <button
                                    type="button"
                                    onClick={handleCopyCbu}
                                    className="p-1.5 bg-[#D4A76A]/20 text-[#D4A76A] hover:bg-[#D4A76A]/40 rounded-md transition-colors focus-ring"
                                    title="Copiar CBU"
                                    aria-label="Copiar CBU"
                                  >
                                    {copiedCbu ? <CheckCircle2 size={15} className="text-green-400" /> : <Copy size={15} />}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 text-center px-4 pb-3 italic font-serif">
                            Al confirmar tu pedido, podrás adjuntar el comprobante directamente por WhatsApp.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Footer Total & Button */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-stone-200 bg-stone-50 shrink-0">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">Total del Pedido</span>
                  <span className="text-2xl font-black text-stone-900 font-display">${total.toLocaleString('es-AR')}</span>
                </div>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-md focus-ring"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Procesando...
                    </span>
                  ) : 'Confirmar pedido por WhatsApp'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
