import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faStar, faEye } from "@fortawesome/free-solid-svg-icons";

const OrdersSection = ({ carts, findProductRating, isProductRated, handleRateClick }) => {
  return (
    <div className="dashboard-section">
      <h2 className="section-title">
        <FontAwesomeIcon icon={faShoppingCart} /> Mis Pedidos Recientes
      </h2>
      {carts.length > 0 ? (
        <div className="orders-grid">
          {carts.slice(0, 5).map((cart) => (
            <div key={cart._id} className="order-card">
              <div className="order-header">
                <span className="order-date">
                  {new Date(cart.createdAt).toLocaleDateString()}
                </span>
                <span className={`order-status ${cart.status}`}>
                  {cart.status || "No definido"}
                </span>
              </div>
              <div className="order-details">
                <div className="order-method">
                  <span>Método:</span> {cart.paymentMethod || "No especificado"}
                </div>
                <div className="order-total">
                  <span>Total:</span> ${cart.totalAmount?.toFixed(2) || 0}
                </div>
              </div>
              <div className="order-products">
                <h4>Productos:</h4>
                <ul>
                  {(cart.items || cart.products || []).map((item, idx) => {
                    const product = item.productId || {};
                    const productId = product._id || item.productId;
                    const productName = product.title || product.name || "Producto";
                    const existingRating = findProductRating(productId, cart);
                    const isRated = existingRating || isProductRated(productId);

                    return (
                      <li key={idx}>
                        {productName} x{item.quantity} - $
                        {item.price || product.price * item.quantity}
                        {cart.status === "entregado" && (
                          <div className="product-rating-container">
                            {isRated ? (
                              <button
                                onClick={() => handleRateClick(item, cart, existingRating)}
                                className="view-rating-btn"
                              >
                                <FontAwesomeIcon icon={faEye} /> Ver Calificación
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRateClick(item, cart)}
                                className="rate-btn"
                              >
                                <FontAwesomeIcon icon={faStar} /> Calificar
                              </button>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No hay pedidos recientes</p>
      )}
    </div>
  );
};

export default OrdersSection;