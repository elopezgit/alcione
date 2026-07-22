import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: { id: string; name: string; price: number }, quantity?: number, notes?: string) => void;
  removeFromCart: (id: string, notes?: string) => void;
  updateQuantity: (id: string, quantity: number, notes?: string) => void;
  updateItemNotes: (id: string, oldNotes: string | undefined, newNotes: string) => void;
  clearCart: () => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ─── Persistencia en localStorage ─── */
const DEFAULT_STORAGE_KEY = 'mrcerdo_cart';

function saveCart(items: CartItem[], key: string) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch { /* quota exceeded, silently fail */ }
}

function loadCart(key: string): CartItem[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* invalid JSON, ignore */ }
  return [];
}

interface CartProviderProps {
  children: ReactNode;
  storageKey?: string;
}

export function CartProvider({ children, storageKey }: CartProviderProps) {
  const key = storageKey || DEFAULT_STORAGE_KEY;
  const [items, setItems] = useState<CartItem[]>(() => loadCart(key));
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persistir cambios automáticamente
  useEffect(() => {
    saveCart(items, key);
  }, [items, key]);

  const addToCart = useCallback((product: { id: string; name: string; price: number }, quantity = 1, notes = '') => {
    setItems(current => {
      const cartKey = notes ? `${product.id}-${notes}` : product.id;
      
      const existing = current.find(item => (item.notes ? `${item.id}-${item.notes}` : item.id) === cartKey);
      if (existing) {
        return current.map(item => 
          (item.notes ? `${item.id}-${item.notes}` : item.id) === cartKey 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...current, { ...product, quantity, notes }];
    });
  }, []);

  const removeFromCart = useCallback((id: string, notes?: string) => {
    setItems(current => current.filter(item => {
      const itemKey = item.notes ? `${item.id}-${item.notes}` : item.id;
      const removeKey = notes ? `${id}-${notes}` : id;
      return itemKey !== removeKey;
    }));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number, notes?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, notes);
      return;
    }
    setItems(prev => prev.map(item => {
      const itemKey = item.notes ? `${item.id}-${item.notes}` : item.id;
      const targetKey = notes ? `${id}-${notes}` : id;
      return itemKey === targetKey ? { ...item, quantity } : item;
    }));
  }, [removeFromCart]);

  const updateItemNotes = useCallback((id: string, oldNotes: string | undefined, newNotes: string) => {
    setItems(prev => prev.map(item => {
      const itemKey = item.notes ? `${item.id}-${item.notes}` : item.id;
      const targetKey = oldNotes ? `${id}-${oldNotes}` : id;
      return itemKey === targetKey ? { ...item, notes: newNotes } : item;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }, []);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateItemNotes,
      clearCart,
      total,
      isCartOpen,
      setIsCartOpen,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
