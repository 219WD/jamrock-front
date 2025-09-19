import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import "./css/Solicitud.css";

const Solicitud = () => {
  const [adress, setAdress] = useState("");
  const [phone, setPhone] = useState("");
  const [dni, setDni] = useState("");
  const [reprocann, setReprocann] = useState(false);
  const [error, setError] = useState(null);
  
  // Acceso correcto al estado
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const name = user?.name;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificamos user.id (no user._id) porque así viene del backend
    if (!user?.id) {
      setError("No se pudo obtener la información del usuario");
      console.error("El usuario no tiene ID:", user);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/partners/createPartner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,  // Usamos user.id (no user._id)
          adress,
          phone,
          dni,
          reprocann,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error del servidor:", data);
        throw new Error(data.error || "Error al enviar solicitud");
      }

      navigate("/pendiente");
    } catch (err) {
      console.error("Error en la solicitud:", err);
      setError(err.message);
    }
  };

  return (
    <div className="solicitud-membership-container">
      <form className="solicitud-membership-form" onSubmit={handleSubmit}>
        <h2 className="solicitud-title">Solicitud de membresía</h2>

        {name && (
          <p className="solicitud-user-name">
            <strong>Nombre:</strong> {name}
          </p>
        )}

        <div className="solicitud-input-group">
          <label htmlFor="adress" className="solicitud-label">Dirección:</label>
          <input
            id="adress"
            type="text"
            value={adress}
            onChange={(e) => setAdress(e.target.value)}
            required
            placeholder="Ingresa tu dirección"
            className="solicitud-input"
          />
        </div>

        <div className="solicitud-input-group">
          <label htmlFor="phone" className="solicitud-label">Teléfono:</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="Ingresa tu teléfono"
            className="solicitud-input"
          />
        </div>

        <div className="solicitud-input-group">
          <label htmlFor="dni" className="solicitud-label">DNI:</label>
          <input
            id="dni"
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
            placeholder="Ingresa tu DNI"
            className="solicitud-input"
          />
        </div>

        <div className="solicitud-checkbox-group">
          <input
            id="reprocann"
            type="checkbox"
            checked={reprocann}
            onChange={(e) => setReprocann(e.target.checked)}
            className="solicitud-checkbox"
          />
          <label htmlFor="reprocann" className="solicitud-checkbox-label">¿Tenés REPROCANN?</label>
        </div>

        <button type="submit" className="solicitud-submit-btn">Enviar solicitud</button>
        {error && <p className="solicitud-error">{error}</p>}
      </form>
    </div>
  );
};

export default Solicitud;