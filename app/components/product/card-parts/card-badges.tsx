import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { cn } from "~/utils/cn";
import {
    BestSellerBadge,
    BundleBadge,
    NewBadge,
    SaleBadge,
    SoldOutBadge,
} from "../badges";

/**
 * Props for the CardBadges component.
 */
export interface CardBadgesProps {
    /** Whether to show the sale badge */
    showSale?: boolean;
    /** Whether to show the new badge */
    showNew?: boolean;
    /** Whether to show the bundle badge */
    showBundle?: boolean;
    /** Whether to show the bestseller badge */
    showBestseller?: boolean;
    /** Whether to show the sold out badge */
    showSoldOut?: boolean;
    /** Whether the product is a bundle */
    isBundle?: boolean;
    /** Whether the product is a bestseller */
    isBestseller?: boolean;
    /** Whether the product is sold out */
    isSoldOut?: boolean;
    /** Product published date for new badge calculation */
    publishedAt?: string;
    /** Current price for sale calculation */
    price?: MoneyV2;
    /** Compare at price for sale calculation */
    compareAtPrice?: MoneyV2;
    /** Badge position */
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    /** Additional CSS classes */
    className?: string;
}

/**
 * Container for product card badges (sale, new, bundle, bestseller, sold out).
 * Automatically handles visibility based on product state and settings.
 *
 * @param props - Component props
 * @returns Badge container with visible badges
 */
export function CardBadges({
    showSale = true,
    showNew = true,
    showBundle = true,
    showBestseller = true,
    showSoldOut = true,
    isBundle = false,
    isBestseller = false,
    isSoldOut = false,
    publishedAt,
    price,
    compareAtPrice,
    position = "top-left",
    className,
}: CardBadgesProps) {
    const positionClasses = {
        "top-left": "top-2 left-2",
        "top-right": "top-2 right-2",
        "bottom-left": "bottom-2 left-2",
        "bottom-right": "bottom-2 right-2",
    };

    return (
        <div
            className={cn(
                "absolute z-10 flex flex-wrap gap-1.5",
                positionClasses[position],
                className,
            )}
        >
            {showBundle && isBundle && <BundleBadge />}
            {showSale && price && compareAtPrice && (
                <SaleBadge price={price} compareAtPrice={compareAtPrice} />
            )}
            {showBestseller && isBestseller && <BestSellerBadge />}
            {showNew && publishedAt && <NewBadge publishedAt={publishedAt} />}
            {showSoldOut && isSoldOut && <SoldOutBadge />}
        </div>
    );
}
