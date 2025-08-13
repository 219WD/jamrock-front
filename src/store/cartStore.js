import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useAuthStore from './authStore';

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
          const res = await fetch(`http://localhost:4000/cart/user/${user._id}/last`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error('Error al obtener carrito');
          const data = await res.json();

          if (data && ['inicializado', 'pendiente', 'pagado', 'preparacion'].includes(data.status)) {
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
          } else {
            // Si el último carrito ya fue entregado o pagado, se limpia
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
          ? "http://localhost:4000/cart/addToCart"
          : `http://localhost:4000/cart/update/${cartId.id}`;

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
        if (!token || !cartId || ['pagado', 'preparacion', 'cancelado', 'entregado'].includes(cartId.status)) return;

        set({ loading: true });
        try {
          const action = increment > 0 ? 'add' : 'subtract';
          const res = await fetch(`http://localhost:4000/cart/update/${cartId.id}`, {
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
          const res = await fetch(`http://localhost:4000/cart/update/${cartId.id}`, {
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
        if (!token || !cartId || ['pagado', 'preparacion', 'entregado'].includes(cartId.status)) return;
        set({ loading: true });
        try {
          const response = await fetch(`http://localhost:4000/cart/checkout/${cartId.id}`, {
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

          set({ cart: [], cartId: null });

          // Refetch products to update stock
          const resProducts = await fetch("http://localhost:4000/products/getProducts");
          if (!resProducts.ok) throw new Error("Error al actualizar productos");
          const updatedProducts = await resProducts.json();
          // Assuming you have a way to update products in the Productos component,
          // you might need to lift this state or use a global store for products.

          return await response.json();
        } catch (error) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ loading: false });
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
