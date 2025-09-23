import React from "react";

const EspecialistasVencimiento = ({
  especialistasPorVencer,
  getReprocannClass,
}) => {
  if (!especialistasPorVencer.length) return null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2>Especialistas con vencimiento en 30 días</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Especialidad</th>
            <th>Vencimiento</th>
          </tr>
        </thead>
        <tbody>
          {especialistasPorVencer.map((e) => (
            <tr
              key={e._id}
              className={getReprocannClass(e.reprocann.fechaVencimiento)}
            >
              <td data-label="Nombre">{e.userId?.name}</td>
              <td data-label="Email">{e.userId?.email}</td>
              <td data-label="Especialidad">{e.especialidad}</td>
              <td data-label="Vencimiento">
                {new Date(e.reprocann.fechaVencimiento).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EspecialistasVencimiento;
