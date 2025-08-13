import React from "react";
import "./css/Hero.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Logo from "../assets/LOGOJAMROCK.png";
import useAuthStore from "../store/authStore"; // Importamos el store

const Hero = () => {
  const { user } = useAuthStore(); // Obtenemos el usuario logueado

  return (
    <section className="hero">
      <section className="txt">
        <h1>Weed and Dab Club</h1>
        <p>
          Somos una <strong>asociación civil sin fines de lucro</strong>,
          ubicada en el corazón de la provincia de <strong>Tucumán</strong>.
          Registrada ante la <strong>Dirección de Personería Jurídica</strong>{" "}
          de la provincia. <br />
          <br />
          “Nuestra política principal es <strong>cultivar conciencia</strong>,
          cosechar experiencia, dispensar, informar y{" "}
          <strong>capacitar a nuestros asociados</strong>, sobre el acceso a los{" "}
          <strong>usos terapéuticos</strong> del cannabis.”
        </p>
        <div className="buttons">
          {user ? (
            <Link to="/perfil" className="btn-primary">
              <FontAwesomeIcon icon={faUser} /> Ver Perfil
            </Link>
          ) : (
            <Link to="/register" className="btn-primary">
              <FontAwesomeIcon icon={faUser} /> Unirse al Club
            </Link>
          )}

          {/* Mostrar botón solo si el usuario es partner */}
          {user?.isPartner && (
            <Link to="/productos" className="btn-secondary">
              <FontAwesomeIcon icon={faCartShopping} /> Ver Productos
            </Link>
          )}
        </div>
      </section>
      <section className="img-container">
        <img src={Logo} alt="Logo Jamrock" className="hero-img" />
      </section>
    </section>
  );
};

export default Hero;
