import React, { useState } from "react";
import PropTypes from "prop-types";

const toLocalDateTimeString = (date) => {
  if (!date) return "";
  const pad = (n) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EditarTurnoModal = ({
  turno,
  especialistas,
  onClose,
  onSave,
  currentUserId,
  canEditEspecialista,
}) => {
  const [form, setForm] = useState({
    fecha: turno.fecha ? toLocalDateTimeString(new Date(turno.fecha)) : "",
    motivo: turno.motivo || "",
    notas: turno.notas || "",
    reprocannRelacionado: turno.reprocannRelacionado || false,
    estado: turno.estado || "pendiente",
    especialistaId: turno.especialistaId?._id || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fecha || !form.motivo) {
      return setError("Fecha y motivo son campos obligatorios");
    }

    const fechaTurno = new Date(form.fecha);
    if (fechaTurno <= new Date()) {
      return setError("La fecha del turno debe ser futura");
    }

    try {
      setLoading(true);
      const datosActualizados = {
        fecha: form.fecha,
        motivo: form.motivo,
        notas: form.notas,
        reprocannRelacionado: form.reprocannRelacionado,
        estado: form.estado,
        ...(canEditEspecialista && { especialistaId: form.especialistaId }),
      };

      await onSave(turno._id, datosActualizados);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="close-modal" disabled={loading}>
          &times;
        </button>
        <h3>Editar Turno</h3>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          {canEditEspecialista && (
            <div className="form-group">
              <label>Especialista:</label>
              <select
                value={form.especialistaId}
                onChange={(e) =>
                  setForm({ ...form, especialistaId: e.target.value })
                }
                disabled={loading}
              >
                <option value="">Seleccionar especialista</option>
                {especialistas.map((especialista) => (
                  <option key={especialista._id} value={especialista._id}>
                    {especialista.especialidad} - {especialista.userId?.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Fecha y Hora:</label>
            <input
              type="datetime-local"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              required
              min={new Date().toISOString().slice(0, 16)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Motivo:</label>
            <input
              type="text"
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Notas adicionales:</label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Estado:</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              disabled={loading}
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="cancelado">Cancelado</option>
              <option value="completado">Completado</option>
            </select>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={form.reprocannRelacionado}
                onChange={(e) =>
                  setForm({ ...form, reprocannRelacionado: e.target.checked })
                }
                disabled={loading}
              />
              Relacionado a Reprocann
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="close-btn"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="approve-btn"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditarTurnoModal.propTypes = {
  turno: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    fecha: PropTypes.string,
    motivo: PropTypes.string,
    notas: PropTypes.string,
    reprocannRelacionado: PropTypes.bool,
    estado: PropTypes.string,
    especialistaId: PropTypes.shape({
      _id: PropTypes.string,
      userId: PropTypes.shape({
        name: PropTypes.string,
      }),
      especialidad: PropTypes.string,
    }),
  }).isRequired,
  especialistas: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      especialidad: PropTypes.string.isRequired,
      userId: PropTypes.shape({
        name: PropTypes.string,
      }),
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  currentUserId: PropTypes.string.isRequired,
  canEditEspecialista: PropTypes.bool.isRequired,
};

export default EditarTurnoModal;