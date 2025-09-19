import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import "../components/css/Individual.css";
import NavBar from "../components/NavBar";
import ShoppingCart from "../components/ShoppingCart/ShoppingCart";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";

const Individual = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useAuthStore();
  const {
    cart,
    isCartVisible,
    toggleCartVisibility,
    addToCart,
    removeFromCart,
    updateQuantity,
    fetchCart,
  } = useCartStore();

  // Fetch producto individual
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/products/getProducts/${id}`
        );
        if (!res.ok) throw new Error("Producto no encontrado");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch carrito si hay token
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  const handleAddToCart = async () => {
    if (!product) return;
    const normalizedProduct = {
      ...product,
      _id: product._id || product.id,
      id: product._id || product.id,
    };
    try {
      await addToCart(normalizedProduct);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert("Error al agregar al carrito");
    }
  };

  if (loading) return <p className="individual-loading">Cargando producto...</p>;
  if (error) return <p className="individual-error">{error}</p>;
  if (!product) return <p className="individual-error">Producto no encontrado</p>;

  return (
    <div className="individual-page">
      <NavBar
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        toggleCartVisibility={toggleCartVisibility}
      />

      {isCartVisible && (
        <ShoppingCart
          cart={cart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          toggleCartVisibility={toggleCartVisibility}
        />
      )}

      <section className="individual-container">
        <section className="individual-content">
          <div className="individual-img-container">
            <img
              src={product.image}
              alt={product.title}
              className="individual-img"
            />
          </div>

          <div className="individual-text">
            <h1>{product.title}</h1>
            <p className="individual-price">${product.price?.toLocaleString()}</p>

            <div className="individual-metadata">
              <p>
                <strong>Categoría:</strong> {product.category}
              </p>
              <p>
                <strong>Stock:</strong> {product.stock}
              </p>
              <p>
                <strong>Rating:</strong> ⭐ {product.rating} (
                {product.numReviews} reseñas)
              </p>
            </div>

            <p className="individual-description">{product.description}</p>

            <div className="individual-buttons">
              <button
                className="add-to-cart-button-individual"
                onClick={handleAddToCart}
              >
                <FontAwesomeIcon icon={faCartShopping} /> Agregar al Carrito
              </button>
              <Link to="/productos" className="view-button-individual">
                Ver Más Productos
              </Link>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};

export default Individual;