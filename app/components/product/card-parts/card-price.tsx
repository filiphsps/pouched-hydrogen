import { Money } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { cn } from "~/utils/cn";

/**
 * Calculate discount percentage between two prices.
 */
function calculateDiscountPercentage(
    price: MoneyV2,
    compareAtPrice: MoneyV2,
): number {
    const priceNum = Number(price.amount);
    const compareNum = Number(compareAtPrice.amount);
    if (compareNum > priceNum) {
        return Math.round(((compareNum - priceNum) / compareNum) * 100);
    }
    return 0;
}

/**
 * Props for the CardPrice component.
 */
export interface CardPriceProps {
    /** Current price */
    price: MoneyV2;
    /** Compare at price (original price for sale items) */
    compareAtPrice?: MoneyV2 | null;
    /** Whether to show the compare at price */
    showCompareAt?: boolean;
    /** Whether to show percentage discount badge */
    showPercentage?: boolean;
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Additional CSS classes */
    className?: string;
}

/**
 * Price display with optional compare-at price for sales.
 * Clean minimal design with clear price hierarchy.
 *
 * @param props - Component props
 * @returns Price display with optional sale styling
 */
export function CardPrice({
    price,
    compareAtPrice,
    showCompareAt = true,
    showPercentage = true,
    size = "md",
    className,
}: CardPriceProps) {
    const isOnSale =
        showCompareAt &&
        compareAtPrice &&
        Number(compareAtPrice.amount) > Number(price.amount);

    const discountPercentage =
        isOnSale && compareAtPrice
            ? calculateDiscountPercentage(price, compareAtPrice)
            : 0;

    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    };

    return (
        <div
            className={cn("flex flex-wrap items-baseline gap-2", className)}
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
        >
            {/* Current price */}
            <span
                className={cn("font-bold text-foreground", sizeClasses[size])}
                itemProp="price"
                content={price.amount}
            >
                <Money withoutTrailingZeros data={price} />
            </span>
            <meta itemProp="priceCurrency" content={price.currencyCode} />

            {/* Compare at price */}
            {isOnSale && compareAtPrice && (
                <span className="text-body-subtle text-sm line-through">
                    <Money withoutTrailingZeros data={compareAtPrice} />
                </span>
            )}

            {/* Discount percentage badge */}
            {showPercentage && discountPercentage > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 font-semibold text-white text-xs">
                    -{discountPercentage}%
                </span>
            )}
        </div>
    );
}
