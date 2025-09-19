import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import useNotify from "../hooks/useToast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import "./css/estadoEnvio.css";
import RatingModal from "./ShoppingCart/RatingModal";

const EstadoDelEnvio = () => {
  const [ultimoCarrito, setUltimoCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratedProducts, setRatedProducts] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?._id);
  const notify = useNotify();

  const API_URL = "http://localhost:4000/cart";

  useEffect(() => {
    const fetchUltimoCarrito = async () => {
      try {
        const lastCartId = localStorage.getItem("lastCartId");

        if (!token || (!userId && !lastCartId)) {
          setError("Usuario no identificado");
          setLoading(false);
          return;
        }

        let response;

        if (lastCartId) {
          response = await fetch(`${API_URL}/${lastCartId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          response = await fetch(`${API_URL}/user/${userId}/last`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        if (!response.ok) {
          throw new Error("Error al obtener el pedido");
        }

        const data = await response.json();
        setUltimoCarrito(data);

        if (data.ratings && data.ratings.length > 0) {
          const ratedIds = data.ratings.map((rating) =>
            rating.productId.toString()
          );
          setRatedProducts(ratedIds);
        }
      } catch (err) {
        setError(err.message);
        notify(err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUltimoCarrito();
  }, [userId, token, notify]);

  const getStatusStyles = (status) => {
    switch (status) {
      case "inicializado":
        return { className: "status-inicializado", text: "Carrito creado" };
      case "pendiente":
        return {
          className: "status-pendiente",
          text: "Pendiente de confirmación",
        };
      case "pagado":
        return { className: "status-pagado", text: "Pagado" };
      case "preparacion":
        return { className: "status-preparacion", text: "En preparación" };
      case "entregado":
        return { className: "status-entregado", text: "Entregado" };
      case "cancelado":
        return { className: "status-cancelado", text: "Cancelado" };
      default:
        return { className: "status-default", text: status };
    }
  };

  const handleRateClick = (item) => {
    const product = item.productId;
    setCurrentProduct({
      id: product._id || product,
      name: product?.title || "Producto",
      cartId: ultimoCarrito._id,
    });
    setShowRatingModal(true);
  };

  const handleRateSuccess = (productId) => {
    setRatedProducts((prev) => [...prev, productId.toString()]);
    notify("¡Calificación enviada con éxito!", "success");
    setShowRatingModal(false);
  };

  const isProductRated = (productId) => {
    return ratedProducts.includes(productId.toString());
  };

  if (loading)
    return <div className="loading">Cargando tu último pedido...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!ultimoCarrito)
    return <div className="no-carrito">No tienes pedidos recientes</div>;

  const statusInfo = getStatusStyles(ultimoCarrito.status);
  const shipping = ultimoCarrito.shippingAddress || {};

  return (
    <div className="container-estado">
      <div className="estado-envio-container">
        <h2>Estado de tu último pedido</h2>

        <div className="estado-section">
          <div className="estado-section-row border-bottom">
            <div className="estado-section-status border-bottom">
              <h3>Estado del pedido</h3>
              <div className={`status-badge ${statusInfo.className}`}>
                {statusInfo.text}
              </div>
            </div>
            
            <div className="tipo-entrega">
              <h3>Tipo de entrega</h3>
              <div className="tipo-entrega-info">
                {ultimoCarrito.deliveryMethod === "envio" ? (
                  <span className="entrega-domicilio">Entrega a domicilio</span>
                ) : (
                  <span className="retiro-local">Retiro en local</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="info-contacto border-bottom">
            <h3>Información de contacto</h3>
            <div className="info-contacto-detalles">
              <p>
                <strong>Nombre:</strong> {shipping.name}
              </p>
              <p>
                <strong>Teléfono:</strong> {shipping.phone}
              </p>
              {ultimoCarrito.deliveryMethod === "envio" && (
                <p>
                  <strong>Dirección:</strong> {shipping.address}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="productos-section">
          <h3>Productos en tu pedido</h3>
          <ul className="productos-list">
            {ultimoCarrito.items.map((item, index) => {
              const product = item.productId;
              const productId = product?._id || product;

              return (
                <li key={index} className="producto-item">
                  <span className="producto-nombre">
                    {product?.title || "Producto no disponible"}
                  </span>
                  <span className="producto-cantidad">x{item.quantity}</span>

                  {ultimoCarrito.status === "entregado" && product && (
                    <div className="product-rating-container">
                      {isProductRated(productId) ? (
                        <span className="rated-label">
                          <FontAwesomeIcon
                            icon={faStar}
                            className="rated-star"
                          />
                          ¡Gracias por tu calificación!
                        </span>
                      ) : (
                        <button
                          className="rate-button"
                          onClick={() => handleRateClick(item)}
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

        <div className="resumen-pedido">
          <div className="metodo-pago">
            <span>Método de pago:</span>
            <span className="capitalize">{ultimoCarrito.paymentMethod}</span>
          </div>

          <div className="fecha-pedido">
            <span>Fecha:</span>
            <span>
              {new Date(ultimoCarrito.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="total-pedido">
            <span>Total:</span>
            <span>${ultimoCarrito.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {showRatingModal && currentProduct && (
        <RatingModal
          productId={currentProduct.id}
          productName={currentProduct.name}
          cartId={currentProduct.cartId}
          existingRating={null}
          onClose={() => setShowRatingModal(false)}
          onRateSuccess={() => handleRateSuccess(currentProduct.id)}
        />
      )}
    </div>
  );
};

export default EstadoDelEnvio;