import useNotify from "../hooks/useToast";
import useCartStore from "../store/cartStore";

const whatsappNumber = "3816671884";

export default function useCheckoutHandlers({
  name, phone, address,
  paymentMethod, deliveryType,
  receiptUrl, cart, total,
  navigate, setStep, setIsProcessing
}) {
  const notify = useNotify();
  const { checkoutCart } = useCartStore();

  const generateWhatsAppMessage = () => {
    let message = "¡Hola! Quisiera realizar el siguiente pedido:\n\n";
    cart.forEach(item => {
      message += `🍔 ${item.title} (x${item.quantity}) - $${parseFloat(item.price).toFixed(2)} c/u\n`;
    });
    message += `\nTotal: $${total.toFixed(2)}\n\n`;
    message += `Información del cliente:\n📛 Nombre: ${name}\n`;
    if (deliveryType === "envio") message += `🏠 Dirección: ${address}\n`;
    message += `📞 Teléfono: ${phone}\n`;
    message += `📦 Tipo de entrega: ${deliveryType === "envio" ? "Envío a domicilio" : "Retiro en local"}\n`;
    message += `💳 Método de pago: ${paymentMethod === "efectivo" ? "Efectivo" :
      paymentMethod === "transferencia" ? "Transferencia bancaria" : "Mercado Pago"
      }\n\n`;
    if (receiptUrl) message += `📎 Comprobante de pago: ${receiptUrl}\n\n`;
    return encodeURIComponent(message);
  };

  const sendWhatsAppMessage = () => {
    const message = generateWhatsAppMessage();
    const url = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`;
    window.open(url, "_blank"); // Abre WhatsApp en nueva pestaña
  };

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text)
      .then(() => notify(`Copiado: ${text}`, "success"))
      .catch(() => notify("No se pudo copiar.", "error"));
  };

  const handleCheckout = async () => {
    if (!name || !phone || (deliveryType === "envio" && !address)) {
      notify("Completa todos los datos antes de continuar.", "error");
      return;
    }
    setIsProcessing(true);
    try {
      const paymentData = {
        paymentMethod,
        deliveryMethod: deliveryType,
        shippingAddress: {
          name,
          address: deliveryType === "envio" ? address : "Retiro en local",
          phone
        },
        customerInfo: { name, phone },
        receiptUrl: paymentMethod === "transferencia" ? receiptUrl : undefined,
      };
      await checkoutCart(paymentData);
      if (paymentMethod !== "tarjeta") sendWhatsAppMessage();
      notify("Pedido procesado correctamente", "success");
      setStep(0);
      navigate("/estadoDelEnvio");
    } catch (error) {
      notify(error.message || "Error al procesar el pedido", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMercadoPago = async () => {
    setIsProcessing(true);
    try {
      const items = cart.map(item => ({
        title: item.title,
        description: item.description,
        image: item.image,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity, 10)
      }));
      const res = await fetch(
        "https://two19foodpremiumback.onrender.com/Mercado_Pago",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(items)
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error("Error al procesar el pago");
      const paymentData = {
        paymentMethod: "tarjeta",
        deliveryMethod: deliveryType,
        shippingAddress: {
          name,
          address: deliveryType === "envio" ? address : "Retiro en local",
          phone
        },
        customerInfo: { name, phone }
      };
      await checkoutCart(paymentData);
      window.location.href = data.init_point;
    } catch (error) {
      notify(error.message || "Error con MercadoPago", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleCheckout, handleMercadoPago, copyToClipboard, sendWhatsAppMessage
  };
}
