import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import NavDashboard from "../components/NavDashboard";
import useNotify from "../hooks/useToast";
import TurnosTable from "../components/Turnos/TurnosTable";
import NuevoTurnoModal from "../components/Turnos/NuevoTurnoModal";
import EditarTurnoModal from "../components/Turnos/EditarTurnoModal";
import "./css/TurnosPanel.css";

const Turnos = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [turnos, setTurnos] = useState([]);
  const [especialistas, setEspecialistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateOrder, setDateOrder] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [especialidadFilter, setEspecialidadFilter] = useState("todos");
  const [showNuevoTurnoModal, setShowNuevoTurnoModal] = useState(false);
  const [showEditarTurnoModal, setShowEditarTurnoModal] = useState(false);
  const [turnoAEditar, setTurnoAEditar] = useState(null);

  const notify = useNotify();

  const fetchTurnos = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/turnos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Error al obtener turnos";
        notify(errorMsg, "error");
        throw new Error(errorMsg);
      }
      setTurnos(data.data || []);
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchEspecialistas = async () => {
    try {
      const res = await fetch("http://localhost:4000/especialistas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Error al obtener especialistas";
        throw new Error(errorMsg);
      }
      setEspecialistas(data.data || []);
    } catch (err) {
      console.error("Error al obtener especialistas:", err.message);
      notify(err.message, "error");
    }
  };

  const handleEstadoChange = async (turnoId, nuevoEstado) => {
    try {
      setLoading(true);
      const endpoint = user.isSecretaria
        ? `http://localhost:4000/turnos/secretaria/${turnoId}`
        : `http://localhost:4000/turnos/medico/${turnoId}`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Error al actualizar estado del turno";
        throw new Error(errorMsg);
      }

      notify("Estado del turno actualizado", "success");
      await fetchTurnos();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReprogramarTurno = async (turnoId, nuevosDatos) => {
    try {
      setLoading(true);
      const endpoint = user.isSecretaria
        ? `http://localhost:4000/turnos/secretaria/${turnoId}`
        : `http://localhost:4000/turnos/medico/${turnoId}`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevosDatos),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Error al reprogramar turno";
        throw new Error(errorMsg);
      }

      notify("Turno reprogramado exitosamente", "success");
      await fetchTurnos();
      setShowEditarTurnoModal(false);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const filterTurnos = () => {
    return turnos
      .filter((turno) => {
        if (!turno) return false;

        if (user.isMedico) {
          const medicoId = turno.especialistaId?.userId?._id;
          if (medicoId !== user._id) return false;
        }

        const query = searchQuery.toLowerCase();
        const pacienteNombre = turno.pacienteId?.fullName?.toLowerCase() || "";
        const especialistaNombre =
          turno.especialistaId?.userId?.name?.toLowerCase() || "";
        const motivo = turno.motivo?.toLowerCase() || "";
        const especialidad =
          turno.especialistaId?.especialidad?.toLowerCase() || "";

        const matchesSearch =
          pacienteNombre.includes(query) ||
          especialistaNombre.includes(query) ||
          motivo.includes(query) ||
          especialidad.includes(query);

        const matchesStatus =
          statusFilter === "todos" || turno.estado === statusFilter;

        const matchesEspecialidad =
          especialidadFilter === "todos" ||
          turno.especialistaId?.especialidad === especialidadFilter;

        const fechaTurno = new Date(turno.fecha);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo + "T23:59:59") : null;

        const matchesDate =
          (!fromDate || fechaTurno >= fromDate) &&
          (!toDate || fechaTurno <= toDate);

        return (
          matchesSearch && matchesStatus && matchesEspecialidad && matchesDate
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  };

  useEffect(() => {
    fetchTurnos();
    fetchEspecialistas();
  }, []);

  const especialidadesUnicas = [
    ...new Set(especialistas.map((esp) => esp.especialidad).filter(Boolean)),
  ];

  return (
    <div className="turnos-panel">
      <NavDashboard />
      <div className="turnos-container">
        <div className="title-admin">
          <h1>Gestión de Turnos</h1>
        </div>

        <div className="filtros-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por paciente, especialista o motivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-search"
            />
          </div>

          <div className="status-filter">
            <label>Estado:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmado">Confirmados</option>
              <option value="cancelado">Cancelados</option>
              <option value="completado">Completados</option>
            </select>
          </div>

          <div className="status-filter">
            <label>Especialidad:</label>
            <select
              value={especialidadFilter}
              onChange={(e) => setEspecialidadFilter(e.target.value)}
            >
              <option value="todos">Todas</option>
              {especialidadesUnicas.map((especialidad, index) => (
                <option key={index} value={especialidad}>
                  {especialidad}
                </option>
              ))}
            </select>
          </div>

          <div className="status-filter">
            <label>Orden:</label>
            <select
              value={dateOrder}
              onChange={(e) => setDateOrder(e.target.value)}
            >
              <option value="desc">Más recientes</option>
              <option value="asc">Más antiguos</option>
            </select>
          </div>

          <div className="status-filter">
            <label>Desde:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="status-filter">
            <label>Hasta:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <TurnosTable
          turnos={filterTurnos()}
          loading={loading}
          onEstadoChange={handleEstadoChange}
          onReprogramar={(turno) => {
            setTurnoAEditar(turno);
            setShowEditarTurnoModal(true);
          }}
        />

        {showNuevoTurnoModal && (
          <NuevoTurnoModal
            especialistas={especialistas}
            onClose={() => setShowNuevoTurnoModal(false)}
            onCreate={fetchTurnos}
            token={token}
            currentUser={user}
            isAdminOrMedicoOrSecretaria={
              user.isAdmin || user.isMedico || user.isSecretaria
            }
          />
        )}

        {showEditarTurnoModal && turnoAEditar && (
          <EditarTurnoModal
            turno={turnoAEditar}
            especialistas={especialistas}
            onClose={() => setShowEditarTurnoModal(false)}
            onSave={handleReprogramarTurno}
            currentUserId={user._id}
            canEditEspecialista={user.isAdmin || user.isSecretaria}
          />
        )}
      </div>
    </div>
  );
};

export default Turnos;