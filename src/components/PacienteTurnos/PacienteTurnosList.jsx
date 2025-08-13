import React from "react";

const PacienteTurnosList = ({ turnos, loading, onEditarTurno }) => {
  if (loading) {
    return <p>Cargando tus turnos...</p>;
  }

  if (turnos.length === 0) {
    return <p className="no-turnos">No tienes turnos programados</p>;
  }

  // Función para obtener información del especialista
  const getEspecialistaInfo = (turno) => {
    if (turno.especialistaId?.userId?.name) {
      return `${turno.especialistaId.userId.name} (${turno.especialistaId.especialidad})`;
    }
    if (turno.especialistaId?.name) {
      return `${turno.especialistaId.name} (${turno.especialistaId.especialidad})`;
    }
    return "Especialista no especificado";
  };

  return (
    <div className="turnos-list">
      {turnos.map((turno) => (
        <div key={turno._id} className={`turno-card ${turno.estado}`}>
          <div className="turno-info">
            <h3>{getEspecialistaInfo(turno)}</h3>
            <p><strong>Fecha:</strong> {new Date(turno.fecha).toLocaleString()}</p>
            <p><strong>Motivo:</strong> {turno.motivo}</p>
            <p><strong>Estado:</strong> 
              <span className={`status-badge ${turno.estado}`}>
                {turno.estado}
              </span>
            </p>
          </div>
          <div className="turno-actions">
            <button 
              onClick={() => onEditarTurno(turno)}
              className="btn-editar"
              disabled={turno.estado !== 'pendiente'}
            >
              Editar
            </button>
            {turno.estado !== 'pendiente' && (
              <p className="nota-edicion">Solo puedes editar turnos pendientes</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PacienteTurnosList;