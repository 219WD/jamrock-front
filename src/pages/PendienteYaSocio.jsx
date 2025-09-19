import React from 'react'
import { useNavigate } from 'react-router-dom'
import './css/PendienteYaSocio.css'

const PendienteYaSocio = () => {
  const navigate = useNavigate()

  const handleGoToProfile = () => {
    navigate('/perfil')
  }

  const handleEditInfo = () => {
    window.location.href = '/solicitudPendiente'
  }

  return (
    <div className='pendiente-container'>
      <div className='pendiente-card'>
        <h2>Solicitud Pendiente</h2>
        <p>Tu solicitud de membresía está pendiente de aprobación. Para completar el registro deberá firmar los papeles de solicitud en las instalaciones en San Lorenzo 420.</p>
        <p>Luego recibirás un correo electrónico una vez que se haya aprobado tu solicitud.</p>
        
        <div className="pendiente-button-group">
          <button onClick={handleEditInfo} className="pendiente-edit-btn">
            Editar Información
          </button>
          <button onClick={handleGoToProfile} className="pendiente-profile-btn">
            Ir al Perfil
          </button>
        </div>
      </div>
    </div>
  )
}

export default PendienteYaSocio