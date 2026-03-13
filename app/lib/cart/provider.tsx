import { useEffect } from "react";
import { useCartStore } from "./store";

/**
 * Syncs root loader cart data into the Zustand store.
 * Runs on initial load and on navigation (when root loader revalidates).
 * Does NOT overwrite if Zustand already has newer data from a mutation response.
 *
 * Not a React Context provider — just manages loader-to-Zustand sync.
 */
export function CartProvider({ cart }: { cart: unknown }) {
    const storeCart = useCartStore((s) => s.cart);
    const setCart = useCartStore((s) => s.setCart);

    useEffect(() => {
        const loaderCart = cart as { updatedAt?: string } | null | undefined;
        if (!loaderCart?.updatedAt) return;

        // Only update if store is empty or loader cart is newer
        const storeUpdatedAt = (storeCart as { updatedAt?: string } | null)
            ?.updatedAt;
        if (!storeUpdatedAt || loaderCart.updatedAt > storeUpdatedAt) {
            setCart(loaderCart as never);
        }
    }, [cart, storeCart, setCart]);

    return null;
}
