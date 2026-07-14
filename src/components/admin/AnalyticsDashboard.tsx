import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getEmpresaId } from '../../lib/getEmpresa';
import { filterMrCerdoOrders } from '../../lib/defaultCatalog';
import { TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, Users, Calendar, Activity, Receipt, LayoutList, Trophy, ArrowDownToLine, Download } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  selectedOptions?: string[];
}

interface Order {
  id: string;
  created_at: string;
  total_price?: number;
  total: number;
  status: string;
  items: OrderItem[];
  payment_method?: string;
  comment?: string;
  customer_name: string;
  customer_phone: string;
}

interface ClientStats {
  phone: string;
  name: string;
  orderCount: number;
  totalSpent: number;
}

export default function AnalyticsDashboard({ empresaSlug }: { empresaSlug: string }) {
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [prevOrders, setPrevOrders] = useState<Order[]>([]);
  const [timeFilter, setTimeFilter] = useState<'shift' | 'week' | 'month' | 'all' | 'custom'>('shift');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const id = await getEmpresaId(empresaSlug);
      if (id) {
        setEmpresaId(id);
        fetchData(id, timeFilter);
      }
    }
    init();
  }, [empresaSlug]);

  useEffect(() => {
    if (empresaId) {
      if (timeFilter === 'custom' && (!customStartDate || !customEndDate)) return;
      fetchData(empresaId, timeFilter);
    }
  }, [timeFilter, customStartDate, customEndDate]);

  const fetchData = async (eid: string, filter: string) => {
    setIsLoading(true);
    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();

    let hasPrevPeriod = filter !== 'all';

    if (filter === 'shift') {
      if (now.getHours() < 6) startDate.setDate(now.getDate() - 1);
      startDate.setHours(6, 0, 0, 0);
      
      prevEndDate = new Date(startDate);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 1);
    } else if (filter === 'week') {
      startDate.setDate(now.getDate() - 7);
      
      prevEndDate = new Date(startDate);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 7);
    } else if (filter === 'month') {
      startDate.setMonth(now.getMonth() - 1);
      
      prevEndDate = new Date(startDate);
      prevStartDate = new Date(startDate);
      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
    } else if (filter === 'custom') {
      startDate = new Date(customStartDate + 'T00:00:00');
      let endDate = new Date(customEndDate + 'T23:59:59');
      
      let query = supabase.from('orders').select('*').eq('empresa_id', eid).order('created_at', { ascending: false });
      query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
      
      const { data: currentData } = await query;
      setOrders(filterMrCerdoOrders(currentData || []));
      
      setPrevOrders([]);
      setIsLoading(false);
      return;
    }

    // Fetch Current Period
    let query = supabase.from('orders').select('*').eq('empresa_id', eid).order('created_at', { ascending: false });
    if (filter !== 'all') {
      query = query.gte('created_at', startDate.toISOString());
    }
    const { data: currentData } = await query;
    setOrders(filterMrCerdoOrders(currentData || []));

    // Fetch Previous Period
    if (hasPrevPeriod) {
      const { data: previousData } = await supabase.from('orders')
        .select('*')
        .eq('empresa_id', eid)
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', prevEndDate.toISOString());
      setPrevOrders(filterMrCerdoOrders(previousData || []));
    } else {
      setPrevOrders([]);
    }

    setIsLoading(false);
  };

  // KPIs Current
  const validOrders = orders.filter(o => o.status !== 'cancelado');
  const totalRevenue = orders.filter(o => o.status === 'entregado').reduce((sum, o) => sum + o.total, 0);
  const completedOrders = orders.filter(o => o.status === 'entregado').length;
  const pendingOrders = orders.filter(o => o.status === 'pendiente').length;
  const prepOrders = orders.filter(o => o.status === 'en_preparacion').length;
  const avgTicket = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  // Avg preparation time — estimado basado en la distribución de pedidos completados
  // (sin updated_at en DB, aproximamos por el span entre completados consecutivos)
  const completedChron = orders
    .filter(o => o.status === 'entregado')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  let avgPrepTimeFinal = 0;
  if (completedChron.length >= 3) {
    let gaps = 0;
    for (let i = 1; i < completedChron.length; i++) {
      gaps += (new Date(completedChron[i].created_at).getTime() - new Date(completedChron[i-1].created_at).getTime()) / 60000;
    }
    avgPrepTimeFinal = Math.round(gaps / (completedChron.length - 1));
  } else if (completedChron.length > 0) {
    avgPrepTimeFinal = 20; // baseline por defecto con pocos datos
  }

  // KPIs Previous
  const prevRevenue = prevOrders.filter(o => o.status === 'entregado').reduce((sum, o) => sum + o.total, 0);
  const prevCompletedOrders = prevOrders.filter(o => o.status === 'entregado').length;
  
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const revenueGrowth = calculateGrowth(totalRevenue, prevRevenue);
  const ordersGrowth = calculateGrowth(completedOrders, prevCompletedOrders);

  // Growth Badge Component
  const GrowthBadge = ({ value }: { value: number }) => {
    if (timeFilter === 'all') return null;
    const isPositive = value >= 0;
    return (
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full mt-2 w-max ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isPositive ? '+' : ''}{value}% vs Anterior
      </div>
    );
  };

  // ─── CSV Export ──────────────────────────────────────
  const csvEscape = (val: string | number): string => {
    const str = String(val);
    // Prevenir CSV injection: si empieza con = + - @, anteponer '
    const escaped = /^[=+\-@]/.test(str) ? "'" + str : str;
    // Escapar comillas dobles y wrap en quotes si contiene comas, comillas o saltos
    if (/[,"\n]/.test(escaped)) {
      return '"' + escaped.replace(/"/g, '""') + '"';
    }
    return escaped;
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Cliente', 'Teléfono', 'Productos', 'Total', 'Estado', 'Método de Pago'];
    const rows = orders.map(o => {
      const items = o.items.map((i: any) => `${i.quantity}x ${i.name}`).join('; ');
      return [
        csvEscape(new Date(o.created_at).toLocaleString('es-AR')),
        csvEscape(o.customer_name),
        csvEscape(o.customer_phone),
        csvEscape(items),
        csvEscape(o.total),
        csvEscape(o.status),
        csvEscape(getPaymentMethod(o)),
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${empresaSlug}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Top Clients
  const clientsMap: Record<string, ClientStats> = {};
  const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};

  validOrders.forEach(o => {
    // Clients
    if (!clientsMap[o.customer_phone]) {
      clientsMap[o.customer_phone] = { phone: o.customer_phone, name: o.customer_name, orderCount: 0, totalSpent: 0 };
    }
    clientsMap[o.customer_phone].orderCount += 1;
    clientsMap[o.customer_phone].totalSpent += o.total;
    clientsMap[o.customer_phone].name = o.customer_name;

    // Products
    o.items.forEach(item => {
      if (!productStats[item.name]) {
        productStats[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productStats[item.name].quantity += item.quantity;
      productStats[item.name].revenue += (item.quantity * item.price);
    });
  });

  const topClients = Object.values(clientsMap).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  
  const allProducts = Object.values(productStats).sort((a, b) => b.quantity - a.quantity);
  const topProducts = allProducts.slice(0, 5);
  // Least products (filter out things with 0 maybe? they are all > 0 if they are in orders)
  const bottomProducts = [...allProducts].reverse().slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pendiente': return <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md border border-red-200">Pendiente</span>;
      case 'en_preparacion': return <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md border border-blue-200">En Cocina</span>;
      case 'entregado': return <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded-md border border-slate-300">Entregado</span>;
      case 'cancelado': return <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2 py-1 rounded-md border border-slate-700">Cancelado</span>;
      default: return null;
    }
  };

  // ─── Chart Helpers ──────────────────────────────────────
  const getPaymentMethod = (order: Order): 'efectivo' | 'transferencia' | 'unknown' => {
    if (order.payment_method) {
      const pm = order.payment_method.toLowerCase();
      if (pm.includes('transferencia') || pm === 'transfer') return 'transferencia';
      if (pm.includes('efectivo') || pm === 'cash') return 'efectivo';
    }
    const comment = order.comment || '';
    const c = comment.toUpperCase();
    if (c.includes('[PAGA CON TRANSFERENCIA]') || c.includes('[TRANSFERENCIA]')) return 'transferencia';
    if (c.includes('[PAGA EN EFECTIVO]') || c.includes('[EFECTIVO]')) return 'efectivo';
    for (const item of order.items) {
      const text = `${item.name || ''} ${(item.selectedOptions || []).join(' ')}`.toUpperCase();
      if (text.includes('TRANSFERENCIA')) return 'transferencia';
      if (text.includes('EFECTIVO')) return 'efectivo';
    }
    return 'unknown';
  };

  // ─── Chart Data ─────────────────────────────────────────
  // Daily revenue (last 7 days from data, only 'entregado')
  const revenueByDate: Record<string, number> = {};
  orders
    .filter(o => o.status === 'entregado')
    .forEach(o => {
      const dateKey = o.created_at.split('T')[0];
      revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + o.total;
    });
  const dailyRevenueData: { label: string; total: number }[] = Object.entries(revenueByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([dateKey, total]) => {
      const [, m, d] = dateKey.split('-');
      return { label: `${d}/${m}`, total };
    });

  const maxRevenue = Math.max(...dailyRevenueData.map(d => d.total), 1);

  // Previous period daily revenue for comparison overlay
  const prevRevenueByDate: Record<string, number> = {};
  prevOrders
    .filter(o => o.status === 'entregado')
    .forEach(o => {
      const dateKey = o.created_at.split('T')[0];
      prevRevenueByDate[dateKey] = (prevRevenueByDate[dateKey] || 0) + o.total;
    });
  const prevDailyRevenueData: { label: string; total: number }[] = Object.entries(prevRevenueByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([dateKey, total]) => {
      const [, m, d] = dateKey.split('-');
      return { label: `${d}/${m}`, total };
    });
  const maxRevenueAll = Math.max(maxRevenue, ...prevDailyRevenueData.map(d => d.total), 1);

  // Payment distribution (efectivo vs transferencia)
  let efectivoCount = 0;
  let transferenciaCount = 0;
  orders.filter(o => o.status !== 'cancelado').forEach(o => {
    const method = getPaymentMethod(o);
    if (method === 'efectivo') efectivoCount++;
    else if (method === 'transferencia') transferenciaCount++;
  });
  const totalPaymentCount = efectivoCount + transferenciaCount;
  const totalPaymentPct = totalPaymentCount;

  return (
    <div className="p-8 pb-20">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Analíticas Avanzadas</h2>
          <p className="text-slate-500 mt-1">Métricas, comparativas y movimientos de {empresaSlug.toUpperCase()}</p>
        </div>
        
        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <Calendar size={18} className="text-slate-400 ml-3" />
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="p-2 bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="shift">Turno Actual (vs Ayer)</option>
              <option value="week">Últimos 7 días (vs Semana Anterior)</option>
              <option value="month">Este Mes (vs Mes Anterior)</option>
              <option value="all">Histórico Completo</option>
              <option value="custom">Rango Personalizado</option>
            </select>
          </div>
          
          {timeFilter === 'custom' && (
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200 text-sm">
              <input 
                type="date" 
                value={customStartDate} 
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-transparent text-slate-700 font-medium outline-none"
              />
              <span className="text-slate-400">hasta</span>
              <input 
                type="date" 
                value={customEndDate} 
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-transparent text-slate-700 font-medium outline-none"
              />
            </div>
          )}
          <button
            onClick={exportToCSV}
            disabled={orders.length === 0}
            aria-label="Exportar a CSV"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-primary hover:text-primary transition-all disabled:opacity-50 focus-ring"
          >
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Ingresos Brutos</p>
              <h3 className="text-2xl font-black text-slate-800">${totalRevenue.toLocaleString('es-AR')}</h3>
            </div>
          </div>
          <GrowthBadge value={revenueGrowth} />
          {/* Mini sparkline */}
          {dailyRevenueData.length > 0 && (
            <svg className="w-full h-6 mt-2" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
              <polyline
                points={dailyRevenueData.map((d, i) => {
                  const x = (i / Math.max(dailyRevenueData.length - 1, 1)) * 100;
                  const y = 20 - (d.total / maxRevenueAll) * 18;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none" stroke="#16a34a" strokeWidth="1.5"
              />
            </svg>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Receipt size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Ticket Promedio</p>
              <h3 className="text-2xl font-black text-slate-800">${Math.round(avgTicket).toLocaleString('es-AR')}</h3>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Gasto promedio por cliente</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Pendientes</p>
              <h3 className="text-2xl font-black text-slate-800">{pendingOrders}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Prep. Promedio</p>
              <h3 className="text-2xl font-black text-slate-800">{avgPrepTimeFinal} min</h3>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Tiempo estimado en cocina</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">En Preparación</p>
              <h3 className="text-2xl font-black text-slate-800">{prepOrders}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Finalizados</p>
              <h3 className="text-2xl font-black text-slate-800">{completedOrders}</h3>
            </div>
          </div>
          <GrowthBadge value={ordersGrowth} />
        </div>
      </div>

      {/* ─── CHARTS SECTION ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Chart 1: Revenue Trend Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-primary" /> Ingresos Diarios (Últimos 7 días)
          </h3>
          {dailyRevenueData.length > 0 ? (
            <div className="w-full" style={{ maxHeight: 220 }}>
              <svg
                viewBox="0 0 600 220"
                className="w-full h-auto"
                preserveAspectRatio="xMidYMid meet"
                aria-label="Gráfico de barras de ingresos diarios. Los valores se muestran en pesos argentinos por día."
                role="img"
              >
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                  const yPos = 20 + 160 * (1 - fraction);
                  return (
                    <g key={fraction}>
                      <line
                        x1={50} y1={yPos} x2={590} y2={yPos}
                        stroke="#e2e8f0" strokeWidth="1"
                      />
                      <text x={48} y={yPos + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
                        ${Math.round(maxRevenueAll * fraction).toLocaleString('es-AR')}
                      </text>
                    </g>
                  );
                })}
                {/* Bars */}
                {dailyRevenueData.map((day, i) => {
                  const barWidth = Math.max(16, (540 / dailyRevenueData.length) * 0.55);
                  const gap = (540 / dailyRevenueData.length) * 0.45;
                  const x = 50 + (540 / dailyRevenueData.length) * i + gap / 2;
                  const barH = (day.total > 0 && maxRevenueAll > 0)
                    ? (day.total / maxRevenueAll) * 160
                    : 0;
                  const y = 180 - barH;
                  return (
                    <g key={day.label}>
                      <rect
                        x={x} y={y} width={barWidth} height={barH || 1}
                        fill="#A12C25" rx="3"
                        aria-label={`${day.label}: $${day.total.toLocaleString('es-AR')}`}
                      />
                      <text
                        x={x + barWidth / 2} y={214}
                        textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="500"
                      >
                        {day.label}
                      </text>
                      {day.total > 0 && (
                        <text
                          x={x + barWidth / 2} y={y - 6}
                          textAnchor="middle" fontSize="9" fill="#334155" fontWeight="bold"
                        >
                          ${(day.total >= 1000 ? Math.round(day.total / 1000) + 'k' : day.total.toLocaleString('es-AR'))}
                        </text>
                      )}
                    </g>
                  );
                })}
                {/* Weekly comparison overlay (prev period) */}
                {prevDailyRevenueData.length > 0 && prevDailyRevenueData.length === dailyRevenueData.length && (
                  <g>
                    <polyline
                      points={prevDailyRevenueData.map((day, i) => {
                        const pointX = 50 + (540 / dailyRevenueData.length) * i + (540 / dailyRevenueData.length) / 2;
                        const barH = (day.total / maxRevenueAll) * 160;
                        const pointY = 180 - barH;
                        return `${pointX},${pointY}`;
                      }).join(' ')}
                      fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,3"
                    />
                    {prevDailyRevenueData.map((day, i) => {
                      const pointX = 50 + (540 / dailyRevenueData.length) * i + (540 / dailyRevenueData.length) / 2;
                      const barH = (day.total / maxRevenueAll) * 160;
                      const pointY = 180 - barH;
                      return (
                        <circle key={i} cx={pointX} cy={pointY} r="4" fill="#94a3b8" />
                      );
                    })}
                    <text x="470" y="20" fontSize="10" fill="#94a3b8" fontWeight="500">Semana anterior</text>
                  </g>
                )}
              </svg>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#A12C25] inline-block" />
                  Ingresos (solo entregados)
                </span>
                {prevDailyRevenueData.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-slate-400 inline-block" style={{ borderTop: '2px dashed #94a3b8' }} />
                    Semana anterior
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-slate-400 text-sm">
              Sin datos de ingresos en este periodo.
            </div>
          )}
        </div>

        {/* Chart 2: Payment Methods Donut Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Receipt size={16} className="text-primary" /> Métodos de Pago
          </h3>
          {efectivoCount + transferenciaCount > 0 ? (
            <div className="flex flex-col items-center">
              <svg
                viewBox="0 0 240 200"
                className="w-full max-w-[260px]"
                preserveAspectRatio="xMidYMid meet"
                aria-label={`Gráfico de dona de métodos de pago. Efectivo: ${efectivoCount} pedidos, Transferencia: ${transferenciaCount} pedidos.`}
                role="img"
              >
                {/* Donut */}
                <g transform="translate(10,0)">
                  {/* Background ring */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f1f5f9" strokeWidth="32" />
                  {(() => {
                    const total = efectivoCount + transferenciaCount;
                    const radius = 80;
                    const circumference = 2 * Math.PI * radius;
                    const efLength = (efectivoCount / total) * circumference;
                    const trLength = (transferenciaCount / total) * circumference;
                    return (
                      <>
                        {efectivoCount > 0 && (
                          <circle
                            cx="100" cy="100" r={radius} fill="none"
                            stroke="#16a34a" strokeWidth="32"
                            strokeDasharray={`${efLength} ${circumference - efLength}`}
                            strokeDashoffset="0"
                            transform="rotate(-90 100 100)"
                            aria-label={`Efectivo: ${efectivoCount} pedidos`}
                          />
                        )}
                        {transferenciaCount > 0 && (
                          <circle
                            cx="100" cy="100" r={radius} fill="none"
                            stroke="#2563eb" strokeWidth="32"
                            strokeDasharray={`${trLength} ${circumference - trLength}`}
                            strokeDashoffset={-efLength}
                            transform="rotate(-90 100 100)"
                            aria-label={`Transferencia: ${transferenciaCount} pedidos`}
                          />
                        )}
                      </>
                    );
                  })()}
                  {/* Center text */}
                  <text x="100" y="94" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#1e293b" fontFamily="system-ui">
                    {efectivoCount + transferenciaCount}
                  </text>
                  <text x="100" y="112" textAnchor="middle" fontSize="11" fill="#64748b" fontFamily="system-ui">
                    pedidos
                  </text>
                </g>
                {/* Legend */}
                <g transform="translate(210, 50)">
                  <rect x="0" y="0" width="14" height="14" rx="3" fill="#16a34a" />
                  <text x="20" y="12" fontSize="11" fill="#334155" fontFamily="system-ui" fontWeight="500">
                    Efectivo
                  </text>
                  <text x="20" y="26" fontSize="12" fill="#1e293b" fontFamily="system-ui" fontWeight="bold">
                    {efectivoCount} ({totalPaymentPct > 0 ? Math.round((efectivoCount / (efectivoCount + transferenciaCount)) * 100) : 0}%)
                  </text>
                  <rect x="0" y="46" width="14" height="14" rx="3" fill="#2563eb" />
                  <text x="20" y="58" fontSize="11" fill="#334155" fontFamily="system-ui" fontWeight="500">
                    Transferencia
                  </text>
                  <text x="20" y="72" fontSize="12" fill="#1e293b" fontFamily="system-ui" fontWeight="bold">
                    {transferenciaCount} ({totalPaymentPct > 0 ? Math.round((transferenciaCount / (efectivoCount + transferenciaCount)) * 100) : 0}%)
                  </text>
                </g>
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-slate-400 text-sm">
              Sin datos de pago en este periodo.
            </div>
          )}
        </div>

      </div>

      {/* Second row of charts: Status Donut + Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Status Distribution Donut */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-primary" /> Estado de Pedidos
          </h3>
          {orders.length > 0 ? (
            <div className="flex items-center justify-center gap-8">
              <svg viewBox="0 0 240 200" className="w-full max-w-[200px]" preserveAspectRatio="xMidYMid meet"
                aria-label="Distribución de estados de pedidos" role="img">
                <g transform="translate(20, 0)">
                  {/* Background ring */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f1f5f9" strokeWidth="28" />
                  {/* Status segments */}
                  {(() => {
                    const radius = 80;
                    const circumference = 2 * Math.PI * radius;
                    const total = orders.length;
                    const segments = [
                      { count: pendingOrders, color: '#ef4444', label: 'Pendiente' },
                      { count: prepOrders, color: '#3b82f6', label: 'Cocina' },
                      { count: completedOrders, color: '#22c55e', label: 'Entregado' },
                      { count: orders.filter(o => o.status === 'cancelado').length, color: '#64748b', label: 'Cancelado' },
                    ].filter(s => s.count > 0);
                    
                    let offset = 0;
                    return segments.map((seg, i) => {
                      const len = (seg.count / total) * circumference;
                      const el = (
                        <circle key={i} cx="100" cy="100" r={radius} fill="none"
                          stroke={seg.color} strokeWidth="28"
                          strokeDasharray={`${len} ${circumference - len}`}
                          strokeDashoffset={-offset}
                          transform="rotate(-90 100 100)"
                          aria-label={`${seg.label}: ${seg.count}`}
                        />
                      );
                      offset += len;
                      return el;
                    });
                  })()}
                  <text x="100" y="94" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#1e293b" fontFamily="system-ui">
                    {orders.length}
                  </text>
                  <text x="100" y="112" textAnchor="middle" fontSize="11" fill="#64748b" fontFamily="system-ui">
                    total
                  </text>
                </g>
                {/* Legend */}
                <g transform="translate(200, 30)">
                  <rect x="0" y="0" width="12" height="12" rx="2" fill="#ef4444" />
                  <text x="18" y="11" fontSize="11" fill="#334155" fontWeight="500">Pendientes: {pendingOrders}</text>
                  <rect x="0" y="26" width="12" height="12" rx="2" fill="#3b82f6" />
                  <text x="18" y="37" fontSize="11" fill="#334155" fontWeight="500">Cocina: {prepOrders}</text>
                  <rect x="0" y="52" width="12" height="12" rx="2" fill="#22c55e" />
                  <text x="18" y="63" fontSize="11" fill="#334155" fontWeight="500">Entregados: {completedOrders}</text>
                  <rect x="0" y="78" width="12" height="12" rx="2" fill="#64748b" />
                  <text x="18" y="89" fontSize="11" fill="#334155" fontWeight="500">Cancelados: {orders.filter(o => o.status === 'cancelado').length}</text>
                </g>
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-slate-400 text-sm">Sin datos.</div>
          )}
        </div>

        {/* Peak Hours Heatmap */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Clock size={16} className="text-primary" /> Horas Pico (Volumen de Pedidos)
          </h3>
          {orders.length > 0 ? (
            <div>
              {/* Compute hourly distribution */}
              {(() => {
                const hourlyCount: number[] = Array(24).fill(0);
                orders.forEach(o => {
                  try {
                    const h = new Date(o.created_at).getHours();
                    hourlyCount[h]++;
                  } catch {}
                });
                const maxHourly = Math.max(...hourlyCount, 1);
                const getIntensity = (count: number) => {
                  const ratio = count / maxHourly;
                  if (ratio === 0) return 'bg-stone-50 text-stone-400';
                  if (ratio < 0.25) return 'bg-blue-50 text-blue-700';
                  if (ratio < 0.5) return 'bg-blue-100 text-blue-800';
                  if (ratio < 0.75) return 'bg-orange-100 text-orange-800';
                  return 'bg-red-100 text-red-800';
                };
                return (
                  <div className="grid grid-cols-6 gap-1.5">
                    {hourlyCount.map((count, hour) => (
                      <div key={hour} className={`p-2 rounded-lg text-center text-xs font-bold transition-all ${getIntensity(count)}`}
                        title={`${hour}:00 - ${count} pedidos`}
                        aria-label={`${hour}:00, ${count} pedidos`}>
                        <span className="block text-[10px] opacity-70">{hour}:00</span>
                        <span className="block mt-0.5">{count}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className="flex items-center justify-center gap-3 mt-4 text-[10px] text-stone-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-50 border border-blue-200 inline-block" /> Bajo</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300 inline-block" /> Medio</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100 border border-orange-300 inline-block" /> Alto</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Pico</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-slate-400 text-sm">Sin datos de horarios.</div>
          )}
        </div>

      </div>

      {/* Rankings Grid (Clients, Top Products, Bottom Products) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Clients */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users size={16} className="text-primary" /> Mejores Clientes
            </h3>
          </div>
          {topClients.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-100">
                  {topClients.map((client, idx) => (
                    <tr key={client.phone} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono w-4">{idx+1}.</span>
                          <span className="truncate max-w-[100px]">{client.name}</span>
                        </p>
                      </td>
                      <td className="p-3 text-right">
                        <p className="font-black text-green-600 text-xs">${client.totalSpent.toLocaleString('es-AR')}</p>
                        <p className="text-[10px] text-slate-400">{client.orderCount} pedidos</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs flex-1 flex items-center justify-center">Sin datos.</div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" /> Más Vendidos
            </h3>
          </div>
          {topProducts.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-100">
                  {topProducts.map((prod, idx) => (
                    <tr key={prod.name} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono w-4">{idx+1}.</span>
                          <span className="truncate max-w-[120px]">{prod.name}</span>
                        </p>
                      </td>
                      <td className="p-3 text-right">
                        <p className="font-black text-slate-800 text-xs">{prod.quantity} un.</p>
                        <p className="text-[10px] text-green-600 font-bold">${prod.revenue.toLocaleString('es-AR')}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs flex-1 flex items-center justify-center">Sin datos.</div>
          )}
        </div>

        {/* Least Sold Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ArrowDownToLine size={16} className="text-red-500" /> Menos Vendidos
            </h3>
          </div>
          {bottomProducts.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-100">
                  {bottomProducts.map((prod, idx) => (
                    <tr key={prod.name} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono w-4">{allProducts.length - idx}.</span>
                          <span className="truncate max-w-[120px]">{prod.name}</span>
                        </p>
                      </td>
                      <td className="p-3 text-right">
                        <p className="font-black text-slate-800 text-xs">{prod.quantity} un.</p>
                        <p className="text-[10px] text-slate-400">${prod.revenue.toLocaleString('es-AR')}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs flex-1 flex items-center justify-center">Sin datos.</div>
          )}
        </div>
      </div>

      {/* DETAILED MOVEMENTS GRID */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <LayoutList size={20} className="text-primary" /> Grilla Detallada de Movimientos
          </h3>
          <span className="bg-primary/20 text-primary-hover font-bold px-3 py-1 rounded-full text-xs border border-primary/30">
            {orders.length} pedidos encontrados
          </span>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Cargando movimientos...</div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 font-bold w-32">Fecha y Hora</th>
                  <th className="p-4 font-bold w-48">Cliente</th>
                  <th className="p-4 font-bold min-w-[300px]">Detalle de Artículos</th>
                  <th className="p-4 font-bold w-32 text-center">Estado</th>
                  <th className="p-4 font-bold w-32 text-right">Monto Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-xs text-slate-500 font-mono">
                      {new Date(order.created_at).toLocaleDateString('es-AR')} <br/>
                      <span className="font-bold text-slate-700">{new Date(order.created_at).toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{order.customer_name}</p>
                      <p className="text-xs text-slate-400 font-mono">{order.customer_phone}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 max-h-20 overflow-y-auto hide-scrollbar">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex gap-2 text-xs text-slate-600">
                            <span className="font-bold text-slate-800">{item.quantity}x</span>
                            <span className="truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4 text-right font-black text-slate-800">
                      ${order.total.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <Activity size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="font-bold">No hay movimientos en este periodo.</p>
          </div>
        )}
      </div>

    </div>
  );
}
