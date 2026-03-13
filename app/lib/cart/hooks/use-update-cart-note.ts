import { CartForm } from "@shopify/hydrogen";
import type { CartMutationOptions, CartMutationResult } from "../types";
import { useCartMutation } from "./use-cart-mutation";

/**
 * Hook for updating the cart note.
 *
 * @param options - Optional callbacks
 * @returns Mutation result with `mutate(note)` function
 */
export function useUpdateCartNote(
    options?: CartMutationOptions,
): CartMutationResult<[note: string]> {
    const mutation = useCartMutation("cart-note", options);

    function mutate(cartNote: string) {
        mutation.submit(CartForm.ACTIONS.NoteUpdate, { cartNote });
    }

    return {
        mutate,
        isLoading: mutation.isLoading,
        userErrors: mutation.userErrors,
        data: mutation.data,
        reset: mutation.reset,
    };
}
