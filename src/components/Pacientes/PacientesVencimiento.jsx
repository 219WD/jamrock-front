import React from "react";

const PacientesVencimiento = ({ pacientesPorVencer, getReprocannClass }) => {
  if (!pacientesPorVencer.length) return null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2>Pacientes con vencimiento en 30 días</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Vencimiento</th>
          </tr>
        </thead>
        <tbody>
          {pacientesPorVencer.map((p) => (
            <tr
              key={p._id}
              className={getReprocannClass(p.reprocann?.fechaVencimiento)}
            >
              <td>{p.fullName}</td>
              <td>{p.userId?.email}</td>
              <td>
                {p.reprocann?.fechaVencimiento
                  ? new Date(p.reprocann.fechaVencimiento).toLocaleDateString()
                  : "No especificado"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PacientesVencimiento;