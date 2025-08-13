import React from "react";
import { useNavigate } from "react-router-dom";
import "./css/SocioPage.css";
import useAuthStore from "../store/authStore";
import NavBar from '../components/NavBar';

const Socio = () => {
  const navigate = useNavigate();
  const isPartner = useAuthStore((state) => state.isPartner);
  const token = useAuthStore((state) => state.token);

  const handleSolicitud = () => {
    navigate("/solicitud");
  };

  const handleYaSoySocio = () => {
    if (isPartner === true) {
      navigate("/");
    } else {
      navigate("/solicitudPendiente");
    }
  };

  // Si no hay token, redirigir al login
  if (!token) {
    navigate("/solicitudPendiente");
    return null;
  }

  console.log(token)

  return (
    <div className="socio-container">
      <NavBar />
      <div className="socio-card">
        <h1>Bienvenido a Jamrock</h1>
        <p>¿Querés formar parte del club o ya sos miembro?</p>
        <div className="socio-buttons">
          <button onClick={handleSolicitud}>Solicitar unirse al club</button>
          <button onClick={handleYaSoySocio}>Ya soy socio</button>
        </div>
      </div>
    </div>
  );
};

export default Socio;
