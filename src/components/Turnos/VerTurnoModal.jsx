import React from "react";

const VerTurnoModal = ({ turno, onClose }) => {
  if (!turno) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container ver-turno-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Detalles de la Consulta</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Información básica del turno */}
          <div className="seccion-turno">
            <h3>📅 Información del Turno</h3>
            <div className="grid-datos">
              <div className="form-group">
                <label>Paciente:</label>
                <div className="modal-detail">
                  {turno.pacienteId?.fullName || "No especificado"}
                </div>
              </div>

              <div className="form-group">
                <label>Especialista:</label>
                <div className="modal-detail">
                  {turno.especialistaId?.userId?.name || "No especificado"}
                </div>
              </div>

              <div className="form-group">
                <label>Especialidad:</label>
                <div className="modal-detail">
                  {turno.especialistaId?.especialidad || "No especificado"}
                </div>
              </div>

              <div className="form-group">
                <label>Fecha y Hora:</label>
                <div className="modal-detail">
                  {new Date(turno.fecha).toLocaleString()}
                </div>
              </div>

              <div className="form-group">
                <label>Motivo:</label>
                <div className="modal-detail">
                  {turno.motivo || "No especificado"}
                </div>
              </div>

              <div className="form-group">
                <label>Estado:</label>
                <div className="modal-detail">
                  <span className={`status-badge ${turno.estado}`}>
                    {turno.estado}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Reprocann Relacionado:</label>
                <div className="modal-detail">
                  {turno.reprocannRelacionado ? "Sí" : "No"}
                </div>
              </div>
            </div>
          </div>

          {/* Información de la consulta médica */}
          {turno.consulta && (
            <div className="seccion-consulta">
              <h3>💰 Información de Facturación</h3>
              <div className="grid-datos">
                <div className="form-group">
                  <label>Precio Consulta:</label>
                  <div className="modal-detail">
                    ${turno.consulta.precioConsulta?.toLocaleString() || "0"}
                  </div>
                </div>

                <div className="form-group">
                  <label>Forma de Pago:</label>
                  <div className="modal-detail">
                    {turno.consulta.formaPago || "No especificado"}
                  </div>
                </div>

                <div className="form-group">
                  <label>Pagado:</label>
                  <div className="modal-detail">
                    <span
                      className={`badge-pago ${
                        turno.consulta.pagado ? "pagado" : "pendiente"
                      }`}
                    >
                      {turno.consulta.pagado ? "✅ Pagado" : "⏳ Pendiente"}
                    </span>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Notas de Consulta:</label>
                  <div className="modal-detail texto-largo">
                    {turno.consulta.notasConsulta || "No hay notas de consulta"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información médica importante */}
          <div className="seccion-medica">
            <h3>💊 Información Médica</h3>
            <div className="grid-datos">
              <div className="form-group full-width">
                <label>Diagnóstico:</label>
                <div className="modal-detail texto-largo">
                  {turno.diagnostico || "No se registró diagnóstico"}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Observaciones:</label>
                <div className="modal-detail texto-largo">
                  {turno.observaciones || "No hay observaciones"}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Tratamiento:</label>
                <div className="modal-detail texto-largo">
                  {turno.tratamiento || "No se registró tratamiento"}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Notas Adicionales:</label>
                <div className="modal-detail texto-largo">
                  {turno.notas || "No hay notas adicionales"}
                </div>
              </div>
            </div>
          </div>

          {/* Documentos adjuntos */}
          {turno.documentosAdjuntos && turno.documentosAdjuntos.length > 0 && (
            <div className="seccion-adjuntos">
              <h3>📎 Documentos Adjuntos</h3>
              <div className="adjuntos-container">
                {turno.documentosAdjuntos.map((adjunto, index) => (
                  <div key={index} className="adjunto-item">
                    <a
                      href={adjunto.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="adjunto-link"
                    >
                      📎 {adjunto.nombre || `Documento ${index + 1}`}
                      <span className="tipo-adjunto">({adjunto.tipo})</span>
                    </a>
                    <div className="fecha-adjunto">
                      {new Date(adjunto.fecha).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información de productos si existe */}
          {turno.consulta?.productos && turno.consulta.productos.length > 0 && (
            <div className="seccion-productos">
              <h3>💊 Productos Recetados</h3>
              <div className="productos-container">
                {turno.consulta.productos.map((producto, index) => (
                  <div key={index} className="producto-item">
                    <div className="producto-nombre">{producto.nombre}</div>
                    <div className="producto-detalle">
                      Cantidad: {producto.cantidad} - Precio: ${producto.precio}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información de comprobante de pago */}
          {turno.comprobantePago && (
            <div className="seccion-comprobante">
              <h3>Comprobante de Pago</h3>
              <div className="grid-datos">
                <div className="form-group">
                  <label>Fecha de Subida:</label>
                  <div className="modal-detail">
                    {new Date(
                      turno.comprobantePago.fechaSubida
                    ).toLocaleString()}
                  </div>
                </div>
                <div className="form-group">
                  <label>Fecha de Consulta:</label>
                  <div className="modal-detail">
                    {new Date(
                      turno.comprobantePago.fechaConsulta
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerTurnoModal;
