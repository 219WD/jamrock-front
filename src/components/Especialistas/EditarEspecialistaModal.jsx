import React from "react";
const EditarEspecialistaModal = ({ especialista, form, setForm, onClose, onSave }) => {
  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal-content">
        <button className="dashboard-modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h3 className="dashboard-modal-title">Editar Especialista</h3>
        <div className="modal-body">
          <div className="user-details">
            <p>
              <strong>Nombre:</strong> {especialista.userId?.name}
            </p>
            <p>
              <strong>Email:</strong> {especialista.userId?.email}
            </p>
          </div>
          <div className="form-group">
            <label>Especialidad</label>
            <input
              type="text"
              value={form.especialidad}
              onChange={(e) =>
                setForm({ ...form, especialidad: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Matrícula</label>
            <input
              type="text"
              value={form.matricula}
              onChange={(e) =>
                setForm({ ...form, matricula: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Estado Reprocann</label>
            <select
              className="dashboard-status-select"
              value={form.reprocann.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  reprocann: { ...form.reprocann, status: e.target.value },
                })
              }
            >
              <option value="inicializado">Inicializado</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha de Aprobación</label>
            <input
              type="date"
              value={form.reprocann.fechaAprobacion}
              onChange={(e) =>
                setForm({
                  ...form,
                  reprocann: { ...form.reprocann, fechaAprobacion: e.target.value },
                })
              }
            />
          </div>
          <div className="form-group">
            <label>Fecha de Vencimiento</label>
            <input
              type="date"
              value={form.reprocann.fechaVencimiento}
              onChange={(e) =>
                setForm({
                  ...form,
                  reprocann: { ...form.reprocann, fechaVencimiento: e.target.value },
                })
              }
            />
          </div>
          {especialista.firmaDigital && (
            <div className="form-group">
              <label>Firma Digital</label>
              <img
                src={especialista.firmaDigital}
                alt="Firma"
                className="firma-img"
              />
            </div>
          )}
        </div>
        <div className="dashboard-modal-actions">
          <button onClick={onSave} className="dashboard-save-btn">
            Guardar Cambios
          </button>
          <button onClick={onClose} className="dashboard-close-btn">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarEspecialistaModal;