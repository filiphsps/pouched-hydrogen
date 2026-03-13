import { type OptimisticCart, useOptimisticData } from "@shopify/hydrogen";
import { useTranslation } from "react-i18next";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Banner } from "~/components/banner";
import { Quantity } from "~/components/product/quantity";
import { useUpdateCartLine } from "~/lib/cart";
import { cn } from "~/utils/cn";
import type { CartLineOptimisticData } from "./cart-line-item";

/**
 * Component for adjusting cart line item quantity.
 * Uses the `useUpdateCartLine` hook for mutations with optimistic data.
 * Shows error messages from the action response when mutations fail.
 *
 * @param props.line - Cart line item from optimistic cart
 * @param props.className - Optional additional CSS classes
 * @returns Cart line quantity adjust component or null if line is invalid
 */
export function CartLineQuantityAdjust({
    line,
    className,
}: {
    line: OptimisticCart<CartApiQueryFragment>["lines"]["nodes"][0];
    className?: string;
}) {
    const { t } = useTranslation();
    const optimisticId = line?.id;
    const optimisticData =
        useOptimisticData<CartLineOptimisticData>(optimisticId);
    const { mutate, isLoading, userErrors } = useUpdateCartLine(line?.id ?? "");

    if (!line || typeof line?.quantity === "undefined") {
        return null;
    }

    const optimisticQuantity = optimisticData?.quantity || line.quantity;
    const { id: lineId, isOptimistic: lineIsOptimistic } = line;
    const isOptimistic = lineIsOptimistic || isLoading;
    const hasError = userErrors.length > 0 && !isLoading;

    /**
     * Handles quantity change by submitting cart update with optimistic data.
     * Removes line if quantity is 0, otherwise updates the quantity.
     * Guards against no-op submissions (same quantity).
     */
    const handleQuantityChange = (quantity: number) => {
        if (quantity < 0 || quantity === optimisticQuantity) {
            return;
        }
        mutate(quantity);
    };

    return (
        <div className={cn("w-fit", className)}>
            <label htmlFor={`quantity-${lineId}`} className="sr-only">
                {t("cart.quantityLabel", { quantity: optimisticQuantity })}
            </label>
            <div className="flex items-center justify-evenly border-line-subtle">
                <Quantity
                    value={optimisticQuantity}
                    onChange={handleQuantityChange}
                    label={false}
                    disabled={isOptimistic}
                    className="h-8 w-36"
                    min={0}
                />
            </div>
            {hasError && (
                <Banner variant="error" className="mt-1">
                    {userErrors[0].message}
                </Banner>
            )}
        </div>
    );
}
