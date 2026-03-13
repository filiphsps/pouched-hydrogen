import type { CartReturn } from "@shopify/hydrogen";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { create } from "zustand";

/**
 * Unified cart store combining cart data and drawer state.
 *
 * Cart data is initialized from the root loader, then updated directly from
 * mutation responses. This avoids Shopify Storefront API eventual consistency
 * issues — we never re-query `cart.get()` after mutations.
 */
interface CartState {
    /** Current cart data (from root loader or mutation response). */
    cart: CartReturn | null;
    /** Set cart data (from mutation response or root loader). */
    setCart: (cart: CartApiQueryFragment | CartReturn) => void;
    /** Whether the cart drawer is open. */
    isDrawerOpen: boolean;
    /** Open the cart drawer. */
    openDrawer: () => void;
    /** Close the cart drawer. */
    closeDrawer: () => void;
    /** Toggle the cart drawer. */
    toggleDrawer: (open?: boolean) => void;
}

export const useCartStore = create<CartState>()((set) => ({
    cart: null,
    setCart: (cart) => set({ cart: cart as CartReturn }),
    isDrawerOpen: false,
    openDrawer: () => set({ isDrawerOpen: true }),
    closeDrawer: () => set({ isDrawerOpen: false }),
    toggleDrawer: (open) =>
        set((state) => ({
            isDrawerOpen: open !== undefined ? open : !state.isDrawerOpen,
        })),
}));

/**
 * Backward-compatible shim for `useCartDrawerStore`.
 * Returns an object matching the old API shape for incremental migration.
 */
export function useCartDrawerStore(): {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: (open?: boolean) => void;
} {
    const isOpen = useCartStore((s) => s.isDrawerOpen);
    const open = useCartStore((s) => s.openDrawer);
    const close = useCartStore((s) => s.closeDrawer);
    const toggle = useCartStore((s) => s.toggleDrawer);
    return { isOpen, open, close, toggle };
}
