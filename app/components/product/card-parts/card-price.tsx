import { Money } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { cn } from "~/utils/cn";

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
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Additional CSS classes */
    className?: string;
}

/**
 * Price display with optional compare-at price for sales.
 * Includes Schema.org Offer markup for SEO.
 *
 * @param props - Component props
 * @returns Price display with optional sale styling
 */
export function CardPrice({
    price,
    compareAtPrice,
    showCompareAt = true,
    size = "md",
    className,
}: CardPriceProps) {
    const isOnSale =
        showCompareAt &&
        compareAtPrice &&
        Number(compareAtPrice.amount) > Number(price.amount);

    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-xl font-semibold",
    };

    return (
        <div
            className={cn("flex flex-wrap items-center gap-2", className)}
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
        >
            {/* Current price */}
            <span
                className={cn(
                    "font-semibold text-foreground",
                    sizeClasses[size],
                )}
                itemProp="price"
                content={price.amount}
            >
                <Money withoutTrailingZeros data={price} />
            </span>
            <meta itemProp="priceCurrency" content={price.currencyCode} />

            {/* Compare at price */}
            {isOnSale && compareAtPrice && (
                <span
                    className={cn(
                        "text-muted-foreground line-through",
                        size === "lg" ? "text-base" : "text-sm",
                    )}
                >
                    <Money withoutTrailingZeros data={compareAtPrice} />
                </span>
            )}
        </div>
    );
}
