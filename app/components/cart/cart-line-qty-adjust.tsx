import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import {
    CartForm,
    type OptimisticCart,
    OptimisticInput,
    useOptimisticData,
} from "@shopify/hydrogen";
import type { CartLineUpdateInput } from "@shopify/hydrogen/storefront-api-types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CartApiQueryFragment } from "storefront-api.generated";
import type { CartLineOptimisticData } from "./cart-line-item";

/**
 * Component for adjusting cart line item quantity
 * @param {Object} props - Component props
 * @param {OptimisticCart<CartApiQueryFragment>["lines"]["nodes"][0]} props.line - Cart line item
 * @returns {JSX.Element | null} Cart line quantity adjust component
 */
export function CartLineQuantityAdjust({
    line,
}: {
    line: OptimisticCart<CartApiQueryFragment>["lines"]["nodes"][0];
}) {
    const { t } = useTranslation();
    const optimisticId = line?.id;
    const optimisticData =
        useOptimisticData<CartLineOptimisticData>(optimisticId);

    // Initialize state before early return
    const [inputValue, setInputValue] = useState(String(line?.quantity ?? 0));

    if (!line || typeof line?.quantity === "undefined") {
        return null;
    }

    const optimisticQuantity = optimisticData?.quantity || line.quantity;

    const { id: lineId, isOptimistic } = line;
    const prevQuantity = Number(Math.max(0, optimisticQuantity - 1).toFixed(0));
    const nextQuantity = Number((optimisticQuantity + 1).toFixed(0));

    /**
     * Handle input blur event to submit quantity changes
     * Removes line item if quantity is 0
     */
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const newQuantity = Number.parseInt(inputValue, 10);

        // Validate and ensure non-negative integer
        if (Number.isNaN(newQuantity) || newQuantity < 0) {
            setInputValue(String(optimisticQuantity));
            return;
        }

        // Only submit if quantity has changed
        if (newQuantity !== optimisticQuantity) {
            // Submit the form
            const form = e.currentTarget.form;
            if (form) {
                form.requestSubmit();
            }
        }
    };

    /**
     * Handle input change event
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    /**
     * Handle key down events (Enter to submit, Escape to reset)
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        } else if (e.key === "Escape") {
            setInputValue(String(optimisticQuantity));
            e.currentTarget.blur();
        }
    };

    // Update input value when optimistic quantity changes
    if (
        String(optimisticQuantity) !== inputValue &&
        !document.activeElement?.id.includes(`quantity-${lineId}`)
    ) {
        setInputValue(String(optimisticQuantity));
    }

    const currentQuantity = Number.parseInt(inputValue, 10);
    const validQuantity =
        Number.isNaN(currentQuantity) || currentQuantity < 0
            ? 0
            : currentQuantity;

    return (
        <>
            <label htmlFor={`quantity-${lineId}`} className="sr-only">
                {t("cart.quantityLabel", { quantity: optimisticQuantity })}
            </label>
            <div className="flex min-w-30 items-center justify-evenly rounded-xl border border-line-subtle">
                <UpdateCartButton
                    lines={[{ id: lineId, quantity: prevQuantity }]}
                >
                    <button
                        type="submit"
                        name="decrease-quantity"
                        aria-label={t("cart.decreaseQuantity")}
                        className="inline-flex size-9 items-center justify-center transition disabled:cursor-not-allowed disabled:text-body-subtle"
                        value={prevQuantity}
                        disabled={optimisticQuantity <= 1 || isOptimistic}
                    >
                        <MinusIcon />
                        <OptimisticInput
                            id={optimisticId}
                            data={{ quantity: prevQuantity }}
                        />
                    </button>
                </UpdateCartButton>

                {validQuantity === 0 ? (
                    <CartForm
                        route="/cart"
                        action={CartForm.ACTIONS.LinesRemove}
                        inputs={{ lineIds: [lineId] }}
                    >
                        <input
                            id={`quantity-${lineId}`}
                            type="number"
                            min="0"
                            className="min-w-8 border-0 px-2 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-inset"
                            data-test="item-quantity"
                            value={inputValue}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            disabled={isOptimistic}
                        />
                        <OptimisticInput
                            id={optimisticId}
                            data={{ quantity: validQuantity }}
                        />
                    </CartForm>
                ) : (
                    <CartForm
                        route="/cart"
                        action={CartForm.ACTIONS.LinesUpdate}
                        inputs={{
                            lines: [{ id: lineId, quantity: validQuantity }],
                        }}
                    >
                        <input
                            id={`quantity-${lineId}`}
                            type="number"
                            min="0"
                            className="min-w-8 border-0 px-2 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-inset"
                            data-test="item-quantity"
                            value={inputValue}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            disabled={isOptimistic}
                        />
                        <OptimisticInput
                            id={optimisticId}
                            data={{ quantity: validQuantity }}
                        />
                    </CartForm>
                )}

                <UpdateCartButton
                    lines={[{ id: lineId, quantity: nextQuantity }]}
                >
                    <button
                        type="submit"
                        className="inline-flex size-9 items-center justify-center transition disabled:cursor-not-allowed disabled:text-body-subtle"
                        name="increase-quantity"
                        value={nextQuantity}
                        aria-label={t("cart.increaseQuantity")}
                        disabled={isOptimistic}
                    >
                        <PlusIcon />
                        <OptimisticInput
                            id={optimisticId}
                            data={{ quantity: nextQuantity }}
                        />
                    </button>
                </UpdateCartButton>
            </div>
        </>
    );
}

function UpdateCartButton({
    children,
    lines,
}: {
    children: React.ReactNode;
    lines: CartLineUpdateInput[];
}) {
    return (
        <CartForm
            route="/cart"
            action={CartForm.ACTIONS.LinesUpdate}
            inputs={{ lines }}
        >
            {children}
        </CartForm>
    );
}
