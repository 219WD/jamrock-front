import React from "react";

const TurnosHeader = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  especialistaFilter,
  setEspecialistaFilter,
  especialistas = []
}) => {
  return (
    <div className="turnos-header">
      <div className="search-filters-container">
        <div className="filter-group">
          <label>Buscar:</label>
          <input
            type="text"
            placeholder="Paciente, motivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmado">Confirmados</option>
            <option value="cancelado">Cancelados</option>
            <option value="completado">Completados</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Fecha:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Especialista:</label>
          <select
            value={especialistaFilter}
            onChange={(e) => setEspecialistaFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            {especialistas.map(esp => (
              <option key={esp._id} value={esp._id}>
                {esp.userId?.name || esp.especialidad}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TurnosHeader;