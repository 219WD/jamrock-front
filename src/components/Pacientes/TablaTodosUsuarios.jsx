import React from "react";

const TablaTodosUsuarios = ({ users, onCreatePaciente }) => (
  <table className="users-table">
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Email</th>
        <th>Socio</th>
        <th>Admin</th>
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
          <td className="actions">
            <button 
              onClick={() => onCreatePaciente(user)} 
              className="approve-btn"
              disabled={user.isPaciente} // Deshabilitar si ya es paciente
            >
              {user.isPaciente ? "Ya es paciente" : "Crear Paciente"}
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default TablaTodosUsuarios;