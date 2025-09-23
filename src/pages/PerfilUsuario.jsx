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
} from "@fortawesome/free-solid-svg-icons";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import API_URL from "../common/constants";

const PerfilUsuario = () => {
  const { user, token, setUser } = useAuthStore();
  const notify = useNotify(); // ✅ CORRECTO: Obtener la función del hook
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [partnerFormData, setPartnerFormData] = useState({ dni: "", adress: "", phone: "" });
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

    // Cargar datos del partner
    fetch(`${API_URL}/partners/user/getPartnerByUserId/${user._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setPartnerData(data);
          setPartnerFormData({
            dni: data.dni || "",
            adress: data.adress || data.address || "",
            phone: data.phone || "",
          });
        }
      })
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

          const allRatings = reversed.flatMap((cart) =>
            (cart.ratings || []).map((rating) => ({
              ...rating,
              cartId: cart._id,
            }))
          );
          setRatedProducts(allRatings.map((rating) => rating.productId.toString()));
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

  const findProductRating = (productId, cart) => {
    if (!cart.ratings) return null;
    return cart.ratings.find(
      (rating) => rating.productId.toString() === productId.toString()
    );
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePartnerChange = (e) => {
    setPartnerFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending request to:', `${API_URL}/users/updateUser/${user._id}`);
      console.log('Token:', token);
      console.log('Request body:', formData);
      const res = await fetch(`${API_URL}/users/updateUser/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        console.log('Response text:', text);
        let errorData;
        try {
          errorData = JSON.parse(text);
          throw new Error(errorData.error || `Error ${res.status}: No se pudo actualizar el perfil`);
        } catch (jsonError) {
          throw new Error(`Error ${res.status}: Respuesta no es JSON válida - ${text.slice(0, 100)}`);
        }
      }

      const data = await res.json();
      setUser(data.user); // ✅ CORRECTO: Usar setUser del hook
      notify("Perfil actualizado correctamente", "success")
    } catch (err) {
      console.error("Error en la actualización:", err.message);
      notify("Error al actualizar perfil", "error"); // ✅ CORRECTO
    }
  };

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending partner request to:', `${API_URL}/partners/updatePartner/${partnerData._id}`);
      console.log('Partner request body:', partnerFormData);
      const res = await fetch(`${API_URL}/partners/updatePartner/${partnerData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(partnerFormData),
      });

      console.log('Partner response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        console.log('Partner response text:', text);
        let errorData;
        try {
          errorData = JSON.parse(text);
          throw new Error(errorData.error || `Error ${res.status}: No se pudo actualizar los datos del socio`);
        } catch (jsonError) {
          throw new Error(`Error ${res.status}: Respuesta no es JSON válida - ${text.slice(0, 100)}`);
        }
      }

      const data = await res.json();
      setPartnerData(data);
      
      notify("Datos del socio actualizados correctamente","success"); // ✅ CORRECTO
    } catch (err) {
      notify("Error al actualizar datos del socio", "error"); // ✅ CORRECTO
    }
  };

  const calcularTopProductos = (carts) => {
    const productos = {};
    carts.forEach((cart) => {
      (cart.items || cart.products || []).forEach((item) => {
        const id = item.productId?._id || item.productId;
        const name = item.productId?.title || item.productId?.name || "Producto";
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
      existingRating,
    });
  };

  const handleRateSuccess = (productId) => {
    setRatedProducts((prev) => [...prev, productId.toString()]);
    setCarts((prevCarts) => {
      return prevCarts.map((cart) => {
        if (cart._id === showRating.cartId) {
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
    notify("success", "¡Calificación enviada con éxito!"); // ✅ CORRECTO
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
    <div className="perfil">
      <div className="perfil-layout">
        <NavDashboard />
        <div className="perfil-container">
          <h2 className="dashboard-title-perfil">Mi Perfil</h2>
          <div className="dashboard-tabs-perfil">
            <button
              className={`tab-btn-perfil ${activeTab === "perfil" ? "active" : ""}`}
              onClick={() => setActiveTab("perfil")}
            >
              <FontAwesomeIcon icon={faUser} /> Perfil
            </button>
            {user?.isPartner && (
              <button
                className={`tab-btn-perfil ${activeTab === "pedidos" ? "active" : ""}`}
                onClick={() => setActiveTab("pedidos")}
              >
                <FontAwesomeIcon icon={faShoppingCart} /> Mis Pedidos
              </button>
            )}
            {user?.isPaciente && (
              <>
                <button
                  className={`tab-btn-perfil ${activeTab === "turnos" ? "active" : ""}`}
                  onClick={() => setActiveTab("turnos")}
                >
                  <FontAwesomeIcon icon={faCalendarAlt} /> Mis Turnos
                </button>
                <button
                  className={`tab-btn-perfil ${activeTab === "recetas" ? "active" : ""}`}
                  onClick={() => setActiveTab("recetas")}
                >
                  <FontAwesomeIcon icon={faPills} /> Recetas
                </button>
                <button
                  className={`tab-btn-perfil ${
                    activeTab === "historial" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("historial")}
                >
                  <FontAwesomeIcon icon={faFileMedicalAlt} /> Historial
                </button>
              </>
            )}
          </div>
          <div className="dashboard-content-perfil">
            {activeTab === "perfil" && (
              <>
                <div className="dashboard-section-perfil">
                  <h2 className="section-title-perfil">
                    <FontAwesomeIcon icon={faUser} /> Información Personal
                  </h2>
                  <form onSubmit={handleSubmit} className="perfil-form">
                    <div className="form-grid-perfil">
                      <div className="perfil-field">
                        <label className="perfil-label" htmlFor="name">
                          Nombre
                        </label>
                        <input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="perfil-input"
                          placeholder="Ingresá tu nombre"
                          required
                        />
                      </div>
                      <div className="perfil-field">
                        <label className="perfil-label" htmlFor="email">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="perfil-input"
                          placeholder="ejemplo@correo.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-actions-perfil">
                      <button
                        type="button"
                        className="perfil-password-btn"
                        onClick={() => setShowForgotModal(true)}
                      >
                        Cambiar contraseña
                      </button>
                      <button type="submit" className="perfil-submit-btn">
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
                  <div className="dashboard-section-perfil">
                    <h2 className="section-title-perfil">
                      <FontAwesomeIcon icon={faUser} /> Datos del Socio
                    </h2>
                    <form onSubmit={handlePartnerSubmit} className="perfil-form">
                      <div className="form-grid-perfil">
                        <div className="perfil-field">
                          <label className="perfil-label" htmlFor="dni">
                            DNI
                          </label>
                          <input
                            id="dni"
                            name="dni"
                            value={partnerFormData.dni}
                            onChange={handlePartnerChange}
                            className="perfil-input"
                            placeholder="Ingresá tu DNI"
                            required
                          />
                        </div>
                        <div className="perfil-field">
                          <label className="perfil-label" htmlFor="adress">
                            Dirección
                          </label>
                          <input
                            id="adress"
                            name="adress"
                            value={partnerFormData.adress}
                            onChange={handlePartnerChange}
                            className="perfil-input"
                            placeholder="Ingresá tu dirección"
                            required
                          />
                        </div>
                        <div className="perfil-field">
                          <label className="perfil-label" htmlFor="phone">
                            Teléfono
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            value={partnerFormData.phone}
                            onChange={handlePartnerChange}
                            className="perfil-input"
                            placeholder="Ingresá tu teléfono"
                            required
                          />
                        </div>
                        <div className="perfil-field">
                          <label className="perfil-label">REPROCANN</label>
                          <span className="info-value-perfil">
                            {partnerData.reprocann ? "Sí" : "No"}
                          </span>
                        </div>
                      </div>
                      <div className="form-actions-perfil">
                        <button type="submit" className="perfil-submit-btn">
                          Guardar cambios
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                {user?.isPartner && topProducts.length > 0 && (
                  <div className="dashboard-section-perfil">
                    <h2 className="section-title-perfil">
                      <FontAwesomeIcon icon={faStar} /> Productos más comprados
                    </h2>
                    <div className="top-products-grid-perfil">
                      {topProducts.map((prod) => (
                        <div className="top-product-card-perfil" key={prod.id}>
                          <img
                            src={prod.image || "/placeholder.png"}
                            alt={prod.name}
                            className="product-thumbnail-perfil"
                          />
                          <div className="product-details-perfil">
                            <h3 className="product-name-perfil">{prod.name}</h3>
                            <p className="product-count-perfil">{prod.count} unidades</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {activeTab === "pedidos" && user?.isPartner && (
              <div className="dashboard-section-perfil">
                <h2 className="section-title-perfil">
                  <FontAwesomeIcon icon={faShoppingCart} /> Mis Pedidos Recientes
                </h2>
                {carts.length > 0 ? (
                  <div className="orders-grid-perfil">
                    {carts.slice(0, 5).map((cart) => (
                      <div key={cart._id} className="order-card-perfil">
                        <div className="order-header-perfil">
                          <span className="order-date-perfil">
                            {new Date(cart.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`order-status-perfil ${cart.status}`}>
                            {cart.status || "No definido"}
                          </span>
                        </div>
                        <div className="order-details-perfil">
                          <div className="order-method-perfil">
                            <span>Método:</span>{" "}
                            {cart.paymentMethod || "No especificado"}
                          </div>
                          <div className="order-total-perfil">
                            <span>Total:</span> $
                            {cart.totalAmount?.toFixed(2) || 0}
                          </div>
                        </div>
                        <div className="order-products-perfil">
                          <h4>Productos:</h4>
                          <ul>
                            {(cart.items || cart.products || []).map((item, idx) => {
                              const product = item.productId || {};
                              const productId = product._id || item.productId;
                              const productName =
                                product.title || product.name || "Producto";
                              const existingRating = findProductRating(productId, cart);
                              const isRated = existingRating || isProductRated(productId);
                              return (
                                <li key={idx}>
                                  {productName} x{item.quantity} - $
                                  {item.price || product.price * item.quantity}
                                  {cart.status === "entregado" && (
                                    <div className="product-rating-container-perfil">
                                      {isRated ? (
                                        <button
                                          onClick={() =>
                                            handleRateClick(item, cart, existingRating)
                                          }
                                          className="view-rating-btn-perfil"
                                        >
                                          <FontAwesomeIcon icon={faEye} /> Ver Calificación
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleRateClick(item, cart)}
                                          className="rate-btn-perfil"
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
                  <p className="no-data-perfil">No hay pedidos recientes</p>
                )}
              </div>
            )}
            {activeTab === "turnos" && user?.isPaciente && (
              <div className="dashboard-section-perfil">
                <h2 className="section-title-perfil">
                  <FontAwesomeIcon icon={faCalendarAlt} /> Mis Próximos Turnos
                </h2>
                {turnos.length > 0 ? (
                  <div className="appointments-grid-perfil">
                    {turnos
                      .filter((t) => ["pendiente", "confirmado"].includes(t.estado))
                      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                      .slice(0, 3)
                      .map((turno) => (
                        <div key={turno._id} className="appointment-card-perfil">
                          <div className="appointment-header-perfil">
                            <span className="appointment-date-perfil">
                              {formatDate(turno.fecha)}
                            </span>
                            <span className={`appointment-status-perfil ${turno.estado}`}>
                              {turno.estado}
                            </span>
                          </div>
                          <div className="appointment-details-perfil">
                            <div className="appointment-specialist-perfil">
                              <span>Especialista:</span>{" "}
                              {turno.especialistaId?.userId?.name || "No especificado"}
                            </div>
                            <div className="appointment-reason-perfil">
                              <span>Motivo:</span> {turno.motivo}
                            </div>
                          </div>
                          {turno.consulta?.productos?.length > 0 && (
                            <div className="appointment-products-perfil">
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
                  <p className="no-data-perfil">No tienes turnos programados</p>
                )}
              </div>
            )}
            {activeTab === "recetas" && user?.isPaciente && (
              <div className="dashboard-section-perfil">
                <h2 className="section-title-perfil">
                  <FontAwesomeIcon icon={faPills} /> Mis Últimas Recetas
                </h2>
                {turnos.filter((t) => t.consulta?.productos?.length > 0).length > 0 ? (
                  <div className="prescriptions-grid-perfil">
                    {turnos
                      .filter((t) => t.consulta?.productos?.length > 0)
                      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                      .slice(0, 5)
                      .map((turno) => (
                        <div key={turno._id} className="prescription-card-perfil">
                          <div className="prescription-header-perfil">
                            <span className="prescription-date-perfil">
                              {formatDate(turno.fecha)}
                            </span>
                            <span className="prescription-doctor-perfil">
                              Dr. {turno.especialistaId?.userId?.name || "No especificado"}
                            </span>
                          </div>
                          <div className="prescription-products-perfil">
                            <h4>Medicamentos:</h4>
                            <ul>
                              {turno.consulta.productos.map((prod, idx) => (
                                <li key={idx}>
                                  <strong>{prod.nombreProducto}</strong> - {prod.cantidad}{" "}
                                  unidad(es)
                                  {prod.dosis && (
                                    <span className="dosis-perfil">Dosis: {prod.dosis}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="prescription-notes-perfil">
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
                  <p className="no-data-perfil">No tienes recetas registradas</p>
                )}
              </div>
            )}
            {activeTab === "historial" && user?.isPaciente && (
              <div className="dashboard-section-perfil">
                <h2 className="section-title-perfil">
                  <FontAwesomeIcon icon={faFileMedicalAlt} /> Mi Historial Completo
                </h2>
                {turnos.length > 0 ? (
                  <div className="medical-history-perfil">
                    {turnos
                      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                      .map((turno) => (
                        <div key={turno._id} className="history-card-perfil">
                          <div className="history-header-perfil">
                            <span className="history-date-perfil">
                              {formatDate(turno.fecha)}
                            </span>
                            <span className={`history-status-perfil ${turno.estado}`}>
                              {turno.estado}
                            </span>
                          </div>
                          <div className="history-content-perfil">
                            <div className="history-section-perfil">
                              <h4>Especialista:</h4>
                              <p>
                                {turno.especialistaId?.userId?.name || "No especificado"}
                              </p>
                            </div>
                            <div className="history-section-perfil">
                              <h4>Motivo de consulta:</h4>
                              <p>{turno.motivo || "No especificado"}</p>
                            </div>
                            <div className="history-section-perfil">
                              <h4>Indicaciones:</h4>
                              <p>{turno.notas || "No hay notas registradas"}</p>
                            </div>
                            {turno.reprocannRelacionado && (
                              <div className="history-section-perfil">
                                <h4>REPROCANN:</h4>
                                <p>Consulta relacionada con trámite REPROCANN</p>
                              </div>
                            )}
                            {turno.consulta && (
                              <>
                                <div className="history-section-perfil">
                                  <h4>Detalles de la consulta:</h4>
                                  <p>
                                    Estado: {turno.consulta.pagado ? "Pagado" : "Pendiente de pago"}
                                  </p>
                                  <p>
                                    Método de pago:{" "}
                                    {turno.consulta.formaPago || "No especificado"}
                                  </p>
                                  {turno.consulta.notasConsulta && (
                                    <p>Notas: {turno.consulta.notasConsulta}</p>
                                  )}
                                </div>
                                {turno.consulta.productos?.length > 0 && (
                                  <div className="history-section-perfil">
                                    <h4>Productos recetados:</h4>
                                    <ul className="product-list-perfil">
                                      {turno.consulta.productos.map((prod, idx) => (
                                        <li key={idx}>
                                          <strong>{prod.nombreProducto}</strong> - Cantidad:{" "}
                                          {prod.cantidad} - Precio unitario: $
                                          {prod.precioUnitario} - Total: $
                                          {(prod.precioUnitario * prod.cantidad).toFixed(2)}
                                          {prod.dosis && <span> (Dosis: {prod.dosis})</span>}
                                        </li>
                                      ))}
                                    </ul>
                                    <p className="total-amount-perfil">
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
                  <p className="no-data-perfil">
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
    </div>
  );
};

export default PerfilUsuario;