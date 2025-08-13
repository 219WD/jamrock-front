import React, { useState } from "react";
import "./css/NavBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faBars } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import LogoSinFondo from "../assets/logo png.png";
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";

const NavBar = ({ cartCount, toggleCartVisibility }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isLoggedIn = !!user;
  const isPartner = user?.isPartner;
  const fetchCart = useCartStore((state) => state.fetchCart);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src={LogoSinFondo} alt="Logo" className="logoNav" />
        </Link>
      </div>
      <button className="menu-toggle" onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBars} />
      </button>
      <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
        {/* Solo visible si el usuario es partner */}
        {user?.isPartner && <Link to="/productos">Productos</Link>}

        <Link to="/about">Acerca de Nosotros</Link>

        {!user ? (
          <>
            <Link to="/register">Registro</Link>
            <Link to="/login">Iniciar Sesión</Link>
          </>
        ) : (
          <>
            {user.isAdmin ? (
              <Link to="/admin">Admin</Link>
            ) : (
              <Link to="/perfil">Perfil</Link>
            )}
            <button onClick={handleLogout} className="logout-button">
              Cerrar Sesión
            </button>
          </>
        )}
      </nav>
      {isLoggedIn && isPartner && (
        <>
          <button className="cart-button" onClick={toggleCartVisibility}>
            <FontAwesomeIcon icon={faShoppingCart} />
            <span className="cart-count">{cartCount}</span>
          </button>
        </>
      )}
    </header>
  );
};

export default NavBar;
