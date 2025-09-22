import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import useAuthStore from "../store/authStore";
import useLoadingStore from "../store/loadingStore";
import "./css/dashboard.css";
import NavDashboard from "./NavDashboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEye } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import GlobalLoader from "./GlobalLoader";
import API_URL from "../common/constants";

function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const token = useAuthStore((state) => state.token);

  const navigate = useNavigate();
  const hasAnimated = useRef(false);

  // Fetch functions
  const fetchPedidos = async () => {
    try {
      const response = await fetch(`${API_URL}/cart/getAllCarts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener los pedidos");
      }
      const data = await response.json();
      setPedidos(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users/getUsers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al obtener usuarios");
      }
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleUpdateStatus = async (pedidoId, newStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/cart/status/${pedidoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }
      const updatedPedido = await response.json();
      setPedidos((prev) =>
        prev.map((pedido) => (pedido._id === pedidoId ? updatedPedido : pedido))
      );
      if (selectedPedido && selectedPedido._id === pedidoId) {
        setSelectedPedido(updatedPedido);
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPendingPartners = () => {
    return users.filter((user) => {
      const hasPendingPartner = user.partnerData && !user.isPartner;
      const isExplicitlyPending = user.partnerStatus === "pending";
      return hasPendingPartner || isExplicitlyPending;
    });
  };

  const getDeliveredOrders = () => {
    return pedidos.filter((pedido) => pedido.status === "entregado");
  };

  // Función para obtener pedidos pendientes de confirmación
  const getPendingConfirmationOrders = () => {
    return pedidos.filter((pedido) =>
      ["pagado", "preparacion", "pendiente"].includes(pedido.status)
    );
  };

  const handleNavigate = () => {
    navigate("/pedidos");
  };

  useEffect(() => {
    fetchPedidos();
    fetchUsers();
  }, []);

  // GSAP Animation for dashboard - modificado para considerar si hay pedidos pendientes
  useEffect(() => {
    if (hasAnimated.current || loading) return;

    hasAnimated.current = true;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.fromTo(
      ".container-main",
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.5 }
    );

    // Solo animar el right-sidebar si hay pedidos pendientes
    const pendingOrders = getPendingConfirmationOrders();
    if (pendingOrders.length > 0) {
      tl.fromTo(
        ".right-sidebar",
        { opacity: 1, x: 50 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1 },
        "-=0.3"
      );

      tl.fromTo(
        ".right-sidebar h3",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 },
        "-=0.3"
      );

      tl.fromTo(
        ".right-sidebar .item",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 },
        "-=0.3"
      );
    }

    tl.fromTo(
      ".stat",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.3, stagger: 0.1 },
      "-=0.3"
    );

    document.querySelectorAll(".stat").forEach((stat, index) => {
      tl.fromTo(
        stat.querySelectorAll("h3, p"),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 },
        `-=${0.3 - index * 0.1}`
      );
    });

    tl.fromTo(
      ".help",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4 },
      "-=0.3"
    );

    // Solo animar el h2 y orders-table si hay pedidos pendientes
    if (pendingOrders.length > 0) {
      tl.fromTo(
        ".container-main h2",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3 },
        "-=0.3"
      );

      tl.fromTo(
        ".orders-table",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.3"
      );
    }

    return () => {
      tl.kill();
    };
  }, [loading]);

  // GSAP Animation for modal
  useEffect(() => {
    if (!selectedPedido) return;

    gsap.fromTo(
      ".dashboard-modal-overlay",
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    gsap.fromTo(
      ".dashboard-modal-content",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }, [selectedPedido]);

  // El GlobalLoader se maneja automáticamente por el store, no necesitamos mostrarlo manualmente
  // Solo mostramos el contenido cuando no está loading
  if (loading && pedidos.length === 0) {
    return <GlobalLoader text="Cargando dashboard..." />;
  }

  const pendingOrders = getPendingConfirmationOrders();
  const hasPendingOrders = pendingOrders.length > 0;

  return (
    <div className="dashboard futurista">
      <NavDashboard />
      <GlobalLoader text="Cargando..." />
      <div className="main-content">
        <div className="container-main">
          <section className="stats">
            <div className="stat">
              <h3>{users.length}</h3>
              <p>
                Socios <br /> Activos
              </p>
            </div>
            <div className="stat">
              <h3>{getPendingPartners().length}</h3>
              <p>
                Socios <br /> Pendientes
              </p>
            </div>
            <div className="stat">
              <h3>{getDeliveredOrders().length}</h3>
              <p>
                Pedidos
                <br />
                Entregados
              </p>
            </div>
            <div className="help">
              <h3>GRÁFICOS</h3>
              <p>
                Para una analítica más detallada, ver los gráficos de
                estadística.
              </p>
              <button>VER GRÁFICOS</button>
            </div>
          </section>
          
          {/* Solo mostrar si hay pedidos pendientes */}
          {hasPendingOrders && (
            <>
              <h2>Últimos pedidos pendientes de confirmación</h2>
              <section className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Productos</th>
                      <th>Total</th>
                      <th>Forma de Pago</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 3)
                      .map((pedido) => (
                        <tr key={pedido._id}>
                          <td>{pedido.userId?.name || "Usuario eliminado"}</td>
                          <td>
                            {pedido.items.map((item, index) => (
                              <span key={index}>
                                {item.productId?.title || "Producto eliminado"}
                                {index < pedido.items.length - 1 && ", "}
                              </span>
                            ))}
                          </td>
                          <td>${pedido.totalAmount?.toFixed(2)}</td>
                          <td>{pedido.paymentMethod}</td>
                          <td>{new Date(pedido.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`status ${pedido.status}`}>
                              {pedido.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </section>
            </>
          )}
        </div>
      </div>
      
      {/* Solo mostrar el sidebar si hay pedidos pendientes */}
      {hasPendingOrders && (
        <aside className="right-sidebar">
          <h3>Últimos pedidos</h3>
          <div className="items">
            {pendingOrders
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 3)
              .map((pedido) => (
                <div key={pedido._id} className="item">
                  <div className="info">
                    <p>
                      <strong>Usuario:</strong> {pedido.userId?.name || "Anónimo"}
                    </p>
                    <p>
                      <strong>Productos:</strong>{" "}
                      {pedido.items
                        .map((item) => item.productId?.title)
                        .join(", ")}
                    </p>
                    <p>
                      <strong>Total:</strong> ${pedido.totalAmount?.toFixed(2)}
                    </p>
                    <p>
                      <strong>Estado:</strong> {pedido.status}
                    </p>
                    <div className="actions">
                      <button
                        onClick={() => setSelectedPedido(pedido)}
                        className="view-btn"
                      >
                        <FontAwesomeIcon icon={faEye} /> Ver
                      </button>
                      <select
                        value={pedido.status}
                        onChange={(e) =>
                          handleUpdateStatus(pedido._id, e.target.value)
                        }
                        className="status-select"
                      >
                        <option value="pagado">Pagado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="preparacion">En preparación</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="entregado">Entregado</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <button className="see-all" onClick={handleNavigate}>
            Ver todos los pedidos
          </button>
        </aside>
      )}
      
      {selectedPedido && (
        <div
          className="dashboard-modal-overlay"
          onClick={() => setSelectedPedido(null)}
        >
          <div
            className="dashboard-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="dashboard-modal-close-btn"
              onClick={() => setSelectedPedido(null)}
            >
              &times;
            </button>
            <h2 className="dashboard-modal-title">Detalle del Pedido</h2>
            <div className="dashboard-modal-body">
              <p>
                <strong>Usuario:</strong>{" "}
                {selectedPedido.userId?.name || "No disponible"}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(selectedPedido.createdAt).toLocaleDateString()} -{" "}
                {new Date(selectedPedido.createdAt).toLocaleTimeString()}
              </p>
              <p>
                <strong>Estado:</strong> {selectedPedido.status}
              </p>
              <p>
                <strong>Método de pago:</strong> {selectedPedido.paymentMethod}
              </p>
              {selectedPedido.shippingAddress && (
                <>
                  <h3 className="dashboard-modal-title">Dirección de envío:</h3>
                  <p>
                    <strong>Nombre:</strong>{" "}
                    {selectedPedido.shippingAddress.name}
                  </p>
                  <p>
                    <strong>Teléfono:</strong>{" "}
                    {selectedPedido.shippingAddress.phone}
                  </p>
                  <p>
                    <strong>Dirección:</strong>{" "}
                    {selectedPedido.shippingAddress.address}
                  </p>
                </>
              )}
              <h3 className="dashboard-modal-title">Productos:</h3>
              <ul>
                {selectedPedido.items.map((item, i) => (
                  <li key={i}>
                    {item.productId?.title || "Producto no disponible"} - x
                    {item.quantity} (${item.productId?.price?.toFixed(2)} c/u)
                  </li>
                ))}
              </ul>
              <h3 className="dashboard-modal-title">Total:</h3>
              <p>${selectedPedido.totalAmount?.toFixed(2)}</p>
            </div>
            <div className="dashboard-modal-actions">
              <select
                value={selectedPedido.status}
                onChange={(e) =>
                  handleUpdateStatus(selectedPedido._id, e.target.value)
                }
                className="dashboard-status-select"
              >
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
                <option value="preparacion">En preparación</option>
                <option value="cancelado">Cancelado</option>
                <option value="entregado">Entregado</option>
              </select>
              <button
                onClick={() => setSelectedPedido(null)}
                className="dashboard-close-btn"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;