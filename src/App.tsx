import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientHome from './pages/ClientHome';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider } from './lib/CartContext';
import { ToastProvider } from './hooks/useToast';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirigir la raíz a /alcione */}
          <Route path="/" element={<Navigate to="/alcione" replace />} />
          
          {/* Ruta del catálogo público */}
          <Route path="/:empresaSlug" element={
            <CartProvider storageKey="alcione_cart">
              <ClientHome />
            </CartProvider>
          } />
          
          {/* Ruta del panel de administración */}
          <Route path="/admin/:empresaSlug" element={
            <CartProvider storageKey="alcione_cart">
              <AdminDashboard />
            </CartProvider>
          } />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
