import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import "../css/Register.css";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import withGlobalLoader from "../../utils/withGlobalLoader";
import API_URL from "../../common/constants";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // Referencias para los elementos animados
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const nameGroupRef = useRef(null);
  const emailGroupRef = useRef(null);
  const passwordGroupRef = useRef(null);
  const forgotRef = useRef(null);
  const buttonRef = useRef(null);
  const signinRef = useRef(null);
  const errorRef = useRef(null);

  // Animación inicial
  useEffect(() => {
    const elements = [
      containerRef.current,
      formRef.current,
      titleRef.current,
      nameGroupRef.current,
      emailGroupRef.current,
      passwordGroupRef.current,
      forgotRef.current,
      buttonRef.current,
      signinRef.current,
    ];

    if (elements.every((el) => el !== null)) {
      console.log("Todos los elementos están listos para animar");

      // Resetear estados iniciales
      gsap.set(
        [
          formRef.current,
          titleRef.current,
          nameGroupRef.current,
          emailGroupRef.current,
          passwordGroupRef.current,
          forgotRef.current,
          buttonRef.current,
          signinRef.current,
        ],
        {
          opacity: 0,
          y: 20,
        }
      );

      // Timeline de animación
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.to(containerRef.current, { opacity: 1, duration: 0.5 })
        .to(formRef.current, { opacity: 1, y: 0, duration: 0.6 })
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3")
        .to(nameGroupRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
        .to(emailGroupRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
        .to(
          passwordGroupRef.current,
          { opacity: 1, y: 0, duration: 0.4 },
          "-=0.2"
        )
        .to(forgotRef.current, { opacity: 1, duration: 0.3 }, "-=0.2")
        .to(buttonRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
        .to(signinRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
    } else {
      console.error("Algunos elementos no están disponibles:", elements);
    }
  }, []);

  // Animación para errores
  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4 }
      );
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Animación de carga del botón
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        duration: 0.3,
        backgroundColor: "#00aaaa",
        yoyo: true,
        repeat: 1,
      });
    }

    await withGlobalLoader(async () => {
      const res = await fetch(`${API_URL}/register/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registro fallido");
      }

      // Guardar token y usuario en el store
      login(data.token, data.user);

      // Limpiar formulario
      setName("");
      setEmail("");
      setPassword("");
      setError(null);

      // Animación de salida
      if (formRef.current) {
        gsap.to(formRef.current, {
          opacity: 0,
          y: -30,
          duration: 0.5,
          onComplete: () => {
            navigate("/login");
          },
        });
      }
    }).catch((err) => setError(err.message));
  };

  return (
    <div className="overlay-container" ref={containerRef}>
      <div className="form-container" ref={formRef}>
        <p className="title" ref={titleRef}>
          Registro
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group" ref={nameGroupRef}>
            <label htmlFor="name">Nombre Completo</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group" ref={emailGroupRef}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group password-group" ref={passwordGroupRef}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="forgot" ref={forgotRef}>
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>
          </div>
          <button className="sign" type="submit" ref={buttonRef}>
            Registrarse
          </button>
          {error && (
            <p className="error" ref={errorRef}>
              {error}
            </p>
          )}
          <p className="signin" ref={signinRef}>
            ¿Tenés una cuenta?
            <Link to="/login"> Iniciar Sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;