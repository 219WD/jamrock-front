import React from "react";

const TablaTurnos = ({
  currentTurnos,
  getProductosFromTurno,
  getTotalTurno,
  getProductDisplayName,
  itemSubtotal,
  setSelectedTurno,
  setSelectedProducts,
  setDescuento,
  setFormaPago,
  updatePagoStatus
}) => {
  return (
    <table className="turnos-table">
      <thead>
        <tr>
          <th>Paciente</th>
          <th>Fecha</th>
          <th>Productos</th>
          <th>Total</th>
          <th>Forma de Pago</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {currentTurnos.map((turno) => {
          const productos = getProductosFromTurno(turno);
          const total = getTotalTurno(turno);
          const descuento = turno.consulta?.descuento || 0;

          return (
            <tr key={turno._id} className="turno-row">
              <td>{turno.pacienteId?.fullName || "Sin Paciente"}</td>
              <td>
                {new Date(turno.fecha).toLocaleString("es-AR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
              <td>
                {productos.length > 0 ? (
                  <ul className="productos-list">
                    {productos.map((producto, index) => (
                      <li key={index}>
                        {getProductDisplayName(producto)} (x
                        {producto.cantidad || 0}) - $
                        {itemSubtotal(producto).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "Ninguno"
                )}
              </td>
              <td>${total.toFixed(2)}</td>
              <td>
                <span
                  className={`turno-estado ${
                    turno.consulta?.pagado
                      ? "completado"
                      : "pendiente"
                  }`}
                >
                  {turno.consulta?.formaPago || "N/A"}
                </span>
              </td>
              <td>
                <div className="acciones-botones">
                  <button
                    className="btn-small"
                    onClick={() => {
                      setSelectedTurno(turno);
                      setSelectedProducts(
                        turno.consulta?.productos || []
                      );
                      setDescuento(turno.consulta?.descuento || 0);
                      setFormaPago(
                        turno.consulta?.formaPago || "efectivo"
                      );
                    }}
                  >
                    Ver Consulta
                  </button>
                  <button
                    className="btn-small"
                    onClick={() =>
                      updatePagoStatus(
                        turno._id,
                        turno.consulta?.pagado || false
                      )
                    }
                  >
                    {turno.consulta?.pagado
                      ? "Desmarcar"
                      : "Marcar Pagado"}
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TablaTurnos;