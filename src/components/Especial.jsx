import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faUsers,
  faHeart,
  faSeedling,
} from "@fortawesome/free-solid-svg-icons";
import { faCannabis } from "@fortawesome/free-solid-svg-icons";
import "./css/Especial.css";

const Especial = () => {
  return (
    <section className="especial-section">
      {/* Capas de fondo con efecto parallax */}
      <div className="especial-bg-layer layer-1"></div>
      <div className="especial-bg-layer layer-2"></div>

      <div className="especial-container">
        <div className="especial-content">
          <div className="especial-text">
            <h2 className="section-title">
              <span className="title-line">¿Quiénes</span>
              <span className="title-line accent">Somos?</span>
            </h2>

            <div className="jamrock-title">
              <FontAwesomeIcon icon={faCannabis} className="title-icon" />
              <span>Jamrock</span>
            </div>

            <p className="especial-description">
              Jamrock es una{" "}
              <strong>asociación civil sin fines de lucro</strong> en Tucumán,
              registrada legalmente, dedicada a la salud y el bienestar
              comunitario. Nuestra misión es brindar apoyo y recursos para el
              acceso al cannabis medicinal de calidad premium.
            </p>

            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-header">
                  <FontAwesomeIcon icon={faUsers} className="feature-icon" />
                  <h4>Equipo Especializado</h4>
                </div>
                <p>Expertos en cultivo, medicina, derecho y comunicación</p>
              </div>
              <div className="feature-item">
                <div className="feature-header">
                  <FontAwesomeIcon icon={faSeedling} className="feature-icon" />
                  <h4>Cultivo Certificado</h4>
                </div>
                <p>Variedades adaptadas a necesidades médicas específicas</p>
              </div>
              <div className="feature-item">
                <div className="feature-header">
                  <FontAwesomeIcon icon={faHeart} className="feature-icon" />
                  <h4>Marco Legal</h4>
                </div>
                <p>Operamos dentro de la Ley 27.350 (REPROCANN)</p>
              </div>
            </div>
          </div>

          <div className="especial-visual">
            <div className="visual-content">
              <div className="floating-element element-1">
                <FontAwesomeIcon icon={faCannabis} />
              </div>
              <div className="floating-element element-2">
                <FontAwesomeIcon icon={faSeedling} />
              </div>
              <div className="floating-element element-3">
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <div className="main-visual">
                <div className="visual-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Especial;
