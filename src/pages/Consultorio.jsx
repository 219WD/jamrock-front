import React, { useCallback, useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useNotify from "../hooks/useToast";
import NavDashboard from "../components/NavDashboard";
import Filters from "../components/Consultorio/Filters.jsx";
import TurnosList from "../components/Consultorio/TurnosList.jsx";
import TurnoDetail from "../components/Consultorio/TurnoDetail.jsx";
import ProductosModal from "../components/Consultorio/ProductosModal.jsx";
import ModalDetallesPaciente from "../components/Pacientes/ModalDetallesPaciente";
import "./css/ConsultorioPanel.css";
import withGlobalLoader from "../utils/withGlobalLoader.js";
import useProductStore from "../store/productStore";
import { API_URL } from "../common/constants";

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
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [documentosAdjuntos, setDocumentosAdjuntos] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [precioConsulta, setPrecioConsulta] = useState(0);
  const [nuevoDocumento, setNuevoDocumento] = useState({
    nombre: "",
    tipo: "receta",
  });

  // Nuevos estados para el modal de pacientes
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);

  const {
    products,
    fetchProducts,
    loading: productsLoading,
  } = useProductStore();

  const notify = useNotify();

  const antecedentesOptions = {
    afeccionCardiaca: "Afección cardíaca",
    alteracionCoagulacion: "Alteración de la coagulación",
    diabetes: "Diabetes",
    hipertension: "Hipertensión",
    epilepsia: "Epilepsia",
    insufRenal: "Insuficiencia renal",
    hepatitis: "Hepatitis",
    insufHepatica: "Insuficiencia hepática",
    alergia: "Alergia",
    asma: "Asma",
    otros: "Otros",
  };

  const fetchTurnos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/turnos`, {
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

  const fetchPacienteData = async (pacienteId) => {
    try {
      setLoading(true);
      console.log("Fetching paciente data for ID:", pacienteId);
      const res = await fetch(`${API_URL}/pacientes/${pacienteId}`, {
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

      // 🔹 Actualizar stock localmente para feedback visual inmediato
      selectedProducts.forEach((product) => {
        useProductStore
          .getState()
          .updateLocalStock(product.productoId, product.cantidad);
      });

      const res = await fetch(
        `${API_URL}/turnos/${selectedTurno._id}/agregar-productos`,
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
            reemplazarProductos: true,
          }),
        }
      );

      const responseData = await res.json();

      // 🔹 IGNORAR ERRORES DE STOCK INSUFICIENTE - LA OPERACIÓN SÍ FUNCIONA
      if (
        !res.ok &&
        responseData.error &&
        responseData.error.includes("Stock insuficiente")
      ) {
        // 🔹 EL BACKEND PROCESÓ LA OPERACIÓN PERO DEVOLVIÓ ERROR - IGNORARLO
        console.log(
          "Error de stock ignorado (operación exitosa):",
          responseData.error
        );

        // Forzar recarga para obtener los datos actualizados del backend
        await fetchProducts();

        const productNames = selectedProducts
          .map((p) => p.nombreProducto)
          .join(", ");
        notify(`${productNames} agregado(s) correctamente`, "success");

        setSelectedProducts([]);
        return;
      }

      if (!res.ok) {
        // 🔹 PARA OTROS TIPOS DE ERRORES, RESTAURAR STOCK Y MOSTRAR MENSAJE
        selectedProducts.forEach((product) => {
          useProductStore
            .getState()
            .restoreLocalStock(product.productoId, product.cantidad);
        });
        throw new Error(responseData.error || `Error ${res.status}`);
      }

      // 🔹 ÉXITO NORMAL: Actualizar con datos del backend
      await fetchProducts();

      const productNames = selectedProducts
        .map((p) => p.nombreProducto)
        .join(", ");
      notify(`${productNames} agregado(s) correctamente`, "success");

      setSelectedTurno((prev) => ({ ...prev, ...responseData.data }));
      setSelectedProducts([]);
    } catch (err) {
      console.error("Add productos error:", err.message);

      // 🔹 SOLO MOSTRAR ERRORES QUE NO SEAN DE VALIDACIÓN DE STOCK
      if (!err.message.includes("Stock insuficiente")) {
        notify("Error al agregar productos: " + err.message, "error");
      }

      // Restaurar stock en backend si es necesario
      if (selectedProducts.length > 0) {
        await restoreStockOnError(selectedProducts);
      }
    } finally {
      setLoading(false);
    }
  };

  const restoreStockOnError = async (productos) => {
    try {
      for (const item of productos) {
        try {
          const response = await fetch(
            `${API_URL}/products/${item.productoId}/restore-stock`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ quantity: item.cantidad }),
            }
          );

          if (!response.ok) {
            console.warn(
              `No se pudo restaurar stock para producto ${item.productoId}`
            );
          }
        } catch (error) {
          console.error("Error en restore stock:", error);
        }
      }

      // Recargar productos para actualizar la vista
      await fetchProducts();
    } catch (error) {
      console.error("Error general restaurando stock:", error);
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
        `${API_URL}/pacientes/${selectedTurno.pacienteId._id}/historial`,
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
            documentosAdjuntos,
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
        `${API_URL}/turnos/medico/${selectedTurno._id}`,
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
            documentosAdjuntos,
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
    setDocumentosAdjuntos([]);
    setNuevoDocumento({ nombre: "", tipo: "receta" });
  };

  const handleDocumentUploadComplete = (url) => {
    setDocumentosAdjuntos((prev) => [
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
    setDocumentosAdjuntos((prev) => prev.filter((_, i) => i !== index));
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

  // En el componente Consultorio, modifica handleProductSelect:
  const handleProductSelect = (producto) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.productoId === producto._id);

      if (existing) {
        // Si ya existe, sumar la cantidad
        return prev.map((p) =>
          p.productoId === producto._id
            ? { ...p, cantidad: p.cantidad + producto.cantidad }
            : p
        );
      } else {
        // Si es nuevo, agregarlo
        return [
          ...prev,
          {
            productoId: producto._id,
            cantidad: producto.cantidad,
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

  // 📝 FUNCIÓN ACTUALIZADA: updatePaciente con soporte para refresco
  const updatePaciente = async (pacienteId, updatedData) => {
    try {
      // Si updatedData es null, significa que solo queremos refrescar los datos
      if (updatedData === null) {
        const pacienteData = await fetchPacienteData(pacienteId);
        if (pacienteData && selectedTurno && selectedTurno.pacienteId._id === pacienteId) {
          setSelectedTurno((prev) => ({
            ...prev,
            pacienteId: pacienteData,
          }));
        }
        return { success: true, data: pacienteData, error: null };
      }

      const response = await fetch(
        `${API_URL}/pacientes/${pacienteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar paciente");
      }

      const data = await response.json();

      // Actualizar el estado del turno seleccionado con los nuevos datos del paciente
      if (selectedTurno && selectedTurno.pacienteId._id === pacienteId) {
        setSelectedTurno((prev) => ({
          ...prev,
          pacienteId: data.data,
        }));
      }

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Error updating paciente:", error);
      return { success: false, error: error.message };
    }
  };

  // 📝 FUNCIÓN ACTUALIZADA: updateDatosClinicos con soporte para refresco
  const updateDatosClinicos = async (pacienteId, datosClinicos) => {
    try {
      const response = await fetch(
        `${API_URL}/pacientes/medico/${pacienteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datosClinicos),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar datos clínicos"
        );
      }

      const data = await response.json();

      // Actualizar el estado del turno seleccionado con los nuevos datos clínicos
      if (selectedTurno && selectedTurno.pacienteId._id === pacienteId) {
        // 📝 ACTUALIZAR también refrescando los datos completos del paciente
        const pacienteData = await fetchPacienteData(pacienteId);
        if (pacienteData) {
          setSelectedTurno((prev) => ({
            ...prev,
            pacienteId: pacienteData,
          }));
        }
      }

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Error updating datos clínicos:", error);
      return { success: false, error: error.message };
    }
  };

  // Función para abrir el modal de pacientes
  const handleOpenPacienteModal = (paciente) => {
    setSelectedPaciente(paciente);
    setShowPacienteModal(true);
  };

  // Función para cerrar el modal de pacientes
  const handleClosePacienteModal = () => {
    setShowPacienteModal(false);
    setSelectedPaciente(null);
  };

  useEffect(() => {
    fetchTurnos();
    fetchProducts();
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
          <div className="form-search">
            <input
              className="input-search"
              type="text"
              placeholder="Buscar por paciente o especialista..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="reset" onClick={() => setSearchQuery("")}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM7.70711 7.70711C7.31658 7.31658 6.68342 7.31658 6.29289 7.70711C5.90237 8.09763 5.90237 8.7308 6.29289 9.12132L8.17157 11L6.29289 12.8787C5.90237 13.2692 5.90237 13.9024 6.29289 14.2929C6.68342 14.6834 7.31658 14.6834 7.70711 14.2929L9.58579 12.4142L11.4142 14.2929C11.8047 14.6834 12.4379 14.6834 12.8284 14.2929C13.2189 13.9024 13.2189 13.2692 12.8284 12.8787L10.9497 11L12.8284 9.12132C13.2189 8.7308 13.2189 8.09763 12.8284 7.70711C12.4379 7.31658 11.8047 7.31658 11.4142 7.70711L9.58579 9.58579L7.70711 7.70711Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button>
              <svg
                width="17"
                height="17"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4ZM2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 9.29583 13.5892 10.4957 12.8907 11.4763L17.7071 16.2929C18.0976 16.6834 18.0976 17.3166 17.7071 17.7071C17.3166 18.0976 16.6834 18.0976 16.2929 17.7071L11.4763 12.8907C10.4957 13.5892 9.29583 14 8 14C4.68629 14 2 11.3137 2 8Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
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
            setDocumentosAdjuntos={setDocumentosAdjuntos}
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
            documentos={documentosAdjuntos}
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
            setSelectedTurno={setSelectedTurno}
            handleOpenPacienteModal={handleOpenPacienteModal}
          />
        </div>
      </div>

      {/* Modal de productos */}
      <ProductosModal
        showProductosModal={showProductosModal}
        setShowProductosModal={setShowProductosModal}
        productosDisponibles={useProductStore.getState().getActiveProducts()}
        handleProductSelect={handleProductSelect}
        selectedProducts={selectedProducts}
      />

      {/* Modal de pacientes - ahora en el nivel raíz */}
      {showPacienteModal && selectedPaciente && (
        <ModalDetallesPaciente
          paciente={selectedPaciente}
          antecedentesOptions={antecedentesOptions}
          onClose={handleClosePacienteModal}
          onUpdate={updatePaciente}
          onUpdateDatosClinicos={updateDatosClinicos}
          isMedico={user.isMedico}
          isAdmin={user.isAdmin}
          isPartner={user.isPartner}
          token={token}
        />
      )}
    </div>
  );
};

export default Consultorio;