import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente Footer
 * Pie de página oficial de Hermanos Jota Furniture:
 * Presenta la identidad de marca de 3 columnas (Filosofía/Certificaciones, Navegación rápida y Casa Taller en San Cristóbal).
 */
const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Columna 1: Marca y Filosofía */}
        <div className="footer-brand-column">
          <div className="footer-brand">
            <img
              src="/assets/images/logo.svg"
              alt="Logo Hermanos Jota"
              className="footer-logo-img"
            />
            <h3>HERMANOS JOTA</h3>
          </div>
          <p className="footer-desc">
            Diseño de autor y ebanistería contemporánea. Honrando la nobleza de la madera argentina desde 1968.
          </p>
          <div className="footer-badges">
            <span className="badge">Certificación FSC®</span>
            <span className="badge">Hecho en Buenos Aires</span>
          </div>
        </div>

        {/* Columna 2: Navegación Rápida */}
        <div className="footer-col">
          <h4 className="footer-col-title">Explorar</h4>
          <ul className="footer-nav-list">
            <li>
              <Link to="/" className="footer-nav-link">Inicio</Link>
            </li>
            <li>
              <Link to="/productos" className="footer-nav-link">Catálogo de Piezas</Link>
            </li>
            <li>
              <Link to="/contacto" className="footer-nav-link">Casa Taller & Contacto</Link>
            </li>
            <li>
              <Link to="/admin/crear-producto" className="footer-nav-link">
                Alta de Producto (Admin)
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Casa Taller Oficial */}
        <div className="footer-col">
          <h4 className="footer-col-title">Casa Taller</h4>
          <p className="footer-contact-text">
            Av. San Juan 2847, San Cristóbal<br />
            Buenos Aires, Argentina
          </p>
          <p className="footer-contact-text">
            <strong>Horarios:</strong> Lun a Vie 10:00 — 19:00 hs<br />
            Sábados 10:00 — 14:00 hs
          </p>
          <div className="footer-contact-links">
            <a
              href="https://wa.me/5491145678900"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-link"
            >
              +54 11 4567-8900
            </a>
            <span className="footer-contact-sep">·</span>
            <a
              href="mailto:info@hermanosjota.com.ar"
              className="footer-contact-link"
            >
              info@hermanosjota.com.ar
            </a>
          </div>
        </div>
      </div>

      {/* Barra Inferior */}
      <div className="footer-bottom">
        <p>
          © 2026 Hermanos Jota. Todos los derechos reservados. Redescubriendo el arte de habitar desde Buenos Aires.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
