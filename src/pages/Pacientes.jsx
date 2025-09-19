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
import NuevoTurnoModal from "../components/Turnos/NuevoTurnoModal.jsx";
import useNotify from "../hooks/useToast.jsx";
import { API_URL } from "../common/constants";

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
  const [turnos, setTurnos] = useState([]);

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const notify = useNotify();

  const hasAnimated = useRef(false);
  const pacientesContainerRef = useRef(null);
  const headerRef = useRef(null);
  const vencimientoRef = useRef(null);
  const pacientesTitleRef = useRef(null);
  const usuariosTitleRef = useRef(null);
  const pacientesTableRef = useRef(null);
  const usuariosTableRef = useRef(null);
  const buttonsRef = useRef(null);

  // Función para obtener todos los usuarios
  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users/getUsers`, {
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
      const res = await fetch(`${API_URL}/turnos`, {
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

  // Función para obtener especialistas
  const fetchEspecialistas = async () => {
    try {
      const currentToken = useAuthStore.getState().token;
      if (!currentToken) {
        throw new Error("No hay token disponible");
      }

      const res = await fetch(`${API_URL}/especialistas`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.status === 401) {
        useAuthStore.getState().logout();
        throw new Error("Sesión expirada. Por favor ingresa nuevamente");
      }

      const response = await res.json();
      console.log("Datos de especialistas:", response);

      if (!res.ok)
        throw new Error(response.error || "Error al obtener especialistas");

      setEspecialistas(response.data || []);
    } catch (err) {
      console.error("Error fetching especialistas:", err.message);
      setError(err.message);
      setEspecialistas([]);
    }
  };

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/pacientes`, {
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
      const res = await fetch(`${API_URL}/antecedentes`, {
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
      const res = await fetch(`${API_URL}/turnos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...turnoData,
          userId: user._id,
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

      const {
        fullName,
        fechaDeNacimiento,
        userId,
        partnerId,
        ...antecedentesData
      } = pacienteData;

      const bodyToSend = {
        fullName,
        fechaDeNacimiento,
        userId: userId || null,
        partnerId: partnerId || null,
        ...antecedentesData,
      };

      const res = await fetch(`${API_URL}/antecedentes/completo`, {
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
      const res = await fetch(`${API_URL}/pacientes/${id}`, {
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
      const res = await fetch(`${API_URL}/pacientes/medico/${id}`, {
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

  // GSAP Animation - CORREGIDO
  useEffect(() => {
    if (hasAnimated.current || loading || pacientes.length === 0) return;

    hasAnimated.current = true;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Animación del contenedor principal
    if (pacientesContainerRef.current) {
      tl.fromTo(
        pacientesContainerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }

    // Animación del header
    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3 },
        "-=0.3"
      );
    }

    // Animación de la sección de vencimiento
    if (vencimientoRef.current) {
      tl.fromTo(
        vencimientoRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.2"
      );
    }

    // Animación de títulos
    if (pacientesTitleRef.current) {
      tl.fromTo(
        pacientesTitleRef.current,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.3 },
        "-=0.2"
      );
    }

    // Animación de tabla de pacientes
    if (pacientesTableRef.current) {
      tl.fromTo(
        pacientesTableRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.2"
      );
    }

    // Animación de título de usuarios
    if (usuariosTitleRef.current) {
      tl.fromTo(
        usuariosTitleRef.current,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.1"
      );
    }

    // Animación de tabla de usuarios
    if (usuariosTableRef.current) {
      tl.fromTo(
        usuariosTableRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.1"
      );
    }

    // Animación de botones "Ver más"
    const verMasButtons = document.querySelectorAll('.ver-mas-btn');
    if (verMasButtons.length > 0) {
      tl.fromTo(
        verMasButtons,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1 },
        "-=0.1"
      );
    }

    return () => {
      tl.kill();
    };
  }, [loading, pacientes.length]);

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
      <div className="pacientes-container" ref={pacientesContainerRef}>
        <div ref={headerRef}>
          <PacientesHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddPaciente={() => setShowCreateModal(true)}
            canAdd={user.isAdmin || user.isPartner}
          />
        </div>

        <div ref={vencimientoRef}>
          <PacientesVencimiento
            pacientesPorVencer={getPacientesPorVencer()}
            getReprocannClass={getReprocannClass}
          />
        </div>

        <h2 ref={pacientesTitleRef}>Todos los pacientes</h2>
        
        <div ref={pacientesTableRef}>
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
        </div>

        <h2 ref={usuariosTitleRef}>Todos los Usuarios</h2>
        
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

        <div ref={usuariosTableRef}>
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
  );
};

export default Pacientes;