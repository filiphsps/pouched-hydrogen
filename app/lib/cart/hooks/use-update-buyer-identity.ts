import { CartForm } from "@shopify/hydrogen";
import type { CartBuyerIdentityInput } from "@shopify/hydrogen/storefront-api-types";
import type { CartMutationOptions, CartMutationResult } from "../types";
import { useCartMutation } from "./use-cart-mutation";

/**
 * Hook for updating the cart's buyer identity (country, email, etc.).
 *
 * @param options - Optional callbacks
 * @returns Mutation result with `mutate(buyerIdentity)` function
 */
export function useUpdateBuyerIdentity(
    options?: CartMutationOptions,
): CartMutationResult<[buyerIdentity: CartBuyerIdentityInput]> {
    const mutation = useCartMutation("buyer-identity", options);

    function mutate(buyerIdentity: CartBuyerIdentityInput) {
        mutation.submit(CartForm.ACTIONS.BuyerIdentityUpdate, {
            buyerIdentity,
        });
    }

    return {
        mutate,
        isLoading: mutation.isLoading,
        userErrors: mutation.userErrors,
        data: mutation.data,
        reset: mutation.reset,
    };
}
