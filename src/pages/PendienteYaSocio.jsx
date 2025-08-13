import React from 'react'
import './css/PendienteYaSocio.css'

const PendienteYaSocio = () => {
  return (
    <div className='pendiente-container'>
      <div className='pendiente-card'>
        <h2>Solicitud Pendiente</h2>
        <p>Tu solicitud de membresía está pendiente de aprobación. Para completar el registro deberá firmar los papeles de solicitud en las instalaciones en San Lorenzo 420.</p>
        <p>Luego recibirás un correo electrónico una vez que se haya aprobado tu solicitud.</p>
        <button onClick={() => window.location.href = '/solicitudPendiente'}>Editar Información</button>
      </div>
    </div>
  )
}

export default PendienteYaSocio
