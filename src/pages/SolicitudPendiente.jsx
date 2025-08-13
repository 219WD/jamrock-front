import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import "./css/Solicitud.css";

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

  const fetchPartnerData = async () => {
    try {
      setLoading(prev => ({...prev, fetch: true}));
      setError(null);

      if (!user?._id) {
        setLoading(prev => ({...prev, fetch: false}));
        return;
      }

      const response = await fetch(
        `http://localhost:4000/partners/user/getPartnerByUserId/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al obtener datos del socio");
      }

      if (data && data._id) {
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
    fetchPartnerData();
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
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({...prev, submit: true}));
      setError(null);
      setSuccess(null);

      if (!editData.adress || !editData.phone || !editData.dni) {
        throw new Error("Todos los campos son obligatorios");
      }

      const url = partnerExists
        ? `http://localhost:4000/partners/updatePartner/${partnerId}`
        : "http://localhost:4000/partners/createPartner";

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
      
      setPartnerData({...editData});
      setIsEditing(false);
    } catch (err) {
      console.error("Error en handleSubmit:", err);
      setError(err.message);
    } finally {
      setLoading(prev => ({...prev, submit: false}));
    }
  };

  if (loading.fetch && !partnerExists) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando información del socio...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="error-message">No hay usuario logueado</div>;
  }

  return (
    <div className="solicitud-container">
      <div className="solicitud-form">
        <h2>Mis Datos de Socio</h2>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="user-info">
          <h3>
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
                <div className="input-group">
                  <label htmlFor="adress">Dirección:</label>
                  <input
                    id="adress"
                    name="adress"
                    type="text"
                    value={editData.adress}
                    onChange={handleEditChange}
                    required
                    disabled={loading.submit}
                    autoComplete="street-address"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="phone">Teléfono:</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={editData.phone}
                    onChange={handleEditChange}
                    required
                    disabled={loading.submit}
                    autoComplete="tel"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="dni">DNI:</label>
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
                  />
                </div>

                <div className="checkbox-group">
                  <label>
                    <input
                      name="reprocann"
                      type="checkbox"
                      checked={editData.reprocann}
                      onChange={handleEditChange}
                      disabled={loading.submit}
                    />
                    Reprocann
                  </label>
                </div>

                <div className="button-group">
                  <button 
                    type="submit" 
                    disabled={loading.submit}
                  >
                    {loading.submit ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    disabled={loading.submit}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="view-mode">
                <div className="input-group">
                  <label>Dirección:</label>
                  <p>{partnerData.adress || "No especificado"}</p>
                </div>

                <div className="input-group">
                  <label>Teléfono:</label>
                  <p>{partnerData.phone || "No especificado"}</p>
                </div>

                <div className="input-group">
                  <label>DNI:</label>
                  <p>{partnerData.dni || "No especificado"}</p>
                </div>

                <div className="input-group">
                  <label>Reprocann:</label>
                  <p>{partnerData.reprocann ? "Sí" : "No"}</p>
                </div>

                <button
                  type="button"
                  onClick={handleEditClick}
                  disabled={loading.fetch}
                >
                  Editar información
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-partner-message">
            <p>No tienes un perfil de socio creado.</p>
            <button
              onClick={handleEditClick}
              disabled={loading.fetch}
            >
              Crear perfil de socio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudPendiente;