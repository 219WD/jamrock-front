import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./css/Loader.css";

const LoaderGsap = ({ visible = true, loop = true }) => {
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current) return;

    hasAnimated.current = true;

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        if (loop) {
          gsap.to(".progress-fill", {
            width: "100%",
            duration: 3,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true,
          });
        }
      },
    });

    // 1. Barras diagonales (más lento)
    tl.fromTo(".bar-top", { x: "-100vw", y: "-100vh" }, { x: 0, y: 0, duration: 3 });
    tl.fromTo(".bar-bottom", { x: "100vw", y: "100vh" }, { x: 0, y: 0, duration: 3 });

    // 2. Logo
    tl.fromTo(
      ".loader-logo",
      { opacity: 0, scale: 0.6 },
      { opacity: 1, scale: 1, duration: 2 }
    );

    // 3. Texto "Loading"
    tl.fromTo(
      ".loader-text",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.5 }
    );

    // 4. Barra de progreso inicial (antes del loop)
    tl.fromTo(
      ".progress-fill",
      { width: "0%" },
      { width: "100%", duration: 3 }
    );

    return () => {
      tl.kill();
    };
  }, [visible, loop]);

  if (!visible) return null;

  return (
    <div className="loader-overlay">
      <div className="bar-top"></div>
      <div className="bar-bottom"></div>
      <div className="loader-content">
        <svg
          className="loader-logo"
          width="80"
          height="80"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="40" stroke="#00ffff" strokeWidth="8" />
          <path d="M50 30 L70 50 L50 70 L30 50 Z" fill="#00ffff" />
        </svg>
        <p className="loader-text">Loading</p>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default LoaderGsap;
