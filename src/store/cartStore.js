import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useAuthStore from './authStore';
import API_URL from "../common/constants";

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      cartId: null,
      isCartVisible: false,
      loading: false,
      error: null,

fetchCart: async () => {
  const { token, user } = useAuthStore.getState();
  if (!token || !user?._id) return;

  set({ loading: true });
  try {
    const res = await fetch(`${API_URL}/cart/user/${user._id}/last`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Error al obtener carrito');
    const data = await res.json();

    if (data && ['inicializado', 'pendiente', 'pagado', 'preparacion', 'entregado', 'cancelado'].includes(data.status)) {
      set({
        cart: data.items.map(item => ({
          id: item.productId._id || item.productId,
          ...item.productId,
          quantity: item.quantity
        })),
        cartId: {
          id: data._id,
          status: data.status,
          paymentMethod: data.paymentMethod,
          deliveryMethod: data.deliveryMethod,
          shippingAddress: data.shippingAddress,
        }
      });
      
      // Limpiar solo si el carrito está en estado final
      if (['entregado', 'cancelado'].includes(data.status)) {
        set({ cart: [], cartId: null });
      }
    } else {
      set({ cart: [], cartId: null });
    }
  } catch (err) {
    set({ error: err.message });
  } finally {
    set({ loading: false });
  }
},

      addToCart: async (product, extraData = {}) => {
        const { token, user } = useAuthStore.getState();
        const { cartId } = get();

        if (!token || !user || !user._id) throw new Error("Debes iniciar sesión");

        const productId = product._id || product.id;
        if (!productId) throw new Error("El producto no tiene un ID válido");

        // Si el carrito está pagado +o entregado, crear uno nuevo
        const usarNuevoCarrito = !cartId || ['pagado', 'preparacion', 'cancelado', 'entregado'].includes(cartId.status);

        const item = {
          productId,
          quantity: 1,
        };

        const url = usarNuevoCarrito
          ? `${API_URL}/cart/addToCart`
          : `${API_URL}/cart/update/${cartId.id}`;

        const method = usarNuevoCarrito ? "POST" : "PUT";

        const body = usarNuevoCarrito
          ? {
            userId: user._id,
            items: [item],
            paymentMethod: extraData.paymentMethod || "efectivo",
            deliveryMethod: extraData.deliveryMethod || "retiro",
            shippingAddress: extraData.shippingAddress || {
              name: user.name,
              address: "Sin dirección",
              phone: "0000000000",
            },
            totalAmount: product.price,
          }
          : { ...item, action: "add" };

        try {
          const response = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });

          const responseData = await response.json();
          if (!response.ok) throw new Error(responseData.message || "Error en el carrito");

          await get().fetchCart();
          return responseData;
        } catch (error) {
          console.error("Error en addToCart:", error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateQuantity: async (productId, increment) => {
        const { token } = useAuthStore.getState();
        const { cartId } = get();
        if (!token || !cartId || ['pagado', 'preparacion', 'entregado', 'cancelado'].includes(cartId.status)) return;

        set({ loading: true });
        try {
          const action = increment > 0 ? 'add' : 'subtract';
          const res = await fetch(`${API_URL}/cart/update/${cartId.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, action }),
          });

          if (!res.ok) throw new Error('Error al actualizar cantidad');
          await get().fetchCart();
        } catch (err) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      removeFromCart: async (productId) => {
        const { token } = useAuthStore.getState();
        const { cartId } = get();
        if (!token || !cartId || ['pagado', 'preparacion', 'cancelado', 'entregado'].includes(cartId.status)) return;
        set({ loading: true });
        try {
          const res = await fetch(`${API_URL}/cart/update/${cartId.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, action: 'remove' }),
          });

          if (!res.ok) throw new Error('Error al eliminar producto');
          await get().fetchCart();
        } catch (err) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

checkoutCart: async (data) => {
  const { token } = useAuthStore.getState();
  const { cartId } = get();
  
  // Permitir checkout solo si el carrito no está en estados finales
  if (!token || !cartId || ['entregado', 'cancelado'].includes(cartId.status)) return;
  
  set({ loading: true });
  try {
    const response = await fetch(`${API_URL}/cart/checkout/${cartId.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const resData = await response.json();
      throw new Error(resData.message || "Error al finalizar compra");
    }

    // NO limpiar el carrito aquí - en su lugar, actualizar el estado
    // El carrito se mantendrá con los items pero con nuevo estado
    await get().fetchCart(); // Esto actualizará el estado del carrito

    // Refetch products to update stock
    const resProducts = await fetch(`${API_URL}/products/getProducts`);
    if (!resProducts.ok) throw new Error("Error al actualizar productos");
    const updatedProducts = await resProducts.json();
    
    return await response.json();
  } catch (error) {
    set({ error: error.message });
    throw error;
  } finally {
    set({ loading: false });
  }
},

// También modificar la función clearCart para que sea más específica
clearCart: () => {
  // Solo limpiar si el carrito está en un estado final
  const { cartId } = get();
  if (!cartId || ['entregado', 'cancelado'].includes(cartId.status)) {
    set({ cart: [], cartId: null, isCartVisible: false });
  }
},

      toggleCartVisibility: () =>
        set((state) => ({ isCartVisible: !state.isCartVisible })),

      clearCart: () => {
        set({ cart: [], cartId: null, isCartVisible: false });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        isCartVisible: state.isCartVisible,
        cart: state.cart,
        cartId: state.cartId,
      }),
      onRehydrateStorage: () => (state) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          state?.clearCart?.();
        }
      },
    }
  )
);

export default useCartStore;
