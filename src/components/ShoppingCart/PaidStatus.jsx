import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox } from "@fortawesome/free-solid-svg-icons";

const PaidStatus = ({ message, onViewStatus }) => (
  <div className="paid-status-container">
    <div className="paid-status-message">
      <FontAwesomeIcon icon={faBox} className="status-icon" />
      <span> {message} </span>
    </div>
    <button className="status-button" onClick={onViewStatus}>
      Ver estado del pedido
    </button>
  </div>
);

export default PaidStatus;
