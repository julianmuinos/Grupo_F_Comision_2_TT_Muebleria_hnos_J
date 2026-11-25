import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartModal from './components/CartModal';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ProductForm from './components/ProductForm';
import HomeView from './components/HomeView';
import ContactView from './components/ContactView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import ProfileView from './components/ProfileView';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import {
  getProductos,
  API_BASE,
  PRODUCTOS_URL as API_URL,
} from './api/productos';
import './App.css';

// Redirección de la ruta legada /producto/:id a /productos/:id
function LegacyProductRedirect() {
  const { id } = useParams();
  return <Navigate to={`/productos/${id}`} replace />;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    items,
    isCartOpen,
    closeCart,
    adjustQuantity,
    removeItem,
    clearCart,
    syncCartWithProductMutation,
  } = useCart();

  // 1. Estado para almacenar los productos de la API (utilizado en la portada HomeView)
  const [products, setProducts] = useState([]);

  // 2. Estados para el ciclo de vida de la petición asíncrona
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      syncCartWithProductMutation(action, payload);
    },
    [fetchProducts, syncCartWithProductMutation]
  );

  const isHome = location.pathname === '/';

  return (
    <div className="app-container">
      {/* Reset de scroll inmediato al cambiar de ruta */}
      <ScrollToTop />

      {/* Barra de Navegación con consumo de AuthContext y CartContext */}
      <Navbar />

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
            element={<ProductList />}
          />
          {/* Pantallas Públicas de Autenticación (/login y /registro) */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/registro" element={<RegisterView />} />

          {/* Página Protegida de Perfil (/perfil) */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <ProfileView />
              </ProtectedRoute>
            }
          />

          {/* Ruta Protegida de Mis Pedidos (/mis-pedidos) */}
          <Route
            path="/mis-pedidos"
            element={
              <ProtectedRoute>
                <div className="state-container">
                  <span className="section-badge">Mi Cuenta · Hermanos Jota</span>
                  <h2 style={{ marginTop: '0.5rem' }}>Mis Pedidos</h2>
                  <p className="section-subtitle">
                    Todavía no registrás pedidos confirmados con tu cuenta.
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.85rem',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      marginTop: '1.5rem',
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => navigate('/productos')}
                    >
                      Explorar Catálogo
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/perfil')}
                    >
                      Volver a Mi Perfil
                    </button>
                  </div>
                </div>
              </ProtectedRoute>
            }
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
        onClose={closeCart}
        cart={items}
        onUpdateQuantity={adjustQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
