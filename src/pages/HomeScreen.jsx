import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Cards from '../components/Cards';
import Sugerencia from '../components/Sugerencia';
import Footer from '../components/Footer';
import Especial from '../components/Especial.jsx';
import useAuthStore from '../store/authStore.js'; // ajustá la ruta si es diferente
import useCartStore from '../store/cartStore.js';
import ReprocanSection from '../components/ReprocanSection.jsx';
import AfterOfficeSection from '../components/AfterOfficeSection.jsx';

const HomeScreen = ({ addToCart }) => {
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user;
  const isPartner = user?.isPartner;
  const fetchCart = useCartStore(state => state.fetchCart);

    useEffect(() => {
    fetchCart(); // Asegura que el carrito se cargue al entrar al Home
  }, []);

  return (
    <div className="container">
      <Hero addToCart={addToCart} />
      
      {isLoggedIn && isPartner && (
        <>
          <Cards onAddToCart={addToCart} />
          <ReprocanSection />
          <AfterOfficeSection />
        </>
      )}
      
      <Especial addToCart={addToCart} />
      <Footer />
    </div>
  );
};

export default HomeScreen;
