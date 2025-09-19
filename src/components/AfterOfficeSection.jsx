import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock, faMusic, faCocktail } from "@fortawesome/free-solid-svg-icons";
import "./css/AfterOffice.css";

// Importar imágenes (debes reemplazar estas rutas con las tuyas)
// Usar URLs como strings
const afterOffice1 = "https://media.istockphoto.com/id/1152502772/es/foto/hora-de-celebrarlo.jpg?s=612x612&w=0&k=20&c=G7kJYelt1WV-CB22AwKdJtdeHLYbwpLNx7vSjn2CT-4=";
const afterOffice2 = "https://media.istockphoto.com/id/1152502772/es/foto/hora-de-celebrarlo.jpg?s=612x612&w=0&k=20&c=G7kJYelt1WV-CB22AwKdJtdeHLYbwpLNx7vSjn2CT-4=";
const afterOffice3 = "https://media.istockphoto.com/id/1152502772/es/foto/hora-de-celebrarlo.jpg?s=612x612&w=0&k=20&c=G7kJYelt1WV-CB22AwKdJtdeHLYbwpLNx7vSjn2CT-4=";
const afterOffice4 = "https://media.istockphoto.com/id/1152502772/es/foto/hora-de-celebrarlo.jpg?s=612x612&w=0&k=20&c=G7kJYelt1WV-CB22AwKdJtdeHLYbwpLNx7vSjn2CT-4=";

const AfterOfficeSection = () => {
  return (
    <section className="after-office-section">
      <div className="after-office-container">
        <div className="after-office-content">
          <div className="after-office-images">
            <div className="image-grid">
              <div className="image-row">
                <div className="image-item">
                  <img src={afterOffice1} alt="After Office - Ambiente 1" />
                  <div className="image-overlay"></div>
                </div>
                <div className="image-item">
                  <img src={afterOffice2} alt="After Office - Ambiente 2" />
                  <div className="image-overlay"></div>
                </div>
              </div>
              <div className="image-row">
                <div className="image-item">
                  <img src={afterOffice3} alt="After Office - Ambiente 3" />
                  <div className="image-overlay"></div>
                </div>
                <div className="image-item">
                  <img src={afterOffice4} alt="After Office - Ambiente 4" />
                  <div className="image-overlay"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="after-office-info">
            <h2 className="section-title">
              <span className="title-line accent">After Office</span>
              <span className="title-line">Viernes Especial</span>
            </h2>
            
            <div className="schedule-info">
              <div className="schedule-item">
                <FontAwesomeIcon icon={faCalendarAlt} className="schedule-icon" />
                <span>Todos los Viernes</span>
              </div>
              <div className="schedule-item">
                <FontAwesomeIcon icon={faClock} className="schedule-icon" />
                <span>18:00 - 22:00 hs</span>
              </div>
            </div>

            <p className="after-office-description">
              Terminá la semana con la mejor energía en nuestro After Office especial. 
              Disfrutá de un ambiente único con música, bebidas exclusivas y la mejor compañía.
            </p>

            <div className="features-grid">
              <div className="feature-item">
                <FontAwesomeIcon icon={faMusic} className="feature-icon" />
                <h4>Música en Vivo</h4>
                <p>DJ y artistas locales</p>
              </div>
              <div className="feature-item">
                <FontAwesomeIcon icon={faCocktail} className="feature-icon" />
                <h4>Bebidas Exclusivas</h4>
                <p>Coctelería premium</p>
              </div>
            </div>

            <button className="cta-button after-office-cta">
              Reservar Mesa
              <FontAwesomeIcon icon={faCalendarAlt} className="cta-icon" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AfterOfficeSection;