import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from '../components/admin/KanbanBoard';
import CatalogManager from '../components/admin/CatalogManager';
import BannerManager from '../components/admin/BannerManager';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import POSHome from './POSHome';
import ErrorBoundary from '../components/ErrorBoundary';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabase';
import { getEmpresaData } from '../lib/getEmpresa';
import {
  LayoutDashboard, ShoppingBag, Image as ImageIcon, Settings,
  LockKeyhole, LogOut, BarChart3, Store, Menu, X, ChevronLeft,
  Home, Clock, AlertCircle,
  Phone, MapPin, Copy, Save, DollarSign, ShoppingCart, Users, Activity, Globe
} from 'lucide-react';

type TabId = 'home' | 'analytics' | 'kanban' | 'catalog' | 'banners' | 'config' | 'pos';

const TAB_CONFIG: Record<TabId, { label: string; icon: React.ReactNode; roles: ('admin' | 'cocina' | 'operador')[]; shortcut: string }> = {
  home: { label: 'Inicio', icon: <Home size={20} />, roles: ['admin', 'cocina', 'operador'], shortcut: '1' },
  analytics: { label: 'Analíticas', icon: <BarChart3 size={20} />, roles: ['admin'], shortcut: '2' },
  kanban: { label: 'Pedidos', icon: <LayoutDashboard size={20} />, roles: ['admin', 'cocina'], shortcut: '3' },
  catalog: { label: 'Catálogo', icon: <ShoppingBag size={20} />, roles: ['admin'], shortcut: '4' },
  banners: { label: 'Banners', icon: <ImageIcon size={20} />, roles: ['admin'], shortcut: '5' },
  config: { label: 'Configuración', icon: <Settings size={20} />, roles: ['admin'], shortcut: '6' },
  pos: { label: 'Tomar Pedido', icon: <Store size={20} />, roles: ['admin', 'operador'], shortcut: '7' },
};

const KEY_MAP: Record<string, TabId> = {
  '1': 'home', '2': 'analytics', '3': 'kanban', '4': 'catalog',
  '5': 'banners', '6': 'config', '7': 'pos',
};

export default function AdminDashboard() {
  const { empresaSlug } = useParams<{ empresaSlug: string }>();
  const toast = useToast();

  const [activeTab, setActiveTabState] = useState<TabId>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<'admin' | 'cocina' | 'operador' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  // ─── URL Persistence: restore tab from localStorage ───
  const setActiveTab = useCallback((tab: TabId) => {
    setActiveTabState(tab);
    try { localStorage.setItem(`admin_tab_${empresaSlug}`, tab); } catch {}
  }, [empresaSlug]);

  // ─── Fetch pending orders count for badge ───
  useEffect(() => {
    if (!isAuthenticated || !role || !empresaSlug) return;
    let cancelled = false;

    const fetchPending = async () => {
      try {
        const empresaId = localStorage.getItem(`empresa_id_${empresaSlug}`);
        if (!empresaId) {
          const data = await getEmpresaData(empresaSlug!);
          if (data && !cancelled) {
            localStorage.setItem(`empresa_id_${empresaSlug}`, data.id);
            const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('empresa_id', data.id).eq('status', 'pendiente');
            if (!cancelled) setPendingCount(count || 0);
          }
        } else {
          const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('status', 'pendiente');
          if (!cancelled) setPendingCount(count || 0);
        }
      } catch {}
    };

    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isAuthenticated, role, empresaSlug]);

  // ─── Detectar mobile para sidebar ───
  useEffect(() => {
    const checkScreen = () => setSidebarOpen(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // ─── Restore saved tab ───
  useEffect(() => {
    if (!isAuthenticated || !role) return;
    try {
      const saved = localStorage.getItem(`admin_tab_${empresaSlug}`) as TabId | null;
      if (saved && saved in TAB_CONFIG) {
        const config = TAB_CONFIG[saved];
        if (config.roles.includes(role!)) {
          setActiveTabState(saved);
          return;
        }
      }
    } catch {}
    setDefaultTab(role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, role, empresaSlug]);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      const tabId = KEY_MAP[e.key];
      if (tabId) {
        const config = TAB_CONFIG[tabId];
        if (config.roles.includes(role!)) {
          e.preventDefault();
          setActiveTab(tabId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, role, setActiveTab]);

  const setDefaultTab = (userRole: 'admin' | 'cocina' | 'operador') => {
    if (userRole === 'admin') setActiveTabState('home');
    else if (userRole === 'cocina') setActiveTabState('kanban');
    else if (userRole === 'operador') setActiveTabState('pos');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(false);

    // Usar contraseñas desde variables de entorno (configurables por deploy)
    const adminPwd = import.meta.env.VITE_ADMIN_PASSWORD;
    const cocinaPwd = import.meta.env.VITE_COCINA_PASSWORD;
    const operadorPwd = import.meta.env.VITE_OPERADOR_PASSWORD;

    let assignedRole: 'admin' | 'cocina' | 'operador' | null = null;

    if (username === 'admin' && adminPwd && password === adminPwd) {
      assignedRole = 'admin';
    } else if (username === 'cocina' && cocinaPwd && password === cocinaPwd) {
      assignedRole = 'cocina';
    } else if (username === 'operador' && operadorPwd && password === operadorPwd) {
      assignedRole = 'operador';
    }

    if (assignedRole) {
      setIsAuthenticated(true);
      setRole(assignedRole);
      localStorage.setItem(`admin_role_${empresaSlug}`, assignedRole);
      setDefaultTab(assignedRole);
      toast.success('Inicio de sesión exitoso', `Rol: ${assignedRole}`);
    } else if (!adminPwd && !cocinaPwd && !operadorPwd) {
      setLoginError(true);
      toast.error('Configuración incompleta', 'No hay contraseñas configuradas en .env');
    } else {
      setLoginError(true);
      toast.error('Error de inicio de sesión', 'Credenciales incorrectas');
    }
    
    setIsLoading(false);
  };

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setRole(null);
    localStorage.removeItem(`admin_role_${empresaSlug}`);
    localStorage.removeItem(`admin_tab_${empresaSlug}`);
    toast.info('Sesión cerrada');
  }, [empresaSlug, toast]);

  /* ═══════ LOGIN SCREEN ═══════ */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-slate-900 to-stone-950 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-[#1A5B6B]/20 text-[#1A5B6B] rounded-full flex items-center justify-center mx-auto mb-6">
            <LockKeyhole size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Acceso Restringido</h2>
          <p className="text-stone-400 text-sm mb-8">Administración de {empresaSlug}</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Usuario" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                aria-label="Nombre de usuario"
                className="w-full bg-black/50 border border-white/10 text-white p-3 rounded-xl outline-none focus:border-[#1A5B6B] focus:ring-1 focus:ring-[#1A5B6B]/30 transition-all placeholder:text-stone-500"
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                aria-label="Contraseña"
                className="w-full bg-black/50 border border-white/10 text-white p-3 rounded-xl outline-none focus:border-[#1A5B6B] focus:ring-1 focus:ring-[#1A5B6B]/30 transition-all placeholder:text-stone-500"
              />
            </div>
            
            {loginError && <p className="text-red-400 text-xs font-bold" role="alert">Credenciales incorrectas</p>}
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#1A5B6B] to-[#2C8A9E] text-white font-black py-3 rounded-xl mt-4 active:scale-95 transition-transform disabled:opacity-70 flex justify-center items-center gap-2 focus-ring"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Verificando...
                </>
              ) : 'Entrar al Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ═══════ MAIN ADMIN LAYOUT ═══════ */
  const availableTabs = (Object.entries(TAB_CONFIG) as [TabId, typeof TAB_CONFIG[TabId]][])
    .filter(([_, config]) => config.roles.includes(role!));

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FEFCF8] flex">
        
        {/* ═══ SIDEBAR ═══ */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            bg-gradient-to-b from-stone-900 via-slate-900 to-stone-950
            text-stone-100 p-6 flex flex-col shadow-2xl
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-16 lg:translate-x-0 lg:px-2'}
          `}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-1 text-stone-400 hover:text-white focus-ring rounded"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>

          <div className={`flex items-center gap-3 mb-8 ${!sidebarOpen && 'lg:justify-center'}`}>
            <div className="w-10 h-10 rounded-xl bg-[#1A5B6B]/20 border border-[#1A5B6B]/30 flex items-center justify-center shrink-0">
              <Store size={22} className="text-[#1A5B6B]" />
            </div>
            {(sidebarOpen || window.innerWidth >= 1024) && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-lg font-black text-white leading-tight">{empresaSlug?.toUpperCase()}</h1>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" aria-hidden="true"></span>
                  {role}
                </p>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-1">
            {availableTabs.map(([tabId, config]) => (
              <button
                key={tabId}
                onClick={() => {
                  setActiveTab(tabId);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                aria-label={`${config.label} (tecla ${config.shortcut})`}
                aria-current={activeTab === tabId ? 'page' : undefined}
                className={`
                  w-full flex items-center gap-3 text-left p-3 rounded-lg font-medium transition-all relative
                  ${activeTab === tabId
                    ? 'bg-gradient-to-r from-[#1A5B6B] to-[#2C8A9E] text-white shadow-md'
                    : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
                  }
                  ${!sidebarOpen && window.innerWidth >= 1024 ? 'justify-center px-0' : ''}
                  focus-ring
                `}
                title={!sidebarOpen && window.innerWidth >= 1024 ? `${config.label} [${config.shortcut}]` : `[${config.shortcut}] ${config.label}`}
              >
                <span className="shrink-0 relative">
                  {config.icon}
                  {/* Pending orders badge on Pedidos tab */}
                  {tabId === 'kanban' && pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 shadow-lg animate-pulse" aria-label={`${pendingCount} pedidos pendientes`}>
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </span>
                {(sidebarOpen || window.innerWidth < 1024) && (
                  <span className="text-sm truncate flex items-center justify-between flex-1">
                    {config.label}
                    <span className="text-[10px] opacity-50 ml-auto tabular-nums">{config.shortcut}</span>
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-6 space-y-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex w-full items-center justify-center gap-2 text-stone-400 hover:text-white py-2 rounded-lg hover:bg-white/5 transition-colors focus-ring"
              aria-label={sidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
            >
              <ChevronLeft size={16} className={`transition-transform ${!sidebarOpen && 'rotate-180'}`} />
              {sidebarOpen && <span className="text-xs">Colapsar</span>}
            </button>

            <button
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="w-full flex items-center justify-center gap-2 bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 py-2 rounded-lg text-sm font-medium transition-colors focus-ring"
            >
              <LogOut size={16} aria-hidden="true" />
              {(sidebarOpen || window.innerWidth < 1024) && <span>Cerrar Sesión</span>}
            </button>
            
            <p className="text-[10px] text-stone-600 text-center">{(empresaSlug || 'alcione').toUpperCase()} OS v1.0</p>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* ═══ MAIN CONTENT ═══ */}
        <main className="flex-1 overflow-x-hidden relative min-w-0">
          <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-stone-200 px-4 py-3 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menú" className="p-2 rounded-lg hover:bg-stone-100 transition-colors focus-ring">
              <Menu size={20} />
            </button>
            <h1 className="font-black text-stone-900 text-lg font-display uppercase">{empresaSlug} - {role}</h1>
          </div>

          <AnimatedTab active={activeTab === 'home'}>
            <DashboardHome empresaSlug={empresaSlug!} setActiveTab={setActiveTab} />
          </AnimatedTab>
          <AnimatedTab active={activeTab === 'analytics'}>
            <AnalyticsDashboard empresaSlug={empresaSlug!} />
          </AnimatedTab>
          <AnimatedTab active={activeTab === 'kanban'}>
            <KanbanBoard empresaSlug={empresaSlug!} role={role!} />
          </AnimatedTab>
          <AnimatedTab active={activeTab === 'catalog'}>
            <CatalogManager empresaSlug={empresaSlug!} />
          </AnimatedTab>
          <AnimatedTab active={activeTab === 'banners'}>
            <BannerManager empresaSlug={empresaSlug!} />
          </AnimatedTab>
          <AnimatedTab active={activeTab === 'pos'}>
            <div className="h-screen overflow-hidden"><POSHome empresaSlug={empresaSlug!} /></div>
          </AnimatedTab>
          <AnimatedTab active={activeTab === 'config'}>
            <ConfigPanel empresaSlug={empresaSlug!} />
          </AnimatedTab>
        </main>
      </div>
    </ErrorBoundary>
  );
}

/* ════════════════════════════════════════════════════
   DASHBOARD HOME — Resumen Ejecutivo
   ════════════════════════════════════════════════════ */
function DashboardHome({ empresaSlug, setActiveTab }: { empresaSlug: string; setActiveTab: (tab: TabId) => void }) {
  const [stats, setStats] = useState({
    todayRevenue: 0, todayOrders: 0, pendingOrders: 0, prepOrders: 0,
    completedToday: 0, totalProducts: 0, recentOrders: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const empresaId = localStorage.getItem(`empresa_id_${empresaSlug}`) || (await getEmpresaData(empresaSlug))?.id;
        if (!empresaId) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();

        const [ordersRes, productsRes] = await Promise.all([
          supabase.from('orders').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false }).limit(50),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('is_active', true),
        ]);

        const orders = ordersRes.data || [];
        const todayOrders = orders.filter(o => o.created_at >= todayStr);
        const completedToday = todayOrders.filter(o => o.status === 'entregado');

        setStats({
          todayRevenue: completedToday.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
          todayOrders: todayOrders.length,
          pendingOrders: orders.filter(o => o.status === 'pendiente').length,
          prepOrders: orders.filter(o => o.status === 'en_preparacion').length,
          completedToday: completedToday.length,
          totalProducts: productsRes.count || 0,
          recentOrders: orders.slice(0, 8),
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [empresaSlug]);

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="h-8 w-64 bg-stone-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-stone-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-stone-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-20">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-stone-800">Panel de Control</h2>
        <p className="text-stone-500 mt-1">Resumen rápido de {empresaSlug.toUpperCase()}</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<DollarSign size={22} />}
          label="Ingresos Hoy"
          value={`$${stats.todayRevenue.toLocaleString('es-AR')}`}
          bg="bg-green-50 text-green-600"
        />
        <StatCard
          icon={<ShoppingCart size={22} />}
          label="Pedidos Hoy"
          value={stats.todayOrders.toString()}
          sub={`${stats.completedToday} completados`}
          bg="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={<AlertCircle size={22} />}
          label="Pendientes"
          value={stats.pendingOrders.toString()}
          sub={`${stats.prepOrders} en cocina`}
          bg="bg-red-50 text-red-600"
          highlight={stats.pendingOrders > 0}
        />
        <StatCard
          icon={<Users size={22} />}
          label="Productos Activos"
          value={stats.totalProducts.toString()}
          bg="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Quick Actions + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h3 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-primary" /> Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <QuickActionBtn
              icon={<Store size={18} />}
              label="Tomar Pedido"
              shortcut="7"
              onClick={() => setActiveTab('pos')}
              color="bg-[#1A5B6B]/10 text-[#1A5B6B]"
            />
            <QuickActionBtn
              icon={<LayoutDashboard size={18} />}
              label="Ver Pedidos"
              shortcut="3"
              onClick={() => setActiveTab('kanban')}
              color="bg-blue-50 text-blue-600"
            />
            <QuickActionBtn
              icon={<BarChart3 size={18} />}
              label="Ver Analíticas"
              shortcut="2"
              onClick={() => setActiveTab('analytics')}
              color="bg-green-50 text-green-600"
            />
            <QuickActionBtn
              icon={<ShoppingBag size={18} />}
              label="Gestionar Catálogo"
              shortcut="4"
              onClick={() => setActiveTab('catalog')}
              color="bg-purple-50 text-purple-600"
            />
            <QuickActionBtn
              icon={<Settings size={18} />}
              label="Configuración"
              shortcut="6"
              onClick={() => setActiveTab('config')}
              color="bg-stone-50 text-stone-600"
            />
          </div>
          <p className="text-[10px] text-stone-400 text-center mt-4">Usá las teclas 1-7 para cambiar de sección</p>
        </div>

        {/* Recent Orders Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h3 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-primary" /> Últimos Pedidos
          </h3>
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {stats.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 hover:bg-white hover:border-stone-200 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      order.status === 'pendiente' ? 'bg-red-500 animate-pulse' :
                      order.status === 'en_preparacion' ? 'bg-blue-500' :
                      order.status === 'entregado' ? 'bg-green-500' : 'bg-stone-400'
                    }`} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-stone-800 truncate">{order.customer_name}</p>
                      <p className="text-[10px] text-stone-500 font-mono">
                        {new Date(order.created_at).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-stone-500 uppercase">
                      {order.status === 'pendiente' ? 'Pendiente' :
                       order.status === 'en_preparacion' ? 'Cocina' :
                       order.status === 'entregado' ? 'Listo' : 'Cancelado'}
                    </span>
                    <span className="font-black text-stone-800">${order.total?.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-stone-400 text-sm">Aún no hay pedidos registrados.</div>
          )}
          {stats.recentOrders.length > 0 && (
            <button
              onClick={() => setActiveTab('kanban')}
              className="w-full mt-4 py-2 text-center text-sm font-bold text-primary hover:bg-[#1A5B6B]/5 rounded-xl transition-colors focus-ring"
            >
              Ver todos los pedidos →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ Stat Card ═══ */
function StatCard({ icon, label, value, sub, bg, highlight }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
  bg: string; highlight?: boolean;
}) {
  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border ${highlight ? 'border-red-300 bg-red-50/30' : 'border-stone-200'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-stone-500 text-xs font-medium uppercase tracking-wider mb-0.5">{label}</p>
          <h3 className="text-2xl font-black text-stone-800">{value}</h3>
          {sub && <p className="text-[10px] text-stone-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

/* ═══ Quick Action Button ═══ */
function QuickActionBtn({ icon, label, shortcut, onClick, color }: {
  icon: React.ReactNode; label: string; shortcut: string; onClick: () => void; color: string;
}) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-3 rounded-xl ${color} hover:brightness-95 transition-all focus-ring`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-bold text-sm">{label}</span>
      </div>
      <span className="text-[10px] opacity-60 font-mono font-bold">[{shortcut}]</span>
    </button>
  );
}

/* ════════════════════════════════════════════════════
   CONFIG PANEL — Configuración funcional de la empresa
   ════════════════════════════════════════════════════ */
function ConfigPanel({ empresaSlug }: { empresaSlug: string }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    name: '', phone: '', instagram_url: '', maps_url: '', alias: '', cbu: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const empresaId = localStorage.getItem(`empresa_id_${empresaSlug}`) || (await getEmpresaData(empresaSlug))?.id;
        if (!empresaId) return;
        
        const { data } = await supabase.from('empresas').select('*').eq('id', empresaId).single();
        if (data) {
          setConfig({
            name: data.name || '',
            phone: data.phone || '',
            instagram_url: data.instagram_url || '',
            maps_url: data.maps_url || '',
            alias: data.alias || 'alcione.mp',
            cbu: data.cbu || '',
          });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [empresaSlug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const empresaId = localStorage.getItem(`empresa_id_${empresaSlug}`);
      if (!empresaId) { toast.error('Error', 'No se encontró la empresa.'); return; }

      const { error } = await supabase.from('empresas').update({
        name: config.name,
        phone: config.phone,
        instagram_url: config.instagram_url,
        maps_url: config.maps_url,
        alias: config.alias,
        cbu: config.cbu,
      }).eq('id', empresaId);

      if (error) throw error;
      toast.success('Configuración guardada');
    } catch (err: any) {
      toast.error('Error al guardar', err.message);
    }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="p-8 animate-pulse"><div className="h-8 w-64 bg-stone-200 rounded mb-8" /><div className="h-96 bg-stone-200 rounded-2xl" /></div>;
  }

  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-stone-800">Configuración de {empresaSlug.toUpperCase()}</h2>
        <p className="text-stone-500 mt-1">Administrá los datos de tu empresa.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Nombre de la Empresa" value={config.name} onChange={v => setConfig({...config, name: v})} />
          <Field label="Teléfono (WhatsApp)" value={config.phone} onChange={v => setConfig({...config, phone: v})} placeholder="+549381..." icon={<Phone size={14} />} />
          <Field label="Instagram URL" value={config.instagram_url} onChange={v => setConfig({...config, instagram_url: v})} placeholder="https://instagram.com/..." icon={<Globe size={14} />} />
          <Field label="Google Maps URL" value={config.maps_url} onChange={v => setConfig({...config, maps_url: v})} placeholder="https://maps.google.com/..." icon={<MapPin size={14} />} />
          <Field label="Alias de Transferencia" value={config.alias} onChange={v => setConfig({...config, alias: v})} icon={<Copy size={14} />} />
          <Field label="CBU / CVU" value={config.cbu} onChange={v => setConfig({...config, cbu: v})} icon={<DollarSign size={14} />} />
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1A5B6B] to-[#2C8A9E] text-white font-black px-6 py-3 rounded-xl shadow-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-70 focus-ring"
          >
            {saving ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg> Guardando...</>
            ) : (
              <><Save size={18} /> Guardar Cambios</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
        {icon}{label}
      </label>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xl p-3 text-sm outline-none focus:bg-white focus:border-[#1A5B6B] focus:ring-2 focus:ring-[#1A5B6B]/15 transition-all"
      />
    </div>
  );
}

/* ═══ Animated Tab Wrapper ═══ */
function AnimatedTab({ active, children }: { active: boolean; children: React.ReactNode }) {
  if (!active) return null;
  return <div className="animate-fade-in">{children}</div>;
}
