import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCart = create(
  persist(
    (set, get) => ({
      items: [], // { product, quantity, size, color }

      add: (product, qty = 1, size = null, color = null) => {
        const { items } = get();
        const key = `${product.id}-${size}-${color}`;
        const existing = items.find(i => i.key === key);
        const min = product.min_quantity ?? 1;

        if (existing) {
          set({
            items: items.map(i =>
              i.key === key
                ? { ...i, quantity: Math.max(min, i.quantity + qty) }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              { key, product, quantity: Math.max(min, qty), size, color },
            ],
          });
        }
      },

      updateQty: (key, delta) =>
        set(state => ({
          items: state.items.map(i => {
            if (i.key !== key) return i;
            const min = i.product.min_quantity ?? 1;
            return { ...i, quantity: Math.max(min, i.quantity + delta) };
          }),
        })),

      remove: key => set(state => ({ items: state.items.filter(i => i.key !== key) })),
      clear: () => set({ items: [] }),

      subtotal: () =>
        get().items.reduce((sum, i) => {
          const p = i.product.discount_price ?? i.product.price;
          return sum + p * i.quantity;
        }, 0),
    }),
    { name: 'cart-storage' }
  )
);