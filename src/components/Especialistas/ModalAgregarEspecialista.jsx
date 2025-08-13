import React, { useState } from "react";
import useAuthStore from "../../store/authStore";
import "../../pages/css/AdminPanel.css"; // Asegúrate de que este archivo exista y tenga los estilos necesarios

const ModalAgregarEspecialista = ({ user, onClose, onSuccess }) => {
  const token = useAuthStore((state) => state.token);
  const [form, setForm] = useState({
    especialidad: "",
    matricula: "",
    reprocann: {
      status: "inicializado",
      fechaAprobacion: "",
      fechaVencimiento: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

const handleSubmit = async () => {
  try {
    setLoading(true);
    setError(null);

    if (!form.especialidad || !form.matricula) {
      throw new Error("Especialidad y matrícula son requeridos");
    }

    // Primero crea el especialista
    const response = await fetch("http://localhost:4000/especialistas", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user._id,
        especialidad: form.especialidad,
        matricula: form.matricula,
        reprocann: form.reprocann.status,
      }),
    });

    // Luego actualiza el usuario a médico
    if (response.ok) {
      const updateUserRes = await fetch(
        `http://localhost:4000/users/toggleMedico/${user._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!updateUserRes.ok) {
        throw new Error("Error al actualizar estado médico del usuario");
      }
    } else {
      const data = await response.json();
      throw new Error(data.error || data.message || "Error al crear especialista");
    }

    onSuccess();
    onClose();
  } catch (err) {
    setError(err.message || "Error al crear especialista");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Convertir en Médico</h3>
        <p>
          <strong>Nombre:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <div className="form-group">
          <label>Especialidad</label>
          <input
            type="text"
            value={form.especialidad}
            onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Matrícula</label>
          <input
            type="text"
            value={form.matricula}
            onChange={(e) => setForm({ ...form, matricula: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Estado Reprocann</label>
          <select
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
                reprocann: {
                  ...form.reprocann,
                  fechaAprobacion: e.target.value,
                },
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
                reprocann: {
                  ...form.reprocann,
                  fechaVencimiento: e.target.value,
                },
              })
            }
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="modal-actions">
          <button
            onClick={handleSubmit}
            className="save-btn"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Médico"}
          </button>
          <button onClick={onClose} className="close-btn" disabled={loading}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarEspecialista;
