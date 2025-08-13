import React from "react";

const Filters = ({
  searchQuery,
  setSearchQuery,
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
    <div className="filtros-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por paciente o especialista..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-search"
        />
      </div>

      <div className="status-filter">
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

      <div className="status-filter">
        <label>Orden:</label>
        <select
          value={dateOrder}
          onChange={(e) => setDateOrder(e.target.value)}
        >
          <option value="asc">Próximos primero</option>
          <option value="desc">Recientes primero</option>
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
  );
};

export default Filters;