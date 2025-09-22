import React from "react";
import useLoadingStore from "../store/loadingStore";

const GlobalLoader = ({ text = "Cargando..." }) => {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      color: '#00ff00',
      fontSize: '24px',
      fontFamily: '"Zen Dots", sans-serif'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #00ff00',
          borderTop: '5px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div>{text}</div>
      </div>
    </div>
  );
};

export default GlobalLoader;