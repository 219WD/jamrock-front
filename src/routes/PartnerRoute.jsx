// src/routes/PartnerRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js'; // Ajusta la ruta según tu estructura de carpetas

const PartnerRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const isPartner = user?.isPartner;

  // Si no está logueado o no es partner, redirige a Home o Login
  if (!user || !isPartner) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PartnerRoute;
