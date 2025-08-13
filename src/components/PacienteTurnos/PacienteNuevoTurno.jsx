import React, { useState } from "react";

const PacienteNuevoTurno = ({ especialistas, onClose, onCreate }) => {
  const [form, setForm] = useState({
    especialistaId: "",
    fecha: "",
    motivo: "",
    notas: "",
    reprocannRelacionado: false
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.especialistaId || !form.fecha || !form.motivo) {
      return setError("Todos los campos obligatorios deben estar completos");
    }

    // Validar que la fecha sea futura
    if (new Date(form.fecha) < new Date()) {
      return setError("La fecha debe ser futura");
    }

    onCreate(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button onClick={onClose} className="close-modal">
          &times;
        </button>
        <h2>Sacar Nuevo Turno</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Especialista:</label>
            <select
              value={form.especialistaId}
              onChange={(e) => setForm({...form, especialistaId: e.target.value})}
              required
            >
              <option value="">Seleccione un especialista</option>
              {especialistas.map((esp) => (
                <option key={esp._id} value={esp._id}>
                  {esp.userId?.name} - {esp.especialidad} ({esp.matricula})
                </option>
              ))}
            </select>
          </div>

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

          <div className="form-group">
            <label>Notas adicionales:</label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({...form, notas: e.target.value})}
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={form.reprocannRelacionado}
                onChange={(e) => setForm({...form, reprocannRelacionado: e.target.checked})}
              />
              Relacionado a Reprocann
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Confirmar Turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PacienteNuevoTurno;