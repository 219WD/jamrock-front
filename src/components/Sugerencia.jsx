import React from 'react';
import './css/Sugerencia.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const Sugerencia = () => {
    return (
        <section className="sugerencia">
            <div className="image-section">
                <img
                    src="https://profesorcbd.com/cdn/shop/files/Gelefectofrio200ml-cosmeticacbd-004.webp?v=1737634189&width=1000"
                    alt="Gel Efecto Frio"
                    className="image-sugerencia"
                />
            </div>
            <div className="description">
                <h2>Vení a conocer nuestros productos</h2>
                <p>Descubrí los mejores productos de CBD en nuestra tienda. Aquí encontrarás el aceite CBD, las flores CBD y los productos con CBD más elegidos por los clientes ¡No te los pierdas!</p>
                <Link to="/productos" className="menu-link">
                    <button>
                        <FontAwesomeIcon icon={faEye} /> Ver Productos
                    </button>
                </Link>
            </div>
        </section>
    );
};

export default Sugerencia;
