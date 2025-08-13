import React from "react";
import "../pages/css/AdminPanel.css";
import useLoadingStore from "../store/loadingStore";

const GlobalLoader = ({ text = "Cargando..." }) => {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;
  
  return (
    <div className="admin-loading">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
};

export default GlobalLoader;
