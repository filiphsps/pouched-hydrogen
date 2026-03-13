import { CartForm } from "@shopify/hydrogen";
import type { CartMutationOptions, CartMutationResult } from "../types";
import { useCartMutation } from "./use-cart-mutation";

/**
 * Hook for updating a specific cart line's quantity.
 * Uses a per-line fetcher key to allow concurrent line updates.
 *
 * If quantity is 0, submits `LinesRemove` instead of `LinesUpdate`.
 * Includes `__hydrogenOptimisticData` in FormData for optimistic rendering.
 *
 * @param lineId - The cart line ID to update
 * @param options - Optional callbacks
 * @returns Mutation result with `mutate(quantity)` function
 */
export function useUpdateCartLine(
    lineId: string,
    options?: CartMutationOptions,
): CartMutationResult<[quantity: number]> {
    const mutation = useCartMutation(`cart-line-${lineId}`, options);

    function mutate(quantity: number) {
        if (quantity < 0) return;

        if (quantity === 0) {
            // Remove the line
            mutation.submit(
                CartForm.ACTIONS.LinesRemove,
                { lineIds: [lineId] },
                {
                    __hydrogenOptimisticData: JSON.stringify({
                        id: lineId,
                        data: { action: "remove" },
                    }),
                },
            );
        } else {
            // Update the quantity
            mutation.submit(
                CartForm.ACTIONS.LinesUpdate,
                { lines: [{ id: lineId, quantity }] },
                {
                    __hydrogenOptimisticData: JSON.stringify({
                        id: lineId,
                        data: { quantity },
                    }),
                },
            );
        }
    }

    return {
        mutate,
        isLoading: mutation.isLoading,
        userErrors: mutation.userErrors,
        data: mutation.data,
        reset: mutation.reset,
    };
}
