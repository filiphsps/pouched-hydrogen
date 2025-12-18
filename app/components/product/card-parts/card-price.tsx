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
 * Price display with premium sale styling.
 * Features prominent current price, subtle compare-at, and eye-catching discount badge.
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
        sm: "text-[13px]",
        md: "text-[15px]",
        lg: "text-base",
    };

    const compareSizeClasses = {
        sm: "text-[11px]",
        md: "text-[13px]",
        lg: "text-sm",
    };

    return (
        <div
            className={cn("flex flex-wrap items-center gap-2", className)}
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
        >
            {/* Current price - prominent and bold */}
            <span
                className={cn(
                    "font-bold tracking-tight",
                    sizeClasses[size],
                    isOnSale ? "text-rose-600" : "text-gray-900",
                )}
                itemProp="price"
                content={price.amount}
            >
                <Money withoutTrailingZeros data={price} />
            </span>
            <meta itemProp="priceCurrency" content={price.currencyCode} />

            {/* Compare at price - subtle strikethrough */}
            {isOnSale && compareAtPrice && (
                <span
                    className={cn(
                        "text-gray-400 line-through decoration-gray-300",
                        compareSizeClasses[size],
                    )}
                >
                    <Money withoutTrailingZeros data={compareAtPrice} />
                </span>
            )}

            {/* Discount percentage badge - eye-catching */}
            {showPercentage && discountPercentage > 0 && (
                <span className="rounded-md bg-rose-100 px-1.5 py-0.5 font-bold text-[11px] text-rose-600">
                    -{discountPercentage}%
                </span>
            )}
        </div>
    );
}
