import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getEmpresaId } from '../../lib/getEmpresa';
// No se necesita filtro adicional — Alcione es el único tenant
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Search, X } from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';
import { useToast } from '../../hooks/useToast';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  delivery_address?: string;
  total_price?: number;
  total?: number;
  status: string;
  created_at: string;
  notes?: string;
  comment?: string;
  payment_method?: string;
  items: any[];
}

const COLUMNS = [
  { id: 'pendiente', title: 'Nuevos (Pendiente)', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  { id: 'en_preparacion', title: 'En Cocina / Armado', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { id: 'en_camino', title: 'En Delivery', color: 'bg-purple-50 border-purple-200 text-purple-800' },
  { id: 'entregado', title: 'Finalizados', color: 'bg-green-50 border-green-200 text-green-800' }
];

export default function KanbanBoard({ empresaSlug, role }: { empresaSlug: string, role?: string }) {
  const toast = useToast();
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function init() {
      const id = await getEmpresaId(empresaSlug);
      if (id) {
        setEmpresaId(id);
        fetchOrders(id);
      }
    }
    init();
  }, [empresaSlug]);

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    if (!empresaId) return;
    
    const interval = setInterval(() => {
      fetchOrders(empresaId);
    }, 120000);

    return () => clearInterval(interval);
  }, [empresaId]);

  const fetchOrders = async (id: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('empresa_id', id)
      .order('created_at', { ascending: false });
    setOrders((arr => arr)(data || []));
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const deleteOrder = async (orderId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (!error) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        setSelectedOrder(null);
        toast.success('Pedido eliminado', 'El pedido se eliminó correctamente.');
      } else {
        toast.error('Error', 'No se pudo eliminar el pedido.');
      }
    }
  };

  const updateOrderData = async (orderId: string, updatedData: any) => {
    const { error } = await supabase.from('orders').update(updatedData).eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updatedData } : o));
      setSelectedOrder(prev => prev ? { ...prev, ...updatedData } : null);
      toast.success('Pedido actualizado', 'Los cambios se guardaron correctamente.');
    } else {
      toast.error('Error', 'No se pudo actualizar el pedido.');
    }
  };

  const filteredOrders = orders.filter(order =>
    searchTerm === '' ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !empresaId) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      // Optimistic UI Update
      setOrders(prev => prev.map(o => o.id === draggableId ? { ...o, status: destination.droppableId } : o));

      // Update in Supabase
      await supabase
        .from('orders')
        .update({ status: destination.droppableId })
        .eq('id', draggableId);
    }
  };

  if (!empresaId) return <div className="p-8">Cargando tablero...</div>;

  return (
    <div className="p-8 h-screen flex flex-col">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Tablero de Pedidos</h2>
          <p className="text-slate-500 mt-1">Arrastra las tarjetas para cambiar su estado.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o ID..."
              aria-label="Buscar pedidos por nombre de cliente o ID de orden"
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-200 transition-colors focus-ring"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} className="text-slate-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => fetchOrders(empresaId)}
            className="text-sm bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg font-medium transition-colors focus-ring"
            aria-label="Refrescar pedidos"
          >
            🔄 Refrescar
          </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full items-start min-w-max">
            {COLUMNS.map(col => {
              const columnOrders = filteredOrders.filter(o => o.status === col.id);
              return (
                <div key={col.id} className="w-80 bg-slate-200/50 rounded-xl p-4 flex flex-col max-h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700">{col.title}</h3>
                    <span className="bg-slate-300 text-slate-700 text-xs font-bold px-2 py-1 rounded-full">{columnOrders.length}</span>
                  </div>
                  
                  <Droppable droppableId={col.id}>
                    {(provided) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="flex-1 overflow-y-auto space-y-3 min-h-[150px]"
                      >
                        {columnOrders.map((order, index) => (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                role="button"
                                tabIndex={0}
                                className={`group bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md hover:border-primary transition-all focus-ring ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : 'border-slate-200'}`}
                                onClick={() => setSelectedOrder(order)}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedOrder(order); } }}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-mono text-slate-400">#{order.id.split('-')[0].toUpperCase()}</span>
                                  <span className="font-bold text-primary">${order.total}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg">{order.customer_name}</h4>
                                <p className="text-sm text-slate-600">📞 {order.customer_phone}</p>
                                {order.delivery_address && (
                                  <p className="text-sm text-slate-600 mt-1">📍 {order.delivery_address}</p>
                                )}
                                
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <p className="text-xs font-semibold text-slate-500 mb-1">Detalle:</p>
                                  <ul className="text-sm text-slate-700 space-y-1">
                                    {order.items.map((item: any, i: number) => (
                                      <li key={i}>• {item.quantity}x {item.name}</li>
                                    ))}
                                  </ul>
                                </div>

                                {order.comment && (
                                  <div className="mt-3 bg-yellow-50 text-yellow-800 p-2 rounded text-sm border border-yellow-200">
                                    <span className="font-bold block text-xs mb-1">Comentario:</span>
                                    {order.comment}
                                  </div>
                                )}

                                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                                  <a 
                                    href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=Hola%20${order.customer_name},%20te%20escribimos%20por%20tu%20pedido%20(Orden%20%23${order.id.split('-')[0].toUpperCase()})`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-md font-medium transition-colors focus-ring"
                                    aria-label={`Contactar por WhatsApp a ${order.customer_name}`}
                                  >
                                    Contactar WhatsApp
                                  </a>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateOrderStatus}
          onDelete={role === 'admin' ? () => deleteOrder(selectedOrder.id) : undefined}
          onUpdate={role === 'admin' ? (updatedData) => updateOrderData(selectedOrder.id, updatedData) : undefined}
        />
      )}
    </div>
  );
}
