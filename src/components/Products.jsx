import React, { useEffect, useState, useCallback, useRef } from "react";
import { gsap } from "gsap";
import useAuthStore from "../store/authStore";
import useNotify from "../hooks/useToast";
import withGlobalLoader from "../utils/withGlobalLoader";
import NavDashboard from "./NavDashboard";
import Cloudinary from "./Cloudinary";
import ProductForm from "./Productos/ProductForm";
import ProductTable from "./Productos/ProductTable";
import "./css/productos.css";

const API_URL = "http://localhost:4000/products";

const Products = () => {
  const [productos, setProductos] = useState([]);
  const [formValues, setFormValues] = useState({
    title: "",
    image: "",
    description: "",
    stock: "",
    price: "",
    category: "",
  });
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageReset, setImageReset] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasAnimated = useRef(false);

  const token = useAuthStore((state) => state.token);
  const notify = useNotify();

  const fetchProductos = useCallback(
    () =>
      withGlobalLoader(async () => {
        const res = await fetch(`${API_URL}/getProducts`);
        const data = await res.json();
        setProductos(data);
        setLoading(false);
      }).catch((err) => {
        console.error("Error al obtener productos", err.message);
        notify(err.message, "error");
        setLoading(false);
      }),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API_URL}/updateProduct/${editingId}`
      : `${API_URL}/createProduct`;

    if (!token) {
      notify("Token no encontrado. Inicia sesión.", "error");
      return;
    }

    try {
      await withGlobalLoader(async () => {
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formValues),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al guardar producto");

        await fetchProductos();
        notify(editing ? "Producto actualizado" : "Producto creado", "success");

        setFormValues({
          title: "",
          image: "",
          description: "",
          stock: "",
          price: "",
          category: "",
        });
        setEditing(false);
        setImageReset(true);
        setTimeout(() => setImageReset(false), 100);
      });
    } catch (error) {
      console.error("Error:", error.message);
      notify(error.message || "Error al guardar producto", "error");
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      await withGlobalLoader(async () => {
        const res = await fetch(`${API_URL}/toggle-status/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al cambiar el estado");

        setProductos((prev) =>
          prev.map((prod) => (prod._id === id ? { ...prod, isActive: !prod.isActive } : prod))
        );
        notify(`Producto ${data.product.isActive ? "activado" : "desactivado"}`, "success");
      });
    } catch (err) {
      console.error(err.message);
      notify(err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;

    try {
      await withGlobalLoader(async () => {
        const res = await fetch(`${API_URL}/deleteProduct/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al eliminar producto");

        await fetchProductos();
        notify("Producto eliminado", "success");
      });
    } catch (error) {
      console.error(error.message);
      notify("Error al eliminar producto", "error");
    }
  };

  const handleEdit = (producto) => {
    setFormValues(producto);
    setEditing(true);
    setEditingId(producto._id);
  };

  const handleUploadComplete = (url) => {
    setFormValues({ ...formValues, image: url });
  };

  // GSAP Animation
  useEffect(() => {
    if (hasAnimated.current || loading) return;

    hasAnimated.current = true;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // 1. Animate productos-container
    tl.fromTo(
      ".productos-container",
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.5 }
    );

    // 2. Animate h5
    tl.fromTo(
      ".productos-container h5",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.3"
    );

    // 3. Animate productos-form inputs
    tl.fromTo(
      ".productos-form .form-control",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 },
      "-=0.2"
    );

    // 4. Animate orders-table
    tl.fromTo(
      ".orders-table",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.5 },
      "-=0.2"
    );

    return () => {
      tl.kill();
    };
  }, [loading]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  if (loading && productos.length === 0) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="dashboard products">
      <NavDashboard />
      <div className="productos-container">
        <h5>Gestión de Productos</h5>

        <ProductForm
          formValues={formValues}
          setFormValues={setFormValues}
          handleSubmit={handleSubmit}
          editing={editing}
          Cloudinary={Cloudinary}
          handleUploadComplete={handleUploadComplete}
          imageReset={imageReset}
        />

        <ProductTable
          productos={productos}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleToggleEstado={handleToggleEstado}
        />
      </div>
    </div>
  );
};

export default Products;