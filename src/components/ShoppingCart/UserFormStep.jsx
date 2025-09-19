import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faTimes } from "@fortawesome/free-solid-svg-icons";
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
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close-btn" onClick={closeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="modal-header">
              <h2>{modalInfo.title}</h2>
            </div>
            <div className="modal-body">
              {modalInfo.details.map((detail, index) => (
                <p key={index} className="modal-detail">{detail}</p>
              ))}
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn copy"
                onClick={() => copyToClipboard("mi-alias")}
              >
                Copiar Alias
              </button>
              <button
                className="modal-btn copy"
                onClick={() => copyToClipboard("1234567890123456789012")}
              >
                Copiar CBU
              </button>
              <button className="modal-btn close" onClick={closeModal}>
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