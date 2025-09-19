import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import MenuCards from "../components/MenuCards";
import Footer from "../components/Footer";
import ShoppingCart from "../components/ShoppingCart/ShoppingCart";
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";
import useProductStore from "../store/productStore";
import "../pages/css/Productos.css";

const Productos = () => {
  const { token } = useAuthStore();
  const {
    cart,
    isCartVisible,
    toggleCartVisibility,
    addToCart,
    removeFromCart,
    updateQuantity,
    checkoutCart,
    fetchCart,
  } = useCartStore();

  // 🔹 USAR getActiveProducts() en lugar de products directamente
  const { getActiveProducts, loading, error, fetchProducts } = useProductStore();
  const activeProducts = getActiveProducts(); // 🔹 Esto devuelve solo productos activos con stock > 0

  // Obtener productos del backend usando el store
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Obtener carrito del backend solo si hay token
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  const handleAddToCart = async (product) => {
    try {
      // 🔹 ESTA VERIFICACIÓN YA NO ES NECESARIA porque activeProducts solo tiene stock > 0
      // Pero la dejamos por seguridad
      if (product.stock <= 0) {
        alert("Este producto no tiene stock disponible");
        return;
      }

      const normalizedProduct = {
        ...product,
        _id: product._id || product.id,
        id: product._id || product.id,
      };
      
      await addToCart(normalizedProduct);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
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

      {/* 🔹 PASAR activeProducts EN LUGAR DE products */}
      <MenuCards
        products={activeProducts} // 🔹 ESTA ES LA CORRECCIÓN IMPORTANTE
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