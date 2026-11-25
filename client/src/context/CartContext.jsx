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
const DEFAULT_MAX_STOCK = 99;

/**
 * Resuelve el límite de stock disponible para un producto.
 */
const resolveMaxStock = (item) => {
  const parsed = Number(item?.stock);
  if (item?.stock !== undefined && item?.stock !== null && Number.isFinite(parsed) && parsed >= 0) {
    return Math.floor(parsed);
  }
  return DEFAULT_MAX_STOCK;
};

/**
 * Normaliza la estructura de un ítem del carrito conservando compatibilidad
 * con nombres de campos en español e inglés.
 */
const normalizeCartItem = (product, quantity) => {
  const prodId = getProductoId(product);
  const precio = Number(product?.precio ?? product?.price ?? 0);
  const nombre = product?.nombre || product?.title || product?.name || 'Mueble Hermanos Jota';
  const imagenUrl =
    product?.imagenUrl || product?.imagen || product?.image || product?.foto || '';

  return {
    ...product,
    id: prodId,
    _id: product?._id ?? prodId,
    nombre,
    precio: Number.isFinite(precio) ? precio : 0,
    imagenUrl,
    cantidad: quantity,
  };
};

/**
 * Lee y sanea el carrito guardado en localStorage para evitar fallos
 * ante datos corruptos o versiones previas.
 */
const loadStoredItems = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && getProductoId(item) != null)
      .map((item) => {
        const qty = Math.floor(Number(item.cantidad) || 0);
        if (qty <= 0) return null;
        return normalizeCartItem(item, Math.min(resolveMaxStock(item) || DEFAULT_MAX_STOCK, qty));
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadStoredItems);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persistir carrito en localStorage ante cualquier modificación
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error al guardar el carrito en localStorage:', e);
    }
  }, [items]);

  // Cantidad total de unidades en el carrito
  const totalItems = useMemo(
    () => items.reduce((total, item) => total + (Number(item.cantidad) || 0), 0),
    [items]
  );

  // Total monetario acumulado del carrito
  const totalPrice = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (Number(item.precio ?? item.price) || 0) * (Number(item.cantidad) || 0),
        0
      ),
    [items]
  );

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  /**
   * Agrega un producto al carrito o incrementa su cantidad respetando el stock.
   */
  const addItem = useCallback((product, quantityToAdd = 1) => {
    const prodId = getProductoId(product);
    if (prodId == null) return;

    const maxStock = resolveMaxStock(product);
    if (maxStock <= 0) return;

    const qty = Math.max(1, Math.floor(Number(quantityToAdd) || 1));

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => String(getProductoId(item)) === String(prodId)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const currentItem = updated[existingIndex];
        const targetMax = resolveMaxStock(product) || resolveMaxStock(currentItem);
        const newQty = Math.min(targetMax, (Number(currentItem.cantidad) || 0) + qty);
        updated[existingIndex] = normalizeCartItem({ ...currentItem, ...product }, newQty);
        return updated;
      }

      return [...prevItems, normalizeCartItem(product, Math.min(maxStock, qty))];
    });
  }, []);

  /**
   * Elimina un producto del carrito por su identificador.
   */
  const removeItem = useCallback((productId) => {
    if (productId == null) return;
    setItems((prevItems) =>
      prevItems.filter((item) => String(getProductoId(item)) !== String(productId))
    );
  }, []);

  /**
   * Actualiza la cantidad exacta de un producto en el carrito.
   * Si la nueva cantidad es <= 0, elimina el producto.
   */
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (productId == null) return;
    const parsedQty = Math.floor(Number(newQuantity));
    if (!Number.isFinite(parsedQty)) return;

    setItems((prevItems) =>
      prevItems
        .map((item) => {
          if (String(getProductoId(item)) !== String(productId)) return item;
          if (parsedQty <= 0) return null;
          const maxStock = resolveMaxStock(item);
          return {
            ...item,
            cantidad: Math.min(maxStock || DEFAULT_MAX_STOCK, parsedQty),
          };
        })
        .filter(Boolean)
    );
  }, []);

  /**
   * Ajusta la cantidad de forma incremental (+1 / -1) respetando límites.
   */
  const adjustQuantity = useCallback((productId, delta) => {
    if (productId == null) return;
    const parsedDelta = Math.trunc(Number(delta));
    if (!Number.isFinite(parsedDelta) || parsedDelta === 0) return;

    setItems((prevItems) =>
      prevItems
        .map((item) => {
          if (String(getProductoId(item)) !== String(productId)) return item;
          const nextQty = (Number(item.cantidad) || 0) + parsedDelta;
          if (nextQty <= 0) return null;
          const maxStock = resolveMaxStock(item);
          return {
            ...item,
            cantidad: Math.min(maxStock || DEFAULT_MAX_STOCK, nextQty),
          };
        })
        .filter(Boolean)
    );
  }, []);

  /**
   * Vacía completamente el carrito y limpia localStorage.
   */
  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Ignorar errores de storage
    }
  }, []);

  /**
   * Mantiene sincronizados los ítems del carrito cuando se edita o elimina
   * un producto desde el panel CRUD.
   */
  const syncCartWithProductMutation = useCallback((action, payload) => {
    if (action === 'delete' && payload) {
      setItems((prevItems) =>
        prevItems.filter((item) => String(getProductoId(item)) !== String(payload))
      );
    } else if (action === 'update' && payload) {
      const updatedId = getProductoId(payload);
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (String(getProductoId(item)) !== String(updatedId)) return item;
          const merged = { ...item, ...payload, id: updatedId };
          const maxStock = resolveMaxStock(merged);
          const safeQty =
            maxStock > 0 ? Math.min(maxStock, Number(item.cantidad) || 1) : Number(item.cantidad) || 1;
          return normalizeCartItem(merged, safeQty);
        })
      );
    }
  }, []);

  const value = useMemo(
    () => ({
      // API principal de CartContext
      items,
      addItem,
      removeItem,
      updateQuantity,
      adjustQuantity,
      clearCart,
      totalItems,
      totalPrice,
      // Control del drawer/modal del carrito y sincronización CRUD
      isCartOpen,
      setIsCartOpen,
      openCart,
      closeCart,
      syncCartWithProductMutation,
      // Aliases de compatibilidad retroactiva
      cart: items,
      cartCount: totalItems,
      cartTotal: totalPrice,
      addToCart: addItem,
      removeFromCart: removeItem,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      adjustQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isCartOpen,
      openCart,
      closeCart,
      syncCartWithProductMutation,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe utilizarse dentro de un <CartProvider>');
  }
  return context;
};

export default CartContext;
