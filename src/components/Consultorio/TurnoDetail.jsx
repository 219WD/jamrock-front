import React, { useState, useEffect } from "react";
import Cloudinary from "../../components/Cloudinary";
import ModalDetallesPaciente from "../../components/Pacientes/ModalDetallesPaciente";
import useAuthStore from "../../store/authStore";

const TurnoDetail = ({
  selectedTurno,
  selectedProducts,
  formaPago,
  setFormaPago,
  notasConsulta,
  setNotasConsulta,
  diagnostico,
  setDiagnostico,
  tratamiento,
  setTratamiento,
  observaciones,
  setObservaciones,
  documentos,
  nuevoDocumento,
  setNuevoDocumento,
  handleDocumentUploadComplete,
  handleRemoveDocument,
  setShowProductosModal,
  precioConsulta,
  setPrecioConsulta,
  updateProductQuantity,
  updateProductDosis,
  calculateTotal,
  handleSaveHistorial,
  handleCompleteTurno,
  loading,
  guardando,
}) => {
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [patientData, setPatientData] = useState(
    selectedTurno?.pacienteId || {}
  );
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const antecedentesOptions = {
    afeccionCardiaca: "Afección cardíaca",
    alteracionCoagulacion: "Alteración de la coagulación",
    diabetes: "Diabetes",
    hipertension: "Hipertensión",
    epilepsia: "Epilepsia",
    insufRenal: "Insuficiencia renal",
    hepatitis: "Hepatitis",
    insufHepatica: "Insuficiencia hepática",
    alergia: "Alergia",
    asma: "Asma",
    otros: "Otros",
  };

  useEffect(() => {
    if (selectedTurno?.pacienteId) {
      setPatientData(selectedTurno.pacienteId);
    }
  }, [selectedTurno?.pacienteId]);

  const updatePaciente = async (pacienteId, updatedData) => {
    try {
      const response = await fetch(
        `http://localhost:4000/pacientes/${pacienteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateDatosClinicos = async (pacienteId, datosClinicos) => {
    try {
      const response = await fetch(
        `http://localhost:4000/pacientes/${pacienteId}/datos-clinicos`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datosClinicos),
        }
      );
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <div className="turno-detail">
      {selectedTurno ? (
        <>
          <h3>Consulta de {selectedTurno.pacienteId?.fullName}</h3>
          <div className="turno-info-detailed">
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(selectedTurno.fecha).toLocaleString()}
            </p>
            <p>
              <strong>Motivo:</strong> {selectedTurno.motivo}
            </p>
            <p>
              <strong>Especialista:</strong>{" "}
              {selectedTurno.especialistaId?.userId?.name}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              <span className={`estado ${selectedTurno.estado}`}>
                {selectedTurno.estado}
              </span>
            </p>
            <button
              className="btn-info-paciente"
              onClick={() => {
                setPatientData(selectedTurno.pacienteId);
                setShowPacienteModal(true);
              }}
            >
              Info Paciente
            </button>
          </div>

          <div className="productos-section">
            <h4>Productos Recetados</h4>
            {(!selectedTurno.consulta?.productos ||
              selectedTurno.consulta.productos.length === 0) &&
              selectedProducts.length === 0 && (
                <div className="add-productos-section">
                  <button
                    className="btn-add-productos"
                    onClick={() => setShowProductosModal(true)}
                  >
                    Agregar Productos
                  </button>
                </div>
              )}
            {(selectedTurno.consulta?.productos?.length > 0 ||
              selectedProducts.length > 0) && (
              <table className="productos-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedTurno.consulta?.productos || []).map(
                    (item, index) => (
                      <tr key={index}>
                        <td>{item.nombreProducto}</td>
                        <td>{item.cantidad}</td>
                        <td>${item.precioUnitario}</td>
                        <td>${item.precioUnitario * item.cantidad}</td>
                      </tr>
                    )
                  )}
                  {selectedProducts.map((item, index) => (
                    <tr key={`selected-${index}`}>
                      <td>{item.nombreProducto}</td>
                      <td>{item.cantidad}</td>
                      <td>${item.precioUnitario}</td>
                      <td>${item.precioUnitario * item.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3">
                      <strong>Total:</strong>
                    </td>
                    <td>
                      <strong>${calculateTotal()}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <strong>Forma de Pago:</strong>
                    </td>
                    <td colSpan="2">{formaPago}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* Sección de Precio de Consulta - Ahora aparece siempre */}
          <div className="price-section">
            <label>Precio de Consulta:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={precioConsulta}
              onChange={(e) => setPrecioConsulta(Number(e.target.value))}
              placeholder="Precio de la consulta"
            />
          </div>

          {/* Sección de Forma de Pago - Ahora aparece siempre */}
          <div className="payment-section">
            <label>Forma de Pago:</label>
            <select
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="mercadoPago">Mercado Pago</option>
            </select>
          </div>

          {/* Sección de Notas - Ahora aparece siempre */}
          <div className="notes-section">
            <label>Notas de la Consulta:</label>
            <textarea
              value={notasConsulta}
              onChange={(e) => setNotasConsulta(e.target.value)}
              placeholder="Observaciones, diagnóstico, etc."
            />
          </div>

          {/* Sección de Total - Corregida para no duplicar */}
          <div className="total-section">
            <strong>Total:</strong> ${calculateTotal()}
          </div>

          {/* Sección de Productos Seleccionados (solo si hay productos) */}
          {selectedProducts.length > 0 && (
            <div className="selected-products">
              <h4>Productos Seleccionados</h4>
              <ul>
                {selectedProducts.map((item, index) => (
                  <li key={index}>
                    <span>{item.nombreProducto}</span>
                    <div className="product-actions">
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) =>
                          updateProductQuantity(
                            item.productoId,
                            parseInt(e.target.value)
                          )
                        }
                      />
                      <input
                        type="text"
                        placeholder="Dosis"
                        value={item.dosis}
                        onChange={(e) =>
                          updateProductDosis(item.productoId, e.target.value)
                        }
                      />
                    </div>
                    <span>${item.precioUnitario * item.cantidad}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="historial-section">
            <h4>Datos Clínicos</h4>
            <div className="form-group">
              <label>Diagnóstico:</label>
              <textarea
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Ingrese el diagnóstico..."
              />
            </div>

            <div className="form-group">
              <label>Tratamiento:</label>
              <textarea
                value={tratamiento}
                onChange={(e) => setTratamiento(e.target.value)}
                placeholder="Describa el tratamiento indicado..."
              />
            </div>

            <div className="form-group">
              <label>Observaciones:</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones adicionales..."
              />
            </div>

            <div className="documentos-section">
              <h4>Documentos Adjuntos</h4>
              <div className="nuevo-documento">
                <div className="inputs-documentos-adjuntos">
                  <input
                    type="text"
                    placeholder="Nombre del documento"
                    value={nuevoDocumento.nombre}
                    onChange={(e) =>
                      setNuevoDocumento({
                        ...nuevoDocumento,
                        nombre: e.target.value,
                      })
                    }
                  />
                  <select
                    value={nuevoDocumento.tipo}
                    onChange={(e) =>
                      setNuevoDocumento({
                        ...nuevoDocumento,
                        tipo: e.target.value,
                      })
                    }
                  >
                    <option value="receta">Receta</option>
                    <option value="estudio">Estudio</option>
                    <option value="informe">Informe</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <Cloudinary
                  onUploadComplete={handleDocumentUploadComplete}
                  disabled={!nuevoDocumento.nombre}
                  buttonText="Subir Documento"
                />
              </div>

              {documentos.length > 0 && (
                <ul className="documentos-list">
                  {documentos.map((doc, index) => (
                    <li key={index}>
                      <div className="documento-info">
                        <span className="documento-nombre">{doc.nombre}</span>
                        <span className={`documento-tipo ${doc.tipo}`}>
                          {doc.tipo}
                        </span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="documento-link"
                        >
                          Ver documento
                        </a>
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveDocument(index)}
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="btn-submit btn-complete-turno"
              onClick={handleCompleteTurno}
              disabled={guardando || selectedTurno.estado === "completado"}
            >
              {guardando ? "Procesando..." : "Completar Turno"}
            </button>
          </div>

          {showPacienteModal && (
            <ModalDetallesPaciente
              paciente={selectedTurno?.pacienteId}
              antecedentesOptions={antecedentesOptions}
              onClose={() => setShowPacienteModal(false)}
              onUpdate={updatePaciente}
              onUpdateDatosClinicos={updateDatosClinicos}
              isMedico={user.isMedico}
              isAdmin={user.isAdmin}
              isPartner={user.isPartner}
              token={token}
            />
          )}
        </>
      ) : (
        <div className="no-turno-selected">
          <p>Selecciona un turno para ver los detalles</p>
        </div>
      )}
    </div>
  );
};

export default TurnoDetail;