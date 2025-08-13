import React from "react";

const TablaUsuarios = ({
  users,
  onDetails,
  onTogglePartner,
  onToggleAdmin,
  onConvertToEspecialista,
}) => (
  <table className="users-table">
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Email</th>
        <th>Socio</th>
        <th>Admin</th>
        <th>Médico</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {users.map((user) => (
        <tr key={user._id} className="user-row">
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>{user.isPartner ? "✅" : "❌"}</td>
          <td>{user.isAdmin ? "✅" : "❌"}</td>
          <td>{user.isMedico ? "✅" : "❌"}</td>
          <td className="actions">
            <button onClick={() => onDetails(user._id)} className="view-btn">
              Ver información
            </button>
            
            {/* Botón que solo aparece si NO es médico */}
            {!user.isMedico && (
              <button
                onClick={() => onConvertToEspecialista(user)}
                className="approve-btn"
              >
                Crear Médico
              </button>
            )}

            <button
              onClick={() => onToggleAdmin(user._id)}
              className={user.isAdmin ? "revoke-btn" : "approve-btn"}
            >
              {user.isAdmin ? "Quitar Admin" : "Hacer Admin"}
            </button>
            <button
              onClick={() => onTogglePartner(user._id)}
              className={user.isPartner ? "revoke-btn" : "approve-btn"}
            >
              {user.isPartner ? "Revocar Socio" : "Aprobar Socio"}
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default TablaUsuarios;