import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import useAuthStore from "../store/authStore";
import useNotify from "../hooks/useToast";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faBox,
  faMoneyBillWave,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import "./css/pedidos.css";
import NavDashboard from "./NavDashboard";
import withGlobalLoader from "../utils/withGlobalLoader";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [deliveryFilter, setDeliveryFilter] = useState("todos");
  const [dateOrder, setDateOrder] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [visibleCount, setVisibleCount] = useState(9);

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const notify = useNotify();
  const navigate = useNavigate();
  const API_URL = "http://localhost:4000/cart";
  const hasAnimated = useRef(false);

  const fetchCalled = useRef(false);

  const fetchPedidos = async () => {
    await withGlobalLoader(async () => {
      const response = await fetch(`${API_URL}/getAllCarts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los pedidos");
      }

      const data = await response.json();
      setPedidos(data);
      console.log("Pedidos:", data);
    })
      .catch((err) => {
        setError(err.message);
        notify(err.message, "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!fetchCalled.current && token) {
    fetchCalled.current = true;
    fetchPedidos();
  }

  // GSAP Animation
  useEffect(() => {
    if (hasAnimated.current || loading) return;

    hasAnimated.current = true;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // 1. Animate pedidos-wrapper
    tl.fromTo(
      ".pedidos-wrapper",
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.5 }
    );

    // 2. Animate h1
    tl.fromTo(
      ".pedidos-container h1",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.3"
    );

    // 3. Animate filtros-container items
    tl.fromTo(
      ".filtros-container > *",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 },
      "-=0.2"
    );

    // 4. Animate table-container
    tl.fromTo(
      ".table-container",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.5 },
      "-=0.2"
    );

    // 5. Animate stats-container cards
    tl.fromTo(
      ".stat-card",
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.3, stagger: 0.1 },
      "-=0.3"
    );

    // 6. Animate ver-mas-container
    tl.fromTo(
      ".ver-mas-container",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.2"
    );

    return () => {
      tl.kill();
    };
  }, [loading]);

  // Filtrar y ordenar pedidos
  const sortedPedidos = pedidos
    .filter((pedido) => {
      const userId = pedido.userId?._id || "";
      const userName = pedido.userId?.name || "";
      const productTitles = pedido.items
        .map((item) => item.productId?.title || "")
        .join(" ");

      const matchesSearch =
        pedido._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productTitles.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "todos" || pedido.status === statusFilter;

      const matchesPayment =
        paymentFilter === "todos" || pedido.paymentMethod === paymentFilter;

      const matchesDelivery =
        deliveryFilter === "todos" || pedido.deliveryMethod === deliveryFilter;

      const createdAt = new Date(pedido.createdAt);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      const matchesDate =
        (!fromDate || createdAt >= fromDate) &&
        (!toDate || createdAt <= toDate);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesDelivery &&
        matchesDate
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const filteredPedidos = sortedPedidos.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(9);
  }, [
    searchTerm,
    statusFilter,
    paymentFilter,
    deliveryFilter,
    dateFrom,
    dateTo,
    dateOrder,
  ]);

  const getStatusClass = (status) => {
    const statusClasses = {
      inicializado: "status-inicializado",
      pendiente: "status-pendiente",
      pagado: "status-pagado",
      confirmado: "status-confirmado",
      preparacion: "status-preparacion",
      cancelado: "status-cancelado",
      entregado: "status-entregado",
    };
    return statusClasses[status] || "";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      inicializado: "Inicializado",
      pendiente: "Pendiente",
      pagado: "Pagado",
      confirmado: "Confirmado",
      preparacion: "En preparación",
      cancelado: "Cancelado",
      entregado: "Entregado",
    };
    return statusTexts[status] || status;
  };

  const getPaymentIcon = (method) => {
    return <FontAwesomeIcon icon={faMoneyBillWave} />;
  };

  const getDeliveryIcon = (method) => {
    return method === "envio" ? (
      <FontAwesomeIcon icon={faTruck} />
    ) : (
      <FontAwesomeIcon icon={faBox} />
    );
  };

  const handleUpdateStatus = async (pedidoId, newStatus) => {
    await withGlobalLoader(async () => {
      const response = await fetch(`${API_URL}/status/${pedidoId}`, {
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

      notify(`Estado actualizado a ${newStatus}`, "success");
    }).catch((err) => {
      notify(err.message, "error");
    });
  };

  const handleViewPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
    setIsModalOpen(true);
  };

  if (loading && pedidos.length === 0) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="dashboard pedidos">
      <NavDashboard />
      <div className="pedidos-wrapper">
        <div className="pedidos-container">
          <h1>Gestión de Pedidos</h1>

          {/* Filtros y búsqueda */}
          <div className="filtros-container">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por ID, usuario o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="status-filter">
              <label>Estado:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="inicializado">Inicializado</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="confirmado">Confirmado</option>
                <option value="preparacion">En preparación</option>
                <option value="cancelado">Cancelado</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>

            <div className="status-filter">
              <label>Pago:</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="mercadopago">MercadoPago</option>
              </select>
            </div>

            <div className="status-filter">
              <label>Entrega:</label>
              <select
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="envio">Envío</option>
                <option value="retiro">Retiro</option>
              </select>
            </div>

            <div className="status-filter">
              <label>Orden:</label>
              <select
                value={dateOrder}
                onChange={(e) => setDateOrder(e.target.value)}
              >
                <option value="desc">Más recientes</option>
                <option value="asc">Más antiguos</option>
              </select>
            </div>

            <div className="status-filter">
              <label>Desde:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="status-filter">
              <label>Hasta:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Tabla de pedidos */}
          <div className="table-container">
            <table className="pedidos-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Entrega</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPedidos.length > 0 ? (
                  filteredPedidos.map((pedido) => (
                    <tr key={pedido._id}>
                      <td>
                        <div className="user-email">
                          {pedido.userId?.name || "Usuario eliminado"}
                        </div>
                      </td>
                      <td>
                        {pedido.items.map((item, index) => (
                          <span key={index}>
                            {item.productId?.title || "Producto eliminado"}
                            {index < pedido.items.length - 1 && ", "}
                          </span>
                        ))}
                      </td>
                      <td className="total-cell">
                        ${pedido.totalAmount.toFixed(2)}
                      </td>
                      <td>
                        <div className="payment-method">
                          {getPaymentIcon(pedido.paymentMethod)}
                          <span>{pedido.paymentMethod}</span>
                        </div>
                      </td>
                      <td>
                        <div className="delivery-method">
                          {getDeliveryIcon(pedido.deliveryMethod)}
                          <span>{pedido.deliveryMethod}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            pedido.status
                          )}`}
                        >
                          {getStatusText(pedido.status)}
                        </span>
                      </td>
                      <td>{new Date(pedido.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="actions-cell">
                          <button
                            onClick={() => handleViewPedido(pedido)}
                            className="view-btn"
                            title="Ver detalle"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <select
                            value={pedido.status}
                            onChange={(e) =>
                              handleUpdateStatus(pedido._id, e.target.value)
                            }
                            className="status-select"
                          >
                            <option value="inicializado">Inicializado</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="pagado">Pagado</option>
                            <option value="preparacion">En preparación</option>
                            <option value="cancelado">Cancelado</option>
                            <option value="entregado">Entregado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="no-results">
                      No se encontraron pedidos que coincidan con los filtros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {visibleCount < sortedPedidos.length && (
              <div className="ver-mas-container">
                <button
                  className="ver-mas-btn"
                  onClick={() => setVisibleCount((prev) => prev + 9)}
                >
                  Ver más pedidos
                </button>
              </div>
            )}
          </div>

          {/* Resumen estadístico */}
          <div className="stats-container">
            <div className="stat-card">
              <h3>Total pedidos</h3>
              <p>{pedidos.length}</p>
            </div>
            <div className="stat-card">
              <h3>Pendientes</h3>
              <p className="pendiente">
                {pedidos.filter((p) => p.status === "pendiente").length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Pagados</h3>
              <p className="pagado">
                {pedidos.filter((p) => p.status === "pagado").length}
              </p>
            </div>
            <div className="stat-card">
              <h3>En preparación</h3>
              <p className="preparacion">
                {pedidos.filter((p) => p.status === "preparacion").length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Entregados</h3>
              <p className="entregado">
                {pedidos.filter((p) => p.status === "entregado").length}
              </p>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && pedidoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setIsModalOpen(false)}
            >
              X
            </button>
            <h2>Detalle del Pedido</h2>
            <p>
              <strong>Usuario:</strong>{" "}
              {pedidoSeleccionado.userId?.name || "No disponible"}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(pedidoSeleccionado.createdAt).toLocaleDateString()} -{" "}
              {new Date(pedidoSeleccionado.createdAt).toLocaleTimeString()}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              {getStatusText(pedidoSeleccionado.status)}
            </p>
            <p>
              <strong>Método de pago:</strong>{" "}
              {pedidoSeleccionado.paymentMethod}
            </p>
            <p>
              <strong>Método de entrega:</strong>{" "}
              {pedidoSeleccionado.deliveryMethod}
            </p>
            {pedidoSeleccionado.shippingAddress && (
              <>
                <h3>Dirección:</h3>
                <p>
                  <strong>Nombre:</strong>{" "}
                  {pedidoSeleccionado.shippingAddress.name}
                </p>
                <p>
                  <strong>Teléfono:</strong>{" "}
                  {pedidoSeleccionado.shippingAddress.phone}
                </p>
                <p>
                  <strong>Dirección:</strong>{" "}
                  {pedidoSeleccionado.shippingAddress.address}
                </p>
              </>
            )}
            <h3>Productos:</h3>
            <ul>
              {pedidoSeleccionado.items.map((item, i) => (
                <li key={i}>
                  {item.productId?.title || "Producto no disponible"} - x
                  {item.quantity}
                </li>
              ))}
            </ul>
            <h3>Total:</h3>
            <p>${pedidoSeleccionado.totalAmount?.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;