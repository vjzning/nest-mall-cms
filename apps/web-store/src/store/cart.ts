import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProductInfo } from '@app/shared';

interface CartItem {
  product: ProductInfo;
  skuId: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: ProductInfo, skuId: number) => void;
  removeItem: (skuId: number) => void;
  toggleCart: (open?: boolean) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (product, skuId) => set((state) => {
        const existingIndex = state.items.findIndex(item => item.skuId === skuId);
        if (existingIndex > -1) {
          const newItems = [...state.items];
          newItems[existingIndex].quantity += 1;
          return { items: newItems, isOpen: true };
        }
        return { items: [...state.items, { product, skuId, quantity: 1 }], isOpen: true };
      }),
      removeItem: (skuId) => set((state) => ({
        items: state.items.filter(item => item.skuId !== skuId)
      })),
      toggleCart: (open) => set((state) => ({
        isOpen: typeof open === 'boolean' ? open : !state.isOpen
      })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'nike-cart-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist items, not the 'isOpen' state (usually better UX)
      partialize: (state) => ({ items: state.items }),
    }
  )
);
