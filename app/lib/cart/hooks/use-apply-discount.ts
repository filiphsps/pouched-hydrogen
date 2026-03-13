import { CartForm } from "@shopify/hydrogen";
import type { CartApiQueryFragment } from "storefront-api.generated";
import type { CartMutationOptions } from "../types";
import { useCartMutation } from "./use-cart-mutation";

/**
 * Hook for applying or removing discount codes.
 *
 * For applying: submits `DiscountCodesUpdate` with the new code + existing codes.
 * For removing: submits `DiscountCodesUpdate` with only the remaining codes.
 *
 * @param existingCodes - Currently applied discount codes from the cart
 * @param options - Optional callbacks
 * @returns Mutation result with `apply(code)` and `remove(code)` functions,
 *          plus `isApplicable` derived from the response
 */
export function useApplyDiscount(
    existingCodes: CartApiQueryFragment["discountCodes"],
    options?: CartMutationOptions,
) {
    const mutation = useCartMutation("discount-code", options);

    /** Apply a new discount code. */
    function apply(discountCode: string) {
        mutation.submit(CartForm.ACTIONS.DiscountCodesUpdate, {
            discountCode,
            discountCodes: existingCodes.map((d) => d.code),
        });
    }

    /** Remove a discount code by submitting only the remaining codes. */
    function remove(codeToRemove: string) {
        const remaining = existingCodes
            .filter((d) => d.applicable && d.code !== codeToRemove)
            .map((d) => d.code);
        mutation.submit(CartForm.ACTIONS.DiscountCodesUpdate, {
            discountCodes: remaining,
        });
    }

    // Derive applicability from the response
    const responseDiscountCodes = mutation.data?.cart?.discountCodes;

    return {
        apply,
        remove,
        isLoading: mutation.isLoading,
        userErrors: mutation.userErrors,
        data: mutation.data,
        reset: mutation.reset,
        /** Whether the last-applied code was marked applicable by Shopify. */
        responseDiscountCodes,
    };
}
