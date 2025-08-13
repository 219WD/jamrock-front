import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faStore } from "@fortawesome/free-solid-svg-icons";

const DeliveryOptions = ({ isProcessing, onSelect, onBack }) => (
  <div className="delivery-options">
    <h3>Selecciona tipo de entrega</h3>
    <button className="delivery-button" onClick={() => onSelect("envio")} disabled={isProcessing}>
      <FontAwesomeIcon icon={faTruck} /> Envío a domicilio
    </button>
    <button className="delivery-button" onClick={() => onSelect("retiro")} disabled={isProcessing}>
      <FontAwesomeIcon icon={faStore} /> Retiro en local
    </button>
    <button className="back-button" onClick={onBack} disabled={isProcessing}>
      Atrás
    </button>
  </div>
);

export default DeliveryOptions;
