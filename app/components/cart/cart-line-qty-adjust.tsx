import {
    CartForm,
    type OptimisticCart,
    useOptimisticData,
} from "@shopify/hydrogen";
import { useTranslation } from "react-i18next";
import { useSubmit } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Quantity } from "~/components/product/quantity";
import { cn } from "~/utils/cn";
import type { CartLineOptimisticData } from "./cart-line-item";

/**
 * Component for adjusting cart line item quantity
 * @param {Object} props - Component props
 * @param {OptimisticCart<CartApiQueryFragment>["lines"]["nodes"][0]} props.line - Cart line item
 * @returns {JSX.Element | null} Cart line quantity adjust component
 */
export function CartLineQuantityAdjust({
    line,
    className,
}: {
    line: OptimisticCart<CartApiQueryFragment>["lines"]["nodes"][0];
    className?: string;
}) {
    const { t } = useTranslation();
    const submit = useSubmit();
    const optimisticId = line?.id;
    const optimisticData =
        useOptimisticData<CartLineOptimisticData>(optimisticId);

    if (!line || typeof line?.quantity === "undefined") {
        return null;
    }

    const optimisticQuantity = optimisticData?.quantity || line.quantity;
    const { id: lineId, isOptimistic } = line;

    const handleQuantityChange = (quantity: number) => {
        if (quantity < 0 || quantity === optimisticQuantity) {
            return;
        }

        if (quantity === 0) {
            submit(
                {
                    cartFormInput: JSON.stringify({
                        action: CartForm.ACTIONS.LinesRemove,
                        inputs: { lineIds: [lineId] },
                    }),
                },
                {
                    action: "/cart",
                    method: "POST",
                    navigate: false,
                    fetcherKey: `navigate-cart-${lineId}`, // Match what CartForm would typically generate or use a unique key
                },
            );
        } else {
            submit(
                {
                    cartFormInput: JSON.stringify({
                        action: CartForm.ACTIONS.LinesUpdate,
                        inputs: { lines: [{ id: lineId, quantity }] },
                    }),
                },
                {
                    action: "/cart",
                    method: "POST",
                    navigate: false,
                    fetcherKey: `navigate-cart-${lineId}`,
                },
            );
        }
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
                    disabled={Boolean(isOptimistic)}
                    className="h-8 w-36"
                    min={0}
                />
            </div>
        </div>
    );
}
