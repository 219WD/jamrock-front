import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import "../css/Register.css";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import withGlobalLoader from "../../utils/withGlobalLoader";
import ForgotPasswordModal from "../ForgotPasswordModal";
import API_URL from "../../common/constants";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const containerRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const emailGroupRef = useRef(null);
  const passwordGroupRef = useRef(null);
  const forgotRef = useRef(null);
  const buttonRef = useRef(null);
  const signinRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    const elements = [
      containerRef.current,
      formRef.current,
      titleRef.current,
      emailGroupRef.current,
      passwordGroupRef.current,
      forgotRef.current,
      buttonRef.current,
      signinRef.current,
    ];

    if (elements.every((el) => el !== null)) {
      gsap.set(
        [
          formRef.current,
          titleRef.current,
          emailGroupRef.current,
          passwordGroupRef.current,
          forgotRef.current,
          buttonRef.current,
          signinRef.current,
        ],
        { opacity: 0, y: 20 }
      );

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.to(containerRef.current, { opacity: 1, duration: 0.5 })
        .to(formRef.current, { opacity: 1, y: 0, duration: 0.6 })
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3")
        .to(emailGroupRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
        .to(passwordGroupRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
        .to(forgotRef.current, { opacity: 1, duration: 0.3 }, "-=0.2")
        .to(buttonRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
        .to(signinRef.current, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
    }
  }, []);

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
    setIsSubmitting(true);

    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        duration: 0.3,
        backgroundColor: "#00aaaa",
        yoyo: true,
        repeat: 1,
      });
    }

    try {
      await withGlobalLoader(async () => {
        const res = await fetch(`${API_URL}/login/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Login fallido");
        }

        login(data.token, data.user);

        if (formRef.current) {
          gsap.to(formRef.current, {
            opacity: 0,
            y: -30,
            duration: 0.5,
            onComplete: () => {
              if (data.user.isAdmin) {
                navigate("/admin");
              } else if (data.user.isPartner) {
                navigate("/");
              } else {
                navigate("/socio");
              }
            },
          });
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overlay-container" ref={containerRef}>
      <div className="form-container" ref={formRef}>
        <p className="title" ref={titleRef}>
          Iniciar Sesión
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group" ref={emailGroupRef}>
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <div
              className="forgot"
              ref={forgotRef}
              onClick={() => {
                if (!isSubmitting) {
                  setShowForgotModal(true);
                }
              }}
            >
              <a href="#" style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}>
                Olvidaste tu contraseña?
              </a>
            </div>
          </div>
          <button 
            className="sign" 
            type="submit" 
            ref={buttonRef}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Iniciando Sesión..." : "Iniciar Sesión"}
          </button>
          {error && (
            <p className="error" ref={errorRef}>
              {error}
            </p>
          )}
          <p className="signin" ref={signinRef}>
            No tenés una cuenta?
            <Link to="/register" style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}>
              Registrate
            </Link>
          </p>
        </form>
        <ForgotPasswordModal
          show={showForgotModal}
          onHide={() => setShowForgotModal(false)}
        />
      </div>
    </div>
  );
};

export default Login;