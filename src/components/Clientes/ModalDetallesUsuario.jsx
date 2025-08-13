import React, { useEffect, useState } from "react";
import useAuthStore from "../../store/authStore";

const ModalDetallesUsuario = ({ user, partnerDetails, loading, onClose, onTogglePartner }) => {
  const [especialistaData, setEspecialistaData] = useState(null);
  const [loadingEspecialista, setLoadingEspecialista] = useState(false);
  const [errorEspecialista, setErrorEspecialista] = useState(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (user?.isMedico) {
      fetchEspecialistaData();
    } else {
      setEspecialistaData(null);
      setErrorEspecialista(null);
    }
  }, [user]);

  const fetchEspecialistaData = async () => {
    try {
      setLoadingEspecialista(true);
      setErrorEspecialista(null);
      
      const res = await fetch(`http://localhost:4000/especialistas/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Verificar si la respuesta es JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Respuesta inesperada: ${text.substring(0, 100)}...`);
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al obtener datos del médico');
      }

      setEspecialistaData(data.data); // Asegúrate de acceder a data.data
    } catch (err) {
      console.error("Error al obtener datos de especialista:", err);
      setErrorEspecialista(err.message);
      setEspecialistaData(null);
    } finally {
      setLoadingEspecialista(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Detalles del Usuario</h3>
        <div className="user-details">
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Estado Socio:</strong> {user.isPartner ? "✅ Aprobado" : "❌ Pendiente"}</p>
          <p><strong>Admin:</strong> {user.isAdmin ? "✅ Sí" : "❌ No"}</p>
          <p><strong>Médico:</strong> {user.isMedico ? "✅ Sí" : "❌ No"}</p>

          {loading ? (
            <p>Cargando detalles...</p>
          ) : (
            <>
              {partnerDetails && (
                <div className="partner-info">
                  <h4>Información de Socio:</h4>
                  <p><strong>Dirección:</strong> {partnerDetails.adress || "No especificada"}</p>
                  <p><strong>Teléfono:</strong> {partnerDetails.phone || "No especificado"}</p>
                  <p><strong>DNI:</strong> {partnerDetails.dni || "No especificado"}</p>
                </div>
              )}

              {user.isMedico && (
                <div className="doctor-info">
                  <h4>Información Médica:</h4>
                  {loadingEspecialista ? (
                    <p>Cargando información médica...</p>
                  ) : errorEspecialista ? (
                    <p className="error-message">Error: {errorEspecialista}</p>
                  ) : especialistaData ? (
                    <>
                      <p><strong>Especialidad:</strong> {especialistaData.especialidad}</p>
                      <p><strong>Matrícula:</strong> {especialistaData.matricula}</p>
                      <p><strong>Estado Reprocann:</strong> {especialistaData.reprocann?.status || "No definido"}</p>
                      {especialistaData.reprocann?.fechaAprobacion && (
                        <p><strong>Fecha de Aprobación:</strong> {new Date(especialistaData.reprocann.fechaAprobacion).toLocaleDateString()}</p>
                      )}
                      {especialistaData.reprocann?.fechaVencimiento && (
                        <p><strong>Fecha de Vencimiento:</strong> {new Date(especialistaData.reprocann.fechaVencimiento).toLocaleDateString()}</p>
                      )}
                    </>
                  ) : (
                    <p>No se encontró información médica registrada.</p>
                  )}
                </div>
              )}

              {!partnerDetails && !user.isMedico && (
                <p>El usuario no ha completado su información de socio ni médica.</p>
              )}
            </>
          )}
        </div>

        <div className="modal-actions">
          <button
            onClick={() => onTogglePartner(user._id)}
            className={user.isPartner ? "revoke-btn" : "approve-btn"}
            disabled={loading}
          >
            {user.isPartner ? "Revocar Socio" : "Aprobar Socio"}
          </button>
          <button onClick={onClose} className="close-btn" disabled={loading}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetallesUsuario;