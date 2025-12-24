import {
    CartForm,
    type OptimisticCart,
    useOptimisticData,
} from "@shopify/hydrogen";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Quantity } from "~/components/product/quantity";
import { cn } from "~/utils/cn";
import type { CartLineOptimisticData } from "./cart-line-item";

/**
 * Component for adjusting cart line item quantity.
 * Uses fetcher with optimistic data for immediate UI feedback.
 * @param props - Component props
 * @param props.line - Cart line item from optimistic cart
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
    const fetcher = useFetcher({ key: `cart-line-${line?.id}` });
    const optimisticId = line?.id;
    const optimisticData =
        useOptimisticData<CartLineOptimisticData>(optimisticId);

    if (!line || typeof line?.quantity === "undefined") {
        return null;
    }

    const optimisticQuantity = optimisticData?.quantity || line.quantity;
    const { id: lineId, isOptimistic: lineIsOptimistic } = line;
    const isSubmitting = fetcher.state !== "idle";
    const isOptimistic = lineIsOptimistic || isSubmitting;

    /**
     * Handles quantity change by submitting cart update with optimistic data.
     * Removes line if quantity is 0, otherwise updates the quantity.
     */
    const handleQuantityChange = (quantity: number) => {
        if (quantity < 0 || quantity === optimisticQuantity) {
            return;
        }

        const formData = new FormData();

        if (quantity === 0) {
            formData.set(
                "cartFormInput",
                JSON.stringify({
                    action: CartForm.ACTIONS.LinesRemove,
                    inputs: { lineIds: [lineId] },
                }),
            );
            // Include optimistic data for remove action
            formData.set(
                "__hydrogenOptimisticData",
                JSON.stringify({ id: lineId, data: { action: "remove" } }),
            );
        } else {
            formData.set(
                "cartFormInput",
                JSON.stringify({
                    action: CartForm.ACTIONS.LinesUpdate,
                    inputs: { lines: [{ id: lineId, quantity }] },
                }),
            );
            // Include optimistic data with new quantity
            formData.set(
                "__hydrogenOptimisticData",
                JSON.stringify({ id: lineId, data: { quantity } }),
            );
        }

        fetcher.submit(formData, {
            action: "/cart",
            method: "POST",
        });
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
        </div>
    );
}
