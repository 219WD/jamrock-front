import React, { useState, useEffect } from "react";

const ProductosModal = ({
  showProductosModal,
  setShowProductosModal,
  productosDisponibles,
  handleProductSelect,
  selectedProducts, // Nuevo prop para productos ya seleccionados
}) => {
  const [quantities, setQuantities] = useState({});
  const [availableStock, setAvailableStock] = useState({});

  // Sincronizar el stock disponible considerando productos ya seleccionados
  useEffect(() => {
    const updatedAvailableStock = {};
    const updatedQuantities = {};

    productosDisponibles.forEach((producto) => {
      // Encontrar si el producto ya está seleccionado
      const selectedProduct = selectedProducts?.find(
        (p) => p.productoId === producto._id
      );
      
      const alreadySelectedQuantity = selectedProduct?.cantidad || 0;
      
      // Stock realmente disponible = stock total - ya seleccionado
      updatedAvailableStock[producto._id] = Math.max(
        0,
        producto.stock - alreadySelectedQuantity
      );
      
      // Inicializar cantidad en 0 o mantener la actual si existe
      updatedQuantities[producto._id] = quantities[producto._id] || 0;
    });

    setAvailableStock(updatedAvailableStock);
    setQuantities(updatedQuantities);
  }, [productosDisponibles, selectedProducts, showProductosModal]);

  const handleIncrement = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.min((prev[productId] || 0) + 1, availableStock[productId] || 0),
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
    if (quantity > 0 && quantity <= (availableStock[producto._id] || 0)) {
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
        <div className="modal-content">
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
                    <th>Stock Disponible</th>
                    <th>Categoría</th>
                    <th>Imagen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosDisponibles.map((producto) => {
                    const currentAvailableStock = availableStock[producto._id] || 0;
                    const currentQuantity = quantities[producto._id] || 0;
                    
                    return (
                      <tr key={producto._id}>
                        <td>{producto.title || "Sin título"}</td>
                        <td>{producto.description || "Sin descripción"}</td>
                        <td>${producto.price || 0}</td>
                        <td>
                          {currentAvailableStock > 0 ? (
                            <span className="producto-stock">
                              {currentAvailableStock} disponibles
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
                              disabled={currentQuantity <= 0}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M3 10H17"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                            <span className="quantity-display">
                              {currentQuantity}
                            </span>
                            <button
                              className="btn-quantity btn-increment"
                              onClick={() => handleIncrement(producto._id)}
                              disabled={currentAvailableStock <= 0 || currentQuantity >= currentAvailableStock}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10 3V17M3 10H17"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                            <button
                              className="btn-add"
                              onClick={() => handleAddProduct(producto)}
                              disabled={currentAvailableStock <= 0 || currentQuantity <= 0}
                            >
                              Agregar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="modal-actions">
            <button
              className="btn-cancel"
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