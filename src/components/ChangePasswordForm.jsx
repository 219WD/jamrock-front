import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import API_URL from "../common/constants";
import "../components/css/Register.css";

const ChangePasswordForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Animar la entrada de los inputs y el título
    gsap.fromTo(
      ".change-input-group",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.2, ease: "power2.out" }
    );
    gsap.fromTo(
      ".change-title",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  const handleChangePassword = async () => {
    try {
      if (!newPassword || !confirmPassword) {
        throw new Error('Por favor, completa ambos campos');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      setIsLoading(true);
      setError('');
      setMessage('');

      const response = await fetch(API_URL + `/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar la contraseña');
      }

      // Animación de éxito
      gsap.fromTo(
        ".change-message",
        { opacity: 0, y: -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          },
        }
      );

      setMessage(data.message || 'Contraseña cambiada exitosamente. Redirigiendo...');
    } catch (error) {
      // Animación de error
      gsap.fromTo(
        ".change-error",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-overlay-container">
      <div className="change-form-container">
        <h2 className="change-title">Nueva Contraseña</h2>

        <div className="change-input-group">
          <label htmlFor="newPassword">Nueva Contraseña</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Ingresa tu nueva contraseña"
            disabled={isLoading}
          />
        </div>

        <div className="change-input-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirma tu nueva contraseña"
            disabled={isLoading}
          />
        </div>

        {message && (
          <div className="change-message">
            {message}
          </div>
        )}

        {error && (
          <div className="change-error">
            {error}
          </div>
        )}

        <button
          className="change-btn-primary"
          onClick={handleChangePassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="change-loading-text">Procesando...</span>
          ) : (
            'Cambiar Contraseña'
          )}
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordForm;