import React, { useState } from "react";
import useNotify from "../../hooks/useToast";

const CrearTurnoModal = ({
  paciente,
  especialistas = [],
  onClose,
  onCreate,
}) => {
  const [form, setForm] = useState({
    fecha: "",
    motivo: "",
    notas: "",
    reprocannRelacionado: false,
    especialistaId: "",
    estado: "pendiente",
  });
  const [error, setError] = useState("");

  const notify = useNotify();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fecha || !form.motivo || !form.especialistaId) {
      setError("Fecha, motivo y especialista son campos obligatorios");
      notify("Faltan campos obligatorios", "error");
      return;
    }

    try {
      const nuevoTurno = {
        pacienteId: paciente._id,
        fecha: form.fecha,
        motivo: form.motivo,
        notas: form.notas,
        reprocannRelacionado: form.reprocannRelacionado,
        especialistaId: form.especialistaId,
        estado: form.estado,
      };

      const result = await onCreate(nuevoTurno);
      
      if (result.success) {
        notify("Turno creado exitosamente", "success");
        onClose(); // Cerrar el modal después de crear exitosamente
      } else {
        throw new Error(result.error || "Error al crear turno");
      }
    } catch (err) {
      notify(err.message, "error");
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Crear Turno para {paciente.fullName}</h3>
        {error && (
          <p
            className="error-message"
            style={{ color: "#e74c3c", marginBottom: "1rem" }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Especialista:</label>
            <select
              value={form.especialistaId}
              onChange={(e) =>
                setForm({ ...form, especialistaId: e.target.value })
              }
              required
            >
              <option value="">Seleccionar especialista</option>
              {Array.isArray(especialistas) &&
                especialistas.map((especialista) => (
                  <option key={especialista._id} value={especialista._id}>
                    {especialista.especialidad} -{" "}
                    {especialista.userId?.name || "Nombre no disponible"}
                  </option>
                ))}
            </select>
            {!Array.isArray(especialistas) && (
              <p className="error-message" style={{ color: "#e74c3c" }}>
                No hay especialistas disponibles
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Fecha y Hora:</label>
            <input
              type="datetime-local"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Motivo:</label>
            <input
              type="text"
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Notas adicionales:</label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </div>

          <div
            className="form-group"
            style={{ display: "flex", alignItems: "center" }}
          >
            <input
              type="checkbox"
              id="reprocannCheckbox"
              checked={form.reprocannRelacionado}
              onChange={(e) =>
                setForm({ ...form, reprocannRelacionado: e.target.checked })
              }
              style={{ marginRight: "0.5rem" }}
            />
            <label htmlFor="reprocannCheckbox" style={{ marginBottom: 0 }}>
              Relacionado a Reprocann
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="close-btn">
              Cancelar
            </button>
            <button type="submit" className="approve-btn">
              Crear Turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearTurnoModal;
