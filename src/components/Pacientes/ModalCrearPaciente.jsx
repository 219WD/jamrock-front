import React, { useState, useEffect } from "react";
import useNotify from "../../hooks/useToast"; // Asegúrate de importar tu hook de notificaciones

const ModalCrearPaciente = ({
  onClose,
  onCreate,
  currentUser,
  userToConvert,
  antecedentesOptions
}) => {
  const [step, setStep] = useState(1);
  const notify = useNotify(); // Inicializa el hook de notificaciones
  
  const [formData, setFormData] = useState({
    fullName: '',
    fechaDeNacimiento: '',
    reprocann: { status: 'pending' },
    userId: '',
    partnerId: currentUser.partnerData || ''
  });

  const [antecedentes, setAntecedentes] = useState({
    afeccionCardiaca: false,
    alteracionCoagulacion: false,
    diabetes: false,
    hipertension: false,
    epilepsia: false,
    insufRenal: false,
    hepatitis: false,
    insufHepatica: false,
    alergia: false,
    asma: false,
    otros: false
  });

  useEffect(() => {
    if (userToConvert) {
      setFormData(prev => ({
        ...prev,
        fullName: userToConvert.name,
        userId: userToConvert._id
      }));
    } else if (currentUser) {
      setFormData(prev => ({
        ...prev,
        userId: currentUser._id
      }));
    }
  }, [userToConvert, currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes("reprocann")) {
      const [_, field] = name.split(".");
      setFormData(prev => ({
        ...prev,
        reprocann: {
          ...prev.reprocann,
          [field]: value
        }
      }));
    } else if (name in antecedentes) {
      setAntecedentes(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validación básica
      if (!formData.fullName || !formData.fechaDeNacimiento) {
        notify("Por favor complete todos los campos requeridos", "error");
        return;
      }

      const pacienteCompleto = {
        ...formData,
        ...antecedentes
      };
      
      const result = await onCreate(pacienteCompleto);
      
      if (result.success) {
        notify("Paciente creado exitosamente", "success");
        onClose();
      } else {
        notify(result.error || "Error al crear el paciente", "error");
      }
    } catch (error) {
      console.error("Error al crear paciente:", error);
      notify("Ocurrió un error al crear el paciente", "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Crear Paciente</h3>

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            {userToConvert && (
              <div className="form-group">
                <label>Usuario Asociado</label>
                <input
                  type="text"
                  value={userToConvert.name}
                  disabled
                />
              </div>
            )}

            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Fecha de Nacimiento *</label>
              <input
                type="date"
                name="fechaDeNacimiento"
                value={formData.fechaDeNacimiento}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Estado REPROCANN</label>
              <select
                name="reprocann.status"
                value={formData.reprocann?.status || 'pending'}
                onChange={handleChange}
              >
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
                <option value="expired">Expirado</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="close-btn">
                Cancelar
              </button>
              <button type="submit" className="approve-btn">
                Siguiente
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <h4>Antecedentes Médicos</h4>
            
            <div className="antecedentes-grid">
              {Object.entries(antecedentes).map(([key, value]) => (
                <div key={key} className="antecedente-item">
                  <label>
                    {key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}:
                    {typeof value === 'boolean' ? (
                      <div className="radio-group">
                        <label>
                          <input
                            type="radio"
                            name={key}
                            checked={value === true}
                            onChange={() => setAntecedentes(prev => ({
                              ...prev,
                              [key]: true
                            }))}
                          /> Sí
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={key}
                            checked={value === false}
                            onChange={() => setAntecedentes(prev => ({
                              ...prev,
                              [key]: false
                            }))}
                          /> No
                        </label>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name={key}
                        value={value}
                        onChange={handleChange}
                        placeholder="Especifique otros antecedentes"
                      />
                    )}
                  </label>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setStep(1)} className="close-btn">
                Atrás
              </button>
              <button type="submit" className="approve-btn">
                Crear Paciente
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalCrearPaciente;