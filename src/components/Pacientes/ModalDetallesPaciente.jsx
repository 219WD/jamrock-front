import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import useNotify from "../../hooks/useToast";
import API_URL from "../../common/constants";

const formatearNombreAntecedente = (clave) => {
  const nombres = {
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
  return nombres[clave] || clave;
};

const ModalDetallesPaciente = ({
  paciente,
  antecedentesOptions,
  onClose,
  onUpdate,
  onUpdateDatosClinicos,
  isMedico,
  isAdmin,
  isPartner,
  token,
}) => {
  const [formData, setFormData] = useState({
    ...paciente,
    reprocann: paciente.reprocann || {
      status: "pendiente",
      fechaAprobacion: "",
      fechaVencimiento: "",
    },
    evaluacionMedica: paciente.evaluacionMedica || {
      patologia: "",
      tratamientoPropuesto: "",
      beneficios: "",
    },
  });
  const [activeTab, setActiveTab] = useState("general");
  const [guardando, setGuardando] = useState(false);
  const notify = useNotify();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("reprocann.")) {
      const [, subKey] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        reprocann: {
          ...prev.reprocann,
          [subKey]: value,
        },
      }));
    } else if (name.includes("evaluacionMedica.")) {
      const [, subKey] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        evaluacionMedica: {
          ...prev.evaluacionMedica,
          [subKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 📝 NUEVA FUNCIÓN: Guardar todos los datos
  const handleSaveAll = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const resultados = [];

      // 1. Guardar datos generales
      if (
        formData.fullName !== paciente.fullName ||
        formData.fechaDeNacimiento !== paciente.fechaDeNacimiento
      ) {
        const resultGeneral = await onUpdate(paciente._id, {
          fullName: formData.fullName,
          fechaDeNacimiento: formData.fechaDeNacimiento,
        });
        resultados.push(resultGeneral);
      }

      // 2. Guardar datos clínicos (si hay cambios)
      if (
        formData.evaluacionMedica &&
        JSON.stringify(formData.evaluacionMedica) !==
          JSON.stringify(paciente.evaluacionMedica || {})
      ) {
        const resultClinicos = await onUpdateDatosClinicos(
          paciente._id,
          formData.evaluacionMedica
        );
        resultados.push(resultClinicos);
      }

      // 3. Guardar REPROCANN (si hay cambios)
      if (
        formData.reprocann &&
        JSON.stringify(formData.reprocann) !==
          JSON.stringify(paciente.reprocann || {})
      ) {
        const response = await fetch(
          `${API_URL}/pacientes/${paciente._id}/reprocann`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData.reprocann),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al actualizar REPROCANN");
        }

        const data = await response.json();
        resultados.push({ success: true, data });
      }

      // Verificar si hubo errores
      const errores = resultados.filter((result) => result && !result.success);
      if (errores.length > 0) {
        const mensajeError = errores.map((e) => e.error).join(", ");
        throw new Error(mensajeError);
      }

      notify("Todos los datos se guardaron correctamente", "success");

      // 📝 ACTUALIZAR EL ESTADO LOCAL con los nuevos datos
      if (onUpdate) {
        // Forzar recarga de datos llamando a onUpdate con null para indicar refresco
        await onUpdate(paciente._id, null);
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar datos:", error);
      notify(`Error: ${error.message}`, "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="modal-header">
          <h2>Detalles del Paciente: {paciente.fullName}</h2>
        </div>

        {/* 📝 FORMULARIO ÚNICO QUE ENVUELVE TODO */}
        <form onSubmit={handleSaveAll}>
          <div className="modal-body">
            <div className="tabs">
              <button
                type="button"
                className={activeTab === "general" ? "active" : ""}
                onClick={() => setActiveTab("general")}
              >
                Información General
              </button>
              {(isAdmin || isMedico || isPartner) && (
                <button
                  type="button"
                  className={activeTab === "clinicos" ? "active" : ""}
                  onClick={() => setActiveTab("clinicos")}
                >
                  Datos Clínicos
                </button>
              )}
              {(isAdmin || isMedico || isPartner) && (
                <button
                  type="button"
                  className={activeTab === "reprocann" ? "active" : ""}
                  onClick={() => setActiveTab("reprocann")}
                >
                  REPROCANN
                </button>
              )}
            </div>

            {activeTab === "general" && (
              <div className="user-details">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fechaDeNacimiento"
                    value={formData.fechaDeNacimiento?.split("T")[0] || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group antecedentes-lista">
                  <label>Antecedentes Médicos</label>
                  {formData.antecedentes ? (
                    Object.entries(formData.antecedentes).filter(
                      ([key, value]) =>
                        value === true && key !== "_id" && key !== "pacienteId"
                    ).length > 0 ? (
                      <ul className="antecedentes-ul">
                        {Object.entries(formData.antecedentes)
                          .filter(
                            ([key, value]) =>
                              value === true &&
                              key !== "_id" &&
                              key !== "pacienteId"
                          )
                          .map(([key]) => (
                            <li key={key}>{formatearNombreAntecedente(key)}</li>
                          ))}
                      </ul>
                    ) : (
                      <p className="modal-detail">No tiene antecedentes</p>
                    )
                  ) : (
                    <p className="modal-detail">No tiene antecedentes</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "clinicos" && (
              <div className="user-details">
                <div className="form-group">
                  <label>Patología</label>
                  <textarea
                    name="evaluacionMedica.patologia"
                    value={formData.evaluacionMedica?.patologia || ""}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Tratamiento Propuesto</label>
                  <textarea
                    name="evaluacionMedica.tratamientoPropuesto"
                    value={
                      formData.evaluacionMedica?.tratamientoPropuesto || ""
                    }
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Beneficios Esperados</label>
                  <textarea
                    name="evaluacionMedica.beneficios"
                    value={formData.evaluacionMedica?.beneficios || ""}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              </div>
            )}

            {activeTab === "reprocann" && (
              <div className="user-details">
                <div className="form-group">
                  <label>Estado REPROCANN</label>
                  <select
                    name="reprocann.status"
                    value={formData.reprocann?.status || "pendiente"}
                    onChange={handleChange}
                    required
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="expirado">Expirado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha de Aprobación</label>
                  <input
                    type="date"
                    name="reprocann.fechaAprobacion"
                    value={
                      formData.reprocann?.fechaAprobacion?.split("T")[0] || ""
                    }
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Vencimiento</label>
                  <input
                    type="date"
                    name="reprocann.fechaVencimiento"
                    value={
                      formData.reprocann?.fechaVencimiento?.split("T")[0] || ""
                    }
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* 📝 BOTONES DE GUARDADO ÚNICOS */}
            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="modal-btn close"
                disabled={guardando}
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="modal-btn approve"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar Todos los Cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalDetallesPaciente;
