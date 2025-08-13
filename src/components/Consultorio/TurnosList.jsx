import React from "react";

const TurnosList = ({
  turnos,
  loading,
  error,
  selectedTurno,
  setSelectedTurno,
  setDiagnostico,
  setTratamiento,
  setObservaciones,
  setDocumentos,
}) => {
  return (
    <div className="turnos-list">
      <h3>Turnos Disponibles</h3>
      {loading ? (
        <div className="loading">Cargando...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <ul>
          {turnos.map((turno) => (
            <li
              key={turno._id}
              className={`turno-item ${
                selectedTurno?._id === turno._id ? "selected" : ""
              }`}
              onClick={() => {
                setSelectedTurno(turno);
                setDiagnostico("");
                setTratamiento("");
                setObservaciones("");
                setDocumentos([]);
              }}
            >
              <div className="turno-info">
                <span className="turno-paciente">
                  {turno.pacienteId?.fullName}
                </span>
                <span className="turno-fecha">
                  {new Date(turno.fecha).toLocaleString()}
                </span>
                <span className="turno-motivo">{turno.motivo}</span>
                <span className={`turno-estado ${turno.estado}`}>
                  {turno.estado}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TurnosList;