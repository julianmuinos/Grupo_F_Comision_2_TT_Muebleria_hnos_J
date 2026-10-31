import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductoId } from '../api/productos';

/**
 * Componente HomeView (Inicio)
 * Basado en la maqueta de diseño oficial Hermanos Jota Heritage (inicio_hermanos_jota_2).
 *
 * Props:
 * - products: Array de productos obtenidos de la API
 * - onNavigate: Función opcional para cambiar a otra vista ('productos', 'contacto', etc.)
 * - onSelectProduct: Función opcional para abrir el detalle de un producto específico
 */
const HomeView = ({ products = [], onNavigate, onSelectProduct }) => {
  const navigate = useNavigate();

  const handleNav = (target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      if (target === 'catalogo' || target === 'productos') {
        navigate('/productos');
      } else if (target === 'contacto') {
        navigate('/contacto');
      } else if (target === 'inicio') {
        navigate('/');
      } else {
        navigate(target);
      }
    }
  };

  const handleSelect = (product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      navigate(`/productos/${getProductoId(product)}`);
    }
  };

  // Obtenemos las 4 piezas destacadas del catálogo con fallback preventivo
  const featured = products.filter((p) => p.destacado);
  const featuredProducts = (featured.length > 0 ? featured : products).slice(0, 4);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  return (
    <div className="home-view">
      {/* 1. Hero Section */}
      <section className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <div className="hero-tag-line">
            <span className="hero-accent-dash" />
            <span className="hero-tag">Colección 2026</span>
          </div>
          <h1 className="home-hero-title">
            Muebles que <br />
            <span className="hero-italic-highlight">alimentan el alma.</span>
          </h1>
          <p className="home-hero-description">
            Diseño moderno con alma de los 60. Piezas únicas hechas a mano con maderas nativas sustentables, pensadas para durar generaciones.
          </p>
          <div className="home-hero-actions">
            <button
              type="button"
              className="btn btn-primary btn-hero"
              onClick={() => handleNav('productos')}
            >
              Explorar Catálogo
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Sección: Piezas Destacadas */}
      <section className="featured-section">
        <div className="featured-header">
          <div>
            <span className="section-badge">Selección Curada</span>
            <h2 className="featured-section-title">Piezas Destacadas</h2>
            <p className="featured-section-desc">
              Nuestra selección curada de diseño atemporal. Cada pieza cuenta una historia de artesanía y dedicación.
            </p>
          </div>
          <button
            type="button"
            className="btn-link-action"
            onClick={() => handleNav('productos')}
          >
            Ver todas las piezas
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="featured-grid">
          {featuredProducts.map((product) => {
            const nombre = product.nombre || product.title || product.name;
            const imagen =
              product.imagenUrl || product.imagen || product.image || product.foto;
            const precio = product.precio ?? product.price ?? 0;

            return (
              <article key={getProductoId(product)} className="featured-card">
                <div
                  className="featured-card-img-wrap"
                  onClick={() => handleSelect(product)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(product);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver detalles de ${nombre}`}
                >
                  <img
                    src={imagen}
                    alt={nombre}
                    className="featured-card-img"
                    loading="lazy"
                  />
                  <span className="featured-badge">
                    {product.materiales && product.materiales.includes('FSC®')
                      ? 'Madera FSC®'
                      : product.categoria || product.category}
                  </span>
                </div>
                <div className="featured-card-body">
                  <div className="featured-title-row">
                    <h3
                      className="featured-card-title"
                      onClick={() => handleSelect(product)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelect(product);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      title={nombre}
                    >
                      {nombre}
                    </h3>
                    <span className="featured-price">{formatPrice(precio)}</span>
                  </div>
                  <p className="featured-desc-preview">{product.descripcion}</p>
                  <div className="featured-card-footer">
                    <button
                      type="button"
                      className="btn btn-secondary-light btn-detail-action"
                      onClick={() => handleSelect(product)}
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. Bloque de Valores: Compromiso con el Origen y Oficio */}
      <section className="heritage-pillars-section">
        <div className="pillars-container">
          <div className="pillars-header">
            <span className="pillars-tag">Herencia y Filosofía</span>
            <h2 className="section-title">Compromiso con el Origen</h2>
            <p className="section-subtitle">
              Creemos que un buen diseño no solo debe ser hermoso, sino también responsable. Nuestra filosofía se basa en el respeto por los materiales y su entorno.
            </p>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon-box">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--secondary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 22v-7" />
                  <path d="M17 12V9c0-2.8-2.2-5-5-5S7 6.2 7 9v3" />
                  <path d="M3 15c0 3.3 3.6 6 8.5 6s9.5-2.7 9.5-6-3.6-6-9-6-9 2.7-9 6Z" />
                </svg>
              </div>
              <h3 className="pillar-title">Maderas Nativas FSC®</h3>
              <p className="pillar-desc">
                Solo trabajamos con maderas provenientes de bosques gestionados de manera sostenible, garantizando la regeneración y el equilibrio ecológico.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--secondary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 2v8" />
                  <path d="m4.93 10.93 1.41 1.41" />
                  <path d="M2 18h2" />
                  <path d="M20 18h2" />
                  <path d="m19.07 10.93-1.41 1.41" />
                  <path d="M22 22H2" />
                  <path d="m8 22 4-10 4 10" />
                </svg>
              </div>
              <h3 className="pillar-title">Diseño de Autor Modernista</h3>
              <p className="pillar-desc">
                Inspirado en la sobriedad y calidez de los años 60. Formas orgánicas y proporciones armónicas pensadas para perdurar en el tiempo.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--secondary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9" />
                  <path d="M15 13 9 7l4-4 6 6-4 4Z" />
                  <path d="m18 10 3.5 3.5a2.12 2.12 0 0 1 0 3l-1 1a2.12 2.12 0 0 1-3 0L14 14" />
                </svg>
              </div>
              <h3 className="pillar-title">Ebanistería y Oficio Local</h3>
              <p className="pillar-desc">
                Cada ensamble y pulido se realiza artesanalmente en nuestro taller de Buenos Aires, con acabados en aceites vegetales y ceras naturales libres de tóxicos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Banner de Invitación al Showroom */}
      <section className="showroom-invite-banner">
        <div className="showroom-invite-content">
          <span className="showroom-tag">Experiencia Presencial</span>
          <h2 className="showroom-title">Visita nuestro Showroom en Buenos Aires</h2>
          <p className="showroom-desc">
            Te invitamos a tocar las maderas, apreciar las texturas y encontrar la pieza perfecta para tu hogar.
          </p>
          <div className="showroom-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleNav('contacto')}
            >
              Cómo Llegar y Contacto
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
