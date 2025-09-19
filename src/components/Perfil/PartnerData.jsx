import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const PartnerData = ({ partnerData }) => {
  return (
    <div className="dashboard-section">
      <h2 className="section-title">
        <FontAwesomeIcon icon={faUser} /> Datos del Socio
      </h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">DNI:</span>
          <span className="info-value">{partnerData.dni}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Dirección:</span>
          <span className="info-value">{partnerData.address || partnerData.adress}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Teléfono:</span>
          <span className="info-value">{partnerData.phone}</span>
        </div>
        <div className="info-item">
          <span className="info-label">REPROCANN:</span>
          <span className="info-value">{partnerData.reprocann ? "Sí" : "No"}</span>
        </div>
      </div>
    </div>
  );
};

export default PartnerData;