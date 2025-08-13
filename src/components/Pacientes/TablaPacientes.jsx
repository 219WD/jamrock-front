import React from "react";

const TablaPacientes = ({ 
  pacientes, 
  onViewDetails, 
  canEdit, 
  refreshData,
  onCreateTurno // Nueva prop para manejar la creación de turnos
}) => {
  const handleViewDetails = async (paciente) => {
    if (refreshData) {
      await refreshData(); // Actualiza los datos antes de abrir el modal
    }
    onViewDetails(paciente); // Abre el modal con los datos actualizados
  };

  return (
    pacientes.length === 0 ? (
      <p className="no-pending">No hay pacientes registrados</p>
    ) : (
      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Fecha Nacimiento</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((paciente) => (
            <tr key={paciente._id} className="user-row">
              <td>{paciente.fullName}</td>
              <td>{paciente.userId?.email || 'No asociado'}</td>
              <td>{paciente.fechaDeNacimiento ? new Date(paciente.fechaDeNacimiento).toLocaleDateString() : 'No especificada'}</td>
              <td>
                <span className={`status-badge ${paciente.reprocann?.status || 'inactive'}`}>
                  {paciente.reprocann?.status || 'Sin estado'}
                </span>
              </td>
              <td className="actions">
                <button 
                  onClick={() => handleViewDetails(paciente)} 
                  className="view-btn"
                >
                  Ver Detalles
                </button>
                {onCreateTurno && ( // Solo muestra el botón si se pasó la función
                  <button 
                    onClick={() => onCreateTurno(paciente)} 
                    className="create-turno-btn"
                  >
                    Crear Turno
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  );
};

export default TablaPacientes;