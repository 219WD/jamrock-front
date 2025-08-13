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

const ProductTable = ({ productos, handleEdit, handleDelete, handleToggleEstado }) => {
  const renderStars = (rating) => {
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

  return (
    <div className="orders-table">
      <table>
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
              <td>{producto.title}</td>
              <td>{producto.description}</td>
              <td>${producto.price}</td>
              <td>{producto.stock}</td>
              <td>{producto.category}</td>
              <td>
                <img src={producto.image} alt={producto.title} className="product-image" />
              </td>
              <td>
                {renderStars(producto.rating)} ({producto.rating?.toFixed(1)})
              </td>
              <td>{producto.isActive ? "Activo" : "Inactivo"}</td>
              <td>
                <button onClick={() => handleEdit(producto)} className="btn btn-edit">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button onClick={() => handleDelete(producto._id)} className="btn btn-delete">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                <button
                  onClick={() => handleToggleEstado(producto._id)}
                  className={`btn btn-toggle ${producto.isActive ? "activo" : "inactivo"}`}
                  title={producto.isActive ? "Desactivar producto" : "Activar producto"}
                >
                  <FontAwesomeIcon icon={faPowerOff} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;