import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faIdCard, 
  faSyncAlt, 
  faCalendarCheck,
  faClock,
  faShieldAlt,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import "./css/ReprocanSection.css";

const ReprocanSection = () => {
  const [currentService, setCurrentService] = useState(0);

  const services = [
    {
      icon: faIdCard,
      title: "Inscripción desde Cero",
      description: "Te guiamos en todo el proceso para obtener tu Reprocan por primera vez. Asesoramiento completo y acompañamiento.",
      details: ["Asesoramiento inicial", "Trámites guiados", "Soporte permanente"]
    },
    {
      icon: faSyncAlt,
      title: "Renovación de Reprocan",
      description: "¿Ya tenés tu Reprocan? Te ayudamos a renovarlo de manera rápida y sin complicaciones.",
      details: ["Renovación express", "Documentación asistida", "Seguimiento online"]
    },
    {
      icon: faCalendarCheck,
      title: "Turno con Médico",
      description: "Sacá tu turno con nuestros médicos especializados. Consultas presenciales y virtuales disponibles.",
      details: ["Médicos especializados", "Consultas virtuales", "Resultados rápidos"]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentService((prev) => (prev + 1) % services.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="reprocan-section">
      <div className="reprocan-container">
        <div className="reprocan-header">
          <h2 className="section-title">
            <span className="title-line accent">Gestioná tu Reprocan</span>
            <span className="title-line">con Nosotros</span>
          </h2>
          <p>Te acompañamos en todo el proceso para que accedas a tu tratamiento de manera legal y segura</p>
        </div>

        <div className="reprocan-content">
          <div className="services-display">
            <div className="service-cards">
              {services.map((service, index) => (
                <div 
                  key={index}
                  className={`service-card ${index === currentService ? 'active' : ''}`}
                  onClick={() => setCurrentService(index)}
                >
                  <div className="service-icon">
                    <FontAwesomeIcon icon={service.icon} />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              ))}
            </div>

            <div className="service-details">
              <div className="detail-header">
                <div className="detail-icon">
                  <FontAwesomeIcon icon={services[currentService].icon} />
                </div>
                <h3>{services[currentService].title}</h3>
              </div>
              <ul className="detail-list">
                {services[currentService].details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
              <button className="cta-button">Solicitar Ahora</button>
            </div>
          </div>

          <div className="benefits-section">
            <h3>Beneficios de gestionar con nosotros</h3>
            <div className="benefits-grid">
              <div className="benefit-item">
                <FontAwesomeIcon icon={faClock} className="benefit-icon" />
                <h4>Proceso Rápido</h4>
                <p>Trámites ágiles y sin demoras innecesarias</p>
              </div>
              <div className="benefit-item">
                <FontAwesomeIcon icon={faShieldAlt} className="benefit-icon" />
                <h4>Seguridad Garantizada</h4>
                <p>Tus datos están protegidos y el proceso es confidencial</p>
              </div>
              <div className="benefit-item">
                <FontAwesomeIcon icon={faUsers} className="benefit-icon" />
                <h4>Atención Personalizada</h4>
                <p>Te asignamos un especialista que te acompañará en cada paso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReprocanSection;