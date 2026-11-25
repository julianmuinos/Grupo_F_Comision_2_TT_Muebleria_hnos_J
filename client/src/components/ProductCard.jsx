import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductoId } from '../api/productos';
import { useCart } from '../context/CartContext';

/**
 * Componente ProductCard
 * Tarjeta individual basada en el catálogo oficial de Hermanos Jota:
 * - Lee las propiedades reales del producto (name, price, materials, image, category, etc.)
 * - Soporta vista en cuadrícula (grid) y vista en lista (list)
 * - Badges oficiales dinámicos (NUEVO, SUSTENTABLE, AGOTADO)
 * - Botón de favorito interactivo (corazón ♡ / ♥)
 * - Muestras de color / swatches y stock real disponible
 * - Precio formateado en moneda argentina ($ ARS)
 * - Conectado directamente a CartContext (addItem)
 */
const ProductCard = ({ product, onSelectProduct, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) {
        clearTimeout(addedTimerRef.current);
      }
    };
  }, []);

  if (!product) return null;

  // Extracción de datos reales con soporte bilingüe (name/nombre, price/precio, etc.)
  const nombre = product.name || product.nombre || product.title || 'Mueble de Diseño';
  const precioRaw = product.price ?? product.precio ?? 0;
  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(precioRaw);

  const imagenSrc =
    product.image ||
    product.imageUrl ||
    product.imagen ||
    product.imagenUrl ||
    product.foto ||
    '/assets/images/default.png';

  const materiales =
    product.materials ||
    product.materiales ||
    product.material ||
    product.specs?.materiales ||
    '';

  const categoria = product.category || product.categoria || '';
  const descripcion = product.description || product.descripcion || product.desc || '';
  const medidas = product.dimensions || product.medidas || product.specs?.medidas || '';

  const hayStock = (product.stock ?? 0) > 0 && product.inStock !== false;
  const swatches = Array.isArray(product.swatches) ? product.swatches : [];
  const stockLabel = product.stockLabel || (!hayStock ? 'Agotado' : null);

  // Badge condicional según disponibilidad o atributo destacado
  const badgeText = !hayStock
    ? 'AGOTADO'
    : product.badge?.text || product.badge || (product.destacado ? 'NUEVO' : null);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (!hayStock) return;
    addItem(product, 1);
    setJustAdded(true);
    if (addedTimerRef.current) {
      clearTimeout(addedTimerRef.current);
    }
    addedTimerRef.current = setTimeout(() => {
      setJustAdded(false);
    }, 1400);
  };

  const handleSelect = (e) => {
    e?.stopPropagation?.();
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      navigate(`/productos/${getProductoId(product)}`);
    }
  };

  /* ==========================================
     VISTA EN LISTA (LIST VIEW)
     ========================================== */
  if (viewMode === 'list') {
    return (
      <article
        className="product-card-list"
        onClick={handleSelect}
        role="button"
        tabIndex={0}
        aria-label={`Ver detalles de ${nombre}`}
      >
        <div className="product-list-image-container">
          <img
            src={imagenSrc}
            alt={nombre}
            className="product-list-image"
            loading="lazy"
          />
          {badgeText && (
            <span
              className={`product-badge ${
                badgeText === 'NUEVO'
                  ? 'badge-nuevo'
                  : badgeText === 'SUSTENTABLE'
                  ? 'badge-sustentable'
                  : 'badge-agotado'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>

        <div className="product-list-info">
          <div className="product-list-header">
            <div className="product-list-title-row">
              <h3 className="product-title">{nombre}</h3>
              <span className="product-price">{precioFormateado}</span>
            </div>
            <p className="product-list-desc">{descripcion || materiales}</p>

            <div className="product-list-tags">
              {categoria && <span className="tag-chip">{categoria}</span>}
              {materiales && <span className="tag-chip tag-material">{materiales}</span>}
              {medidas && <span className="tag-chip tag-spec">📐 {medidas}</span>}
            </div>
          </div>

          <div className="product-list-footer">
            <div className="product-swatches-container">
              {swatches.map((color, idx) => (
                <span
                  key={idx}
                  className="color-swatch-dot"
                  style={{ backgroundColor: color }}
                  title="Tono disponible"
                />
              ))}
              {stockLabel && <span className="stock-label-pill">{stockLabel}</span>}
            </div>

            <div className="product-list-actions">
              <button
                type="button"
                className="favorite-heart-btn"
                onClick={handleFavoriteClick}
                title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                aria-label="Favorito"
              >
                {isFavorite ? '♥' : '♡'}
              </button>
              <button
                type="button"
                className="btn btn-secondary-light btn-sm"
                onClick={handleSelect}
              >
                Ver detalle →
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAddClick}
                disabled={!hayStock}
              >
                {!hayStock ? 'Agotado' : justAdded ? '✓ Agregado' : '+ Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  /* ==========================================
     VISTA EN CUADRÍCULA (GRID VIEW)
     ========================================== */
  return (
    <article
      className="product-card"
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de ${nombre}`}
    >
      {/* Contenedor de Imagen con Badge y Corazón */}
      <div className="product-image-container">
        <img
          src={imagenSrc}
          alt={nombre}
          className="product-image"
          loading="lazy"
        />

        {/* Badge superior izquierdo */}
        {badgeText && (
          <span
            className={`product-badge ${
              badgeText === 'NUEVO'
                ? 'badge-nuevo'
                : badgeText === 'SUSTENTABLE'
                ? 'badge-sustentable'
                : 'badge-agotado'
            }`}
          >
            {badgeText}
          </span>
        )}

        {/* Botón de Favorito superior derecho */}
        <button
          type="button"
          className={`card-favorite-btn ${isFavorite ? 'is-fav' : ''}`}
          onClick={handleFavoriteClick}
          title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          aria-label="Agregar a favoritos"
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      {/* Información del Producto */}
      <div className="product-info">
        <div className="product-card-title-group">
          <h3 className="product-title" title={nombre}>
            {nombre}
          </h3>
          <p className="product-short-desc">
            {materiales || descripcion}
          </p>
        </div>

        <div className="product-card-bottom-row">
          <span className="product-price">{precioFormateado}</span>

          <div className="product-card-swatches">
            {swatches.map((color, idx) => (
              <span
                key={idx}
                className="color-swatch-dot"
                style={{ backgroundColor: color }}
                title="Tono disponible"
              />
            ))}
            {stockLabel && <span className="stock-label-pill">{stockLabel}</span>}
          </div>
        </div>

        {/* Botón flotante para agregar al carrito */}
        <div className="product-card-quick-actions">
          <button
            type="button"
            className="btn btn-primary btn-quick-cotizar"
            onClick={handleAddClick}
            disabled={!hayStock}
          >
            {!hayStock ? 'Agotado' : justAdded ? '✓ Agregado al carrito' : '+ Agregar al carrito'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
