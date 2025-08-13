import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import useAuthStore from "../store/authStore";
import "./css/PacientesPanel.css";
import NavDashboard from "../components/NavDashboard";
import ModalCrearPaciente from "../components/Pacientes/ModalCrearPaciente.jsx";
import PacientesHeader from "../components/Pacientes/PacientesHeader.jsx";
import TablaPacientes from "../components/Pacientes/TablaPacientes.jsx";
import TablaTodosUsuarios from "../components/Pacientes/TablaTodosUsuarios";
import ModalDetallesPaciente from "../components/Pacientes/ModalDetallesPaciente.jsx";
import PacientesVencimiento from "../components/Pacientes/PacientesVencimiento.jsx";
import CrearTurnoModal from "../components/Turnos/CrearTurnoModal.jsx";
import NuevoTurnoModal from "../components/Turnos/NuevoTurnoModal.jsx";
import useNotify from "../hooks/useToast.jsx";

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [especialistas, setEspecialistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryUsers, setSearchQueryUsers] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateTurnoModal, setShowCreateTurnoModal] = useState(false);
  const [antecedentesOptions, setAntecedentesOptions] = useState([]);
  const [userToConvert, setUserToConvert] = useState(null);
  const [visiblePacientesCount, setVisiblePacientesCount] = useState(10);
  const [visibleUsersCount, setVisibleUsersCount] = useState(10);
  const [pacienteForTurno, setPacienteForTurno] = useState(null);

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const notify = useNotify();

  const hasAnimated = useRef(false);
  const pacientesContainerRef = useRef(null);
  const titleRef = useRef(null);
  const searchRef = useRef(null);
  const tableRef = useRef(null);

  // Función para obtener todos los usuarios
  const fetchAllUsers = async () => {
    try {
      const res = await fetch("http://localhost:4000/users/getUsers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener usuarios");
      setAllUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchTurnos = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/turnos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Error al obtener turnos", "error");
        throw new Error(data.error || "Error al obtener turnos");
      }
      setTurnos(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener especialistas - VERSIÓN CORREGIDA
  const fetchEspecialistas = async () => {
    try {
      const currentToken = useAuthStore.getState().token; // Obtener el token actualizado
      if (!currentToken) {
        throw new Error("No hay token disponible");
      }

      const res = await fetch("http://localhost:4000/especialistas", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.status === 401) {
        // Token inválido o expirado
        useAuthStore.getState().logout(); // Cerrar sesión
        throw new Error("Sesión expirada. Por favor ingresa nuevamente");
      }

      const response = await res.json();
      console.log("Datos de especialistas:", response);

      if (!res.ok)
        throw new Error(response.error || "Error al obtener especialistas");

      setEspecialistas(response.data || []);
    } catch (err) {
      console.error("Error fetching especialistas:", err.message);
      setError(err.message); // Mostrar error en la UI
      setEspecialistas([]);
    }
  };

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/pacientes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener pacientes");
      setPacientes(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAntecedentes = async () => {
    try {
      const res = await fetch("http://localhost:4000/antecedentes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al obtener antecedentes");
      setAntecedentesOptions(data.data);
    } catch (err) {
      console.error("Error fetching antecedentes:", err);
    }
  };

  // Función para crear turno
  const createTurno = async (turnoData) => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/turnos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...turnoData,
          userId: user._id, // El usuario que crea el turno
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear turno");

      setShowCreateTurnoModal(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createPaciente = async (pacienteData) => {
    try {
      setLoading(true);

      // Extraer datos del paciente y antecedentes
      const {
        fullName,
        fechaDeNacimiento,
        userId,
        partnerId,
        ...antecedentesData
      } = pacienteData;

      // Armamos el body como lo espera el backend
      const bodyToSend = {
        fullName,
        fechaDeNacimiento,
        userId: userId || null,
        partnerId: partnerId || null,
        ...antecedentesData,
      };

      const res = await fetch("http://localhost:4000/antecedentes/completo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyToSend),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear paciente");

      await fetchPacientes();
      setShowCreateModal(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePaciente = async (id, pacienteData) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:4000/pacientes/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pacienteData),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al actualizar paciente");
      await fetchPacientes();
      setSelectedPaciente(null);
      await fetchPacientes();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateDatosClinicos = async (id, datosClinicos) => {
    try {
      const res = await fetch(`http://localhost:4000/pacientes/medico/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosClinicos),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al actualizar datos clínicos");
      await fetchPacientes();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const filterPacientes = (list) =>
    list.filter(
      (paciente) =>
        paciente.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (paciente.userId?.email &&
          paciente.userId.email
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );

  const filterUsers = (list) =>
    list.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQueryUsers.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQueryUsers.toLowerCase())
    );

  const loadMorePacientes = () => {
    setVisiblePacientesCount((prev) => prev + 10);
  };

  const loadMoreUsers = () => {
    setVisibleUsersCount((prev) => prev + 10);
  };

  const getPacientesPorVencer = () => {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + 30);

    return pacientes.filter((paciente) => {
      if (!paciente.reprocann?.fechaVencimiento) return false;
      const vencimiento = new Date(paciente.reprocann.fechaVencimiento);
      return vencimiento >= hoy && vencimiento <= limite;
    });
  };

  const getReprocannClass = (fechaVencimiento) => {
    if (!fechaVencimiento) return "";
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffDias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

    if (diffDias <= 10) return "reprocann-rojo";
    if (diffDias <= 30) return "reprocann-amarillo";
    return "";
  };

  const handleCreateTurnoClick = (paciente) => {
    setPacienteForTurno(paciente);
    setShowCreateTurnoModal(true);
  };

  useEffect(() => {
    fetchPacientes();
    fetchAntecedentes();
    fetchAllUsers();
    fetchEspecialistas();
  }, []);

  useEffect(() => {
    setVisiblePacientesCount(10);
  }, [searchQuery]);

  useEffect(() => {
    setVisibleUsersCount(10);
  }, [searchQueryUsers]);

  useEffect(() => {
    if (hasAnimated.current || loading) return;

    hasAnimated.current = true;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Animate container
    if (pacientesContainerRef.current) {
      tl.fromTo(
        pacientesContainerRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.5 }
      );
    }

    // Animate titles (h2) only if they exist
    if (titleRef.current) {
      const titleElements = titleRef.current.querySelectorAll("h2");
      if (titleElements.length > 0) {
        tl.fromTo(
          titleElements,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 },
          "-=0.3"
        );
      }
    }

    // Animate search forms
    if (searchRef.current) {
      const searchElements = searchRef.current.querySelectorAll(
        ".form-search, .search-container"
      );
      if (searchElements.length > 0) {
        tl.fromTo(
          searchElements,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3 },
          "-=0.2"
        );
      }
    }

    // Animate tables and buttons
    if (tableRef.current) {
      const tableElements = tableRef.current.querySelectorAll(
        ".users-table, .ver-mas-btn"
      );
      if (tableElements.length > 0) {
        tl.fromTo(
          tableElements,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.2 },
          "-=0.2"
        );
      }
    }

    return () => tl.kill();
  }, [loading]);

  const filteredPacientes = filterPacientes(pacientes).slice(
    0,
    visiblePacientesCount
  );
  const filteredUsers = filterUsers(allUsers).slice(0, visibleUsersCount);
  const hasMorePacientes =
    filterPacientes(pacientes).length > visiblePacientesCount;
  const hasMoreUsers = filterUsers(allUsers).length > visibleUsersCount;

  if (loading && pacientes.length === 0)
    return (
      <div className="pacientes-loading">
        <div className="spinner"></div>
        <p>Cargando pacientes...</p>
      </div>
    );

  if (error)
    return (
      <div className="pacientes-error">
        <p>Error: {error}</p>
        <button onClick={fetchPacientes}>Reintentar</button>
      </div>
    );

  return (
    <div className="pacientes">
      <NavDashboard />
      <div className="pacientes-container">
        <div ref={searchRef}>
          <PacientesHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddPaciente={() => setShowCreateModal(true)}
            canAdd={user.isAdmin || user.isPartner}
          />
        </div>

        <div ref={titleRef}>
          <PacientesVencimiento
            pacientesPorVencer={getPacientesPorVencer()}
            getReprocannClass={getReprocannClass}
          />
        </div>

        <h2>Todos los pacientes</h2>
        <div ref={tableRef}>
          <div className="table-container">
            <TablaPacientes
              pacientes={filteredPacientes}
              onViewDetails={setSelectedPaciente}
              canEdit={user.isAdmin || user.isPartner || user.isMedico}
              refreshData={fetchPacientes}
              onCreateTurno={handleCreateTurnoClick}
            />
            {hasMorePacientes && (
              <div className="ver-mas-container-pacientes">
                <button onClick={loadMorePacientes} className="ver-mas-btn">
                  Ver más pacientes
                </button>
              </div>
            )}
          </div>

          <h2>Todos los Usuarios</h2>
          <div className="search-container" style={{ marginBottom: "1rem" }}>
            <button>
              <svg
                width="17"
                height="16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                  stroke="currentColor"
                  strokeWidth="1.333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchQueryUsers}
              onChange={(e) => setSearchQueryUsers(e.target.value)}
              className="input-search"
            />
          </div>

          <div className="table-container">
            <TablaTodosUsuarios
              users={filteredUsers}
              onCreatePaciente={(user) => {
                setUserToConvert(user);
                setShowCreateModal(true);
              }}
            />
            {hasMoreUsers && (
              <div className="ver-mas-container-usuarios">
                <button onClick={loadMoreUsers} className="ver-mas-btn">
                  Ver más usuarios
                </button>
              </div>
            )}
          </div>
        </div>
        {showCreateModal && (
          <ModalCrearPaciente
            antecedentesOptions={antecedentesOptions}
            onClose={() => {
              setShowCreateModal(false);
              setUserToConvert(null);
            }}
            onCreate={createPaciente}
            currentUser={user}
            userToConvert={userToConvert}
          />
        )}

        {selectedPaciente && (
          <ModalDetallesPaciente
            paciente={selectedPaciente}
            antecedentesOptions={antecedentesOptions}
            onClose={() => setSelectedPaciente(null)}
            onUpdate={updatePaciente}
            onUpdateDatosClinicos={updateDatosClinicos}
            isMedico={user.isMedico}
            isAdmin={user.isAdmin}
            isPartner={user.isPartner}
            token={token}
          />
        )}

        {showCreateTurnoModal && pacienteForTurno && (
          <NuevoTurnoModal
            pacienteForTurno={pacienteForTurno}
            especialistas={especialistas}
            onClose={() => setShowCreateTurnoModal(false)}
            onCreate={fetchPacientes}
            token={token}
            currentUser={user}
            isAdminOrMedico={user.isAdmin || user.isMedico}
          />
        )}
      </div>
    </div>
  );
};

export default Pacientes;
