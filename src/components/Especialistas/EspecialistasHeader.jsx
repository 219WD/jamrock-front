import React from "react";

const EspecialistasHeader = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="title-admin">
      <h1>Administrar Especialistas</h1>
      <form className="form-search">
        <button type="button">
          <svg
            width="17"
            height="16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
              stroke="currentColor"
              strokeWidth="1.333"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </button>
        <input
          className="input-search"
          placeholder="Buscar por nombre o especialidad"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="reset"
          className="reset"
          onClick={() => setSearchQuery("")}
        >
          ✖
        </button>
      </form>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{
          padding: "0.5rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      >
        <option value="todos">Todos</option>
        <option value="inicializado">Inicializado</option>
        <option value="pendiente">Pendiente</option>
        <option value="aprobado">Aprobado</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>
  );
};

export default EspecialistasHeader;
