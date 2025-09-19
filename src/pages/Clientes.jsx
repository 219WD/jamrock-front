import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import useAuthStore from "../store/authStore";
import "./css/AdminPanel.css";
import NavDashboard from "../components/NavDashboard";
import ModalAgregarEspecialista from "../components/Especialistas/ModalAgregarEspecialista";
import ClientesHeader from "../components/Clientes/ClientesHeader";
import TablaPendientes from "../components/Clientes/TablaPendientes";
import TablaUsuarios from "../components/Clientes/TablaUsuarios";
import ModalDetallesUsuario from "../components/Clientes/ModalDetallesUsuario";
import API_URL from "../common/constants";

const Clientes = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModalEspecialista, setShowModalEspecialista] = useState(false);
  const [userToConvert, setUserToConvert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [filters, setFilters] = useState({
    isPartner: null,
    isAdmin: null,
    isMedico: null,
    sortBy: "newest",
  });

  const hasAnimated = useRef(false);
  const adminContainerRef = useRef(null);
  const titleRef = useRef(null);
  const searchRef = useRef(null);
  const tableRef = useRef(null);

  const token = useAuthStore((state) => state.token);

  // Fetch users
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users/getUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener usuarios");
      setUsers(data.filter((u) => !u.isPartner));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users/getUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener todos los usuarios");
      setAllUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Función para obtener detalles del usuario y su partner
  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      // Obtener datos del usuario
      const userRes = await fetch(`${API_URL}/users/getUser/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error(userData.error || "Error al obtener usuario");

      setSelectedUser(userData);

      // Intentar obtener datos de socio, incluso si isPartner es false
      try {
        const partnerRes = await fetch(
          `${API_URL}/partners/user/getPartnerByUserId/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const partnerData = await partnerRes.json();
        if (partnerRes.ok) {
          setPartnerDetails(partnerData);
        } else {
          setPartnerDetails(null); // No hay datos de socio
        }
      } catch (err) {
        console.error("Error al obtener datos de socio:", err);
        setPartnerDetails(null);
      }
    } catch (err) {
      setError(err.message);
      setSelectedUser(null);
      setPartnerDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar estado de socio
  const togglePartnerStatus = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/users/togglePartner/${userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar estado");
      await fetchPendingUsers();
      await fetchAllUsers();
      setSelectedUser(null);
      setPartnerDetails(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar estado de admin
  const toggleAdminStatus = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users/isAdmin/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar admin");
      await fetchAllUsers();
      setSelectedUser(null);
      setPartnerDetails(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and pagination
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPartner =
      filters.isPartner === null || user.isPartner === filters.isPartner;
    const matchesAdmin =
      filters.isAdmin === null || user.isAdmin === filters.isAdmin;
    const matchesMedico =
      filters.isMedico === null || user.isMedico === filters.isMedico;

    return matchesSearch && matchesPartner && matchesAdmin && matchesMedico;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return filters.sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // GSAP Animation
  useEffect(() => {
    if (hasAnimated.current || loading) return;

    hasAnimated.current = true;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.fromTo(
      adminContainerRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.5 }
    );

    tl.fromTo(
      titleRef.current.querySelectorAll("h2"),
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 },
      "-=0.3"
    );

    tl.fromTo(
      searchRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.2"
    );

    tl.fromTo(
      tableRef.current.querySelectorAll(".users-table"),
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.2 },
      "-=0.2"
    );

    return () => tl.kill();
  }, [loading]);

  useEffect(() => {
    fetchPendingUsers();
    fetchAllUsers();
  }, []);

  if (loading && users.length === 0) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="dashboard clientes">
      <NavDashboard />
      <div className="clientes-wrapper" ref={adminContainerRef}>
        <div className="clientes-container">
          <div ref={searchRef}>
            <ClientesHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filters={filters}
              setFilters={setFilters}
            />
          </div>

          <div ref={titleRef}>
            <h2>Solicitudes Pendientes de Socio</h2>
          </div>

          <div ref={tableRef}>
            <TablaPendientes
              users={users.filter(
                (user) =>
                  user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              onDetails={fetchUserDetails}
              onTogglePartner={togglePartnerStatus}
            />

            <h2>Todos los Usuarios</h2>
            
            <TablaUsuarios
              users={currentUsers}
              onDetails={fetchUserDetails}
              onTogglePartner={togglePartnerStatus}
              onToggleAdmin={toggleAdminStatus}
              onConvertToEspecialista={async (user) => {
                try {
                  if (user.isMedico) {
                    const res = await fetch(
                      `${API_URL}/partners/user/getPartnerByUserId/${user._id}`,
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    const partnerData = await res.json();
                    if (res.ok && partnerData) {
                      setPartnerDetails(partnerData);
                      setSelectedUser(user);
                    }
                  } else {
                    setUserToConvert(user);
                    setShowModalEspecialista(true);
                  }
                } catch (err) {
                  console.error("Error al obtener info de médico:", err);
                }
              }}
            />

            <div className="pagination-controls">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Anterior
              </button>

              <span className="page-info">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedUser && (
        <ModalDetallesUsuario
          user={selectedUser}
          partnerDetails={partnerDetails}
          loading={loading}
          onClose={() => {
            setSelectedUser(null);
            setPartnerDetails(null);
          }}
          onTogglePartner={togglePartnerStatus}
        />
      )}

      {showModalEspecialista && userToConvert && (
        <ModalAgregarEspecialista
          user={userToConvert}
          onClose={() => {
            setShowModalEspecialista(false);
            setUserToConvert(null);
          }}
          onSuccess={() => {
            fetchAllUsers();
            setShowModalEspecialista(false);
            setUserToConvert(null);
          }}
        />
      )}
    </div>
  );
};

export default Clientes;