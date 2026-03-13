import type { CartReturn } from "@shopify/hydrogen";
import { useCartStore } from "../store";

/**
 * Read-only hook that returns the current cart data from the Zustand store.
 * Subscribes to cart changes and re-renders when the cart updates.
 */
export function useCart(): CartReturn | null {
    return useCartStore((s) => s.cart);
}
