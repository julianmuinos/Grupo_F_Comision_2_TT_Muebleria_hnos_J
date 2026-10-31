import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProducto, getProductoId } from '../api/productos';

/**
 * Componente ProductForm (/admin/crear-producto)
 * Formulario 100% controlado (useState) para el alta de nuevos muebles en MongoDB Atlas.
 *
 * Requerimientos (Integrante 5 — Frontend: Panel de Administración y Formularios CRUD):
 * - Alta de producto (/admin/crear-producto): Formulario controlado para ingresar
 *   nombre, descripcion, precio, stock e imagenUrl (más categoría y atributos opcionales).
 * - Petición POST: Envío de los datos ingresados al endpoint POST /api/productos.
 * - Navegación programática: Implementación del hook useNavigate para redirigir
 *   automáticamente al catálogo (/productos) o al detalle (/productos/:id) luego de una
 *   creación exitosa.
 */
const ProductForm = ({ onProductCreated }) => {
  const navigate = useNavigate();

  const initialFormState = {
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagenUrl: '',
    categoria: 'almacenaje',
    medidas: '',
    materiales: '',
    destacado: false,
  };

  // Estado controlado para los campos del formulario
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [redirectTarget, setRedirectTarget] = useState('detalle'); // 'detalle' | 'catalogo'

  // Opciones rápidas de imágenes locales de la colección para facilitar pruebas
  const presetImages = [
    { label: 'Aparador Uspallata', url: '/assets/images/aparador-uspallata.png' },
    { label: 'Biblioteca Recoleta', url: '/assets/images/biblioteca-recoleta.png' },
    { label: 'Butaca Mendoza', url: '/assets/images/butaca-mendoza.png' },
    { label: 'Sillón Copacabana', url: '/assets/images/sillon-copacabana.png' },
    { label: 'Sofá Patagonia', url: '/assets/images/sofa-patagonia.png' },
    { label: 'Mesa Comedor Pampa', url: '/assets/images/mesa-comedor-pampa.png' },
    { label: 'Mesa de Centro Araucaria', url: '/assets/images/mesa-centro-araucaria.png' },
  ];

  // Validación síncrona por campo
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
        if (!String(value).trim()) return 'El nombre del producto es obligatorio.';
        if (String(value).trim().length < 3)
          return 'El nombre debe tener al menos 3 caracteres.';
        return '';

      case 'descripcion':
        if (!String(value).trim()) return 'La descripción del producto es obligatoria.';
        if (String(value).trim().length < 10)
          return 'La descripción debe contener al menos 10 caracteres.';
        return '';

      case 'precio':
        if (value === '' || value === null || value === undefined)
          return 'El precio es obligatorio.';
        if (isNaN(Number(value)) || Number(value) < 0)
          return 'El precio debe ser un número válido mayor o igual a 0.';
        return '';

      case 'stock':
        if (value === '' || value === null || value === undefined)
          return 'El stock disponible es obligatorio.';
        if (
          isNaN(Number(value)) ||
          Number(value) < 0 ||
          !Number.isInteger(Number(value))
        )
          return 'El stock debe ser un número entero mayor o igual a 0.';
        return '';

      case 'imagenUrl':
        if (!String(value).trim())
          return 'La URL o ruta de la imagen (imagenUrl) es obligatoria.';
        return '';

      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (touched[name]) {
      const fieldError = validateField(name, newValue);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const validateForm = () => {
    const requiredFields = ['nombre', 'descripcion', 'precio', 'stock', 'imagenUrl'];
    const newErrors = {};

    requiredFields.forEach((field) => {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) newErrors[field] = errorMsg;
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    setTouched({
      nombre: true,
      descripcion: true,
      precio: true,
      stock: true,
      imagenUrl: true,
    });

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: Number(formData.precio),
        stock: Number(formData.stock),
        imagenUrl: formData.imagenUrl.trim(),
        imagen: formData.imagenUrl.trim(),
        categoria: (formData.categoria || 'almacenaje').toLowerCase(),
        medidas: formData.medidas.trim(),
        materiales: formData.materiales.trim(),
        destacado: Boolean(formData.destacado),
      };

      const createdProduct = await createProducto(payload);

      // Notificar al estado global (si App.jsx necesita refrescar productos en HomeView)
      onProductCreated?.(createdProduct);

      // Navegación programática con useNavigate luego del alta exitosa
      const newId = getProductoId(createdProduct);
      if (redirectTarget === 'detalle' && newId) {
        navigate(`/productos/${newId}`);
      } else {
        navigate('/productos');
      }
    } catch (err) {
      console.error('Error al crear el producto:', err);
      setSubmitError(
        err.message || 'No se pudo dar de alta el producto. Verifica la conexión con el servidor.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="admin-page-section" aria-labelledby="admin-create-heading">
      <div className="admin-page-container">
        {/* Migas de pan y retorno */}
        <nav className="detail-navigation" aria-label="Navegación de administración">
          <button
            type="button"
            className="back-link-btn"
            onClick={() => navigate('/productos')}
          >
            ← Volver al catálogo
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-category">Panel de Administración</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current" aria-current="page">
            Alta de Producto
          </span>
        </nav>

        <div className="admin-card-wrapper">
          <div className="admin-header-block">
            <span className="section-badge">Gestión de Catálogo · CRUD</span>
            <h1 id="admin-create-heading" className="admin-main-title">
              Alta de Nuevo Mueble
            </h1>
            <p className="admin-main-subtitle">
              Completá los datos técnicos de la pieza para registrarla directamente en la colección de{' '}
              <strong>MongoDB Atlas</strong> mediante <code>POST /api/productos</code>.
            </p>
          </div>

          {submitError && (
            <div className="admin-alert-error" role="alert">
              <strong>Error al guardar:</strong> {submitError}
            </div>
          )}

          <form className="contact-form-heritage admin-crud-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-form-grid">
              {/* Columna Izquierda: Datos Principales Requeridos */}
              <div className="admin-form-col">
                {/* Nombre */}
                <div className={`form-group ${touched.nombre && errors.nombre ? 'has-error' : ''}`}>
                  <label htmlFor="admin-nombre" className="form-label">
                    Nombre del Mueble <span className="required-mark">*</span>
                  </label>
                  <input
                    id="admin-nombre"
                    name="nombre"
                    type="text"
                    placeholder="Ej. Aparador Uspallata"
                    className={`form-input ${touched.nombre && errors.nombre ? 'input-error' : ''}`}
                    value={formData.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.nombre && errors.nombre && (
                    <span className="field-error" role="alert">
                      {errors.nombre}
                    </span>
                  )}
                </div>

                {/* Precio y Stock en fila */}
                <div className="admin-form-row-2col">
                  <div className={`form-group ${touched.precio && errors.precio ? 'has-error' : ''}`}>
                    <label htmlFor="admin-precio" className="form-label">
                      Precio ($ ARS) <span className="required-mark">*</span>
                    </label>
                    <input
                      id="admin-precio"
                      name="precio"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="Ej. 2350000"
                      className={`form-input ${touched.precio && errors.precio ? 'input-error' : ''}`}
                      value={formData.precio}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {touched.precio && errors.precio && (
                      <span className="field-error" role="alert">
                        {errors.precio}
                      </span>
                    )}
                  </div>

                  <div className={`form-group ${touched.stock && errors.stock ? 'has-error' : ''}`}>
                    <label htmlFor="admin-stock" className="form-label">
                      Stock Disponible <span className="required-mark">*</span>
                    </label>
                    <input
                      id="admin-stock"
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Ej. 8"
                      className={`form-input ${touched.stock && errors.stock ? 'input-error' : ''}`}
                      value={formData.stock}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {touched.stock && errors.stock && (
                      <span className="field-error" role="alert">
                        {errors.stock}
                      </span>
                    )}
                  </div>
                </div>

                {/* Categoría */}
                <div className="form-group">
                  <label htmlFor="admin-categoria" className="form-label">
                    Categoría del Catálogo
                  </label>
                  <select
                    id="admin-categoria"
                    name="categoria"
                    className="form-input form-select"
                    value={formData.categoria}
                    onChange={handleChange}
                  >
                    <option value="almacenaje">Almacenaje</option>
                    <option value="asientos">Asientos</option>
                    <option value="mesas">Mesas</option>
                    <option value="accesorios">Accesorios</option>
                  </select>
                </div>

                {/* Descripción */}
                <div
                  className={`form-group ${
                    touched.descripcion && errors.descripcion ? 'has-error' : ''
                  }`}
                >
                  <label htmlFor="admin-descripcion" className="form-label">
                    Descripción <span className="required-mark">*</span>
                  </label>
                  <textarea
                    id="admin-descripcion"
                    name="descripcion"
                    rows="4"
                    placeholder="Describí el diseño, materiales nobles y terminaciones de la pieza..."
                    className={`form-textarea ${
                      touched.descripcion && errors.descripcion ? 'input-error' : ''
                    }`}
                    value={formData.descripcion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.descripcion && errors.descripcion && (
                    <span className="field-error" role="alert">
                      {errors.descripcion}
                    </span>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Imagen URL, Especificaciones Opcionales y Vista Previa */}
              <div className="admin-form-col">
                {/* Imagen URL */}
                <div
                  className={`form-group ${
                    touched.imagenUrl && errors.imagenUrl ? 'has-error' : ''
                  }`}
                >
                  <label htmlFor="admin-imagenUrl" className="form-label">
                    URL o Ruta de Imagen (<code>imagenUrl</code>) <span className="required-mark">*</span>
                  </label>
                  <input
                    id="admin-imagenUrl"
                    name="imagenUrl"
                    type="text"
                    placeholder="/assets/images/aparador-uspallata.png o https://..."
                    className={`form-input ${
                      touched.imagenUrl && errors.imagenUrl ? 'input-error' : ''
                    }`}
                    value={formData.imagenUrl}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touched.imagenUrl && errors.imagenUrl && (
                    <span className="field-error" role="alert">
                      {errors.imagenUrl}
                    </span>
                  )}

                  {/* Selector rápido de imágenes de autor */}
                  <div className="admin-preset-images">
                    <span className="preset-label">Rutas rápidas del catálogo:</span>
                    <div className="preset-chips-row">
                      {presetImages.map((img) => (
                        <button
                          key={img.url}
                          type="button"
                          className={`preset-chip ${formData.imagenUrl === img.url ? 'active' : ''}`}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, imagenUrl: img.url }));
                            setErrors((prev) => ({ ...prev, imagenUrl: '' }));
                          }}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Medidas y Materiales (Opcionales) */}
                <div className="admin-form-row-2col">
                  <div className="form-group">
                    <label htmlFor="admin-medidas" className="form-label">
                      Medidas <span className="optional-tag">(Opcional)</span>
                    </label>
                    <input
                      id="admin-medidas"
                      name="medidas"
                      type="text"
                      placeholder="Ej. 180 × 45 × 75 cm"
                      className="form-input"
                      value={formData.medidas}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="admin-materiales" className="form-label">
                      Materiales <span className="optional-tag">(Opcional)</span>
                    </label>
                    <input
                      id="admin-materiales"
                      name="materiales"
                      type="text"
                      placeholder="Ej. Nogal macizo FSC®"
                      className="form-input"
                      value={formData.materiales}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Checkbox Destacado y Destino de Redirección */}
                <div className="admin-options-box">
                  <label className="sidebar-checkbox-label">
                    <input
                      type="checkbox"
                      name="destacado"
                      checked={formData.destacado}
                      onChange={handleChange}
                      className="custom-checkbox"
                    />
                    <span className="checkbox-text">
                      Marcar como <strong>Pieza Destacada</strong> en Portada
                    </span>
                  </label>

                  <div className="admin-redirect-selector">
                    <span className="form-label">Al crear exitosamente, redirigir a:</span>
                    <div className="redirect-radios">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="redirectTarget"
                          value="detalle"
                          checked={redirectTarget === 'detalle'}
                          onChange={() => setRedirectTarget('detalle')}
                        />
                        <span>Ficha de Detalle del Producto</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="redirectTarget"
                          value="catalogo"
                          checked={redirectTarget === 'catalogo'}
                          onChange={() => setRedirectTarget('catalogo')}
                        />
                        <span>Catálogo General (/productos)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Vista previa en vivo de la imagen */}
                {formData.imagenUrl.trim() && (
                  <div className="admin-image-preview-box">
                    <span className="preview-caption">Vista previa de imagen:</span>
                    <img
                      src={formData.imagenUrl}
                      alt={formData.nombre || 'Vista previa'}
                      className="admin-preview-img"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        e.currentTarget.style.display = 'block';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Acciones de Envío */}
            <div className="admin-form-actions">
              <button
                type="button"
                className="btn btn-secondary-light"
                onClick={() => navigate('/productos')}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-submit-admin"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando en MongoDB...' : '+ Crear Producto en Catálogo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ProductForm;

