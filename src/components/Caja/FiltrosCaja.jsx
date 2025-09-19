import React from "react";

const FiltrosCaja = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  dateOrder,
  setDateOrder,
  showTodayOnly,
  handleTodayClick,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  handleDateRangeChange
}) => {
  return (
    <div className="filtros-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Buscar por paciente or ID..."
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
  );
};

export default FiltrosCaja;