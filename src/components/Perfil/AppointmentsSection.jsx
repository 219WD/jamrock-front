import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

const AppointmentsSection = ({ turnos, formatDate }) => {
  return (
    <div className="dashboard-section">
      <h2 className="section-title">
        <FontAwesomeIcon icon={faCalendarAlt} /> Mis Próximos Turnos
      </h2>
      {turnos.length > 0 ? (
        <div className="appointments-grid">
          {turnos
            .filter((t) => ["pendiente", "confirmado"].includes(t.estado))
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            .slice(0, 3)
            .map((turno) => (
              <div key={turno._id} className="appointment-card">
                <div className="appointment-header">
                  <span className="appointment-date">{formatDate(turno.fecha)}</span>
                  <span className={`appointment-status ${turno.estado}`}>
                    {turno.estado}
                  </span>
                </div>
                <div className="appointment-details">
                  <div className="appointment-specialist">
                    <span>Especialista:</span>{" "}
                    {turno.especialistaId?.userId?.name || "No especificado"}
                  </div>
                  <div className="appointment-reason">
                    <span>Motivo:</span> {turno.motivo}
                  </div>
                </div>
                {turno.consulta?.productos?.length > 0 && (
                  <div className="appointment-products">
                    <h4>Productos recetados:</h4>
                    <ul>
                      {turno.consulta.productos.map((prod, idx) => (
                        <li key={idx}>
                          {prod.nombreProducto} x{prod.cantidad} - $
                          {prod.precioUnitario * prod.cantidad}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <p className="no-data">No tienes turnos programados</p>
      )}
    </div>
  );
};

export default AppointmentsSection;