import React from "react";

const Filters = ({
  statusFilter,
  setStatusFilter,
  dateOrder,
  setDateOrder,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}) => {
  return (
    <div className="filtros-adicionales">
      <div className="filter-group">
        <label>Estado:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="confirmado">Confirmados</option>
          <option value="completado">Completados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Orden:</label>
        <select
          value={dateOrder}
          onChange={(e) => setDateOrder(e.target.value)}
        >
          <option value="asc">Próximos primero</option>
          <option value="desc">Recientes primero</option>
        </select>
      </div>

      <div className="date-filters">
        <div className="filter-group">
          <label>Desde:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Hasta:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Filters;