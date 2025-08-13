import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillTransfer } from "@fortawesome/free-solid-svg-icons";

const TotalAndPayButton = ({ total, onNext, loading }) => (
  <div className="cart-total">
    <p>Total: ${total.toFixed(2)}</p>
    <button className="pay-button" onClick={onNext} disabled={loading}>
      <FontAwesomeIcon icon={faMoneyBillTransfer} /> Pagar
    </button>
  </div>
);

export default TotalAndPayButton;
