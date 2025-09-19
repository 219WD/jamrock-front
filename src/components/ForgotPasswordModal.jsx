import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import API_URL from "../common/constants";

const ForgotPasswordModal = ({ show, onHide }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      gsap.to(".password-reset-modal-overlay", {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(".password-reset-modal-container", {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(".password-reset-modal-overlay", {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
      gsap.to(".password-reset-modal-container", {
        y: 20,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!email) {
        throw new Error('Por favor ingresa tu correo electrónico');
      }

      setIsLoading(true);
      setError('');
      setMessage('');

      const response = await fetch(API_URL + '/auth/reset-password-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar la solicitud');
      }

      setMessage(data.message || 'Se ha enviado un correo con instrucciones para restablecer tu contraseña');
      
      gsap.fromTo(".password-reset-modal-success",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );

      setTimeout(() => {
        onHide();
        setMessage('');
        setEmail('');
      }, 3000);

    } catch (error) {
      setError(error.message);
      
      gsap.fromTo(".password-reset-modal-error",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return createPortal(
    <div className={`password-reset-modal-overlay ${show ? 'active' : ''}`}>
      <div className="password-reset-modal-container">
        <div className="password-reset-modal-header">
          <h2>Restablecer Contraseña</h2>
          <button 
            className="password-reset-modal-close-btn" 
            onClick={onHide}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="password-reset-modal-body">
            <p>Ingresa tu correo electrónico registrado y te enviaremos un enlace para restablecer tu contraseña.</p>

            <div className="password-reset-input-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                disabled={isLoading}
              />
            </div>

            {message && (
              <div className="password-reset-modal-message password-reset-modal-success">
                {message}
              </div>
            )}

            {error && (
              <div className="password-reset-modal-message password-reset-modal-error">
                {error}
              </div>
            )}
          </div>

          <div className="password-reset-modal-footer">
            <button
              type="button"
              className="password-reset-modal-btn password-reset-modal-btn-secondary"
              onClick={onHide}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="password-reset-modal-btn password-reset-modal-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="password-reset-loading-indicator">Enviando...</span>
              ) : (
                'Enviar Petición'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ForgotPasswordModal;