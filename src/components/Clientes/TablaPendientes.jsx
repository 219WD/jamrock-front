import React from "react";

const TablaPendientes = ({ users, onDetails, onTogglePartner }) => (
  users.length === 0 ? <p className="no-pending">No hay solicitudes pendientes</p> : (
    <table className="users-table">
      <thead>
        <tr><th>Nombre</th><th>Email</th><th>Estado Formulario</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id} className="user-row">
            <td data-label="Nombre">{user.name}</td>
            <td data-label="Email">{user.email}</td>
            <td data-label="Estado Formulario">{user.isPending ? "🟠 Pendiente" : "🟢 Completado"}</td>
            <td data-label="Acciones" className="actions">
              <button onClick={() => onDetails(user._id)} className="view-btn">Ver Detalles</button>
              <button onClick={() => onTogglePartner(user._id)} className="approve-btn">
                {user.isPartner ? "Revocar" : "Aprobar"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
);

export default TablaPendientes;