import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const CartItem = ({ item, updateQuantity, removeFromCart, cartLoading, isPaid }) => (
  <div className="cart-item">
    <img src={item.image} alt={item.title} />
    <div>
      <h4>{item.title}</h4>
      <p>{item.description}</p>
      <p>${parseFloat(item.price).toFixed(2)}</p>
    </div>
    <div className="buttons-cart">
      <button onClick={() => updateQuantity(item._id || item.id, -1)} disabled={cartLoading || isPaid}>-</button>
      <span>{item.quantity}</span>
      <button onClick={() => updateQuantity(item._id || item.id, 1)} disabled={cartLoading || isPaid}>+</button>
    </div>
    <button
      className="delete-button"
      onClick={() => removeFromCart(item._id || item.id)}
      disabled={cartLoading || isPaid}
    >
      <FontAwesomeIcon icon={faTrash} />
    </button>
  </div>
);

export default CartItem;
