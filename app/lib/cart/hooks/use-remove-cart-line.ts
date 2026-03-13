import { CartForm } from "@shopify/hydrogen";
import type { CartMutationOptions, CartMutationResult } from "../types";
import { useCartMutation } from "./use-cart-mutation";

/**
 * Hook for removing cart lines.
 * Submits `LinesRemove` with optimistic remove data.
 *
 * @param options - Optional callbacks
 * @returns Mutation result with `mutate(lineIds)` function
 */
export function useRemoveCartLine(
    options?: CartMutationOptions,
): CartMutationResult<[lineIds: string[]]> {
    const mutation = useCartMutation("remove-cart-line", options);

    function mutate(lineIds: string[]) {
        mutation.submit(CartForm.ACTIONS.LinesRemove, { lineIds });
    }

    return {
        mutate,
        isLoading: mutation.isLoading,
        userErrors: mutation.userErrors,
        data: mutation.data,
        reset: mutation.reset,
    };
}
