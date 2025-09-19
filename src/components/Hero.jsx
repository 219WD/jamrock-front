import React, { useEffect, useRef } from "react";
import "./css/Hero.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faUser, faArrowRight, faCannabis, faLeaf } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Logo from "../assets/LOGOJAMROCK.png";
import useAuthStore from "../store/authStore";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registrar el plugin de ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const { user } = useAuthStore();
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const buttonsRef = useRef(null);
  const logoRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    // Animación de entrada
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
    )
    .fromTo(textRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
      "-=0.5"
    )
    .fromTo(buttonsRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.3"
    )
    .fromTo(logoRef.current,
      { scale: 0.8, rotation: -5, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 1, ease: "elastic.out(1, 0.3)" },
      "-=0.5"
    );

    // Crear partículas flotantes
    createParticles();

    // Efecto parallax en scroll
    ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        gsap.to(logoRef.current, {
          y: self.progress * 100,
          rotation: self.progress * 5,
          duration: 0.1
        });
        
        gsap.to(titleRef.current, {
          y: self.progress * 50,
          duration: 0.1
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const createParticles = () => {
    const particles = [];
    const types = [faCannabis, faLeaf];
    const colors = ["#E4FF00", "#74B72C", "#1F7B00", "#ffffff"];
    
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement("div");
      particle.className = "floating-particle";
      
      // Icono o forma aleatoria
      const iconType = types[Math.floor(Math.random() * types.length)];
      const icon = document.createElement("div");
      icon.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="${colors[Math.floor(Math.random() * colors.length)]}" 
              d="${iconType.icon[4]}"/>
      </svg>`;
      
      particle.appendChild(icon);
      heroRef.current.appendChild(particle);
      
      // Posición y animación aleatoria
      const size = Math.random() * 20 + 10;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * 5;
      
      gsap.set(particle, {
        x: `${posX}vw`,
        y: `${posY}vh`,
        width: size,
        height: size,
        opacity: Math.random() * 0.6 + 0.4
      });
      
      // Animación flotante
      gsap.to(particle, {
        y: `+=${Math.random() * 30 + 20}`,
        rotation: Math.random() * 360,
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: delay
      });
      
      particlesRef.current.push(particle);
    }
  };

  return (
    <section className="hero-modern" ref={heroRef}>
      {/* Capas de fondo con efecto parallax */}
      <div className="hero-bg-layer layer-1"></div>
      <div className="hero-bg-layer layer-2"></div>
      <div className="hero-bg-layer layer-3"></div>
      
      <div className="hero-content">
        <section className="hero-text">
          <h1 ref={titleRef} className="hero-title">
            <span className="title-line">Weed and</span>
            <span className="title-line accent">Dab Club</span>
          </h1>
          
          <p ref={textRef} className="hero-description">
            Somos una <strong>asociación civil sin fines de lucro</strong>,
            ubicada en el corazón de la provincia de <strong>Tucumán</strong>.
            Registrada ante la <strong>Dirección de Personería Jurídica</strong>{" "}
            de la provincia.
          </p>
          
          <p ref={textRef} className="hero-quote">
            “Nuestra política principal es <strong>cultivar conciencia</strong>,
            cosechar experiencia, dispensar, informar y{" "}
            <strong>capacitar a nuestros asociados</strong>, sobre el acceso a los{" "}
            <strong>usos terapéuticos</strong> del cannabis.”
          </p>

          <div ref={buttonsRef} className="hero-buttons">
            {user ? (
              <Link to="/perfil" className="btn-primary-modern">
                <FontAwesomeIcon icon={faUser} /> 
                <span>Ver Perfil</span>
                <FontAwesomeIcon icon={faArrowRight} className="arrow" />
              </Link>
            ) : (
              <Link to="/register" className="btn-primary-modern">
                <FontAwesomeIcon icon={faUser} /> 
                <span>Unirse al Club</span>
                <FontAwesomeIcon icon={faArrowRight} className="arrow" />
              </Link>
            )}

            {user?.isPartner && (
              <Link to="/productos" className="btn-secondary-modern">
                <FontAwesomeIcon icon={faCartShopping} /> 
                <span>Ver Productos</span>
                <FontAwesomeIcon icon={faArrowRight} className="arrow" />
              </Link>
            )}
          </div>
        </section>

        <section className="hero-image" ref={logoRef}>
          <div className="logo-container">
            <img src={Logo} alt="Logo Jamrock" className="hero-logo" />
            <div className="logo-glow"></div>
          </div>
        </section>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div className="scroll-line"></div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
};

export default Hero;