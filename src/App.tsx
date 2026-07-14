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
          {/* Redirigir la raíz a /mrcerdo */}
          <Route path="/" element={<Navigate to="/mrcerdo" replace />} />
          
          {/* Rutas Multi-Tenant (segmentadas por empresa) */}
          <Route path="/:empresaSlug" element={
            <CartProvider>
              <ClientHome />
            </CartProvider>
          } />
          <Route path="/admin/:empresaSlug" element={
            <CartProvider>
              <AdminDashboard />
            </CartProvider>
          } />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
