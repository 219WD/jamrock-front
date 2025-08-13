import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import './css/Footer.css';
import Logo from '../assets/LOGOJAMROCK.png';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Logo y Descripción */}
          <div className="footer-section">
            <div className="footer-logo">
              <img
                src={Logo}
                alt="Legen Logo"
                className="footer-image"
              />
            </div>
            <p className="footer-text">
            ONG de la Salud - Res. 344/2023-DPJ
            </p>
          </div>

          {/* Enlaces de Navegación */}
          <div className="footer-section">
            <h3 className="footer-title">Menu</h3>
            <ul className="footer-list">
              <li><Link to="/#hero">Inicio</Link></li>
              <li><Link to="/#quienes-somos">¿Quiénes somos?</Link></li>
              <li><Link to="/#nuestro-enfoque">Nuestro enfoque</Link></li>
              <li><Link to="/#investigacion">Investigación</Link></li>
            </ul>
          </div>

          {/* Enlaces Rápidos */}
          <div className="footer-section">
            <h3 className="footer-title">Mensajes rápidos</h3>
            <ul className="footer-list">
              <li><a href="#">Contactanos</a></li>
              <li><a href="#">Preguntanos</a></li>
              <li><a href="#">Ayudanos</a></li>
              <li><a href="#">Documentos</a></li>
            </ul>
          </div>

          {/* Servicios */}
          <div className="footer-section">
            <h3 className="footer-title">Servicios</h3>
            <ul className="footer-list">
              <li><a href="#">Inicio</a></li>
              <li><a href="#">¿Quiénes somos?</a></li>
              <li><a href="#">Nuestro enfoque</a></li>
              <li><a href="#">Investigación</a></li>
            </ul>
          </div>
        </div>

        {/* Contacto y Redes Sociales */}
        <div className="footer-bottom">
          <div className="footer-contact">
            <div className="footer-contact-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>San Miguel de Tucumán, Tucumán • Argentina</span>
            </div>
            <div className="footer-contact-item">
              <FontAwesomeIcon icon={faPhone} />
              <span>3816 57-4462</span>
            </div>
            <div className="footer-contact-item">
              <FontAwesomeIcon icon={faEnvelope} />
              <span>jamrock@gmail.com</span>
            </div>
          </div>

          <div className="footer-social">
            <a href="https://www.instagram.com/legen.cann/" className="footer-social-icon">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://wa.me/543816574462?text=Hola%20Legen!" className="footer-social-icon">
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
            <a href="#" className="footer-social-icon">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
          </div>
        </div>

        {/* Derechos Reservados */}
        <div className="footer-copy">
          © 2025 Hecho por 219Labs • Todos los Derechos Reservados
        </div>
      </div>
    </footer>
  );
}

export default Footer;