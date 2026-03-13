import type { OptimisticCartLineInput } from "@shopify/hydrogen";
import { CartForm } from "@shopify/hydrogen";
import { useId } from "react";
import { useCartStore } from "../store";
import type { CartMutationOptions, CartMutationResult } from "../types";
import { useCartMutation } from "./use-cart-mutation";

/** Options specific to the add-to-cart hook. */
interface UseAddToCartOptions extends CartMutationOptions {
    /** Whether to open the cart drawer on success. Defaults to `true`. */
    openDrawerOnSuccess?: boolean;
    /** Custom fetcher key. Defaults to a unique key per component instance. */
    fetcherKey?: string;
}

/**
 * Hook for adding lines to the cart.
 * Submits `LinesAdd` and optionally opens the cart drawer on success.
 * Each instance gets a unique fetcher key so loading states are isolated.
 *
 * @param options - Callbacks and behavior options
 * @returns Mutation result with `mutate(lines)` function
 */
export function useAddToCart(
    options?: UseAddToCartOptions,
): CartMutationResult<[lines: OptimisticCartLineInput[]]> {
    const instanceId = useId();
    const openDrawer = useCartStore((s) => s.openDrawer);
    const shouldOpenDrawer = options?.openDrawerOnSuccess ?? true;
    const fetcherKey = options?.fetcherKey ?? `add-to-cart-${instanceId}`;

    const mutation = useCartMutation(fetcherKey, {
        onSuccess: (cart) => {
            if (shouldOpenDrawer) {
                openDrawer();
            }
            options?.onSuccess?.(cart);
        },
        onError: options?.onError,
    });

    function mutate(lines: OptimisticCartLineInput[]) {
        mutation.submit(CartForm.ACTIONS.LinesAdd, { lines });
    }

    return {
        mutate,
        isLoading: mutation.isLoading,
        userErrors: mutation.userErrors,
        data: mutation.data,
        reset: mutation.reset,
    };
}
