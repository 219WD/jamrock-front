import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import PaidStatus from "./PaidStatus";
import CartItem from "./CartItem";
import TotalAndPayButton from "./TotalAndPayButton";
import PaymentOptions from "./PaymentOptions";
import DeliveryOptions from "./DeliveryOptions";
import UserFormStep from "./UserFormStep";
import useCheckoutHandlers from "../../hooks/useCheckoutHandlers";
import "../css/ShoppingCart.css";

const ShoppingCart = () => {
  const {
    cart,
    cartId,
    removeFromCart,
    updateQuantity,
    cartLoading,
    isCartVisible,
    toggleCartVisibility,
  } = useCartStore();

  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [deliveryType, setDeliveryType] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [imageReset, setImageReset] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalInfo, setModalInfo] = useState(null);
  const closeModal = () => setModalInfo(null);
  const openModal = (info) => setModalInfo(info);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isPaid = ["pagado", "preparacion"].includes(cartId?.status);
  const { handleCheckout, handleMercadoPago, copyToClipboard } =
    useCheckoutHandlers({
      name,
      phone,
      address,
      paymentMethod,
      deliveryType,
      receiptUrl,
      cart,
      total,
      navigate,
      setStep,
      setIsProcessing,
    });

  const goBack = () => setStep((s) => s - 1);

  const getStatusMessage = (status) => {
    switch (status) {
      case "pendiente":
        return "Pendiente de confirmación";
      case "pagado":
        return "Pagado - En preparación";
      case "preparacion":
        return "En preparación";
      default:
        return null; // para entregado u otros
    }
  };

  if (!isCartVisible) {
    return (
      <button className="open-cart-button" onClick={toggleCartVisibility}>
        🛒 Ver Carrito
      </button>
    );
  }

  return (
    <div className="cart-overlay">
      <div className="cart">
        <h2>Carrito de Compras</h2>

        {["pendiente", "pagado", "preparacion"].includes(cartId?.status) && (
          <PaidStatus
            message={getStatusMessage(cartId.status)}
            onViewStatus={() => navigate("/estadoDelEnvio")}
          />
        )}

        {cart.length === 0 ? (
          <p>El carrito está vacío.</p>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item._id || item.id}
              item={item}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              cartLoading={cartLoading}
              isPaid={isPaid}
            />
          ))
        )}

        {cart.length > 0 && step === 0 && (
          <TotalAndPayButton
            total={total}
            onNext={() => setStep(1)}
            loading={cartLoading}
          />
        )}

        {step === 1 && (
          <PaymentOptions
            isProcessing={isProcessing}
            onSelect={(method) => {
              setPaymentMethod(method);
              setStep(2);
            }}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <DeliveryOptions
            isProcessing={isProcessing}
            onSelect={(type) => {
              setDeliveryType(type);
              setStep(3);
            }}
            onBack={goBack}
          />
        )}

        {step === 3 && (
          <UserFormStep
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            address={address}
            setAddress={setAddress}
            deliveryType={deliveryType}
            paymentMethod={paymentMethod}
            receiptUrl={receiptUrl}
            setReceiptUrl={setReceiptUrl}
            imageReset={imageReset}
            setImageReset={setImageReset}
            isProcessing={isProcessing}
            onBack={goBack}
            onCheckout={handleCheckout}
            onMercadoPago={handleMercadoPago}
            copyToClipboard={copyToClipboard}
            modalInfo={modalInfo}
            openModal={openModal}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
