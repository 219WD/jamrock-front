import React, { useState, useEffect, useRef } from "react";
import Card from "./Card";
import "./css/Cards.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registrar plugins de GSAP
gsap.registerPlugin(ScrollTrigger);

const Cards = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:4000/products/getProducts");
        if (!response.ok) throw new Error("Error al obtener productos");
        
        const data = await response.json();

        const filtered = data.filter((item) => {
          if (!item || typeof item !== 'object') return false;
          if (item.isActive === false) return false;
          if (typeof item.rating !== 'number' || item.rating < 3) return false;
          if (typeof item.stock !== 'number' || item.stock <= 0) return false;
          return true;
        });
        
        setProducts(filtered);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Animaciones con GSAP
  useEffect(() => {
    if (products.length > 0 && !isLoading) {
      const ctx = gsap.context(() => {
        // Animación del título
        gsap.fromTo(titleRef.current, 
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              trigger: titleRef.current,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          }
        );

        // Animación de las cards
        cardsRef.current.forEach((card, index) => {
          if (card) {
            gsap.fromTo(card,
              { y: 100, opacity: 0, rotationY: -15 },
              {
                y: 0,
                opacity: 1,
                rotationY: 0,
                duration: 0.8,
                delay: index * 0.2,
                scrollTrigger: {
                  trigger: card,
                  start: "top 85%",
                  toggleActions: "play none none none"
                }
              }
            );
          }
        });
      }, sectionRef);

      return () => ctx.revert();
    }
  }, [products, isLoading]);

  const getVisibleCards = () => {
    if (products.length <= 3) return products;
    
    const visibleCards = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % products.length;
      visibleCards.push(products[index]);
    }
    return visibleCards;
  };

  const handleNext = () => {
    if (products.length <= 3) return;
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    if (products.length <= 3) return;
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  if (isLoading) {
    return (
      <section ref={sectionRef} className="main-cards-container">
        <div className="loading-cards">
          <div className="loading-spinner"></div>
          <p>Cargando productos destacados...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section ref={sectionRef} className="main-cards-container">
        <h2 ref={titleRef}>Productos Estrella</h2>
        <p>Pronto tendremos nuevos productos destacados disponibles.</p>
      </section>
    );
  }

  const visibleCards = getVisibleCards();

  return (
    <section ref={sectionRef} className="main-cards-container">
      <div className="cards-content">
        <h2 ref={titleRef} className="section-title">
          <span className="title-accent">Productos</span> Estrella
        </h2>
        
        <p className="section-subtitle">
          Descubre nuestros productos mejor valorados y más populares
        </p>

        <div className="slider-container">
          {products.length > 3 && (
            <button onClick={handlePrev} className="slider-arrow prev">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          <div className="cards-wrapper">
            <div className="main-cards">
              {visibleCards.map((item, index) => (
                <div
                  key={item._id || item.id}
                  ref={el => cardsRef.current[index] = el}
                  className={`card-wrapper ${index === 1 ? "center-card" : ""}`}
                >
                  <Card
                    id={item._id || item.id}
                    image={item.image}
                    title={item.title}
                    description={item.description}
                    rating={item.rating}
                    price={item.price}
                    stock={item.stock}
                    onAddToCart={() => onAddToCart(item)}
                    className={index === 1 ? "medio" : ""}
                  />
                </div>
              ))}
            </div>
          </div>

          {products.length > 3 && (
            <button onClick={handleNext} className="slider-arrow next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        <div className="view-all-container">
          <button className="view-all-btn">
            Ver todos los productos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Cards;