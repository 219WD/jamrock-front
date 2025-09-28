import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import useProductStore from "../store/productStore";
import useNotify from "../hooks/useToast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faTruck,
  faClock,
  faCheckCircle,
  faMapMarkerAlt,
  faUser,
  faPhone,
  faHome,
  faCalendarAlt,
  faCreditCard,
  faBox,
  faMotorcycle,
  faStore,
  faSpinner,
  faMapPin,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./css/estadoEnvio.css";
import RatingModal from "./ShoppingCart/RatingModal";
import API_URL from "../common/constants";

const EstadoDelEnvio = () => {
  const [ultimoCarrito, setUltimoCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratedProducts, setRatedProducts] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?._id);
  const notify = useNotify();
  const { updateProductRating, fetchProductById } = useProductStore();

  // Pasos del proceso de entrega
  const deliverySteps = [
    {
      status: "inicializado",
      icon: faBox,
      label: "Pedido Confirmado",
      description: "Tu pedido ha sido recibido",
    },
    {
      status: "pendiente",
      icon: faClock,
      label: "En Proceso",
      description: "Estamos procesando tu pedido",
    },
    {
      status: "pagado",
      icon: faCreditCard,
      label: "Pago Confirmado",
      description: "Pago verificado exitosamente",
    },
    {
      status: "preparacion",
      icon: faSpinner,
      label: "En Preparación",
      description: "Preparando tu pedido",
    },
    {
      status: "entregado",
      icon: faCheckCircle,
      label: "Entregado",
      description: "¡Disfruta de tu pedido!",
    },
  ];

  useEffect(() => {
    const fetchUltimoCarrito = async () => {
      if (!token || !userId) {
        setError("Usuario no identificado. Por favor, inicia sesión.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/cart/user/${userId}/last`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al obtener el pedido");
        }

        const data = await response.json();
        console.log("Carrito obtenido:", data);
        setUltimoCarrito(data);

        // Calcular paso actual basado en el status
        const stepIndex = deliverySteps.findIndex(
          (step) => step.status === data.status
        );
        setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
        setProgress(((stepIndex + 1) / deliverySteps.length) * 100);

        if (data.ratings?.length > 0) {
          const ratedIds = data.ratings.map((rating) =>
            rating.productId.toString()
          );
          setRatedProducts(ratedIds);
        }
      } catch (err) {
        console.error("Error en fetchUltimoCarrito:", err);
        setError(err.message);
        notify(err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUltimoCarrito();
  }, [userId, token, notify]);

  // Simular progreso en tiempo real (solo para demo)
  useEffect(() => {
    if (
      ultimoCarrito &&
      ultimoCarrito.status !== "entregado" &&
      ultimoCarrito.status !== "cancelado"
    ) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [ultimoCarrito]);

  const getStatusInfo = (status) => {
    const step = deliverySteps.find((step) => step.status === status);
    return (
      step || {
        status: "default",
        icon: faBox,
        label: status,
        description: "Procesando tu pedido",
      }
    );
  };

  const getEstimatedTime = () => {
    if (!ultimoCarrito || ultimoCarrito.deliveryMethod !== "envio") return "";

    const created = new Date(ultimoCarrito.createdAt);
    const now = new Date();
    const diffMinutes = (now - created) / (1000 * 60);

    if (diffMinutes < 15) return "15-25 min";
    if (diffMinutes < 30) return "10-20 min";
    if (diffMinutes < 45) return "5-15 min";
    return "Casi listo!";
  };

  const calculateItemTotal = (item) => {
    // El precio está en item.productId.price, no en item.price
    const price = item.productId?.price;
    const quantity = item.quantity;

    if (price && quantity) {
      return (price * quantity).toFixed(2);
    }
    return "0.00";
  };

  const handleRateClick = (item) => {
    const product = item.productId;
    const productId = product._id || product;
    console.log("Producto seleccionado para calificar:", {
      id: productId,
      title: product?.title,
    });
    setCurrentProduct({
      id: productId,
      name: product?.title || "Producto",
      cartId: ultimoCarrito._id,
      image: product?.image,
    });
    setShowRatingModal(true);
  };

  const handleRateSuccess = async (productId, productUpdate) => {
    console.log(
      "handleRateSuccess - productId:",
      productId,
      "productUpdate:",
      productUpdate
    );
    setRatedProducts((prev) => [...prev, productId.toString()]);
    notify("¡Calificación enviada con éxito!", "success");
    setShowRatingModal(false);

    try {
      if (
        productUpdate &&
        typeof productUpdate.rating === "number" &&
        typeof productUpdate.numReviews === "number"
      ) {
        updateProductRating(
          productId,
          productUpdate.rating,
          productUpdate.numReviews
        );
      } else {
        console.warn(
          "productUpdate no contiene rating o numReviews válidos, intentando obtener producto:",
          productUpdate
        );
        notify(
          "Advertencia: Actualizando producto desde el backend",
          "warning"
        );
        const updatedProduct = await fetchProductById(productId);
        if (
          updatedProduct &&
          typeof updatedProduct.rating === "number" &&
          typeof updatedProduct.numReviews === "number"
        ) {
          updateProductRating(
            productId,
            updatedProduct.rating,
            updatedProduct.numReviews
          );
        } else {
          console.error(
            "No se pudo obtener rating y numReviews del producto:",
            updatedProduct
          );
          notify(
            "Error: No se pudo actualizar el rating del producto",
            "error"
          );
        }
      }
    } catch (err) {
      console.error("Error al actualizar rating del producto:", err);
      notify(
        "Error: No se pudo actualizar el rating del producto localmente",
        "error"
      );
    }
  };

  const isProductRated = (productId) =>
    ratedProducts.includes(productId.toString());

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Cargando tu pedido...</div>
        <div className="loading-subtext">Preparando toda la información</div>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{error}</div>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );

  if (!ultimoCarrito)
    return (
      <div className="no-orders-container">
        <div className="no-orders-icon">🛍️</div>
        <div className="no-orders-title">No tienes pedidos recientes</div>
        <div className="no-orders-subtitle">
          ¡Realiza tu primer pedido y vive la experiencia!
        </div>
      </div>
    );

  const statusInfo = getStatusInfo(ultimoCarrito.status);
  const shipping = ultimoCarrito.shippingAddress || {};
  const hasDeliveryTime = ultimoCarrito.deliveryMethod === "envio";
  const estimatedTime = getEstimatedTime();

  return (
    <div className="container-estado">
      <div className="estado-envio-container">
        {/* Header con información principal */}
        <div className="order-header">
          <div className="order-title-section">
            <h1>Tu Pedido está en Proceso</h1>
            <div className="order-id">
              Orden #
              {ultimoCarrito._id
                ? ultimoCarrito._id.slice(-8).toUpperCase()
                : "N/A"}
            </div>
          </div>
          {hasDeliveryTime && estimatedTime && (
            <div className="time-estimate">
              <FontAwesomeIcon icon={faClock} className="time-icon" />
              <span>Tiempo estimado: {estimatedTime}</span>
            </div>
          )}
        </div>

        {/* Progress Tracker */}
        <div className="progress-section">
          <div className="progress-header">
            <h3>Progreso del Pedido</h3>
            <div className="progress-percentage">{Math.round(progress)}%</div>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="steps-container">
            {deliverySteps.map((step, index) => (
              <div
                key={step.status}
                className={`step-item ${index <= currentStep ? "active" : ""} ${
                  index === currentStep ? "current" : ""
                }`}
              >
                <div className="step-icon">
                  <FontAwesomeIcon icon={step.icon} />
                </div>
                <div className="step-content">
                  <div className="step-label">{step.label}</div>
                  <div className="step-description">{step.description}</div>
                </div>
                {index < deliverySteps.length - 1 && (
                  <div className="step-connector"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Información de Entrega */}
        <div className="delivery-info-section">
          <div className="info-card">
            <div className="info-header">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <h4>Información de Entrega</h4>
            </div>
            <div className="info-content">
              <div className="info-row">
                <FontAwesomeIcon icon={faUser} />
                <span>{shipping.name || "No especificado"}</span>
              </div>
              <div className="info-row">
                <FontAwesomeIcon icon={faPhone} />
                <span>{shipping.phone || "No especificado"}</span>
              </div>
              {ultimoCarrito.deliveryMethod === "envio" ? (
                <>
                  <div className="info-row">
                    <FontAwesomeIcon icon={faHome} />
                    <span>{shipping.address || "No especificado"}</span>
                  </div>
                  <div className="delivery-badge delivery-home">
                    <FontAwesomeIcon icon={faMotorcycle} />
                    Entrega a Domicilio
                  </div>
                </>
              ) : (
                <div className="delivery-badge delivery-pickup">
                  <FontAwesomeIcon icon={faStore} />
                  Retiro en Local
                </div>
              )}
            </div>
          </div>

          <div className="info-card">
            <div className="info-header">
              <FontAwesomeIcon icon={faCreditCard} />
              <h4>Información del Pago</h4>
            </div>
            <div className="info-content">
              <div className="info-row">
                <span>Método:</span>
                <span className="capitalize payment-method">
                  {ultimoCarrito.paymentMethod}
                </span>
              </div>
              <div className="info-row">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>
                  {new Date(ultimoCarrito.createdAt).toLocaleDateString(
                    "es-ES",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Productos del Pedido */}
        <div className="products-section">
          <h3>Tu Pedido</h3>
          <div className="products-grid">
            {ultimoCarrito.items?.map((item, index) => {
              const product = item.productId;
              const productId = product?._id || product;

              return (
                <div key={index} className="product-card">
                  {/* Imagen a la izquierda */}
                  <div className="product-image">
                    {product?.image ? (
                      <img src={product.image} alt={product.title} />
                    ) : (
                      <div className="product-image-placeholder">📦</div>
                    )}
                  </div>

                  {/* Información del producto en el centro */}
                  <div className="product-info">
                    <div className="product-name">
                      {product?.title || "Producto no disponible"}
                    </div>
                    <div className="product-details">
                      <span className="product-quantity">
                        Cantidad: {item.quantity}
                      </span>
                      <span className="product-price">
                        ${calculateItemTotal(item)}
                      </span>
                    </div>
                  </div>

                  {/* Rating container a la derecha */}
                  {ultimoCarrito.status === "entregado" && product && (
                    <div className="product-rating-container">
                      {isProductRated(productId) ? (
                        <div className="rated-badge">
                          <FontAwesomeIcon
                            icon={faStar}
                            className="rated-star"
                          />
                          <span>¡Calificado!</span>
                        </div>
                      ) : (
                        <button
                          className="rate-button glow"
                          onClick={() => handleRateClick(item)}
                        >
                          <FontAwesomeIcon icon={faStar} />
                          Calificar Producto
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen Final */}
        <div className="order-summary">
          <div className="summary-total">
            <span>Total del Pedido</span>
            <span className="total-amount">
              ${ultimoCarrito.totalAmount?.toFixed(2)}
            </span>
          </div>

          {ultimoCarrito.deliveryMethod === "envio" && (
            <div className="shipping-note">
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>
                El costo de envío será cotizado por la empresa de transporte
              </span>
            </div>
          )}
        </div>

        {/* Mensaje especial según estado */}
        {ultimoCarrito.status === "entregado" && (
          <div className="special-message success">
            <FontAwesomeIcon icon={faCheckCircle} />
            <div>
              <strong>¡Pedido Entregado!</strong>
              <p>
                Esperamos que disfrutes tu pedido. ¡Califica tu experiencia!
              </p>
            </div>
          </div>
        )}

        {ultimoCarrito.status === "preparacion" && (
          <div className="special-message preparing">
            <FontAwesomeIcon icon={faSpinner} className="spinning" />
            <div>
              <strong>¡Tu pedido está casi listo!</strong>
              <p>Estamos preparando todo para que recibas tu pedido</p>
            </div>
          </div>
        )}
      </div>

      {showRatingModal && currentProduct && (
        <RatingModal
          productId={currentProduct.id}
          productName={currentProduct.name}
          cartId={currentProduct.cartId}
          productImage={currentProduct.image}
          existingRating={null}
          onClose={() => setShowRatingModal(false)}
          onRateSuccess={handleRateSuccess}
        />
      )}
    </div>
  );
};

export default EstadoDelEnvio;
