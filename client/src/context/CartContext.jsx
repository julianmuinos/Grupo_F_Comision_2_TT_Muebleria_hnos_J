import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { getProductoId } from '../api/productos';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'hnosj_cart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persistir carrito en localStorage ante cualquier modificación
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error al guardar el carrito en localStorage:', e);
    }
  }, [cart]);

  // Cantidad total de unidades en el carrito
  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + (Number(item.cantidad) || 0), 0),
    [cart]
  );

  // Total monetario acumulado del carrito
  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (Number(item.precio) || 0) * (Number(item.cantidad) || 0),
        0
      ),
    [cart]
  );

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback((product, quantityToAdd = 1) => {
    const prodId = getProductoId(product);
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => getProductoId(item) === prodId
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentItem = updated[existingIndex];
        const newQty = Math.min(
          product.stock || 99,
          currentItem.cantidad + quantityToAdd
        );
        updated[existingIndex] = { ...currentItem, cantidad: newQty };
        return updated;
      }

      return [
        ...prevCart,
        {
          ...product,
          id: prodId,
          cantidad: Math.min(product.stock || 99, quantityToAdd),
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (getProductoId(item) === productId) {
            const nuevaCantidad = item.cantidad + delta;
            return nuevaCantidad > 0
              ? {
                  ...item,
                  cantidad: Math.min(item.stock || 99, nuevaCantidad),
                }
              : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => getProductoId(item) !== productId)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const syncCartWithProductMutation = useCallback((action, payload) => {
    if (action === 'delete' && payload) {
      setCart((prevCart) =>
        prevCart.filter((item) => getProductoId(item) !== payload)
      );
    } else if (action === 'update' && payload) {
      const updatedId = getProductoId(payload);
      setCart((prevCart) =>
        prevCart.map((item) =>
          getProductoId(item) === updatedId
            ? { ...item, ...payload, id: updatedId }
            : item
        )
      );
    }
  }, []);

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartTotal,
      isCartOpen,
      setIsCartOpen,
      openCart,
      closeCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      syncCartWithProductMutation,
    }),
    [
      cart,
      cartCount,
      cartTotal,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      syncCartWithProductMutation,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  return useContext(CartContext);
};

export default CartContext;
