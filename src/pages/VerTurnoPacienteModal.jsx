import React from "react";

const VerTurnoPacienteModal = ({ turno, onClose }) => {
  if (!turno) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container ver-turno-paciente-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalles de Mi Consulta</h2>
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
            </div>
          </div>

          {/* Información de facturación */}
          {turno.consulta && (
            <div className="seccion-facturacion">
              <h3>💰 Información de Facturación</h3>
              <div className="grid-datos">
                <div className="form-group">
                  <label>Precio de Consulta:</label>
                  <div className="modal-detail precio">
                    ${turno.consulta.precioConsulta?.toLocaleString() || "0"}
                  </div>
                </div>

                <div className="form-group">
                  <label>Forma de Pago:</label>
                  <div className="modal-detail">
                    {turno.consulta.formaPago ? 
                      turno.consulta.formaPago.charAt(0).toUpperCase() + turno.consulta.formaPago.slice(1) 
                      : "No especificado"}
                  </div>
                </div>

                <div className="form-group">
                  <label>Estado de Pago:</label>
                  <div className="modal-detail">
                    <span className={`badge-pago ${turno.consulta.pagado ? 'pagado' : 'pendiente'}`}>
                      {turno.consulta.pagado ? "✅ Pagado" : "⏳ Pendiente"}
                    </span>
                  </div>
                </div>

                {turno.consulta.descuento > 0 && (
                  <div className="form-group">
                    <label>Descuento Aplicado:</label>
                    <div className="modal-detail descuento">
                      -${turno.consulta.descuento?.toLocaleString() || "0"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Indicaciones médicas */}
          <div className="seccion-indicaciones">
            <h3>💊 Indicaciones Médicas</h3>
            <div className="grid-datos">
              <div className="form-group full-width">
                <label>Diagnóstico:</label>
                <div className="modal-detail texto-largo">
                  {turno.diagnostico || "No se registró diagnóstico"}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Observaciones del Médico:</label>
                <div className="modal-detail texto-largo">
                  {turno.observaciones || "No hay observaciones registradas"}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Tratamiento Indicado:</label>
                <div className="modal-detail texto-largo">
                  {turno.tratamiento || "No se indicó tratamiento específico"}
                </div>
              </div>

              {turno.consulta?.notasConsulta && (
                <div className="form-group full-width">
                  <label>Notas Adicionales:</label>
                  <div className="modal-detail texto-largo">
                    {turno.consulta.notasConsulta}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Receta y documentos */}
          {turno.documentosAdjuntos && turno.documentosAdjuntos.length > 0 && (
            <div className="seccion-receta">
              <h3>📎 Receta y Documentos</h3>
              <div className="adjuntos-container">
                {turno.documentosAdjuntos.map((adjunto, index) => (
                  <div key={index} className="adjunto-item">
                    <div className="adjunto-info">
                      <a 
                        href={adjunto.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="adjunto-link"
                      >
                        📎 {adjunto.nombre || `Documento ${index + 1}`}
                      </a>
                      <span className="tipo-adjunto">
                        {adjunto.tipo ? `(${adjunto.tipo})` : ''}
                      </span>
                    </div>
                    <div className="fecha-adjunto">
                      {new Date(adjunto.fecha).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Productos recetados */}
          {turno.consulta?.productos && turno.consulta.productos.length > 0 && (
            <div className="seccion-productos">
              <h3>💊 Productos Recetados</h3>
              <div className="productos-container">
                {turno.consulta.productos.map((producto, index) => (
                  <div key={index} className="producto-item">
                    <div className="producto-header">
                      <span className="producto-nombre">{producto.nombre}</span>
                      {producto.precio && (
                        <span className="producto-precio">
                          ${producto.precio?.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="producto-detalle">
                      Cantidad: {producto.cantidad || 1}
                      {producto.descripcion && ` - ${producto.descripcion}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comprobante de pago */}
          {turno.comprobantePago && (
            <div className="seccion-comprobante">
              <h3>🧾 Comprobante de Pago</h3>
              <div className="comprobante-info">
                <div className="form-group">
                  <label>Fecha de Pago:</label>
                  <div className="modal-detail">
                    {new Date(turno.comprobantePago.fechaSubida).toLocaleDateString()}
                  </div>
                </div>
                <div className="form-group">
                  <label>Estado:</label>
                  <div className="modal-detail">
                    <span className="badge-verificado">✅ Verificado</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notas generales */}
          {turno.notas && (
            <div className="seccion-notas">
              <h3>📝 Notas Generales</h3>
              <div className="modal-detail texto-largo">
                {turno.notas}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn close" onClick={onClose}>
            Cerrar
          </button>
          {turno.documentosAdjuntos && turno.documentosAdjuntos.length > 0 && (
            <button 
              className="modal-btn descargar-todo"
              onClick={() => {
                // Función para descargar todos los documentos
                turno.documentosAdjuntos.forEach(adjunto => {
                  window.open(adjunto.url, '_blank');
                });
              }}
            >
              Descargar Todos
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerTurnoPacienteModal;