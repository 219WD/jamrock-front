import React, { useState, useEffect } from "react";
import Card from "./Card";
import "./css/Cards.css";

const Cards = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:4000/products/getProducts"); // Asegurate que este endpoint esté correcto
        const data = await response.json();

        // Filtrar por rating >= 3
        const filtered = data.filter((item) => item.rating >= 3);
        setProducts(filtered);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    fetchProducts();
  }, []);

  // Calcular las 3 tarjetas visibles
  const getVisibleCards = () => {
    const visibleCards = [];
    for (let i = 0; i < 3; i++) {
      if (products.length === 0) break;
      visibleCards.push(products[(currentIndex + i) % products.length]);
    }
    return visibleCards;
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % products.length;
    setCurrentIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + products.length) % products.length;
    setCurrentIndex(prevIndex);
  };

  return (
    <section className="main-cards-container">
      <h2>Productos Estrella</h2>
      <p>Estos son algunos de nuestros productos mejor valorados.</p>
      <div className="slider-controls">
        <button onClick={handlePrev} className="arrow">←</button>
        <div className="main-cards">
          {getVisibleCards().map((item, index) => (
            <Card
              key={item._id || item.id}
              id={item._id || item.id}
              image={item.image}
              title={item.title}
              description={item.description}
              rating={item.rating}
              price={item.price}
              onAddToCart={() => onAddToCart(item)}
              className={`card ${index === 1 ? "medio" : ""}`}
            />
          ))}
        </div>
        <button onClick={handleNext} className="arrow">→</button>
      </div>
    </section>
  );
};

export default Cards;
