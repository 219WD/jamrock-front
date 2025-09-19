import React from "react";

const EstadisticasCaja = ({ totals }) => {
  return (
    <div className="stats-container">
      <div className="stat-card">
        <h3>Efectivo</h3>
        <p>${totals.efectivo.toFixed(2)}</p>
      </div>
      <div className="stat-card">
        <h3>Tarjeta</h3>
        <p>${totals.tarjeta.toFixed(2)}</p>
      </div>
      <div className="stat-card">
        <h3>Transferencia</h3>
        <p>${totals.transferencia.toFixed(2)}</p>
      </div>
      <div className="stat-card">
        <h3>Mercado Pago</h3>
        <p>${totals.mercadoPago.toFixed(2)}</p>
      </div>
      {totals.otro > 0 && (
        <div className="stat-card">
          <h3>Otro</h3>
          <p>${totals.otro.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default EstadisticasCaja;