import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBank, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";


const PaymentOptions = ({ isProcessing, onSelect, onBack }) => (
  <div className="payment-options">
    <h3>Selecciona forma de pago</h3>
    <button className="payment-button" onClick={() => onSelect("efectivo")} disabled={isProcessing}>
      <FontAwesomeIcon icon={faWhatsapp} /> Efectivo
    </button>
    <button className="payment-button" onClick={() => onSelect("transferencia")} disabled={isProcessing}>
      <FontAwesomeIcon icon={faBank} /> Transferencia
    </button>
    <button className="payment-button" onClick={() => onSelect("tarjeta")} disabled={isProcessing}>
      <FontAwesomeIcon icon={faCreditCard} /> MercadoPago
    </button>
    <button className="back-button" onClick={onBack} disabled={isProcessing}>
      Atrás
    </button>
  </div>
);

export default PaymentOptions;
