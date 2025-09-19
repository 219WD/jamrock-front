import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import ForgotPasswordModal from "../ForgotPasswordModal";
import useNotify from "../../hooks/useToast";
import useAuthStore from "../../store/authStore"; 
import { API_URL } from "../common/constants";

const ProfileForm = ({ user, token, formData, setFormData, setShowForgotModal, showForgotModal }) => {
  const notify = useNotify();
  const token = useAuthStore((state) => state.token);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/user/updateUser/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        useAuthStore.getState().setUser(data);
        notify("success", "Perfil actualizado correctamente");
      }
    } catch (err) {
      console.error("Error en la actualización:", err);
      notify("error", "Error al actualizar perfil");
    }
  };

  return (
    <div className="dashboard-section">
      <h2 className="section-title">
        <FontAwesomeIcon icon={faUser} /> Información Personal
      </h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-grid">
          <div className="profile-field">
            <label className="profile-label" htmlFor="name">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="profile-input"
              placeholder="Ingresá tu nombre"
              required
            />
          </div>
          <div className="profile-field">
            <label className="profile-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="profile-input"
              placeholder="ejemplo@correo.com"
              required
            />
          </div>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="profile-password-btn"
            onClick={() => setShowForgotModal(true)}
          >
            Cambiar contraseña
          </button>
          <button type="submit" className="profile-submit-btn">
            Guardar cambios
          </button>
        </div>
      </form>
      <ForgotPasswordModal
        show={showForgotModal}
        onHide={() => setShowForgotModal(false)}
      />
    </div>
  );
};

export default ProfileForm;