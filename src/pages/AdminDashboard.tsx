import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from '../components/admin/KanbanBoard';
import CatalogManager from '../components/admin/CatalogManager';
import BannerManager from '../components/admin/BannerManager';
import { LayoutDashboard, ShoppingBag, Image as ImageIcon, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const { empresaSlug } = useParams<{ empresaSlug: string }>();
  const [activeTab, setActiveTab] = useState<'kanban' | 'catalog' | 'banners' | 'config'>('kanban');

  // Aquí luego validaremos si el usuario está logueado.

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 p-6 flex flex-col shadow-2xl z-10">
        <h1 className="text-2xl font-bold mb-2 text-primary">{empresaSlug?.toUpperCase()}</h1>
        <p className="text-xs text-slate-400 mb-8 uppercase tracking-widest font-semibold">Panel de Control</p>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('kanban')}
            className={`w-full flex items-center gap-3 text-left p-3 rounded-lg font-medium transition-colors ${activeTab === 'kanban' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <LayoutDashboard size={20} />
            Pedidos
          </button>
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`w-full flex items-center gap-3 text-left p-3 rounded-lg font-medium transition-colors ${activeTab === 'catalog' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <ShoppingBag size={20} />
            Catálogo
          </button>
          <button 
            onClick={() => setActiveTab('banners')}
            className={`w-full flex items-center gap-3 text-left p-3 rounded-lg font-medium transition-colors ${activeTab === 'banners' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <ImageIcon size={20} />
            Banners
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center gap-3 text-left p-3 rounded-lg font-medium transition-colors ${activeTab === 'config' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Settings size={20} />
            Configuración
          </button>
        </nav>
        
        <div className="mt-auto border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-500 text-center">TopeDeBar OS v1.0</p>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'kanban' && <KanbanBoard empresaSlug={empresaSlug!} />}
        {activeTab === 'catalog' && <CatalogManager empresaSlug={empresaSlug!} />}
        {activeTab === 'banners' && <BannerManager empresaSlug={empresaSlug!} />}
        {activeTab === 'config' && (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Configuración</h2>
            <p className="text-slate-500 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              Aquí pondremos más adelante la configuración del logo, teléfono, redes sociales y links de mapas de {empresaSlug}.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
