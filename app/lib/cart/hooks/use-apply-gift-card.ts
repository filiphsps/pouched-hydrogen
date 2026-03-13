import { CartForm } from "@shopify/hydrogen";
import type { CartMutationOptions } from "../types";
import { useCartMutation } from "./use-cart-mutation";

/**
 * Hook for applying and removing gift card codes.
 *
 * @param options - Optional callbacks
 * @returns Mutation result with `apply(code)` and `remove(giftCardId)` functions
 */
export function useApplyGiftCard(options?: CartMutationOptions) {
    const applyMutation = useCartMutation("gift-card-apply", options);
    const removeMutation = useCartMutation("gift-card-remove", options);

    /** Apply a new gift card code. */
    function apply(giftCardCode: string, existingCodes: string[] = []) {
        const formattedCode = giftCardCode.replace(/\s/g, "");
        applyMutation.submit(CartForm.ACTIONS.GiftCardCodesUpdate, {
            giftCardCode: formattedCode,
            giftCardCodes: existingCodes,
        });
    }

    /** Remove a gift card by its ID. */
    function remove(giftCardIds: string[]) {
        removeMutation.submit(CartForm.ACTIONS.GiftCardCodesRemove, {
            giftCardCodes: giftCardIds,
        });
    }

    // Derive response gift cards from whichever mutation last ran
    const responseGiftCards =
        applyMutation.data?.cart?.appliedGiftCards ??
        removeMutation.data?.cart?.appliedGiftCards;

    return {
        apply,
        remove,
        isApplyLoading: applyMutation.isLoading,
        isRemoveLoading: removeMutation.isLoading,
        isLoading: applyMutation.isLoading || removeMutation.isLoading,
        applyUserErrors: applyMutation.userErrors,
        removeUserErrors: removeMutation.userErrors,
        applyData: applyMutation.data,
        removeData: removeMutation.data,
        resetApply: applyMutation.reset,
        resetRemove: removeMutation.reset,
        responseGiftCards,
    };
}
