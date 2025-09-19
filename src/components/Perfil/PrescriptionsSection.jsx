import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPills } from "@fortawesome/free-solid-svg-icons";

const PrescriptionsSection = ({ turnos, formatDate }) => {
  return (
    <div className="dashboard-section">
      <h2 className="section-title">
        <FontAwesomeIcon icon={faPills} /> Mis Últimas Recetas
      </h2>
      {turnos.filter((t) => t.consulta?.productos?.length > 0).length > 0 ? (
        <div className="prescriptions-grid">
          {turnos
            .filter((t) => t.consulta?.productos?.length > 0)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5)
            .map((turno) => (
              <div key={turno._id} className="prescription-card">
                <div className="prescription-header">
                  <span className="prescription-date">{formatDate(turno.fecha)}</span>
                  <span className="prescription-doctor">
                    Dr. {turno.especialistaId?.userId?.name || "No especificado"}
                  </span>
                </div>
                <div className="prescription-products">
                  <h4>Medicamentos:</h4>
                  <ul>
                    {turno.consulta.productos.map((prod, idx) => (
                      <li key={idx}>
                        <strong>{prod.nombreProducto}</strong> - {prod.cantidad} unidad(es)
                        {prod.dosis && <span className="dosis">Dosis: {prod.dosis}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="prescription-notes">
                  <h4>Indicaciones:</h4>
                  <p>{turno.consulta.notasConsulta || "No hay indicaciones adicionales"}</p>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="no-data">No tienes recetas registradas</p>
      )}
    </div>
  );
};

export default PrescriptionsSection;