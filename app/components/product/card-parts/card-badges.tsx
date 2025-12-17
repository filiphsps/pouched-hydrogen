import { cn } from "~/utils/cn";
import {
    BestSellerBadge,
    BundleBadge,
    NewBadge,
    SoldOutBadge,
} from "../badges";

/**
 * Props for the CardBadges component.
 */
export interface CardBadgesProps {
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
    /** Badge position */
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    /** Additional CSS classes */
    className?: string;
}

/**
 * Container for product card status badges (new, bundle, bestseller, sold out).
 * Sale percentage is now shown inline with price for cleaner design.
 * Positioned over the image area with clean minimal styling.
 *
 * @param props - Component props
 * @returns Badge container with visible badges
 */
export function CardBadges({
    showNew = true,
    showBundle = true,
    showBestseller = true,
    showSoldOut = true,
    isBundle = false,
    isBestseller = false,
    isSoldOut = false,
    publishedAt,
    position = "top-left",
    className,
}: CardBadgesProps) {
    // Position inside the image area
    const positionClasses = {
        "top-left": "top-3 left-3",
        "top-right": "top-3 right-3",
        "bottom-left": "bottom-3 left-3",
        "bottom-right": "bottom-3 right-3",
    };

    return (
        <div
            className={cn(
                "absolute z-10 flex flex-col gap-1.5",
                positionClasses[position],
                className,
            )}
        >
            {showSoldOut && isSoldOut && <SoldOutBadge />}
            {showBundle && isBundle && <BundleBadge />}
            {showBestseller && isBestseller && <BestSellerBadge />}
            {showNew && publishedAt && <NewBadge publishedAt={publishedAt} />}
        </div>
    );
}
