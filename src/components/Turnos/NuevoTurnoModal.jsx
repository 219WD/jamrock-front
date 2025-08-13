import React, { useState, useEffect } from "react";
import useNotify from "../../hooks/useToast";

const NuevoTurnoModal = ({
  especialistas,
  onClose,
  onCreate,
  token,
  currentUser,
  isAdminOrMedico,
  pacienteForTurno,
}) => {
  const [form, setForm] = useState({
    especialistaId: "",
    fecha: "",
    motivo: "",
    notas: "",
    reprocannRelacionado: false,
    pacienteId: pacienteForTurno?._id || "",
  });
  const [error, setError] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  // Cargar pacientes si es admin/médico y no hay pacienteForTurno
  useEffect(() => {
    if (isAdminOrMedico && !pacienteForTurno) {
      const fetchPacientes = async () => {
        try {
          setLoading(true);
          const res = await fetch("http://localhost:4000/pacientes", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Error al obtener pacientes");
          setPacientes(data.data || []);
        } catch (err) {
          notify(err.message, "error");
        } finally {
          setLoading(false);
        }
      };
      fetchPacientes();
    }
  }, [isAdminOrMedico, token, notify, pacienteForTurno]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones básicas
    if (!form.especialistaId || !form.fecha || !form.motivo) {
      return setError("Todos los campos obligatorios deben completarse");
    }

    // Validar fecha futura
    const fechaTurno = new Date(form.fecha);
    if (fechaTurno <= new Date()) {
      return setError("La fecha del turno debe ser futura");
    }

    try {
      setLoading(true);

      // Determinar el endpoint según el rol
      const endpoint = isAdminOrMedico
        ? "http://localhost:4000/turnos/admin"
        : "http://localhost:4000/turnos/paciente";

      // Preparar el cuerpo de la solicitud
      const requestBody = {
        especialistaId: form.especialistaId,
        fecha: form.fecha,
        motivo: form.motivo,
        notas: form.notas,
        reprocannRelacionado: form.reprocannRelacionado,
        userId: currentUser._id,
      };

      // Si es admin/médico, agregar pacienteId
      if (isAdminOrMedico) {
        const pacienteId = pacienteForTurno?._id || form.pacienteId;
        if (!pacienteId) {
          throw new Error("Debe seleccionar un paciente");
        }
        requestBody.pacienteId = pacienteId;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Error al crear turno");
      }

      notify("Turno creado exitosamente", "success");
      onClose();
      if (onCreate) await onCreate();
    } catch (err) {
      console.error("Error al crear turno:", err);
      setError(err.message);
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="close-modal">
          &times;
        </button>
        <h3>{pacienteForTurno ? `Nuevo Turno para ${pacienteForTurno.fullName}` : "Solicitar nuevo turno"}</h3>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          {isAdminOrMedico && !pacienteForTurno && (
            <div className="form-group">
              <label>Paciente:</label>
              <select
                value={form.pacienteId}
                onChange={(e) => setForm({ ...form, pacienteId: e.target.value })}
                required
                disabled={loading}
              >
                <option value="">Seleccione un paciente</option>
                {pacientes.map((paciente) => (
                  <option key={paciente._id} value={paciente._id}>
                    {paciente.fullName} ({paciente.dni})
                  </option>
                ))}
              </select>
              {loading && <small>Cargando pacientes...</small>}
            </div>
          )}

          <div className="form-group">
            <label>Especialista:</label>
            <select
              value={form.especialistaId}
              onChange={(e) => setForm({ ...form, especialistaId: e.target.value })}
              required
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

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={form.reprocannRelacionado}
                onChange={(e) => setForm({ ...form, reprocannRelacionado: e.target.checked })}
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
            <button type="submit" className="approve-btn" disabled={loading}>
              {loading ? "Creando..." : "Confirmar Turno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoTurnoModal;