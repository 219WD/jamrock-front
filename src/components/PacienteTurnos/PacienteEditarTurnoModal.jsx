import React, { useState } from "react";

const PacienteEditarTurnoModal = ({ turno, onClose, onSave }) => {
  const [form, setForm] = useState({
    fecha: turno.fecha ? new Date(turno.fecha).toISOString().slice(0, 16) : "",
    motivo: turno.motivo || ""
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.fecha || !form.motivo) {
      return setError("Fecha y motivo son requeridos");
    }

    // Validar que la fecha sea futura
    if (new Date(form.fecha) < new Date()) {
      return setError("La fecha debe ser futura");
    }

    onSave(turno._id, form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button onClick={onClose} className="close-modal">
          &times;
        </button>
        <h2>Editar Turno</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Fecha y Hora:</label>
            <input
              type="datetime-local"
              value={form.fecha}
              onChange={(e) => setForm({...form, fecha: e.target.value})}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          <div className="form-group">
            <label>Motivo:</label>
            <input
              type="text"
              value={form.motivo}
              onChange={(e) => setForm({...form, motivo: e.target.value})}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PacienteEditarTurnoModal;