import React, { useState, useEffect } from "react";
import Cloudinary from "../Cloudinary";

const EditarProductoModal = ({ producto, onClose, onSubmit }) => {
  const [formValues, setFormValues] = useState({
    title: "",
    image: "",
    description: "",
    stock: "",
    price: "",
    category: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (producto) {
      setFormValues({
        title: producto.title || "",
        image: producto.image || "",
        description: producto.description || "",
        stock: producto.stock || "",
        price: producto.price || "",
        category: producto.category || "",
      });
    }
  }, [producto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleUploadComplete = (url) => {
    setFormValues({ ...formValues, image: url });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formValues.title.trim()) newErrors.title = "El título es requerido";
    if (!formValues.description.trim()) newErrors.description = "La descripción es requerida";
    if (!formValues.stock || formValues.stock < 0) newErrors.stock = "Stock inválido";
    if (!formValues.price || formValues.price <= 0) newErrors.price = "Precio inválido";
    if (!formValues.category.trim()) newErrors.category = "La categoría es requerida";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ ...formValues, _id: producto._id });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Editar Producto</h2>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          <div className="form-group">
            <label>Título:</label>
            <input
              type="text"
              name="title"
              value={formValues.title}
              onChange={handleChange}
              className={errors.title ? "error" : ""}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Imagen:</label>
            <Cloudinary 
              onUploadComplete={handleUploadComplete}
              folder="products"
              existingImage={formValues.image}
            />
            {formValues.image && (
              <div style={{marginTop: '10px'}}>
                <img 
                  src={formValues.image} 
                  alt="Vista previa" 
                  style={{maxWidth: '100px', maxHeight: '100px'}}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              name="description"
              value={formValues.description}
              onChange={handleChange}
              className={errors.description ? "error" : ""}
              rows="3"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>Stock:</label>
            <input
              type="number"
              name="stock"
              value={formValues.stock}
              onChange={handleChange}
              className={errors.stock ? "error" : ""}
              min="0"
            />
            {errors.stock && <span className="error-text">{errors.stock}</span>}
          </div>

          <div className="form-group">
            <label>Precio:</label>
            <input
              type="number"
              name="price"
              value={formValues.price}
              onChange={handleChange}
              className={errors.price ? "error" : ""}
              min="0"
              step="0.01"
            />
            {errors.price && <span className="error-text">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label>Categoría:</label>
            <input
              type="text"
              name="category"
              value={formValues.category}
              onChange={handleChange}
              className={errors.category ? "error" : ""}
            />
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn close" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="modal-btn">
              Actualizar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarProductoModal;