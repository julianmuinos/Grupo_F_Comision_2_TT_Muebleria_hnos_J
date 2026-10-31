import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartModal from './components/CartModal';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ProductForm from './components/ProductForm';
import HomeView from './components/HomeView';
import ContactView from './components/ContactView';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import {
  getProductos,
  getProductoId,
  API_BASE,
  PRODUCTOS_URL as API_URL,
} from './api/productos';
import './App.css';

// Redirección de la ruta legada /producto/:id a /productos/:id
function LegacyProductRedirect() {
  const { id } = useParams();
  return <Navigate to={`/productos/${id}`} replace />;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Estado para almacenar los productos de la API (utilizado en la portada HomeView)
  const [products, setProducts] = useState([]);

  // 2. Estados para el ciclo de vida de la petición asíncrona
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Estado global del Carrito de Compras en App.jsx con persistencia en localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('hnosj_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Estado para visibilidad del modal del carrito
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persistir en localStorage ante cualquier modificación del carrito
  useEffect(() => {
    try {
      localStorage.setItem('hnosj_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error al guardar el carrito:', e);
    }
  }, [cart]);

  // Manejador centralizado para consultar productos (utilizado en montaje, reintento y sincronización CRUD)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProductos();
      setProducts(data);
    } catch (err) {
      console.error('Error al obtener productos desde la API:', err);
      setError(
        `No se pudo conectar con el servidor backend en ${API_BASE}. ` +
          'Asegúrate de que la API de Express esté corriendo con "npm start" dentro de /backend.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial asíncrona al montar el componente reutilizando fetchProducts (DRY)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  // Sincronización reactiva cuando se crea, edita o elimina un producto (Integrante 5 CRUD)
  const handleProductMutated = useCallback(
    (action, payload) => {
      fetchProducts();

      // Si se eliminó o editó un producto que estaba en el carrito, mantener el carrito consistente
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
    },
    [fetchProducts]
  );

  // 5. Cálculo de cantidad total de artículos para pasar al Navbar vía props
  const cartCount = cart.reduce((total, item) => total + item.cantidad, 0);

  // 6. Funciones inmutables para manipulación del estado del carrito (compatibles con _id nativo de MongoDB)
  const handleAddToCart = (product, quantityToAdd = 1) => {
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
      } else {
        return [
          ...prevCart,
          {
            ...product,
            id: prodId,
            cantidad: Math.min(product.stock || 99, quantityToAdd),
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId, delta) => {
    setCart((prevCart) => {
      return prevCart
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
        .filter(Boolean);
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => getProductoId(item) !== productId)
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const isHome = location.pathname === '/';

  return (
    <div className="app-container">
      {/* Reset de scroll inmediato al cambiar de ruta */}
      <ScrollToTop />

      {/* Barra de Navegación con contador de carrito vía props */}
      <Navbar cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />

      {/* Contenido Principal con Rutas Globales Persistentes */}
      <main className={`main-content ${isHome ? 'main-content-home' : ''}`}>
        <Routes>
          <Route
            path="/"
            element={
              loading ? (
                <div className="state-container loading-container">
                  <div className="spinner" />
                  <h2>Cargando catálogo de muebles...</h2>
                  <p>Conectando con la API REST en {API_URL}</p>
                </div>
              ) : error ? (
                <div className="state-container error-container">
                  <div className="error-icon">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#B91C1C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                  </div>
                  <h2>Error de Conexión</h2>
                  <p className="error-detail">{error}</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={fetchProducts}
                  >
                    Reintentar conexión
                  </button>
                </div>
              ) : (
                <HomeView products={products} />
              )
            }
          />
          {/* Catálogo general: consume GET /api/productos */}
          <Route
            path="/productos"
            element={<ProductList onAddToCart={handleAddToCart} />}
          />
          {/* Alta de nuevo producto (Integrante 5 — Panel de Administración y Formularios CRUD) */}
          <Route
            path="/admin/crear-producto"
            element={
              <ProductForm
                onProductCreated={(created) =>
                  handleProductMutated('create', created)
                }
              />
            }
          />
          {/* Rutas legadas redirigidas a las nuevas */}
          <Route path="/catalogo" element={<Navigate to="/productos" replace />} />
          <Route path="/producto/:id" element={<LegacyProductRedirect />} />
          <Route path="/contacto" element={<ContactView />} />
          {/* Detalle dinámico: useParams + GET / PUT / DELETE /api/productos/:id */}
          <Route
            path="/productos/:id"
            element={
              <ProductDetail
                onAddToCart={handleAddToCart}
                onProductMutated={handleProductMutated}
              />
            }
          />
          <Route
            path="*"
            element={
              <div className="state-container">
                <h2>Página no encontrada (404)</h2>
                <p className="section-subtitle">
                  La sección que estás buscando no existe o fue trasladada.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/')}
                  style={{ marginTop: '1rem' }}
                >
                  Volver al Inicio
                </button>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Footer Oficial Hermanos Jota Heritage */}
      <Footer />

      {/* Modal / Drawer del Carrito */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    </div>
  );
}

export default App;
