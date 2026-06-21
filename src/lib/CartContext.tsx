import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  clearCart: () => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: { id: string; name: string; price: number }, quantity = 1, notes = '') => {
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
  };

  const removeFromCart = (id: string, notes?: string) => {
    setItems(current => current.filter(item => {
      const itemKey = item.notes ? `${item.id}-${item.notes}` : item.id;
      const removeKey = notes ? `${id}-${notes}` : id;
      return itemKey !== removeKey;
    }));
  };

  const updateQuantity = (id: string, quantity: number, notes?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, notes);
      return;
    }
    setItems(prev => prev.map(item => {
      const itemKey = item.notes ? `${item.id}-${item.notes}` : item.id;
      const targetKey = notes ? `${id}-${notes}` : id;
      return itemKey === targetKey ? { ...item, quantity } : item;
    }));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      isCartOpen,
      setIsCartOpen
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
