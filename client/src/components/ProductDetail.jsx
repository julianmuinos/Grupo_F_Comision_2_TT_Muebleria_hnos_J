import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProductoById,
  updateProducto,
  deleteProducto,
  getProductoId,
} from '../api/productos';

/**
 * Componente ProductDetail
 * Visualización detallada de un mueble mediante renderizado condicional con:
 * - Botón de volver al catálogo y breadcrumbs
 * - Fotos grandes con badges de estado y categoría
 * - Especificaciones técnicas completas (medidas, materiales, acabados, etc.)
 * - Selector de cantidad y adición al carrito / cotización con feedback visual
 * - Acciones CRUD (Integrante 5): Botones y Modales integrados para Editar (PUT /api/productos/:id)
 *   y Eliminar (DELETE /api/productos/:id) con redirección programática vía useNavigate.
 *
 * Props:
 * - onBack: Función callback opcional para regresar al listado del catálogo
 * - onAddToCart: Función callback para añadir cantidad especificada al carrito
 * - onProductMutated: Función callback opcional para sincronizar cambios globales (edición/borrado)
 */
const ProductDetail = ({ onBack: propOnBack, onAddToCart, onProductMutated }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  // Estado de la petición GET /api/productos/:id
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Estados para Edición (PUT /api/productos/:id) y Eliminación (DELETE /api/productos/:id)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState(null);
  const [editRedirectTarget, setEditRedirectTarget] = useState('detalle'); // 'detalle' | 'catalogo'
  const [editForm, setEditForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagenUrl: '',
    categoria: 'almacenaje',
    medidas: '',
    materiales: '',
    destacado: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setProduct(null);
    setQuantity(1);

    getProductoById(id, controller.signal)
      .then((data) => {
        setProduct(data);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(`Error al obtener el producto ${id}:`, err);
        setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  const handleRetry = useCallback(() => setReloadKey((k) => k + 1), []);

  // Abrir modal de edición precargando los valores actuales del producto
  const handleOpenEditModal = () => {
    if (!product) return;
    setMutationError(null);
    setEditForm({
      nombre: product.nombre || product.title || '',
      descripcion: product.descripcion || '',
      precio: product.precio ?? product.price ?? 0,
      stock: product.stock ?? 0,
      imagenUrl:
        product.imagenUrl || product.imagen || product.image || product.foto || '',
      categoria: (product.categoria || product.category || 'almacenaje').toLowerCase(),
      medidas: product.medidas || product.specs?.medidas || '',
      materiales: product.materiales || product.specs?.materiales || '',
      destacado: Boolean(product.destacado),
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Ejecutar PUT /api/productos/:id
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setMutationError(null);

    if (!editForm.nombre.trim() || editForm.nombre.trim().length < 3) {
      setMutationError('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    if (!editForm.descripcion.trim()) {
      setMutationError('La descripción no puede estar vacía.');
      return;
    }
    if (editForm.precio === '' || isNaN(Number(editForm.precio)) || Number(editForm.precio) < 0) {
      setMutationError('El precio debe ser un número mayor o igual a 0.');
      return;
    }
    if (
      editForm.stock === '' ||
      isNaN(Number(editForm.stock)) ||
      Number(editForm.stock) < 0 ||
      !Number.isInteger(Number(editForm.stock))
    ) {
      setMutationError('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }
    if (!editForm.imagenUrl.trim()) {
      setMutationError('La URL de la imagen (imagenUrl) es obligatoria.');
      return;
    }

    setIsMutating(true);
    try {
      const targetId = getProductoId(product) || id;
      const payload = {
        nombre: editForm.nombre.trim(),
        title: editForm.nombre.trim(),
        descripcion: editForm.descripcion.trim(),
        precio: Number(editForm.precio),
        price: Number(editForm.precio),
        stock: Number(editForm.stock),
        imagenUrl: editForm.imagenUrl.trim(),
        imagen: editForm.imagenUrl.trim(),
        foto: editForm.imagenUrl.trim(),
        image: editForm.imagenUrl.trim(),
        categoria: editForm.categoria.toLowerCase(),
        category: editForm.categoria.toLowerCase(),
        medidas: editForm.medidas.trim(),
        materiales: editForm.materiales.trim(),
        destacado: Boolean(editForm.destacado),
      };

      const updated = await updateProducto(targetId, payload);
      setProduct(updated);
      setIsEditModalOpen(false);
      onProductMutated?.('update', updated);

      // Navegación programática con useNavigate tras edición exitosa
      if (editRedirectTarget === 'catalogo') {
        navigate('/productos');
      } else {
        navigate(`/productos/${getProductoId(updated) || targetId}`, { replace: true });
      }
    } catch (err) {
      console.error('Error al actualizar el producto:', err);
      setMutationError(err.message || 'No se pudo actualizar el producto.');
    } finally {
      setIsMutating(false);
    }
  };

  // Ejecutar DELETE /api/productos/:id
  const handleConfirmDelete = async () => {
    setMutationError(null);
    setIsMutating(true);
    try {
      const targetId = getProductoId(product) || id;
      await deleteProducto(targetId);
      setIsDeleteModalOpen(false);
      onProductMutated?.('delete', targetId);

      // Redirección programática automática al catálogo tras eliminación exitosa
      navigate('/productos');
    } catch (err) {
      console.error('Error al eliminar el producto:', err);
      setMutationError(err.message || 'No se pudo eliminar el producto.');
      setIsMutating(false);
    }
  };

  // Manejador del botón volver con historial del navegador y fallback seguro al catálogo
  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
      return;
    }
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/productos');
    }
  };

  // Estado de carga mientras se consulta GET /api/productos/:id
  if (loading) {
    return (
      <div className="state-container loading-container" role="status" aria-live="polite">
        <div className="spinner" />
        <h2>Cargando detalle del producto...</h2>
        <p>Buscando especificaciones en el catálogo oficial</p>
      </div>
    );
  }

  // Estado de error: 404/400 = producto inexistente; otro = falla de conexión/servidor
  if (error || !product) {
    const noEncontrado = !error || error.status === 404 || error.status === 400;
    return (
      <div className="state-container" role="alert">
        <h2>{noEncontrado ? 'Producto no encontrado' : 'No pudimos cargar el producto'}</h2>
        <p className="section-subtitle">
          {noEncontrado
            ? 'No se encontró ningún producto con ese identificador.'
            : error.message}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'center' }}>
          {!noEncontrado && (
            <button type="button" className="btn btn-primary" onClick={handleRetry}>
              Reintentar
            </button>
          )}
          <button type="button" className="btn btn-secondary-light" onClick={() => navigate('/productos')}>
            ← Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  // Formato oficial de moneda en pesos argentinos ($ ARS) sin decimales
  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(product.precio ?? product.price ?? 0);

  const hayStock = (product.stock ?? 0) > 0;
  const imagenSrc = product.imagenUrl || product.imagen || product.image || product.foto;
  const nombre = product.nombre || product.title;
  const categoria = product.categoria || product.category || 'Muebles';

  // Manejador para aumentar o disminuir cantidad dentro del stock disponible
  const handleQtyChange = (delta) => {
    setQuantity((prev) => {
      const maxStock = product.stock || 99;
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxStock) return maxStock;
      return next;
    });
  };

  // Manejador para agregar al carrito y mostrar notificación temporal
  const handleAdd = () => {
    if (!hayStock) return;
    onAddToCart?.(product, quantity);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2800);
  };

  // Diccionario de etiquetas oficiales de especificaciones según catalogo.pdf
  const specLabels = {
    medidas: 'Medidas',
    materiales: 'Materiales',
    acabado: 'Acabado',
    peso: 'Peso',
    capacidad: 'Capacidad',
    modulares: 'Modulares',
    tapizado: 'Tapizado',
    confort: 'Confort',
    rotacion: 'Rotación',
    garantia: 'Garantía',
    cargaMaxima: 'Carga máxima',
    almacenamiento: 'Almacenamiento',
    caracteristicas: 'Características',
    estructura: 'Estructura',
    relleno: 'Relleno',
    sostenibilidad: 'Sostenibilidad',
    extension: 'Extensión',
    apilables: 'Apilables',
    incluye: 'Incluye',
    cables: 'Cables',
    regulacion: 'Regulación',
    certificacion: 'Certificación',
  };

  // Extraer especificaciones técnicas para mostrarlas fielmente como en el catálogo oficial
  const specs = product.specs || {};
  const standardSpecs = Object.entries(specs).map(([key, value]) => ({
    label: specLabels[key] || key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  // En caso de que no tenga objeto specs pero tenga medidas o materiales directos
  if (standardSpecs.length === 0) {
    if (product.medidas) standardSpecs.push({ label: 'Medidas', value: product.medidas });
    if (product.materiales) standardSpecs.push({ label: 'Materiales', value: product.materiales });
  }

  return (
    <section className="product-detail-section" aria-label={`Detalle de ${nombre}`}>
      {/* Navegación y Breadcrumbs */}
      <nav className="detail-navigation" aria-label="Migas de pan">
        <button
          type="button"
          className="back-link-btn"
          onClick={handleBack}
          aria-label="Volver a la vista del catálogo"
        >
          ← Volver al catálogo
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-category">
          {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current" aria-current="page">
          {nombre}
        </span>
      </nav>

      {/* Disposición Principal del Detalle */}
      <div className="product-detail-layout">
        {/* Columna Izquierda: Imagen Grande y Badges */}
        <div className="detail-image-wrapper">
          <img
            src={imagenSrc}
            alt={nombre}
            className="detail-image"
          />

          {/* Badges de producto */}
          {product.destacado && (
            <span className="detail-badge badge-destacado badge-nuevo">Pieza Destacada</span>
          )}
          {!product.destacado && product.materiales && product.materiales.includes('FSC®') && (
            <span className="detail-badge badge-sustentable">Madera FSC®</span>
          )}

          <span className="detail-category-badge">{categoria}</span>
        </div>

        {/* Columna Derecha: Información y Especificaciones */}
        <div className="detail-content">
          <div className="detail-header-group">
            <span className="detail-subtitle">Hermanos Jota · Edición 2026</span>
            <h1 className="detail-title">{nombre}</h1>
          </div>

          {/* Fila de Precio y Disponibilidad de Stock */}
          <div className="detail-price-row">
            <div>
              <span className="price-tagline">Precio de Lista Oficial</span>
              <div className="detail-price">{precioFormateado}</div>
              <span className="detail-installments-badge">3 y 6 Cuotas Sin Interés</span>
            </div>
            <span className={`detail-stock-pill ${hayStock ? 'in-stock' : 'out-of-stock'}`}>
              {hayStock ? `En Stock (${product.stock} disponibles)` : 'Sin Stock Inmediato'}
            </span>
          </div>

          {/* Chips de Sustentabilidad y Atributos de Autor */}
          <div className="detail-sustainability-chips">
            <span className="sustainability-chip">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22v-7"/><path d="M17 12V9c0-2.8-2.2-5-5-5S7 6.2 7 9v3"/><path d="M3 15c0 3.3 3.6 6 8.5 6s9.5-2.7 9.5-6-3.6-6-9-6-9 2.7-9 6Z"/></svg>
              Madera Certificada FSC®
            </span>
            <span className="sustainability-chip">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              Acabado Aceites Naturales
            </span>
            <span className="sustainability-chip">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/><path d="M15 13 9 7l4-4 6 6-4 4Z"/></svg>
              Ensamble Artesanal
            </span>
          </div>

          <div className="detail-divider" />

          {/* Descripción del Producto */}
          <div className="detail-block">
            <h3>Descripción de Autor</h3>
            <p className="detail-description">
              {product.descripcionLarga || product.descripcion}
            </p>
          </div>

          <div className="detail-divider" />

          {/* Especificaciones Técnicas */}
          {standardSpecs.length > 0 && (
            <>
              <div className="detail-block">
                <h3>Especificaciones Técnicas</h3>
                <div className="detail-specs-grid">
                  {standardSpecs.map((spec, index) => (
                    <div key={index} className="spec-card">
                      <span className="spec-label">{spec.label}</span>
                      <span className="spec-value">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="detail-divider" />
            </>
          )}

          {/* Acciones de Compra / Cotización */}
          <div className="detail-purchase-actions">
            {hayStock && (
              <div className="quantity-selector">
                <label htmlFor="product-detail-qty">Cantidad:</label>
                <div className="quantity-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => handleQtyChange(-1)}
                    disabled={quantity <= 1}
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <input
                    id="product-detail-qty"
                    type="number"
                    className="qty-input"
                    value={quantity}
                    readOnly
                    aria-label="Cantidad seleccionada"
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => handleQtyChange(1)}
                    disabled={quantity >= (product.stock || 99)}
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="action-buttons-group">
              <button
                type="button"
                className="btn btn-primary btn-large"
                onClick={handleAdd}
                disabled={!hayStock}
                aria-label={`Agregar ${quantity} unidades de ${nombre} a la cotización`}
              >
                + Agregar a Cotización
              </button>
              <button
                type="button"
                className="btn btn-secondary-light btn-large"
                onClick={handleBack}
                aria-label="Volver al catálogo"
              >
                Volver al Catálogo
              </button>
            </div>

            {/* Notificación Toast de Éxito */}
            {showToast && (
              <div className="success-toast" role="alert">
                ¡Se agregaron {quantity} unidad(es) de {nombre} a tu cotización!
              </div>
            )}

            {/* =========================================================
                PANEL DE GESTIÓN CRUD (EDITAR / ELIMINAR PRODUCTO)
                ========================================================= */}
            <div className="detail-admin-actions-bar">
              <div className="admin-bar-info">
                <span className="admin-bar-badge">Gestión de Catálogo</span>
                <span className="admin-bar-id">ID: {getProductoId(product)}</span>
              </div>
              <div className="admin-bar-buttons">
                <button
                  type="button"
                  className="btn-admin-edit"
                  onClick={handleOpenEditModal}
                >
                  ✎ Editar Producto
                </button>
                <button
                  type="button"
                  className="btn-admin-delete"
                  onClick={() => {
                    setMutationError(null);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  🗑 Eliminar Producto
                </button>
              </div>
            </div>

            {/* Tarjeta de Confianza y Garantía */}
            <div className="detail-trust-card">
              <div className="trust-item">
                <div className="trust-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <div>
                  <h4 className="trust-title">Garantía Estructural Hermanos Jota</h4>
                  <p className="trust-desc">Cubrimos cualquier defecto estructural de fabricación por 10 años.</p>
                </div>
              </div>
              <div className="trust-divider" />
              <div className="trust-item">
                <div className="trust-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-5v10"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
                </div>
                <div>
                  <h4 className="trust-title">Envío Especializado y Cuidado</h4>
                  <p className="trust-desc">Entregado con embalaje reforzado y manipulación artesanal en todo el país.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL DE EDICIÓN DE PRODUCTO (PUT /api/productos/:id)
          ========================================================= */}
      {isEditModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !isMutating && setIsEditModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-edit-title"
        >
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="section-badge">PUT /api/productos/:id</span>
                <h2 id="modal-edit-title" className="admin-modal-title">
                  Editar Mueble
                </h2>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isMutating}
                aria-label="Cerrar modal de edición"
              >
                ✕
              </button>
            </div>

            {mutationError && (
              <div className="admin-alert-error" role="alert">
                {mutationError}
              </div>
            )}

            <form className="admin-modal-form" onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label htmlFor="edit-nombre" className="form-label">
                  Nombre del Mueble <span className="required-mark">*</span>
                </label>
                <input
                  id="edit-nombre"
                  name="nombre"
                  type="text"
                  className="form-input"
                  value={editForm.nombre}
                  onChange={handleEditFormChange}
                  required
                />
              </div>

              <div className="admin-form-row-2col">
                <div className="form-group">
                  <label htmlFor="edit-precio" className="form-label">
                    Precio ($ ARS) <span className="required-mark">*</span>
                  </label>
                  <input
                    id="edit-precio"
                    name="precio"
                    type="number"
                    min="0"
                    className="form-input"
                    value={editForm.precio}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-stock" className="form-label">
                    Stock Disponible <span className="required-mark">*</span>
                  </label>
                  <input
                    id="edit-stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    value={editForm.stock}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row-2col">
                <div className="form-group">
                  <label htmlFor="edit-categoria" className="form-label">
                    Categoría
                  </label>
                  <select
                    id="edit-categoria"
                    name="categoria"
                    className="form-input form-select"
                    value={editForm.categoria}
                    onChange={handleEditFormChange}
                  >
                    <option value="almacenaje">Almacenaje</option>
                    <option value="asientos">Asientos</option>
                    <option value="mesas">Mesas</option>
                    <option value="accesorios">Accesorios</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-imagenUrl" className="form-label">
                    URL de Imagen (<code>imagenUrl</code>) <span className="required-mark">*</span>
                  </label>
                  <input
                    id="edit-imagenUrl"
                    name="imagenUrl"
                    type="text"
                    className="form-input"
                    value={editForm.imagenUrl}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row-2col">
                <div className="form-group">
                  <label htmlFor="edit-medidas" className="form-label">
                    Medidas
                  </label>
                  <input
                    id="edit-medidas"
                    name="medidas"
                    type="text"
                    className="form-input"
                    value={editForm.medidas}
                    onChange={handleEditFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-materiales" className="form-label">
                    Materiales
                  </label>
                  <input
                    id="edit-materiales"
                    name="materiales"
                    type="text"
                    className="form-input"
                    value={editForm.materiales}
                    onChange={handleEditFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-descripcion" className="form-label">
                  Descripción <span className="required-mark">*</span>
                </label>
                <textarea
                  id="edit-descripcion"
                  name="descripcion"
                  rows="3"
                  className="form-textarea"
                  value={editForm.descripcion}
                  onChange={handleEditFormChange}
                  required
                />
              </div>

              <div className="admin-options-box">
                <label className="sidebar-checkbox-label">
                  <input
                    type="checkbox"
                    name="destacado"
                    checked={editForm.destacado}
                    onChange={handleEditFormChange}
                    className="custom-checkbox"
                  />
                  <span className="checkbox-text">Pieza Destacada</span>
                </label>

                <div className="admin-redirect-selector">
                  <span className="form-label">Al guardar cambios:</span>
                  <div className="redirect-radios">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="editRedirectTarget"
                        checked={editRedirectTarget === 'detalle'}
                        onChange={() => setEditRedirectTarget('detalle')}
                      />
                      <span>Permanecer en Detalle</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="editRedirectTarget"
                        checked={editRedirectTarget === 'catalogo'}
                        onChange={() => setEditRedirectTarget('catalogo')}
                      />
                      <span>Redirigir al Catálogo</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary-light"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isMutating}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isMutating}>
                  {isMutating ? 'Guardando cambios...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE CONFIRMACIÓN DE BORRADO (DELETE /api/productos/:id)
          ========================================================= */}
      {isDeleteModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !isMutating && setIsDeleteModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
        >
          <div
            className="admin-modal-card admin-modal-delete"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-icon">⚠️</div>
            <h2 id="modal-delete-title" className="admin-modal-title">
              ¿Eliminar &ldquo;{nombre}&rdquo;?
            </h2>
            <p className="delete-modal-desc">
              Esta acción ejecutará <code>DELETE /api/productos/{getProductoId(product)}</code> y
              removerá permanentemente la pieza de la base de datos en MongoDB Atlas.
            </p>

            {mutationError && (
              <div className="admin-alert-error" role="alert">
                {mutationError}
              </div>
            )}

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-secondary-light"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isMutating}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={handleConfirmDelete}
                disabled={isMutating}
              >
                {isMutating ? 'Eliminando...' : 'Sí, Eliminar Definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDetail;
