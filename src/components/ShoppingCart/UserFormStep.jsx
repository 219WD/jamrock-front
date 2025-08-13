import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Cloudinary from "../Cloudinary";

const UserFormStep = ({
  name,
  setName,
  phone,
  setPhone,
  address,
  setAddress,
  deliveryType,
  paymentMethod,
  receiptUrl,
  setReceiptUrl,
  imageReset,
  setImageReset,
  isProcessing,
  onBack,
  onCheckout,
  onMercadoPago,
  modalInfo,
  openModal,
  closeModal,
  copyToClipboard,
}) => {
  return (
    <div className="form-step">
      <h3>
        {deliveryType === "envio"
          ? "Datos para el envío"
          : "Datos para el retiro"}
      </h3>

      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isProcessing}
        required
      />

      {deliveryType === "envio" && (
        <input
          type="text"
          placeholder="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isProcessing}
          required
        />
      )}

      <input
        type="text"
        placeholder="Teléfono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={isProcessing}
        required
      />

      {paymentMethod === "transferencia" && (
        <div className="receipt-upload">
          <button
            className="payment-button transferencia"
            type="button"
            onClick={() =>
              openModal({
                title: "Transferencia Bancaria",
                details: ["Alias: mi-alias", "CBU: 1234567890123456789012"],
              })
            }
          >
            Transferir
          </button>
          <h4>
            <FontAwesomeIcon icon={faPaperclip} /> Adjuntar comprobante de
            transferencia
          </h4>
          <Cloudinary
            onUploadComplete={setReceiptUrl}
            reset={imageReset}
            disabled={isProcessing}
          />
        </div>
      )}

      <div className="form-buttons">
        <button
          className="back-button"
          onClick={onBack}
          disabled={isProcessing}
        >
          Atrás
        </button>
        <button
          className="finish-button"
          onClick={paymentMethod === "tarjeta" ? onMercadoPago : onCheckout}
          disabled={
            isProcessing || (paymentMethod === "transferencia" && !receiptUrl)
          }
        >
          {isProcessing
            ? "Procesando..."
            : paymentMethod === "transferencia" && !receiptUrl
            ? "Adjuntar comprobante para finalizar"
            : "Finalizar compra"}
        </button>
      </div>
      {modalInfo && (
        <div className="modal">
          <div className="modal-content">
            <h3>{modalInfo.title}</h3>
            {modalInfo.details.map((detail, index) => (
              <p key={index}>{detail}</p>
            ))}
            <div className="buttons-modal-transfer">
              <button
                className="modal-button copy"
                onClick={() => copyToClipboard("mi-alias")}
              >
                Copiar Alias
              </button>
              <button
                className="modal-button copy"
                onClick={() => copyToClipboard("1234567890123456789012")}
              >
                Copiar CBU
              </button>
              <button className="close-modal" onClick={closeModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFormStep;
