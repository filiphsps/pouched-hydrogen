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
 * Premium positioning with refined shadow effects for depth.
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
    // Position with refined spacing
    const positionClasses = {
        "top-left": "top-2.5 left-2.5",
        "top-right": "top-2.5 right-2.5",
        "bottom-left": "bottom-2.5 left-2.5",
        "bottom-right": "bottom-2.5 right-2.5",
    };

    const hasBadges =
        (showSoldOut && isSoldOut) ||
        (showBundle && isBundle) ||
        (showBestseller && isBestseller) ||
        (showNew && publishedAt);

    if (!hasBadges) return null;

    return (
        <div
            className={cn(
                "absolute z-10 flex flex-col gap-1.5",
                positionClasses[position],
                className,
            )}
        >
            {showSoldOut && isSoldOut && <SoldOutBadge className="shadow-sm" />}
            {showBundle && isBundle && <BundleBadge className="shadow-sm" />}
            {showBestseller && isBestseller && (
                <BestSellerBadge className="shadow-sm" />
            )}
            {showNew && publishedAt && (
                <NewBadge publishedAt={publishedAt} className="shadow-sm" />
            )}
        </div>
    );
}
