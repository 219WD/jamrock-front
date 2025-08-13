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
    <div className="solicitud-container">
      <form className="solicitud-form" onSubmit={handleSubmit}>
        <h2>Solicitud de membresía</h2>

        {name && (
          <p>
            <strong>Nombre:</strong> {name}
          </p>
        )}

        <div className="input-group">
          <label>Dirección:</label>
          <input
            type="text"
            value={adress}
            onChange={(e) => setAdress(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Teléfono:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>DNI:</label>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
          />
        </div>

        <div className="input-group checkbox-group">
          <label htmlFor="reprocann">¿Tenés REPROCANN?</label>
          <input
            id="reprocann"
            type="checkbox"
            checked={reprocann}
            onChange={(e) => setReprocann(e.target.checked)}
          />
        </div>

        <button type="submit">Enviar solicitud</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Solicitud;