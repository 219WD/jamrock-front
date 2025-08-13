// Especialistas.jsx
import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import NavDashboard from "../components/NavDashboard";
import useNotify from "../hooks/useToast";
import EspecialistasHeader from "../components/Especialistas/EspecialistasHeader";
import EspecialistasTable from "../components/Especialistas/EspecialistasTable";
import EspecialistasVencimiento from "../components/Especialistas/EspecialistasVencimiento";
import EditarEspecialistaModal from "../components/Especialistas/EditarEspecialistaModal";
import "./css/AdminPanel.css";

const Especialistas = () => {
  const token = useAuthStore((state) => state.token);
  const [especialistas, setEspecialistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedEspecialista, setSelectedEspecialista] = useState(null);
  const [formEspecialista, setFormEspecialista] = useState({
    especialidad: "",
    matricula: "",
    reprocann: {
      status: "inicializado",
      fechaAprobacion: "",
      fechaVencimiento: "",
    },
  });

  const notify = useNotify();

  const fetchEspecialistas = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/especialistas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Error al obtener especialistas", "error");
        throw new Error(data.error || "Error al obtener especialistas");
      }
      setEspecialistas(data.data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEspecialista = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:4000/especialistas/${selectedEspecialista._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formEspecialista),
        }
      );
      const data = await res.json();
      if (!data.success) {
        notify(data.error || "Error al actualizar especialista", "error");
        throw new Error(data.error);
      }

      notify("Especialista actualizado correctamente", "success");
      fetchEspecialistas();
      setSelectedEspecialista(null);
      setFormEspecialista({
        especialidad: "",
        matricula: "",
        reprocann: {
          status: "inicializado",
          fechaAprobacion: "",
          fechaVencimiento: "",
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterEspecialistas = () => {
    return especialistas.filter((e) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        e.userId?.name?.toLowerCase().includes(query) ||
        e.especialidad.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "todos" || e.reprocann.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const getEspecialistasPorVencer = () => {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + 30);

    return especialistas.filter((e) => {
      if (!e.reprocann?.fechaVencimiento) return false;
      const vencimiento = new Date(e.reprocann.fechaVencimiento);
      return vencimiento >= hoy && vencimiento <= limite;
    });
  };

  const getReprocannClass = (fechaVencimiento) => {
    if (!fechaVencimiento) return "";
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffDias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

    if (diffDias <= 10) return "reprocann-rojo";
    if (diffDias <= 30) return "reprocann-amarillo";
    return "";
  };

  useEffect(() => {
    fetchEspecialistas();
  }, []);

  return (
    <div className="admin">
      <NavDashboard />
      <div className="admin-container">
        <EspecialistasHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <EspecialistasVencimiento
          especialistasPorVencer={getEspecialistasPorVencer()}
          getReprocannClass={getReprocannClass}
        />

        <EspecialistasTable
          especialistas={filterEspecialistas()}
          setSelectedEspecialista={setSelectedEspecialista}
          setFormEspecialista={setFormEspecialista}
        />

        {selectedEspecialista && (
          <EditarEspecialistaModal
            especialista={selectedEspecialista}
            form={formEspecialista}
            setForm={setFormEspecialista}
            onClose={() => {
              setSelectedEspecialista(null);
              setFormEspecialista({
                especialidad: "",
                matricula: "",
                reprocann: {
                  status: "inicializado",
                  fechaAprobacion: "",
                  fechaVencimiento: "",
                },
              });
            }}
            onSave={handleUpdateEspecialista}
          />
        )}
      </div>
    </div>
  );
};

export default Especialistas;
