import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import "./css/Solicitud.css";
import API_URL from "../common/constants";

const SolicitudPendiente = () => {
  const [partnerData, setPartnerData] = useState({
    adress: "",
    phone: "",
    dni: "",
    reprocann: false
  });
  const [editData, setEditData] = useState({
    adress: "",
    phone: "",
    dni: "",
    reprocann: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState({
    fetch: true,
    submit: false
  });
  const [partnerExists, setPartnerExists] = useState(false);
  const [partnerId, setPartnerId] = useState(null);

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const fetchPartnerData = async () => {
    try {
      setLoading(prev => ({...prev, fetch: true}));
      setError(null);

      if (!user?._id || !token) {
        setLoading(prev => ({...prev, fetch: false}));
        setError("Usuario no autenticado");
        return;
      }

      console.log("Buscando datos de partner para usuario:", user._id);
      
      const response = await fetch(
        `${API_URL}/partners/my-partner-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Datos recibidos:", data);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log("No se encontró socio para este usuario");
          setPartnerExists(false);
          setPartnerData({
            adress: "",
            phone: "",
            dni: "",
            reprocann: false
          });
        } else {
          throw new Error(data.error || "Error al obtener datos del socio");
        }
      } else if (data && data._id) {
        console.log("Socio encontrado:", data);
        const newData = {
          adress: data.adress || "",
          phone: data.phone || "",
          dni: data.dni || "",
          reprocann: data.reprocann || false
        };
        setPartnerData(newData);
        setEditData(newData);
        setPartnerId(data._id);
        setPartnerExists(true);
      } else {
        setPartnerExists(false);
      }
    } catch (err) {
      console.error("Error fetching partner data:", err);
      setError(err.message);
    } finally {
      setLoading(prev => ({...prev, fetch: false}));
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchPartnerData();
    }
  }, [user, token]);

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleEditClick = () => {
    setEditData({...partnerData});
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleBackToProfile = () => {
    navigate("/perfil");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({...prev, submit: true}));
      setError(null);
      setSuccess(null);

      if (!editData.adress.trim()) {
        throw new Error("La dirección es obligatoria");
      }
      if (!editData.phone.trim()) {
        throw new Error("El teléfono es obligatorio");
      }
      if (!editData.dni.trim() || !/^\d{8}$/.test(editData.dni)) {
        throw new Error("DNI debe tener 8 dígitos numéricos");
      }

      const url = partnerExists
        ? `${API_URL}/partners/updatePartner/${partnerId}`
        : `${API_URL}/partners/createPartner`;

      const method = partnerExists ? "PUT" : "POST";

      const body = {
        ...editData,
        userId: user._id
      };

      console.log("Enviando datos al servidor:", { url, method, body });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      if (!response.ok) {
        throw new Error(result.error || result.message || "Error en la operación");
      }

      setSuccess(partnerExists 
        ? "Datos actualizados correctamente" 
        : "Socio creado exitosamente");
      
      await fetchPartnerData();
      setIsEditing(false);
    } catch (err) {
      console.error("Error en handleSubmit:", err);
      setError(err.message);
    } finally {
      setLoading(prev => ({...prev, submit: false}));
    }
  };

  if (loading.fetch) {
    return (
      <div className="solicitud-loading-container">
        <div className="solicitud-loading-spinner"></div>
        <p>Cargando información del socio...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="solicitud-error-message">No hay usuario logueado</div>;
  }

  return (
    <div className="solicitud-membership-container">
      <div className="solicitud-membership-form">
        <h2 className="solicitud-title">Mis Datos de Socio</h2>

        {success && <div className="solicitud-success-message">{success}</div>}
        {error && <div className="solicitud-error">{error}</div>}

        <div className="solicitud-user-info">
          <h3 className="solicitud-user-status">
            {user.isPending ? "🟢 Aprobado" : "🟠 Pendiente"} |{" "}
            {user.isPartner ? "Socio" : "No socio"}
          </h3>
          <p>
            <strong>Nombre:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>

        {partnerExists || isEditing ? (
          <>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="solicitud-input-group">
                  <label htmlFor="adress" className="solicitud-label">Dirección:</label>
                  <input
                    id="adress"
                    name="adress"
                    type="text"
                    value={editData.adress}
                    onChange={handleEditChange}
                    required
                    disabled={loading.submit}
                    autoComplete="street-address"
                    className="solicitud-input"
                    placeholder="Ingresa tu dirección"
                  />
                </div>

                <div className="solicitud-input-group">
                  <label htmlFor="phone" className="solicitud-label">Teléfono:</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={editData.phone}
                    onChange={handleEditChange}
                    required
                    disabled={loading.submit}
                    autoComplete="tel"
                    className="solicitud-input"
                    placeholder="Ingresa tu teléfono"
                  />
                </div>

                <div className="solicitud-input-group">
                  <label htmlFor="dni" className="solicitud-label">DNI:</label>
                  <input
                    id="dni"
                    name="dni"
                    type="text"
                    value={editData.dni}
                    onChange={handleEditChange}
                    required
                    disabled={partnerExists || loading.submit}
                    autoComplete="off"
                    pattern="[0-9]{8}"
                    className="solicitud-input"
                    placeholder="12345678"
                    maxLength="8"
                  />
                </div>

                <div className="solicitud-checkbox-group">
                  <label className="solicitud-checkbox-label">
                    <input
                      name="reprocann"
                      type="checkbox"
                      checked={editData.reprocann}
                      onChange={handleEditChange}
                      disabled={loading.submit}
                      className="solicitud-checkbox"
                    />
                    Reprocann
                  </label>
                </div>

                <div className="solicitud-button-group">
                  <button 
                    type="submit" 
                    disabled={loading.submit}
                    className="solicitud-submit-btn"
                  >
                    {loading.submit ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    disabled={loading.submit}
                    className="solicitud-cancel-btn"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="solicitud-view-mode">
                <div className="solicitud-input-group">
                  <label className="solicitud-label">Dirección:</label>
                  <p>{partnerData.adress || "No especificado"}</p>
                </div>

                <div className="solicitud-input-group">
                  <label className="solicitud-label">Teléfono:</label>
                  <p>{partnerData.phone || "No especificado"}</p>
                </div>

                <div className="solicitud-input-group">
                  <label className="solicitud-label">DNI:</label>
                  <p>{partnerData.dni || "No especificado"}</p>
                </div>

                <div className="solicitud-input-group">
                  <label className="solicitud-label">Reprocann:</label>
                  <p>{partnerData.reprocann ? "Sí" : "No"}</p>
                </div>

                <div className="solicitud-button-group">
                  <button
                    type="button"
                    onClick={handleEditClick}
                    disabled={loading.fetch}
                    className="solicitud-submit-btn"
                  >
                    Editar información
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToProfile}
                    className="solicitud-back-btn"
                  >
                    Volver al Perfil
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="solicitud-no-partner">
            <p>No tienes un perfil de socio creado.</p>
            <div className="solicitud-button-group">
              <button
                onClick={handleEditClick}
                disabled={loading.fetch}
                className="solicitud-submit-btn"
              >
                Crear perfil de socio
              </button>
              <button
                onClick={handleBackToProfile}
                className="solicitud-back-btn"
              >
                Volver al Perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudPendiente;