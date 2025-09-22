import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPowerOff,
  faStar as solidStar,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

const ProductTable = ({ productos, loading, onEdit, onDelete, onToggleEstado }) => {
  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon={solidStar} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} color="#FFD700" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={regularStar} color="#FFD700" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="no-productos">
        <p>No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="productos-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Imagen</th>
            <th>Rating</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto._id}>
              <td data-label="Título">{producto.title}</td>
              <td data-label="Descripción" className="description-cell">
                <div className="description-content">
                  {producto.description}
                </div>
              </td>
              <td data-label="Precio">${producto.price}</td>
              <td data-label="Stock">{producto.stock}</td>
              <td data-label="Categoría">{producto.category}</td>
              <td data-label="Imagen">
                {producto.image && (
                  <img src={producto.image} alt={producto.title} className="product-image" />
                )}
              </td>
              <td data-label="Rating">
                <div className="rating">
                  {renderStars(producto.rating || 0)} 
                  <span className="rating-value">({producto.rating ? producto.rating.toFixed(1) : '0.0'})</span>
                </div>
              </td>
              <td data-label="Estado">
                <span className={`status-badge ${producto.isActive ? 'activo' : 'inactivo'}`}>
                  {producto.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td data-label="Acciones">
                <div className="action-buttons">
                  <button onClick={() => onEdit(producto)} className="btn btn-edit" title="Editar producto">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button onClick={() => onDelete(producto._id)} className="btn btn-delete" title="Eliminar producto">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button
                    onClick={() => onToggleEstado(producto._id)}
                    className={`btn btn-toggle ${producto.isActive ? "activo" : "inactivo"}`}
                    title={producto.isActive ? "Desactivar producto" : "Activar producto"}
                  >
                    <FontAwesomeIcon icon={faPowerOff} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;