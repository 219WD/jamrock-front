import React, { useCallback, useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useNotify from "../hooks/useToast";
import NavDashboard from "../components/NavDashboard";
import Filters from "../components/Consultorio/Filters.jsx";
import TurnosList from "../components/Consultorio/TurnosList.jsx";
import TurnoDetail from "../components/Consultorio/TurnoDetail.jsx";
import ProductosModal from "../components/Consultorio/ProductosModal.jsx";
import "./css/ConsultorioPanel.css";
import withGlobalLoader from "../utils/withGlobalLoader.js";

const Consultorio = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("confirmado");
  const [dateOrder, setDateOrder] = useState("asc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formaPago, setFormaPago] = useState("efectivo");
  const [notasConsulta, setNotasConsulta] = useState("");
  const [showProductosModal, setShowProductosModal] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [precioConsulta, setPrecioConsulta] = useState(0);
  const [nuevoDocumento, setNuevoDocumento] = useState({
    nombre: "",
    tipo: "receta",
  });

  const notify = useNotify();

  const fetchTurnos = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/turnos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Error response from fetchTurnos:", text);
        throw new Error(`Error ${res.status}: ${text}`);
      }
      const data = await res.json();
      setTurnos(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Fetch turnos error:", err.message);
      setError(err.message);
      notify("Error al obtener turnos: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      setLoading(true);
      console.log("Fetching productos with token:", token);
      const res = await fetch("http://localhost:4000/products/getProducts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Error response from fetchProductos:", text);
        throw new Error(`Error ${res.status}: ${text}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error("Productos response is not an array:", data);
        throw new Error("Formato de respuesta de productos inválido");
      }
      setProductosDisponibles(data.filter((p) => p.isActive) || []);
      setError(null);
    } catch (err) {
      console.error("Fetch productos error:", err.message);
      setError(err.message);
      notify("Error al obtener productos: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPacienteData = async (pacienteId) => {
    try {
      setLoading(true);
      console.log("Fetching paciente data for ID:", pacienteId);
      const res = await fetch(`http://localhost:4000/pacientes/${pacienteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Error response from fetchPacienteData:", text);
        throw new Error(`Error ${res.status}: ${text}`);
      }
      const data = await res.json();
      console.log("Paciente data fetched:", data);

      // Devuelve data.data en lugar de solo data
      return data.data;
    } catch (err) {
      console.error("Fetch paciente data error:", err.message);
      notify("Error al obtener datos del paciente: " + err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductos = async () => {
    try {
      setLoading(true);
      console.log("Adding productos:", selectedProducts);
      const res = await fetch(
        `http://localhost:4000/turnos/${selectedTurno._id}/agregar-productos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productos: selectedProducts,
            formaPago,
            notasConsulta,
          }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("Error response from handleAddProductos:", text);
        throw new Error(`Error ${res.status}: ${text}`);
      }
      const data = await res.json();
      console.log("Add productos response:", data);
      // Notify with the first product's name (or all if multiple)
      const productNames = selectedProducts
        .map((p) => p.nombreProducto)
        .join(", ");
      notify(`${productNames} recetado(s) al turno`, "success");
      // Update selectedTurno with the new data instead of resetting
      setSelectedTurno((prev) => ({ ...prev, ...data.data }));
      setSelectedProducts([]);
    } catch (err) {
      console.error("Add productos error:", err.message);
      notify("Error al agregar productos: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHistorial = async () => {
    try {
      setLoading(true);

      const productosRecetados = selectedProducts.map((p) => ({
        nombre: p.nombreProducto,
        cantidad: p.cantidad,
        dosis: p.dosis || "",
      }));

      if (
        !selectedTurno.consulta?.productos ||
        selectedTurno.consulta.productos.length === 0
      ) {
        await handleAddProductos();
      }

      const res = await fetch(
        `http://localhost:4000/pacientes/${selectedTurno.pacienteId._id}/historial`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            turnoId: selectedTurno._id,
            diagnostico,
            tratamiento,
            observaciones,
            productosRecetados,
            documentos,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Error response from handleSaveHistorial:", text);
        throw new Error(`Error ${res.status}: ${text}`);
      }

      const data = await res.json();
      notify("Consulta guardada en el historial del paciente", "success");
      await fetchTurnos();
      resetForm();
    } catch (err) {
      console.error("Save historial error:", err.message);
      notify("Error al guardar historial: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTurno = async () => {
    try {
      setGuardando(true);

      // 1. Guardar productos si hay
      if (
        selectedProducts.length > 0 &&
        (!selectedTurno.consulta?.productos ||
          selectedTurno.consulta.productos.length === 0)
      ) {
        await handleAddProductos();
      }

      // 2. Guardar historial
      await handleSaveHistorial();

      // 3. Completar turno
      const res = await fetch(
        `http://localhost:4000/turnos/medico/${selectedTurno._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado: "completado",
            precioConsulta: precioConsulta,
            notasConsulta,
            diagnostico,
            tratamiento,
            observaciones,
          }),
        }
      );

      if (!res.ok) {
        let errorMsg = "Error al completar turno";
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
        } catch {
          const text = await res.text();
          errorMsg = text.includes("<!DOCTYPE html>")
            ? "Error en el servidor"
            : text;
        }
        throw new Error(errorMsg);
      }

      notify("Turno completado exitosamente", "success");
      await fetchTurnos();
      resetForm();
    } catch (err) {
      console.error("Error completando turno:", err);
      notify(err.message || "Error al completar turno", "error");
    } finally {
      setGuardando(false);
    }
  };

  const resetForm = () => {
    setSelectedTurno(null);
    setSelectedProducts([]);
    setDiagnostico("");
    setTratamiento("");
    setObservaciones("");
    setDocumentos([]);
    setNuevoDocumento({ nombre: "", tipo: "receta" });
  };

  const handleDocumentUploadComplete = (url) => {
    setDocumentos((prev) => [
      ...prev,
      {
        ...nuevoDocumento,
        url,
        fecha: new Date().toISOString(),
      },
    ]);
    setNuevoDocumento({ nombre: "", tipo: "receta" });
  };

  const handleRemoveDocument = (index) => {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
  };

  const filterTurnos = () => {
    return turnos
      .filter((turno) => {
        if (user.isMedico) {
          const medicoId = turno.especialistaId?.userId?._id;
          if (medicoId !== user._id) return false;
        }

        const query = searchQuery.toLowerCase();
        const pacienteNombre = turno.pacienteId?.fullName?.toLowerCase() || "";
        const especialistaNombre =
          turno.especialistaId?.userId?.name?.toLowerCase() || "";
        const motivo = turno.motivo?.toLowerCase() || "";

        const matchesSearch =
          pacienteNombre.includes(query) ||
          especialistaNombre.includes(query) ||
          motivo.includes(query);

        const matchesStatus =
          statusFilter === "todos" || turno.estado === statusFilter;

        const fechaTurno = new Date(turno.fecha);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo + "T23:59:59") : null;

        const matchesDate =
          (!fromDate || fechaTurno >= fromDate) &&
          (!toDate || fechaTurno <= toDate);

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  };

  const handleProductSelect = (producto) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.productoId === producto._id);
      if (existing) {
        return prev.map((p) =>
          p.productoId === producto._id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      } else {
        return [
          ...prev,
          {
            productoId: producto._id,
            cantidad: 1,
            precioUnitario: producto.price || 0,
            nombreProducto: producto.title || "Producto desconocido",
            dosis: "",
          },
        ];
      }
    });
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.productoId !== productId)
    );
  };

  const handleGuardarYCerrar = async () => {
    try {
      setGuardando(true);
      await handleSaveHistorial();
      resetForm();
      notify("Consulta guardada y cerrada exitosamente", "success");
    } catch (err) {
      console.error("Guardar y cerrar error:", err.message);
      notify("Error al guardar y cerrar: " + err.message, "error");
    } finally {
      setGuardando(false);
    }
  };

  const updateProductQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productoId === productId ? { ...p, cantidad: newQuantity } : p
      )
    );
  };

  const updateProductDosis = (productId, newDosis) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productoId === productId ? { ...p, dosis: newDosis } : p
      )
    );
  };

  const calculateTotal = () => {
    const totalProductos = selectedProducts.reduce(
      (total, item) =>
        total + (item.precioUnitario || 0) * (item.cantidad || 0),
      0
    );
    return totalProductos + (precioConsulta || 0);
  };

  useEffect(() => {
    fetchTurnos();
    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedTurno?.pacienteId?._id) {
        const pacienteData = await fetchPacienteData(
          selectedTurno.pacienteId._id
        );
        if (pacienteData) {
          setSelectedTurno((prev) => ({
            ...prev,
            pacienteId: pacienteData, // Usa los datos directamente
          }));
        }
      }
    };
    fetchData();
  }, [selectedTurno?.pacienteId?._id]);

  return (
    <div className="consultorio-panel">
      <NavDashboard />
      <div className="consultorio-container">
        <div className="title-admin">
          <h1>Consultorio Médico</h1>
          <p>Gestiona las consultas y productos recetados</p>
        </div>

        {error && (
          <div className="error">
            {error.includes("404")
              ? "No se encontró el endpoint solicitado. Verifica la configuración del servidor."
              : error}
          </div>
        )}

        <Filters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateOrder={dateOrder}
          setDateOrder={setDateOrder}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />

        <div className="consultorio-content">
          <TurnosList
            turnos={filterTurnos()}
            loading={loading}
            error={error}
            selectedTurno={selectedTurno}
            setSelectedTurno={setSelectedTurno}
            setDiagnostico={setDiagnostico}
            setTratamiento={setTratamiento}
            setObservaciones={setObservaciones}
            setDocumentos={setDocumentos}
          />

          <TurnoDetail
            selectedTurno={selectedTurno}
            selectedProducts={selectedProducts}
            formaPago={formaPago}
            setFormaPago={setFormaPago}
            notasConsulta={notasConsulta}
            setNotasConsulta={setNotasConsulta}
            diagnostico={diagnostico}
            setDiagnostico={setDiagnostico}
            tratamiento={tratamiento}
            setTratamiento={setTratamiento}
            observaciones={observaciones}
            setObservaciones={setObservaciones}
            documentos={documentos}
            nuevoDocumento={nuevoDocumento}
            setNuevoDocumento={setNuevoDocumento}
            handleDocumentUploadComplete={handleDocumentUploadComplete}
            handleRemoveDocument={handleRemoveDocument}
            setShowProductosModal={setShowProductosModal}
            precioConsulta={precioConsulta}
            setPrecioConsulta={setPrecioConsulta}
            updateProductQuantity={updateProductQuantity}
            updateProductDosis={updateProductDosis}
            calculateTotal={calculateTotal}
            handleSaveHistorial={handleSaveHistorial}
            handleGuardarYCerrar={handleGuardarYCerrar}
            handleCompleteTurno={handleCompleteTurno}
            loading={loading}
            guardando={guardando}
          />
        </div>

        <ProductosModal
          showProductosModal={showProductosModal}
          setShowProductosModal={setShowProductosModal}
          productosDisponibles={productosDisponibles}
          handleProductSelect={handleProductSelect}
        />
      </div>
    </div>
  );
};

export default Consultorio;
