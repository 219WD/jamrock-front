import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

const ProductosModal = ({
  showProductosModal,
  setShowProductosModal,
  productosDisponibles,
  handleProductSelect,
}) => {
  const [quantities, setQuantities] = useState({});

  const handleIncrement = (productId, stock) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.min((prev[productId] || 0) + 1, stock),
    }));
  };

  const handleDecrement = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 0) - 1, 0),
    }));
  };

  const handleAddProduct = (producto) => {
    const quantity = quantities[producto._id] || 0;
    if (quantity > 0) {
      console.log("Adding product:", { ...producto, cantidad: quantity });
      handleProductSelect({
        ...producto,
        cantidad: quantity,
      });
      setQuantities((prev) => ({
        ...prev,
        [producto._id]: 0,
      }));
    }
  };

  return (
    showProductosModal && (
      <div className="modal-overlay">
        <div className="productos-modal">
          <div className="modal-header">
            <h3>Seleccionar Productos</h3>
            <button
              className="close-modal"
              onClick={() => setShowProductosModal(false)}
            >
              &times;
            </button>
          </div>
          <div className="modal-content-productos">
            {productosDisponibles.length === 0 ? (
              <p className="no-products">No hay productos disponibles</p>
            ) : (
              <table className="productos-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Categoría</th>
                    <th>Imagen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosDisponibles.map((producto) => (
                    <tr key={producto._id}>
                      <td>{producto.title || "Sin título"}</td>
                      <td>{producto.description || "Sin descripción"}</td>
                      <td>${producto.price || 0}</td>
                      <td>
                        {producto.stock > 0 ? (
                          <span className="producto-stock">
                            {producto.stock} disponibles
                          </span>
                        ) : (
                          <span className="producto-sinstock">Sin stock</span>
                        )}
                      </td>
                      <td>{producto.category || "Sin categoría"}</td>
                      <td>
                        {producto.image ? (
                          <img
                            src={producto.image}
                            alt={producto.title}
                            className="product-image"
                          />
                        ) : (
                          "Sin imagen"
                        )}
                      </td>
                      <td>
                        <div className="product-actions">
                          <button
                            className="btn-quantity btn-decrement"
                            onClick={() => handleDecrement(producto._id)}
                            disabled={(quantities[producto._id] || 0) <= 0}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <span className="quantity-display">
                            {quantities[producto._id] || 0}
                          </span>
                          <button
                            className="btn-quantity btn-increment"
                            onClick={() => handleIncrement(producto._id, producto.stock)}
                            disabled={
                              producto.stock <= 0 ||
                              (quantities[producto._id] || 0) >= producto.stock
                            }
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                          <button
                            className="btn-add"
                            onClick={() => handleAddProduct(producto)}
                            disabled={
                              producto.stock <= 0 || (quantities[producto._id] || 0) <= 0
                            }
                          >
                            Agregar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="modal-footer">
            <button
              className="btn-close"
              onClick={() => setShowProductosModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ProductosModal;