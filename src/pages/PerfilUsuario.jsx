import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import RatingModal from "../components/ShoppingCart/RatingModal";
import useNotify from "../hooks/useToast";
import NavDashboard from "../components/NavDashboard";
import "../pages/css/PerfilUsuario.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCalendarAlt,
  faPills,
  faShoppingCart,
  faFileMedicalAlt,
  faStar,
  faEye,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import API_URL from "../common/constants";

const PerfilUsuario = () => {
  const { user, token } = useAuthStore();
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [partnerData, setPartnerData] = useState(null);
  const [carts, setCarts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [showRating, setShowRating] = useState(null);
  const [ratedProducts, setRatedProducts] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [activeTab, setActiveTab] = useState("perfil");
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    if (!user?._id || !token) return;

    // Cargar datos básicos del usuario
    setFormData({
      name: user.name || "",
      email: user.email || "",
    });

    // Cargar datos del partner (para cualquier usuario que tenga partnerData)
    fetch(`${API_URL}/partners/user/getPartnerByUserId/${user._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setPartnerData(data))
      .catch((err) => console.log("Info partner:", err));

    // Cargar carritos del usuario solo si es partner
    if (user.isPartner) {
      fetch(`${API_URL}/cart/user/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          const reversed = Array.isArray(data) ? [...data].reverse() : [];
          setCarts(reversed);
          calcularTopProductos(reversed);

          // Extraer calificaciones de todos los carritos
          const allRatings = reversed.flatMap((cart) =>
            (cart.ratings || []).map((rating) => ({
              ...rating,
              cartId: cart._id,
            }))
          );

          // Guardar IDs de productos calificados
          const ratedIds = allRatings.map((rating) =>
            rating.productId.toString()
          );
          setRatedProducts(ratedIds);
        })
        .catch((err) => console.log("Error carritos:", err));
    }

    // Cargar turnos del usuario si es paciente
    if (user.isPaciente) {
      fetch(`${API_URL}/turnos/mis-datos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setTurnos(data.data || []);
        })
        .catch((err) => console.log("Error turnos:", err));

      // Cargar historial médico
      fetch(`${API_URL}/pacientes/mi-perfil`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.data && data.data.historialConsultas) {
            setHistorial(data.data.historialConsultas);
          }
        })
        .catch((err) => console.log("Error historial:", err));
    }
  }, [user?._id, token, user?.isPartner, user?.isPaciente]);

  // Función para encontrar la calificación de un producto
  const findProductRating = (productId, cart) => {
    if (!cart.ratings) return null;

    return cart.ratings.find(
      (rating) => rating.productId.toString() === productId.toString()
    );
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/user/updateUser/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        useAuthStore.getState().setUser(data);
        useNotify("success", "Perfil actualizado correctamente");
      }
    } catch (err) {
      console.error("Error en la actualización:", err);
      useNotify("error", "Error al actualizar perfil");
    }
  };

  const calcularTopProductos = (carts) => {
    const productos = {};

    carts.forEach((cart) => {
      (cart.items || cart.products || []).forEach((item) => {
        const id = item.productId?._id || item.productId;
        const name =
          item.productId?.title || item.productId?.name || "Producto";
        const image = item.productId?.image || "";
        if (id) {
          productos[id] = productos[id] || { image, name, count: 0 };
          productos[id].count += item.quantity;
        }
      });
    });

    const top = Object.entries(productos)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopProducts(top);
  };

  const handleRateClick = (item, cart, existingRating = null) => {
    const product = item.productId || {};
    setShowRating({
      id: product._id || item.productId,
      name: product.title || product.name || "Producto",
      cartId: cart._id,
      existingRating, // Pasar la calificación existente si existe
    });
  };

  const handleRateSuccess = (productId) => {
    // Añadir el producto calificado a la lista
    setRatedProducts((prev) => [...prev, productId.toString()]);

    // Actualizar la lista de carritos para reflejar la nueva calificación
    setCarts((prevCarts) => {
      return prevCarts.map((cart) => {
        if (cart._id === showRating.cartId) {
          // Si el carrito ya tiene ratings, añadir el nuevo
          const newRatings = cart.ratings
            ? [
                ...cart.ratings,
                {
                  productId,
                  stars: showRating.rating,
                  comment: showRating.comment,
                },
              ]
            : [
                {
                  productId,
                  stars: showRating.rating,
                  comment: showRating.comment,
                },
              ];

          return { ...cart, ratings: newRatings };
        }
        return cart;
      });
    });

    useNotify("success", "¡Calificación enviada con éxito!");
  };

  const isProductRated = (productId) => {
    return ratedProducts.includes(productId.toString());
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-AR", options);
  };

  return (
    <div className="admin">
      <NavDashboard />
      <div className="admin-container">
        <h2 className="dashboard-title">Mi Perfil</h2>

        {/* Navegación por pestañas */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "perfil" ? "active" : ""}`}
            onClick={() => setActiveTab("perfil")}
          >
            <FontAwesomeIcon icon={faUser} /> Perfil
          </button>

          {user?.isPartner && (
            <button
              className={`tab-btn ${activeTab === "pedidos" ? "active" : ""}`}
              onClick={() => setActiveTab("pedidos")}
            >
              <FontAwesomeIcon icon={faShoppingCart} /> Mis Pedidos
            </button>
          )}

          {user?.isPaciente && (
            <>
              <button
                className={`tab-btn ${activeTab === "turnos" ? "active" : ""}`}
                onClick={() => setActiveTab("turnos")}
              >
                <FontAwesomeIcon icon={faCalendarAlt} /> Mis Turnos
              </button>

              <button
                className={`tab-btn ${activeTab === "recetas" ? "active" : ""}`}
                onClick={() => setActiveTab("recetas")}
              >
                <FontAwesomeIcon icon={faPills} /> Recetas
              </button>

              <button
                className={`tab-btn ${
                  activeTab === "historial" ? "active" : ""
                }`}
                onClick={() => setActiveTab("historial")}
              >
                <FontAwesomeIcon icon={faFileMedicalAlt} /> Historial
              </button>
            </>
          )}
        </div>

        {/* Contenido de las pestañas */}
        <div className="dashboard-content">
          {activeTab === "perfil" && (
            <>
              <div className="dashboard-section">
                <h2 className="section-title">
                  <FontAwesomeIcon icon={faUser} /> Información Personal
                </h2>
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-grid">
                    <div className="profile-field">
                      <label className="profile-label" htmlFor="name">
                        Nombre
                      </label>
                      <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="profile-input"
                        placeholder="Ingresá tu nombre"
                        required
                      />
                    </div>

                    <div className="profile-field">
                      <label className="profile-label" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="profile-input"
                        placeholder="ejemplo@correo.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="profile-password-btn"
                      onClick={() => setShowForgotModal(true)}
                    >
                      Cambiar contraseña
                    </button>
                    <button type="submit" className="profile-submit-btn">
                      Guardar cambios
                    </button>
                  </div>
                </form>
                <ForgotPasswordModal
                  show={showForgotModal}
                  onHide={() => setShowForgotModal(false)}
                />
              </div>

              {partnerData && (
                <div className="dashboard-section">
                  <h2 className="section-title">
                    <FontAwesomeIcon icon={faUser} /> Datos del Socio
                  </h2>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">DNI:</span>
                      <span className="info-value">{partnerData.dni}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Dirección:</span>
                      <span className="info-value">
                        {partnerData.address || partnerData.adress}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Teléfono:</span>
                      <span className="info-value">{partnerData.phone}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">REPROCANN:</span>
                      <span className="info-value">
                        {partnerData.reprocann ? "Sí" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {user?.isPartner && topProducts.length > 0 && (
                <div className="dashboard-section">
                  <h2 className="section-title">
                    <FontAwesomeIcon icon={faStar} /> Productos más comprados
                  </h2>
                  <div className="top-products-grid">
                    {topProducts.map((prod) => (
                      <div className="top-product-card" key={prod.id}>
                        <img
                          src={prod.image || "/placeholder.png"}
                          alt={prod.name}
                          className="product-thumbnail"
                        />
                        <div className="product-details">
                          <h3 className="product-name">{prod.name}</h3>
                          <p className="product-count">{prod.count} unidades</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "pedidos" && user?.isPartner && (
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
                          <span>Método:</span>{" "}
                          {cart.paymentMethod || "No especificado"}
                        </div>
                        <div className="order-total">
                          <span>Total:</span> $
                          {cart.totalAmount?.toFixed(2) || 0}
                        </div>
                      </div>
                      <div className="order-products">
                        <h4>Productos:</h4>
                        <ul>
                          {(cart.items || cart.products || []).map(
                            (item, idx) => {
                              const product = item.productId || {};
                              const productId = product._id || item.productId;
                              const productName =
                                product.title || product.name || "Producto";

                              // Buscar si ya existe una calificación para este producto
                              const existingRating = findProductRating(
                                productId,
                                cart
                              );
                              const isRated =
                                existingRating || isProductRated(productId);

                              return (
                                <li key={idx}>
                                  {productName} x{item.quantity} - $
                                  {item.price || product.price * item.quantity}
                                  {cart.status === "entregado" && (
                                    <div className="product-rating-container">
                                      {isRated ? (
                                        <button
                                          onClick={() =>
                                            handleRateClick(
                                              item,
                                              cart,
                                              existingRating
                                            )
                                          }
                                          className="view-rating-btn"
                                        >
                                          <FontAwesomeIcon icon={faEye} /> Ver
                                          Calificación
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            handleRateClick(item, cart)
                                          }
                                          className="rate-btn"
                                        >
                                          <FontAwesomeIcon icon={faStar} />{" "}
                                          Calificar
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No hay pedidos recientes</p>
              )}
            </div>
          )}

          {activeTab === "turnos" && user?.isPaciente && (
            <div className="dashboard-section">
              <h2 className="section-title">
                <FontAwesomeIcon icon={faCalendarAlt} /> Mis Próximos Turnos
              </h2>
              {turnos.length > 0 ? (
                <div className="appointments-grid">
                  {turnos
                    .filter((t) =>
                      ["pendiente", "confirmado"].includes(t.estado)
                    )
                    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                    .slice(0, 3)
                    .map((turno) => (
                      <div key={turno._id} className="appointment-card">
                        <div className="appointment-header">
                          <span className="appointment-date">
                            {formatDate(turno.fecha)}
                          </span>
                          <span
                            className={`appointment-status ${turno.estado}`}
                          >
                            {turno.estado}
                          </span>
                        </div>
                        <div className="appointment-details">
                          <div className="appointment-specialist">
                            <span>Especialista:</span>{" "}
                            {turno.especialistaId?.userId?.name ||
                              "No especificado"}
                          </div>
                          <div className="appointment-reason">
                            <span>Motivo:</span> {turno.motivo}
                          </div>
                        </div>
                        {turno.consulta?.productos?.length > 0 && (
                          <div className="appointment-products">
                            <h4>Productos recetados:</h4>
                            <ul>
                              {turno.consulta.productos.map((prod, idx) => (
                                <li key={idx}>
                                  {prod.nombreProducto} x{prod.cantidad} - $
                                  {prod.precioUnitario * prod.cantidad}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="no-data">No tienes turnos programados</p>
              )}
            </div>
          )}

          {activeTab === "recetas" && user?.isPaciente && (
            <div className="dashboard-section">
              <h2 className="section-title">
                <FontAwesomeIcon icon={faPills} /> Mis Últimas Recetas
              </h2>
              {turnos.filter((t) => t.consulta?.productos?.length > 0).length >
              0 ? (
                <div className="prescriptions-grid">
                  {turnos
                    .filter((t) => t.consulta?.productos?.length > 0)
                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                    .slice(0, 5)
                    .map((turno) => (
                      <div key={turno._id} className="prescription-card">
                        <div className="prescription-header">
                          <span className="prescription-date">
                            {formatDate(turno.fecha)}
                          </span>
                          <span className="prescription-doctor">
                            Dr.{" "}
                            {turno.especialistaId?.userId?.name ||
                              "No especificado"}
                          </span>
                        </div>
                        <div className="prescription-products">
                          <h4>Medicamentos:</h4>
                          <ul>
                            {turno.consulta.productos.map((prod, idx) => (
                              <li key={idx}>
                                <strong>{prod.nombreProducto}</strong> -{" "}
                                {prod.cantidad} unidad(es)
                                {prod.dosis && (
                                  <span className="dosis">
                                    Dosis: {prod.dosis}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="prescription-notes">
                          <h4>Indicaciones:</h4>
                          <p>
                            {turno.consulta.notasConsulta ||
                              "No hay indicaciones adicionales"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="no-data">No tienes recetas registradas</p>
              )}
            </div>
          )}

          {activeTab === "historial" && user?.isPaciente && (
            <div className="dashboard-section">
              <h2 className="section-title">
                <FontAwesomeIcon icon={faFileMedicalAlt} /> Mi Historial
                Completo
              </h2>
              {turnos.length > 0 ? (
                <div className="medical-history">
                  {turnos
                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                    .map((turno) => (
                      <div key={turno._id} className="history-card">
                        <div className="history-header">
                          <span className="history-date">
                            {formatDate(turno.fecha)}
                          </span>
                          <span className={`history-status ${turno.estado}`}>
                            {turno.estado}
                          </span>
                        </div>
                        <div className="history-content">
                          <div className="history-section">
                            <h4>Especialista:</h4>
                            <p>
                              {turno.especialistaId?.userId?.name ||
                                "No especificado"}
                            </p>
                          </div>

                          <div className="history-section">
                            <h4>Motivo de consulta:</h4>
                            <p>{turno.motivo || "No especificado"}</p>
                          </div>

                          <div className="history-section">
                            <h4>Indicaciones:</h4>
                            <p>{turno.notas || "No hay notas registradas"}</p>
                          </div>

                          {turno.reprocannRelacionado && (
                            <div className="history-section">
                              <h4>REPROCANN:</h4>
                              <p>Consulta relacionada con trámite REPROCANN</p>
                            </div>
                          )}

                          {turno.consulta && (
                            <>
                              <div className="history-section">
                                <h4>Detalles de la consulta:</h4>
                                <p>
                                  Estado:{" "}
                                  {turno.consulta.pagado
                                    ? "Pagado"
                                    : "Pendiente de pago"}
                                </p>
                                <p>
                                  Método de pago:{" "}
                                  {turno.consulta.formaPago ||
                                    "No especificado"}
                                </p>
                                {turno.consulta.notasConsulta && (
                                  <p>Notas: {turno.consulta.notasConsulta}</p>
                                )}
                              </div>

                              {turno.consulta.productos?.length > 0 && (
                                <div className="history-section">
                                  <h4>Productos recetados:</h4>
                                  <ul className="product-list">
                                    {turno.consulta.productos.map(
                                      (prod, idx) => (
                                        <li key={idx}>
                                          <strong>{prod.nombreProducto}</strong>{" "}
                                          - Cantidad: {prod.cantidad} - Precio
                                          unitario: ${prod.precioUnitario} -
                                          Total: $
                                          {(
                                            prod.precioUnitario * prod.cantidad
                                          ).toFixed(2)}
                                          {prod.dosis && (
                                            <span> (Dosis: {prod.dosis})</span>
                                          )}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                  <p className="total-amount">
                                    Total consulta: $
                                    {turno.consulta.total?.toFixed(2) || "0.00"}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="no-data">
                  No hay registros en tu historial médico
                </p>
              )}
            </div>
          )}
        </div>

        {showRating && (
          <RatingModal
            productId={showRating.id}
            productName={showRating.name}
            cartId={showRating.cartId}
            existingRating={showRating.existingRating}
            onClose={() => setShowRating(null)}
            onRateSuccess={() => handleRateSuccess(showRating.id)}
          />
        )}
      </div>
    </div>
  );
};

export default PerfilUsuario;
