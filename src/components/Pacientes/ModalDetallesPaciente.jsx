import React, { useState } from "react";
import useAuthStore from "../../store/authStore";
import useNotify from "../../hooks/useToast";

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
  });

  const [activeTab, setActiveTab] = useState("general");
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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDatosClinicosChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      evaluacionMedica: {
        ...prev.evaluacionMedica,
        [name]: value,
      },
    }));
  };

  const handleUpdateReprocann = async (e) => {
    e.preventDefault();

    try {
      console.log("Enviando datos REPROCANN:", formData.reprocann);

      if (!token) {
        notify("No se encontró token de autenticación", "error");
        throw new Error("No se encontró token de autenticación");
      }

      const response = await fetch(
        `http://localhost:4000/pacientes/${paciente._id}/reprocann`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData.reprocann),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        notify(data.error || "Error al actualizar REPROCANN", "error");
        throw new Error(data.error || "Error al actualizar REPROCANN");
      }

      setFormData((prev) => ({
        ...prev,
        reprocann: data.reprocann || data.data.reprocann,
      }));

      notify("REPROCANN actualizado correctamente", "success");
      // Llama a onUpdate para notificar al componente padre
      if (onUpdate) {
        await onUpdate(paciente._id, { reprocann: formData.reprocann });
      }
      onClose();
    } catch (error) {
      console.error("Error al actualizar REPROCANN:", error);
      notify(`Error: ${error.message}`, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (activeTab === "general") {
        const result = await onUpdate(paciente._id, {
          fullName: formData.fullName,
          fechaDeNacimiento: formData.fechaDeNacimiento,
        });

        if (result && result.success) {
          notify("Datos generales actualizados correctamente", "success");
        } else {
          const errorMsg =
            result?.error || "Error al actualizar datos generales";
          notify(errorMsg, "error");
        }
      }

      if (activeTab === "clinicos") {
        const result = await onUpdateDatosClinicos(
          paciente._id,
          formData.evaluacionMedica
        );

        if (result && result.success) {
          notify("Datos clínicos actualizados correctamente", "success");
        } else {
          const errorMsg =
            result?.error || "Error al actualizar datos clínicos";
          notify(errorMsg, "error");
        }
      }

      onClose();
    } catch (error) {
      notify(error.message || "Error al guardar los cambios", "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Detalles del Paciente: {paciente.fullName}</h3>

        <div className="tabs">
          <button
            className={activeTab === "general" ? "active" : ""}
            onClick={() => setActiveTab("general")}
          >
            Información General
          </button>
          {(isAdmin || isMedico || isPartner) && (
            <button
              className={activeTab === "clinicos" ? "active" : ""}
              onClick={() => setActiveTab("clinicos")}
            >
              Datos Clínicos
            </button>
          )}
          {(isAdmin || isMedico || isPartner) && (
            <button
              className={activeTab === "reprocann" ? "active" : ""}
              onClick={() => setActiveTab("reprocann")}
            >
              REPROCANN
            </button>
          )}
        </div>

        {activeTab === "general" && (
          <form onSubmit={handleSubmit} className="user-details">
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
                  <p>No tiene antecedentes</p>
                )
              ) : (
                <p>No tiene antecedentes</p>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="close-btn">
                Cerrar
              </button>
              <button type="submit" className="approve-btn">
                Guardar Cambios
              </button>
            </div>
          </form>
        )}

        {activeTab === "clinicos" && (
          <form onSubmit={handleSubmit} className="user-details">
            <div className="form-group">
              <label>Patología</label>
              <textarea
                name="patologia"
                value={formData.evaluacionMedica?.patologia || ""}
                onChange={handleDatosClinicosChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Tratamiento Propuesto</label>
              <textarea
                name="tratamientoPropuesto"
                value={formData.evaluacionMedica?.tratamientoPropuesto || ""}
                onChange={handleDatosClinicosChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Beneficios Esperados</label>
              <textarea
                name="beneficios"
                value={formData.evaluacionMedica?.beneficios || ""}
                onChange={handleDatosClinicosChange}
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="close-btn">
                Cerrar
              </button>
              <button type="submit" className="approve-btn">
                Guardar Datos Clínicos
              </button>
            </div>
          </form>
        )}

        {activeTab === "reprocann" && (
          <form onSubmit={handleUpdateReprocann} className="user-details">
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
                value={formData.reprocann?.fechaAprobacion?.split("T")[0] || ""}
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

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="close-btn">
                Cerrar
              </button>
              <button type="submit" className="approve-btn">
                Actualizar REPROCANN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalDetallesPaciente;
