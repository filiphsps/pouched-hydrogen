/**
 * Payment Buttons Component.
 * A unified component for displaying Add to Cart and Shop Pay buttons.
 * Single source of truth for payment button styling and behavior.
 *
 * @example
 * ```tsx
 * <PaymentButtons
 *   variant={selectedVariant}
 *   quantity={1}
 *   storeDomain={storeDomain}
 * />
 * ```
 */

import { useTranslation } from "react-i18next";
import type { ProductVariantFragment } from "storefront-api.generated";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import { StyledShopPayButton } from "~/components/product/styled-shop-pay-button";
import { cn } from "~/utils/cn";

export interface PaymentButtonsProps {
    /** The selected product variant */
    variant: ProductVariantFragment | null | undefined;
    /** Quantity to add to cart */
    quantity?: number;
    /** Selling plan ID for subscriptions */
    sellingPlanId?: string | null;
    /** Store domain for Shop Pay */
    storeDomain: string;
    /** Whether to show the Shop Pay button */
    showShopPay?: boolean;
    /** Custom text for Add to Cart button */
    addToCartText?: string;
    /** Custom text for bundles */
    bundleText?: string;
    /** Custom text when sold out */
    soldOutText?: string;
    /** Whether this is a bundle product */
    isBundle?: boolean;
    /** Additional CSS classes for container */
    className?: string;
}

/**
 * Unified payment buttons component.
 * Displays Add to Cart and optionally Shop Pay button with consistent styling.
 *
 * @param props - Component props
 * @returns Payment buttons container
 */
export function PaymentButtons({
    variant,
    quantity = 1,
    sellingPlanId,
    storeDomain,
    showShopPay = true,
    addToCartText,
    bundleText,
    soldOutText,
    isBundle = false,
    className,
}: PaymentButtonsProps) {
    const { t } = useTranslation();

    const isAvailable = variant?.availableForSale ?? false;

    // Determine button text
    let buttonText: string;
    if (isAvailable) {
        buttonText =
            (isBundle ? bundleText : addToCartText) || t("cart.addToCart");
    } else {
        buttonText = soldOutText || t("product.soldOut");
    }

    if (!variant) {
        return null;
    }

    return (
        <div
            className={cn("flex flex-col gap-2", className)}
            style={
                { "--shop-pay-button-height": "100%" } as React.CSSProperties
            }
        >
            <AddToCartButton
                disabled={!isAvailable}
                lines={[
                    {
                        merchandiseId: variant.id,
                        quantity,
                        selectedVariant: variant,
                        sellingPlanId,
                    },
                ]}
                data-test="add-to-cart"
                className="w-full"
            >
                {buttonText}
            </AddToCartButton>

            {showShopPay && isAvailable && (
                <StyledShopPayButton
                    width="100%"
                    variantIdsAndQuantities={[
                        {
                            id: variant.id,
                            quantity,
                        },
                    ]}
                    storeDomain={storeDomain}
                />
            )}
        </div>
    );
}
