import React from "react";

const ProductForm = ({
  formValues,
  setFormValues,
  handleSubmit,
  editing,
  Cloudinary,
  handleUploadComplete,
  imageReset,
}) => (
  <form onSubmit={handleSubmit} className="productos-form">
    <input
      type="text"
      className="form-control"
      placeholder="Título"
      value={formValues.title}
      onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
      required
    />
    <input
      type="number"
      className="form-control"
      placeholder="Precio"
      value={formValues.price}
      onChange={(e) => setFormValues({ ...formValues, price: e.target.value })}
      required
    />
    <textarea
      className="form-control"
      placeholder="Descripción"
      value={formValues.description}
      onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
    />
    <input
      type="number"
      className="form-control"
      placeholder="Stock"
      value={formValues.stock}
      onChange={(e) => setFormValues({ ...formValues, stock: e.target.value })}
      required
    />
    <input
      type="text"
      className="form-control"
      placeholder="Categoría"
      value={formValues.category}
      onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
    />
    <Cloudinary onUploadComplete={handleUploadComplete} reset={imageReset} />
    <button type="submit" className="btn btn-submit">
      {editing ? "Actualizar" : "Crear"} Producto
    </button>
  </form>
);

export default ProductForm;