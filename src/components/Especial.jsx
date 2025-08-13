import React from 'react'
import './css/Especial.css'
import { Link } from 'react-router-dom';

const Especial = () => {

  return (
    <div className='container especial'>
      <div className="txt">
        <h2>¿Quiénes Somos?</h2>
        <h4>Jamrock</h4>
        <p>Jamrock es una asociación civil sin fines de lucro en Tucumán, registrada legalmente, dedicada a la salud y el bienestar comunitario. Su misión es brindar apoyo y recursos para el acceso al cannabis medicinal de calidad premium. Cuenta con un equipo de expertos en cultivo, investigación, medicina, derecho y comunicación, además de una red de colaboradores. Se enfocan en el cultivo y mejoramiento genético de variedades adaptadas a necesidades médicas, operando dentro del marco legal de la Ley 27.350 (REPROCANN).</p>
        <Link to="/about" className="btn-especial">
           Quienes Somos
        </Link>
      </div>
    </div>
  )
}

export default Especial