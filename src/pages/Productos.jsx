import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import MenuCards from "../components/MenuCards";
import Footer from "../components/Footer";
import ShoppingCart from "../components/ShoppingCart/ShoppingCart";
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";
import "../pages/css/Productos.css"; // Asegúrate de que la ruta sea correcta


const Productos = () => {
  const { token } = useAuthStore(); // Token desde Zustand auth store
  const {
    cart,
    isCartVisible,
    toggleCartVisibility,
    addToCart,
    removeFromCart,
    updateQuantity,
    checkoutCart,
    fetchCart, // usamos la función del store
  } = useCartStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener productos del backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:4000/products/getProducts");
        if (!res.ok) throw new Error("Error al traer los productos");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Obtener carrito del backend solo si hay token
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  const handleAddToCart = async (product) => {
    try {
      const normalizedProduct = {
        ...product,
        _id: product._id || product.id,
        id: product._id || product.id, // Asegurar ambos campos
      };
      console.log("Agregando producto al carrito:", normalizedProduct);
      await addToCart(normalizedProduct);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      // Aquí podrías mostrar un toast o alerta al usuario
      alert(error.message || "Error al agregar al carrito");
    }
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="productos-page-container">
      <NavBar
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        toggleCartVisibility={toggleCartVisibility}
      />

      <MenuCards
        products={products}
        onAddToCart={handleAddToCart}
        toggleCartVisibility={toggleCartVisibility}
      />

      {isCartVisible && (
        <ShoppingCart
          cart={cart}
          toggleCartVisibility={toggleCartVisibility}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          checkoutCart={checkoutCart}
        />
      )}

      <Footer />
    </div>
  );
};

export default Productos;
