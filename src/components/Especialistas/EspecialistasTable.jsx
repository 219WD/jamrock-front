import React from "react";

const EspecialistasTable = ({
  especialistas,
  setSelectedEspecialista,
  setFormEspecialista,
}) => {
  return (
    <>
      <h2>Todos los Especialistas</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Especialidad</th>
            <th>Matrícula</th>
            <th>Reprocann</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {especialistas.map((e) => (
            <tr key={e._id} className="user-row">
              <td data-label="Nombre">{e.userId?.name}</td>
              <td data-label="Email">{e.userId?.email}</td>
              <td data-label="Especialidad">{e.especialidad}</td>
              <td data-label="Matrícula">{e.matricula}</td>
              <td data-label="Reprocann">{e.reprocann.status}</td>
              <td className="actions" data-label="Acciones">
                <button
                  onClick={() => {
                    setSelectedEspecialista(e);
                    setFormEspecialista({
                      especialidad: e.especialidad,
                      matricula: e.matricula,
                      reprocann: {
                        status: e.reprocann.status || "inicializado",
                        fechaAprobacion:
                          e.reprocann.fechaAprobacion?.substring(0, 10) || "",
                        fechaVencimiento:
                          e.reprocann.fechaVencimiento?.substring(0, 10) || "",
                      },
                    });
                  }}
                  className="view-btn"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default EspecialistasTable;