// store/productStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import useAuthStore from "./authStore";

const API_URL = "http://localhost:4000/products";

const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      filteredProducts: [],
      loading: false,
      error: null,

      // 🔹 Obtener todos los productos activos y con stock
      fetchProducts: async () => {
        set({ loading: true });
        try {
          const res = await fetch(`${API_URL}/getProducts`);
          if (!res.ok) throw new Error("Error al obtener productos");
          const data = await res.json();
          
          // Filtrar productos: solo activos y con stock > 0
          const filteredProducts = data.filter(product => 
            product.isActive && product.stock > 0
          );
          
          set({ products: data, filteredProducts, error: null });
        } catch (err) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      // 🔹 Obtener productos para admin (incluye inactivos y sin stock)
      fetchAllProductsForAdmin: async () => {
        set({ loading: true });
        try {
          const res = await fetch(`${API_URL}/getProducts`);
          if (!res.ok) throw new Error("Error al obtener productos");
          const data = await res.json();
          set({ products: data, filteredProducts: data, error: null });
        } catch (err) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      // 🔹 Obtener un producto por id (sin filtros para admin)
      fetchProductById: async (id) => {
        try {
          const res = await fetch(`${API_URL}/getProducts/${id}`);
          if (!res.ok) throw new Error("Error al obtener producto");
          return await res.json();
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      // 🔹 Crear producto - validar stock
      createProduct: async (newProduct) => {
        const { token } = useAuthStore.getState();
        try {
          // Si stock es 0, desactivar automáticamente
          if (newProduct.stock === 0) {
            newProduct.isActive = false;
          }
          
          const res = await fetch(`${API_URL}/createProduct`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newProduct),
          });
          if (!res.ok) throw new Error("Error al crear producto");
          const created = await res.json();
          
          // Actualizar ambos arrays: products y filteredProducts
          set((state) => ({ 
            products: [created, ...state.products],
            filteredProducts: created.isActive && created.stock > 0 
              ? [created, ...state.filteredProducts] 
              : state.filteredProducts
          }));
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      // 🔹 Actualizar producto - manejar stock 0
      updateProduct: async (id, updatedData) => {
        const { token } = useAuthStore.getState();
        try {
          // Si stock llega a 0, desactivar automáticamente
          if (updatedData.stock === 0) {
            updatedData.isActive = false;
          }
          
          const res = await fetch(`${API_URL}/updateProduct/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
          });
          if (!res.ok) throw new Error("Error al actualizar producto");
          const updated = await res.json();
          
          set((state) => ({
            products: state.products.map((p) =>
              p._id === id ? updated : p
            ),
            filteredProducts: updated.isActive && updated.stock > 0
              ? state.filteredProducts.map(p => p._id === id ? updated : p)
              : state.filteredProducts.filter(p => p._id !== id)
          }));
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      // 🔹 Actualizar stock localmente (para sincronización en tiempo real)
      updateLocalStock: (productId, quantity) => {
        set((state) => {
          const updatedProducts = state.products.map((product) =>
            product._id === productId
              ? { ...product, stock: Math.max(0, product.stock - quantity) }
              : product
          );
          
          const updatedFilteredProducts = updatedProducts.filter(product => 
            product.isActive && product.stock > 0
          );
          
          return {
            products: updatedProducts,
            filteredProducts: updatedFilteredProducts
          };
        });
      },

      // 🔹 Restaurar stock localmente (si se cancela una operación)
      restoreLocalStock: (productId, quantity) => {
        set((state) => {
          const updatedProducts = state.products.map((product) =>
            product._id === productId
              ? { ...product, stock: (product.stock || 0) + quantity }
              : product
          );
          
          const updatedFilteredProducts = updatedProducts.filter(product => 
            product.isActive && product.stock > 0
          );
          
          return {
            products: updatedProducts,
            filteredProducts: updatedFilteredProducts
          };
        });
      },

      // 🔹 Toggle activo/inactivo con validación de stock
      toggleStatus: async (id) => {
        const { token, products } = get();
        const product = products.find(p => p._id === id);
        
        // No permitir activar productos con stock 0
        if (!product.isActive && product.stock === 0) {
          throw new Error("No se puede activar un producto sin stock");
        }

        try {
          const res = await fetch(`${API_URL}/toggle-status/${id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error("Error al cambiar estado");
          const { product: updatedProduct } = await res.json();
          
          set((state) => ({
            products: state.products.map((p) =>
              p._id === id ? updatedProduct : p
            ),
            filteredProducts: updatedProduct.isActive && updatedProduct.stock > 0
              ? state.filteredProducts.map(p => p._id === id ? updatedProduct : p)
              : state.filteredProducts.filter(p => p._id !== id)
          }));
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      // 🔹 Eliminar producto
      deleteProduct: async (id) => {
        const { token } = useAuthStore.getState();
        try {
          const res = await fetch(`${API_URL}/deleteProduct/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error("Error al eliminar producto");
          set((state) => ({
            products: state.products.filter((p) => p._id !== id),
            filteredProducts: state.filteredProducts.filter((p) => p._id !== id),
          }));
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      // 🔹 Agregar rating
      addReview: async (id, rating, cartId = null) => {
        try {
          const res = await fetch(`${API_URL}/${id}/review${cartId ? `?cartId=${cartId}` : ""}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating }),
          });
          if (!res.ok) throw new Error("Error al agregar rating");
          const updated = await res.json();
          return updated;
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      // 🔹 Función para obtener solo productos activos con stock
      getActiveProducts: () => {
        const { filteredProducts } = get();
        return filteredProducts || [];
      },

      // 🔹 Forzar recarga de productos (para sincronización)
      forceRefresh: async () => {
        await get().fetchProducts();
      },

      // 🔹 Obtener stock actual de un producto específico
      getProductStock: (productId) => {
        const { products } = get();
        const product = products.find(p => p._id === productId);
        return product ? product.stock : 0;
      },

      // 🔹 Verificar disponibilidad de stock
      checkStockAvailability: (productId, requestedQuantity) => {
        const { products } = get();
        const product = products.find(p => p._id === productId);
        return product && product.stock >= requestedQuantity;
      },

      // 🔹 Restaurar stock en el backend
      restoreStock: async (productId, quantity) => {
        const { token } = useAuthStore.getState();
        try {
          const res = await fetch(`${API_URL}/${productId}/restore-stock`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity }),
          });
          
          if (!res.ok) throw new Error("Error al restaurar stock");
          
          // Actualizar el store local después de restaurar
          await get().fetchProducts();
          
          return true;
        } catch (err) {
          console.error("Error restaurando stock:", err);
          return false;
        }
      },

      // 🔹 Obtener producto por ID desde el store local
      getProductById: (id) => {
        const { products } = get();
        return products.find(p => p._id === id);
      },

      // 🔹 Buscar productos por término
      searchProducts: (searchTerm) => {
        const { filteredProducts } = get();
        if (!searchTerm) return filteredProducts;
        
        return filteredProducts.filter(product =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      },

      // 🔹 Obtener productos por categoría
      getProductsByCategory: (category) => {
        const { filteredProducts } = get();
        if (!category) return filteredProducts;
        
        return filteredProducts.filter(product =>
          product.category.toLowerCase() === category.toLowerCase()
        );
      },

      // 🔹 Obtener categorías únicas
      getUniqueCategories: () => {
        const { filteredProducts } = get();
        const categories = filteredProducts.map(product => product.category);
        return [...new Set(categories)].filter(category => category);
      }
    }),
    { 
      name: "products-storage",
      partialize: (state) => ({ 
        products: state.products,
        filteredProducts: state.filteredProducts
      })
    }
  )
);

export default useProductStore;