import React from "react";
import Card from "./Card";
import "./css/MenuCards.css";

const MenuCards = ({ products, onAddToCart }) => (
  <section className="menu-cards-section">
    <h2>Nuestros Productos</h2>
    <div className="menu-cards-grid">
      {products.map((item) => (
        <Card
          key={item._id}
          id={item._id}
          _id={item._id}
          image={item.image}
          title={item.title} // Asegúrate que coincida con tu modelo
          description={item.description}
          rating={item.rating}
          price={item.price}
          product={item}
          onAddToCart={onAddToCart}
        />
      ))}

    </div>
  </section>
);

export default MenuCards;
