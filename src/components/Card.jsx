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
      <img src={image} alt={title} className="card-image" />
      <div className="card-info">
        <span className="rating">
          <FontAwesomeIcon icon={faStar} /> {rating}
        </span>
        <span className="price">${price}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button
        onClick={() => onAddToCart({ id, image, title, description, price })}
        className="add-to-cart-button"
      >
        <FontAwesomeIcon icon={faCartShopping} /> Agregar al Carrito
      </button>
      <Link to={`/individual/${id}`} state={item} className="view-button">
        <FontAwesomeIcon icon={faEye} /> Ver Producto
      </Link>
    </div>
  );
};

export default Card;
