import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import useNotify from "../hooks/useToast";
import "./css/ConsultorioPanel.css";
import NavDashboard from "../components/NavDashboard";

const Caja = () => {
  const token = useAuthStore((state) => state.token);
  const notify = useNotify();
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filteredTurnos, setFilteredTurnos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [dateOrder, setDateOrder] = useState("desc");
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [turnosPerPage] = useState(10);

  const fetchTurnos = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/turnos/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }
      const data = await res.json();
      const turnosData = data.data || [];
      setTurnos(turnosData);
      setError(null);
    } catch (err) {
      setError(err.message);
      notify("Error al obtener turnos: " + err.message, "error");
      setTurnos([]);
    } finally {
      setLoading(false);
    }
  };

  const updatePagoStatus = async (turnoId, currentPagado) => {
    const newPagado = !currentPagado;
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:4000/turnos/${turnoId}/marcar-pagado`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pagado: newPagado }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }
      setTurnos((prev) =>
        prev.map((t) =>
          t._id === turnoId
            ? { ...t, consulta: { ...t.consulta, pagado: newPagado } }
            : t
        )
      );
      setSelectedTurno((prev) =>
        prev && prev._id === turnoId
          ? { ...prev, consulta: { ...prev.consulta, pagado: newPagado } }
          : prev
      );
      notify(
        `Pago ${newPagado ? "marcado como pagado" : "desmarcado"}`,
        "success"
      );
    } catch (err) {
      notify("Error al actualizar pago: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (turnoId) => {
    notify("Funcionalidad de agregar productos en desarrollo", "info");
  };

  const filterTurnos = () => {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const useRange = Boolean(dateFrom || dateTo);
    const rangeStart = dateFrom ? new Date(dateFrom) : new Date("1970-01-01");
    const rangeEnd = dateTo ? new Date(dateTo + "T23:59:59") : new Date("9999-12-31");

    const filtered = turnos
      .filter((turno) => {
        const turnoDate = new Date(turno.fecha);
        const patientName = turno.pacienteId?.fullName || "";
        const matchesSearch =
          patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (turno._id || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "todos" ||
          (statusFilter === "pagado" && turno.consulta?.pagado) ||
          (statusFilter === "pendiente" && !turno.consulta?.pagado);

        const matchesPayment =
          paymentFilter === "todos" ||
          turno.consulta?.formaPago === paymentFilter;

        let matchesDate = true;
        
        if (showTodayOnly) {
          matchesDate = turnoDate >= todayStart && turnoDate <= todayEnd;
        } else if (useRange) {
          matchesDate = turnoDate >= rangeStart && turnoDate <= rangeEnd;
        }

        return matchesSearch && matchesStatus && matchesPayment && matchesDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateOrder === "desc" ? dateB - dateA : dateA - dateB;
      });

    return filtered;
  };

  const handleTodayClick = () => {
    setShowTodayOnly(!showTodayOnly);
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handleDateRangeChange = () => {
    setShowTodayOnly(false);
    setCurrentPage(1);
  };

  const itemSubtotal = (producto) => {
    const unit =
      (typeof producto.precioUnitario === "number" ? producto.precioUnitario : null) ??
      (producto.productoId?.price ?? 0);
    const qty = producto.cantidad || 0;
    return unit * qty;
  };

  const getProductosFromTurno = (turno) => turno?.consulta?.productos || [];

  const calculateTotals = () => {
    const totals = {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0,
      mercadoPago: 0,
      otro: 0,
    };
    filteredTurnos.forEach((turno) => {
      if (turno.consulta?.pagado) {
        const consultaPrecio = turno.consulta?.precioConsulta || 0;
        const productos = getProductosFromTurno(turno);
        const productosTotal = productos.reduce(
          (sum, p) => sum + itemSubtotal(p),
          0
        );
        const total = consultaPrecio + productosTotal;
        const key = turno.consulta?.formaPago || "otro";
        totals[key] = (totals[key] || 0) + total;
      }
    });
    return totals;
  };

  const getTotalTurno = (turno) => {
    const consultaPrecio = turno.consulta?.precioConsulta || 0;
    const productos = getProductosFromTurno(turno);
    const productosTotal = productos.reduce((sum, p) => sum + itemSubtotal(p), 0);
    return consultaPrecio + productosTotal;
  };

  const getProductDisplayName = (producto) =>
    producto.nombreProducto ||
    producto.productoId?.title ||
    "Producto sin nombre";

  // Paginación
  const indexOfLastTurno = currentPage * turnosPerPage;
  const indexOfFirstTurno = indexOfLastTurno - turnosPerPage;
  const currentTurnos = filteredTurnos.slice(indexOfFirstTurno, indexOfLastTurno);
  const totalPages = Math.ceil(filteredTurnos.length / turnosPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchTurnos();
  }, []);

  useEffect(() => {
    setFilteredTurnos(filterTurnos());
    setCurrentPage(1);
  }, [
    turnos,
    showTodayOnly,
    dateFrom,
    dateTo,
    searchTerm,
    statusFilter,
    paymentFilter,
    dateOrder,
  ]);

  const totals = calculateTotals();

  return (
    <div className="consultorio-panel">
      <NavDashboard />
      <div className="consultorio-container">
        <div className="title-admin">
          <h2>Caja</h2>
          <p>Gestión de pagos y totales por turno</p>
        </div>
        <div className="caja-panel">
          {error && <div className="error">{error}</div>}

          {/* Filtros */}
          <div className="filtros-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar por paciente o ID..."
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
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
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
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="mercadoPago">Mercado Pago</option>
                <option value="otro">Otro</option>
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
            <button
              className={`btn-filter ${showTodayOnly ? "active" : ""}`}
              onClick={handleTodayClick}
            >
              HOY
            </button>
            <div className="status-filter">
              <label>Desde:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  handleDateRangeChange();
                }}
              />
            </div>
            <div className="status-filter">
              <label>Hasta:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  handleDateRangeChange();
                }}
              />
            </div>
          </div>

          {loading ? (
            <p>Cargando...</p>
          ) : filteredTurnos.length === 0 ? (
            <p>No se encontraron turnos. Intenta ajustar los filtros.</p>
          ) : (
            <>
              <table className="turnos-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Fecha</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Forma de Pago</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTurnos.map((turno) => {
                    const productos = getProductosFromTurno(turno);
                    const total = getTotalTurno(turno);

                    return (
                      <tr key={turno._id} className="turno-row">
                        <td>{turno.pacienteId?.fullName || "Sin Paciente"}</td>
                        <td>
                          {new Date(turno.fecha).toLocaleString("es-AR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td>
                          {productos.length > 0 ? (
                            <ul className="productos-list">
                              {productos.map((producto, index) => (
                                <li key={index}>
                                  {getProductDisplayName(producto)} (x
                                  {producto.cantidad || 0}) - $
                                  {itemSubtotal(producto).toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "Ninguno"
                          )}
                        </td>
                        <td>${total.toFixed(2)}</td>
                        <td>
                          <span
                            className={`turno-estado ${
                              turno.consulta?.pagado ? "completado" : "pendiente"
                            }`}
                          >
                            {turno.consulta?.formaPago || "N/A"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-submit"
                            onClick={() => setSelectedTurno(turno)}
                          >
                            Ver Consulta
                          </button>
                          <button
                            className="btn-submit"
                            onClick={() =>
                              updatePagoStatus(
                                turno._id,
                                turno.consulta?.pagado || false
                              )
                            }
                          >
                            {turno.consulta?.pagado
                              ? "Desmarcar"
                              : "Marcar Pagado"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="pagination-controls">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Anterior
                </button>

                <span className="page-info">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="pagination-btn"
                >
                  Siguiente
                </button>
              </div>

              {/* Stat Cards */}
              <div className="stats-container">
                <div className="stat-card">
                  <h3>Efectivo</h3>
                  <p>${totals.efectivo.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Tarjeta</h3>
                  <p>${totals.tarjeta.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Transferencia</h3>
                  <p>${totals.transferencia.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Mercado Pago</h3>
                  <p>${totals.mercadoPago.toFixed(2)}</p>
                </div>
                {totals.otro > 0 && (
                  <div className="stat-card">
                    <h3>Otro</h3>
                    <p>${totals.otro.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {/* Modal */}
              {selectedTurno && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <button
                      className="close-modal"
                      onClick={() => setSelectedTurno(null)}
                    >
                      ✕
                    </button>
                    <h3>Detalles de la Consulta</h3>
                    <div className="modal-section">
                      <p>
                        <strong>Paciente:</strong>{" "}
                        {selectedTurno.pacienteId?.fullName || "Sin Paciente"}
                      </p>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {new Date(selectedTurno.fecha).toLocaleString("es-AR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                      <p>
                        <strong>Consulta:</strong> $
                        {(selectedTurno.consulta?.precioConsulta || 0).toFixed(2)}
                      </p>
                      <p>
                        <strong>Productos:</strong>
                      </p>
                      {getProductosFromTurno(selectedTurno).length > 0 ? (
                        <ul className="productos-list">
                          {getProductosFromTurno(selectedTurno).map(
                            (producto, index) => (
                              <li key={index}>
                                {getProductDisplayName(producto)} (x
                                {producto.cantidad || 0}) - $
                                {itemSubtotal(producto).toFixed(2)}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p>Ninguno</p>
                      )}
                      <p>
                        <strong>Total:</strong> $
                        {getTotalTurno(selectedTurno).toFixed(2)}
                      </p>
                      <p>
                        <strong>Forma de Pago:</strong>{" "}
                        {selectedTurno.consulta?.formaPago || "N/A"}
                      </p>
                      <p>
                        <strong>Estado:</strong>{" "}
                        <span
                          className={`turno-estado ${
                            selectedTurno.consulta?.pagado
                              ? "completado"
                              : "pendiente"
                          }`}
                        >
                          {selectedTurno.consulta?.pagado
                            ? "Pagado"
                            : "Pendiente"}
                        </span>
                      </p>
                    </div>
                    <div className="modal-actions">
                      <button
                        className="btn-add"
                        onClick={() => addProduct(selectedTurno._id)}
                      >
                        Agregar Productos
                      </button>
                      <button
                        className="btn-submit"
                        onClick={() =>
                          updatePagoStatus(
                            selectedTurno._id,
                            selectedTurno.consulta?.pagado || false
                          )
                        }
                      >
                        {selectedTurno.consulta?.pagado
                          ? "Desmarcar Pago"
                          : "Marcar como Pagado"}
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => setSelectedTurno(null)}
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Caja;