import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faCartShopping,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import "./css/Card.css";
import { Link } from "react-router-dom";

const Card = ({
  id,
  image,
  title,
  description,
  rating,
  price,
  onAddToCart,
  className,
  product,
}) => {
  const item = { id, image, title, description, price };
  return (
    <div className={`card ${className || ""}`.trim()}>
      <div className="image-container">
        <img src={image} alt={title} className="card-image" />
        <div className="card-overlay">
          <Link to={`/individual/${id}`} state={item} className="quick-view">
            <FontAwesomeIcon icon={faEye} />
          </Link>
        </div>
      </div>
      <div className="card-content">
        <div className="card-info">
          <span className="rating">
            <FontAwesomeIcon icon={faStar} /> {rating}
          </span>
          <span className="price">${price}</span>
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        <div className="card-buttons">
          <button
            onClick={() => onAddToCart({ id, image, title, description, price })}
            className="add-to-cart-button"
          >
            <FontAwesomeIcon icon={faCartShopping} /> Agregar
          </button>
          <Link to={`/individual/${id}`} state={item} className="view-button">
            Detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;