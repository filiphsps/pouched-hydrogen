import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type WishlistStore = {
    items: string[];
    addItem: (id: string) => void;
    removeItem: (id: string) => void;
    toggleItem: (id: string) => void;
};

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (id) =>
                set((state) => {
                    if (state.items.includes(id)) return state;
                    return { items: [...state.items, id] };
                }),
            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((i) => i !== id),
                })),
            toggleItem: (id) => {
                const { items } = get();
                if (items.includes(id)) {
                    get().removeItem(id);
                } else {
                    get().addItem(id);
                }
            },
        }),
        {
            name: "wishlist-storage",
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
