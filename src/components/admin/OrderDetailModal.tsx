import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { Clock, MapPin, Phone, User, MessageSquare, Utensils, CheckCircle, X, Printer, Edit, Trash2, Save, Plus, Minus, Eye } from 'lucide-react';

interface OrderDetailModalProps {
  order: any;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onDelete?: () => void;
  onUpdate?: (updatedData: any) => void;
}

export default function OrderDetailModal({ order, onClose, onStatusChange, onDelete, onUpdate }: OrderDetailModalProps) {
  if (!order) return null;

  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [editedData, setEditedData] = useState({
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    delivery_address: order.delivery_address,
    comment: order.comment
  });
  const [editedItems, setEditedItems] = useState(order.items || []);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (isEditing && products.length === 0 && order.empresa_id) {
      supabase.from('products').select('*').eq('empresa_id', order.empresa_id).eq('is_active', true)
        .then(({ data }) => {
          if (data) setProducts(data);
        });
    }
  }, [isEditing, order.empresa_id, products.length]);

  const isPOS = order.customer_name === 'Pedido en Caja';

  const handleUpdateItemQty = (index: number, delta: number) => {
    const newItems = [...editedItems];
    newItems[index].quantity += delta;
    if (newItems[index].quantity <= 0) {
      newItems.splice(index, 1);
    }
    setEditedItems(newItems);
  };

  const handleUpdateItemNote = (index: number, note: string) => {
    const newItems = [...editedItems];
    newItems[index].notes = note;
    setEditedItems(newItems);
  };

  const handleAddItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value;
    if (!prodId) return;
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setEditedItems([...editedItems, { ...prod, quantity: 1, notes: '' }]);
    }
    e.target.value = '';
  };

  const handleSave = () => {
    if (onUpdate) {
      const newTotal = editedItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
      onUpdate({ ...editedData, items: editedItems, total: newTotal });
      setIsEditing(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) throw error;
      onStatusChange(order.id, newStatus);
      onClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error', 'No se pudo actualizar el estado del pedido.');
    }
  };

  const handlePrint = () => {
    setIsPrintPreviewOpen(true);
  };

  // HTML-escape para prevenir XSS en la ventana de impresión
  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, c => map[c] || c);
  };

  const generatePrintHtml = (items: any[], comment: string, isPOSOrder: boolean) => {
    const itemsHtml = items.map((item: any) => `
      <div style="margin-bottom: 8px;">
        <div style="font-size: 16px; font-weight: bold;">${escapeHtml(String(item.quantity))}x ${escapeHtml(String(item.name))}</div>
        ${item.notes ? `<div style="margin-left: 15px; font-size: 14px; font-weight: bold;">* ${escapeHtml(String(item.notes))}</div>` : ''}
      </div>
    `).join('');

    const generalNoteHtml = comment ? `
      <div style="border-top: 1px dashed black; margin: 10px 0;"></div>
      <div style="font-weight: bold;">NOTAS GENERALES:</div>
      <div style="font-weight: bold; font-size: 14px;">${escapeHtml(comment)}</div>
    ` : '';

    const customerName = escapeHtml(order.customer_name || '');
    const deliveryAddress = order.delivery_address ? escapeHtml(order.delivery_address) : null;

    return `
      <html>
        <head>
          <title>Comanda #${escapeHtml(order.id.slice(0,4).toUpperCase())}</title>
          <style>
            body { 
              font-family: monospace; 
              padding: 10px; 
              margin: 0; 
              width: 80mm; 
              color: black; 
            }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>
          <h2 style="text-align: center; margin: 0 0 10px 0; font-size: 24px;">COMANDA</h2>
          <div style="font-size: 18px; font-weight: bold; text-align: center; border: 2px solid black; padding: 5px; margin-bottom: 10px;">
            #${escapeHtml(order.id.slice(0, 4).toUpperCase())}
          </div>
          <div style="font-size: 14px; margin-bottom: 5px;"><strong>Fecha:</strong> ${escapeHtml(new Date(order.created_at).toLocaleString('es-AR'))}</div>
          <div style="font-size: 14px; margin-bottom: 5px;"><strong>Cliente:</strong> ${customerName}</div>
          <div style="font-size: 14px; margin-bottom: 10px;"><strong>Tipo:</strong> ${isPOSOrder ? 'Pedido en Local' : (deliveryAddress ? 'Delivery' : 'Retira por local')}</div>
          
          <div style="border-top: 1px dashed black; margin: 10px 0;"></div>
          
          ${itemsHtml}
          ${generalNoteHtml}
          
          <div style="border-top: 1px dashed black; margin: 15px 0;"></div>
          <div style="text-align: center; font-size: 12px; margin-top: 20px;">
            - FIN DE COMANDA -
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          <\/script>
        </body>
      </html>
    `;
  };

  const doPrint = () => {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (printWindow) {
      printWindow.document.write(generatePrintHtml(order.items, order.comment || '', isPOS));
      printWindow.document.close();
    }
    setIsPrintPreviewOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-start text-white">
          <div>
            <h2 className="text-3xl font-black mb-1 flex items-center gap-3">
              <span className="bg-primary text-black px-3 py-1 rounded-lg text-lg">
                #{order.id.slice(0, 4).toUpperCase()}
              </span>
              {isPOS ? 'Pedido de Caja (Local)' : 'Pedido Delivery/Retiro'}
            </h2>
            <p className="text-slate-400 font-bold flex items-center gap-2">
              <Clock size={16} /> 
              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing && onUpdate && (
              <button onClick={() => setIsEditing(true)} aria-label="Editar pedido" className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 hover:text-primary transition-colors text-slate-300 focus-ring">
                <Edit size={24} aria-hidden="true" />
              </button>
            )}
            {!isEditing && onDelete && (
              <button onClick={onDelete} aria-label="Eliminar pedido" className="bg-slate-800 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors text-slate-300 focus-ring">
                <Trash2 size={24} aria-hidden="true" />
              </button>
            )}
            <button onClick={handlePrint} aria-label="Vista previa de impresión" className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 hover:text-primary transition-colors text-slate-300 focus-ring">
              <Eye size={24} aria-hidden="true" />
            </button>
            <button onClick={onClose} aria-label="Cerrar" className="bg-slate-800 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors text-slate-300 focus-ring">
              <X size={24} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
          {/* Customer Info (only if not POS) */}
          {!isPOS && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Cliente</span>
                {isEditing ? (
                  <input type="text" value={editedData.customer_name} onChange={e => setEditedData({...editedData, customer_name: e.target.value})} className="w-full border border-slate-300 rounded p-1 outline-none focus:border-primary" />
                ) : (
                  <div className="font-bold text-slate-800 flex items-center gap-2"><User size={16} className="text-slate-400" /> {order.customer_name}</div>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Teléfono</span>
                {isEditing ? (
                  <input type="text" value={editedData.customer_phone} onChange={e => setEditedData({...editedData, customer_phone: e.target.value})} className="w-full border border-slate-300 rounded p-1 outline-none focus:border-primary" />
                ) : (
                  <div className="font-bold text-slate-800 flex items-center gap-2"><Phone size={16} className="text-slate-400" /> {order.customer_phone}</div>
                )}
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Dirección</span>
                {isEditing ? (
                  <input type="text" value={editedData.delivery_address || ''} onChange={e => setEditedData({...editedData, delivery_address: e.target.value})} className="w-full border border-slate-300 rounded p-1 outline-none focus:border-primary" />
                ) : (
                  <div className="font-bold text-slate-800 flex items-center gap-2"><MapPin size={16} className="text-slate-400" /> {order.delivery_address || 'Retira por el local'}</div>
                )}
              </div>
            </div>
          )}

          {/* General Comments */}
          {(order.comment || isEditing) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 shadow-sm">
              <h3 className="font-black text-yellow-800 mb-2 flex items-center gap-2"><MessageSquare size={18} /> Aclaraciones Generales</h3>
              {isEditing ? (
                <textarea value={editedData.comment || ''} onChange={e => setEditedData({...editedData, comment: e.target.value})} className="w-full border border-yellow-300 bg-white rounded p-2 text-yellow-900 outline-none focus:border-yellow-500" rows={2} />
              ) : (
                <p className="text-yellow-900 font-bold text-lg leading-relaxed">{order.comment}</p>
              )}
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils size={18} className="text-slate-500" />
                <h3 className="font-black text-slate-800 uppercase tracking-wide">Productos a Preparar</h3>
              </div>
              {isEditing && products.length > 0 && (
                <select onChange={handleAddItem} className="border border-slate-300 rounded px-2 py-1 text-sm bg-white outline-none focus:border-primary font-bold text-slate-700">
                  <option value="">+ Añadir producto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                  ))}
                </select>
              )}
            </div>
            <ul className="divide-y divide-slate-100">
              {(isEditing ? editedItems : order.items).map((item: any, idx: number) => (
                <li key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {isEditing ? (
                      <div className="flex flex-col items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-inner">
                        <button onClick={() => handleUpdateItemQty(idx, 1)} className="p-1 hover:bg-slate-200 rounded text-slate-600"><Plus size={16} /></button>
                        <span className="font-black text-lg w-6 text-center">{item.quantity}</span>
                        <button onClick={() => handleUpdateItemQty(idx, -1)} className="p-1 hover:bg-slate-200 rounded text-slate-600"><Minus size={16} /></button>
                      </div>
                    ) : (
                      <div className="bg-slate-800 text-white w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                        {item.quantity}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xl font-black text-slate-800 mb-1 leading-none">{item.name}</h4>
                        {isEditing && (
                           <button onClick={() => {
                             const newItems = [...editedItems];
                             newItems.splice(idx, 1);
                             setEditedItems(newItems);
                           }} className="text-red-400 hover:text-red-600 p-1 bg-red-50 hover:bg-red-100 rounded">
                             <Trash2 size={18} />
                           </button>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={item.notes || ''} 
                          onChange={(e) => handleUpdateItemNote(idx, e.target.value)} 
                          placeholder="Nota para cocina (opcional)" 
                          className="w-full mt-2 border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-red-400"
                        />
                      ) : (
                        item.notes && (
                          <div className="inline-block mt-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg border border-red-200 shadow-sm">
                            <span className="font-bold text-xs uppercase tracking-wider text-red-500 block mb-0.5">Nota para cocina:</span>
                            <span className="font-black text-lg leading-tight block">{item.notes}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {isEditing && editedItems.length === 0 && (
                <li className="p-4 text-center text-slate-500 font-bold">No hay productos en el pedido.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-slate-200">
          {isEditing ? (
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black py-4 rounded-xl text-lg transition-colors">Cancelar</button>
              <button onClick={handleSave} className="flex-1 bg-primary hover:bg-yellow-400 text-black font-black py-4 rounded-xl text-lg shadow-lg flex items-center justify-center gap-2"><Save size={24} /> Guardar Cambios</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {order.status === 'pendiente' && (
                <button 
                  onClick={() => handleUpdateStatus('en_preparacion')}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black py-4 rounded-xl text-lg shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Comenzar a Preparar
                </button>
              )}
              
              {order.status === 'en_preparacion' && (
                <button 
                  onClick={() => handleUpdateStatus('entregado')}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl text-lg shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={24} /> Marcar como Listo
                </button>
              )}

              {order.status === 'entregado' && (
                <div className="flex-1 text-center font-black text-green-600 bg-green-50 py-4 rounded-xl border border-green-200">
                  ¡Pedido Terminado y Entregado!
                </div>
              )}

              {order.status === 'cancelado' && (
                <div className="flex-1 text-center font-black text-red-600 bg-red-50 py-4 rounded-xl border border-red-200">
                  Pedido Cancelado
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* ═══ PRINT PREVIEW MODAL ═══ */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[300]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-stone-900 p-4 text-white flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Printer size={20} /> Vista Previa de Comanda
              </h2>
              <button
                onClick={() => setIsPrintPreviewOpen(false)}
                aria-label="Cerrar vista previa"
                className="p-1 hover:bg-white/20 rounded-lg transition-colors focus-ring"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Print Preview Content */}
            <div className="p-6 bg-stone-50 overflow-y-auto flex-1">
              <div className="bg-white border-2 border-dashed border-stone-300 p-4 max-w-[320px] mx-auto shadow-inner" style={{ fontFamily: 'monospace' }}>
                <h3 className="text-center text-xl font-bold mb-2" style={{ fontFamily: 'monospace' }}>COMANDA</h3>
                <div className="text-center font-bold text-lg border-2 border-black p-2 mb-3" style={{ fontFamily: 'monospace' }}>
                  #{order.id.slice(0, 4).toUpperCase()}
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: 14, marginBottom: 4 }}>
                  <strong>Fecha:</strong> {new Date(order.created_at).toLocaleString('es-AR')}
                </p>
                <p style={{ fontFamily: 'monospace', fontSize: 14, marginBottom: 4 }}>
                  <strong>Cliente:</strong> {order.customer_name}
                </p>
                <p style={{ fontFamily: 'monospace', fontSize: 14, marginBottom: 10 }}>
                  <strong>Tipo:</strong> {isPOS ? 'Pedido en Local' : (order.delivery_address ? 'Delivery' : 'Retira por local')}
                </p>
                
                <div className="border-t-2 border-dashed border-stone-300 my-3" />
                
                {(isEditing ? editedItems : order.items).map((item: any, i: number) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold' }}>
                      {item.quantity}x {item.name}
                    </div>
                    {item.notes && (
                      <div style={{ marginLeft: 15, fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold' }}>
                        * {item.notes}
                      </div>
                    )}
                  </div>
                ))}

                {(isEditing ? editedData.comment : order.comment) && (
                  <>
                    <div className="border-t-2 border-dashed border-stone-300 my-3" />
                    <p style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>NOTAS GENERALES:</p>
                    <p style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold' }}>{(isEditing ? editedData.comment : order.comment)}</p>
                  </>
                )}

                <div className="border-t-2 border-dashed border-stone-300 my-4" />
                <p className="text-center" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                  - FIN DE COMANDA -
                </p>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-stone-200 flex gap-3">
              <button
                onClick={() => setIsPrintPreviewOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors focus-ring"
              >
                Cancelar
              </button>
              <button
                onClick={doPrint}
                className="flex-1 py-3 rounded-xl font-black text-white bg-primary hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg focus-ring"
              >
                <Printer size={18} /> Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
