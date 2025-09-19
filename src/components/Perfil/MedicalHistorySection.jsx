import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileMedicalAlt } from "@fortawesome/free-solid-svg-icons";

const MedicalHistorySection = ({ turnos, formatDate }) => {
  return (
    <div className="dashboard-section">
      <h2 className="section-title">
        <FontAwesomeIcon icon={faFileMedicalAlt} /> Mi Historial Completo
      </h2>
      {turnos.length > 0 ? (
        <div className="medical-history">
          {turnos
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .map((turno) => (
              <div key={turno._id} className="history-card">
                <div className="history-header">
                  <span className="history-date">{formatDate(turno.fecha)}</span>
                  <span className={`history-status ${turno.estado}`}>
                    {turno.estado}
                  </span>
                </div>
                <div className="history-content">
                  <div className="history-section">
                    <h4>Especialista:</h4>
                    <p>{turno.especialistaId?.userId?.name || "No especificado"}</p>
                  </div>
                  <div className="history-section">
                    <h4>Motivo de consulta:</h4>
                    <p>{turno.motivo || "No especificado"}</p>
                  </div>
                  <div className="history-section">
                    <h4>Indicaciones:</h4>
                    <p>{turno.notas || "No hay notas registradas"}</p>
                  </div>
                  {turno.reprocannRelacionado && (
                    <div className="history-section">
                      <h4>REPROCANN:</h4>
                      <p>Consulta relacionada con trámite REPROCANN</p>
                    </div>
                  )}
                  {turno.consulta && (
                    <>
                      <div className="history-section">
                        <h4>Detalles de la consulta:</h4>
                        <p>Estado: {turno.consulta.pagado ? "Pagado" : "Pendiente de pago"}</p>
                        <p>Método de pago: {turno.consulta.formaPago || "No especificado"}</p>
                        {turno.consulta.notasConsulta && (
                          <p>Notas: {turno.consulta.notasConsulta}</p>
                        )}
                      </div>
                      {turno.consulta.productos?.length > 0 && (
                        <div className="history-section">
                          <h4>Productos recetados:</h4>
                          <ul className="product-list">
                            {turno.consulta.productos.map((prod, idx) => (
                              <li key={idx}>
                                <strong>{prod.nombreProducto}</strong> - Cantidad: {prod.cantidad} - Precio unitario: ${prod.precioUnitario} - Total: ${(prod.precioUnitario * prod.cantidad).toFixed(2)}
                                {prod.dosis && <span> (Dosis: {prod.dosis})</span>}
                              </li>
                            ))}
                          </ul>
                          <p className="total-amount">
                            Total consulta: ${turno.consulta.total?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="no-data">No hay registros en tu historial médico</p>
      )}
    </div>
  );
};

export default MedicalHistorySection;