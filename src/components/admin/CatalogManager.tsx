import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit, Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function CatalogManager({ empresaSlug }: { empresaSlug: string }) {
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category_id: '' });

  useEffect(() => {
    async function init() {
      const { data: empData } = await supabase.from('empresas').select('id').eq('slug', empresaSlug).maybeSingle();
      if (empData) {
        setEmpresaId(empData.id);
        fetchData(empData.id);
      }
    }
    init();
  }, [empresaSlug]);

  const fetchData = async (id: string) => {
    const [cats, prods] = await Promise.all([
      supabase.from('categories').select('*').eq('empresa_id', id).order('name'),
      supabase.from('products').select('*').eq('empresa_id', id).order('name')
    ]);
    
    if (cats.data) setCategories(cats.data);
    if (prods.data) setProducts(prods.data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return;

    const { error } = await supabase.from('products').insert({
      empresa_id: empresaId,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id || null,
      is_active: true
    });

    if (!error) {
      setIsModalOpen(false);
      setFormData({ name: '', description: '', price: '', category_id: '' });
      fetchData(empresaId);
    } else {
      alert("Error al guardar: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar producto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error && empresaId) {
      fetchData(empresaId);
    }
  };

  if (!empresaId) return <div className="p-8">Cargando gestor...</div>;

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestión de Catálogo</h2>
          <p className="text-slate-500 mt-1">Administra tus productos y categorías.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
            <tr>
              <th className="p-4 font-medium">Producto</th>
              <th className="p-4 font-medium">Categoría</th>
              <th className="p-4 font-medium">Precio</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(product => {
              const cat = categories.find(c => c.id === product.category_id);
              return (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{product.name}</p>
                    <p className="text-xs text-slate-500 truncate max-w-xs">{product.description}</p>
                  </td>
                  <td className="p-4 text-slate-600">{cat ? cat.name : '-'}</td>
                  <td className="p-4 font-bold text-slate-800">${product.price}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {product.is_active ? 'Activo' : 'Oculto'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No hay productos. Añade uno nuevo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Agregar Producto</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg h-20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio ($)</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-white">
                    <option value="">Seleccionar...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
