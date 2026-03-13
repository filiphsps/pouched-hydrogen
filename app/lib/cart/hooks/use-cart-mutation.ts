import { CartForm } from "@shopify/hydrogen";
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import { useCartStore } from "../store";
import type { CartActionResponse, CartMutationOptions } from "../types";

/**
 * Internal base hook for all cart mutations.
 *
 * Handles the common pattern:
 * 1. Creates a `useFetcher` with a scoped key
 * 2. Tracks `prevStateRef` for idle-transition detection
 * 3. Auto-syncs `fetcher.data.cart` to Zustand store on completion
 * 4. Extracts `userErrors` from the response
 * 5. Invokes `onSuccess`/`onError` callbacks
 *
 * @param fetcherKey - Unique key for the fetcher instance
 * @param options - Optional callbacks (onSuccess, onError)
 */
export function useCartMutation(
    fetcherKey: string,
    options?: CartMutationOptions,
) {
    const cartRoute = usePrefixPathWithLocale("/cart");
    const fetcher = useFetcher<CartActionResponse>({ key: fetcherKey });
    const setCart = useCartStore((s) => s.setCart);
    const prevStateRef = useRef<"idle" | "submitting" | "loading">("idle");

    // Auto-sync fetcher cart data to Zustand store when mutation completes
    useEffect(() => {
        if (prevStateRef.current !== "idle" && fetcher.state === "idle") {
            const cart = fetcher.data?.cart;
            if (cart?.updatedAt) {
                setCart(cart);
            }

            const userErrors = fetcher.data?.userErrors ?? [];
            if (userErrors.length > 0) {
                options?.onError?.(userErrors);
            } else if (cart) {
                options?.onSuccess?.(cart);
            }
        }
        prevStateRef.current = fetcher.state;
    }, [fetcher.state, fetcher.data, setCart, options]);

    const isLoading = fetcher.state !== "idle";
    const userErrors = isLoading ? [] : (fetcher.data?.userErrors ?? []);

    /**
     * Submit a cart mutation as FormData to the cart route.
     *
     * @param action - CartForm action constant (e.g., CartForm.ACTIONS.LinesAdd)
     * @param inputs - Action-specific inputs
     * @param extraFormData - Additional FormData entries (e.g., optimistic data)
     */
    function submit(
        action: string,
        inputs: Record<string, unknown>,
        extraFormData?: Record<string, string>,
    ) {
        const formData = new FormData();
        formData.set(CartForm.INPUT_NAME, JSON.stringify({ action, inputs }));
        if (extraFormData) {
            for (const [key, value] of Object.entries(extraFormData)) {
                formData.set(key, value);
            }
        }
        fetcher.submit(formData, {
            action: cartRoute,
            method: "POST",
        });
    }

    /** Clear the fetcher response data. */
    function reset() {
        fetcher.data = undefined as unknown as CartActionResponse;
    }

    return {
        submit,
        isLoading,
        userErrors,
        data: (fetcher.data as CartActionResponse) ?? null,
        reset,
        /** Raw fetcher for advanced use (e.g., optimistic data). */
        fetcher,
    };
}
