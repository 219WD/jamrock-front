import { useState } from 'react';

export const usePayment = () => {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [modalInfo, setModalInfo] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    phone: ''
  });

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openModal = (info) => {
    setModalInfo(info);
  };

  const closeModal = () => {
    setModalInfo(null);
  };

  return {
    showPaymentOptions,
    setShowPaymentOptions,
    modalInfo,
    openModal,
    closeModal,
    customerInfo,
    handleCustomerInfoChange
  };
};