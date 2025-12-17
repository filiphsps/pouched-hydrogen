import { HeartIcon } from "@phosphor-icons/react";
import { cn } from "~/utils/cn";
import { useWishlistStore } from "./wishlist-store";

/**
 * Props for the WishlistButton component.
 */
interface WishlistButtonProps {
    /** The unique identifier of the product. */
    productId: string;
    /** Size variant */
    size?: "sm" | "md";
    /** Additional CSS class names for styling. */
    className?: string;
}

/**
 * A wishlist button component that displays a heart icon.
 * Toggles between filled (wishlisted) and outline (not wishlisted) states.
 * Clean minimal design with subtle hover effects.
 *
 * @param props - The component props
 * @returns A button element with a heart icon
 */
export function WishlistButton({
    productId,
    size = "md",
    className,
}: WishlistButtonProps) {
    const isWishlisted = useWishlistStore((state) =>
        state.items.includes(productId),
    );
    const toggleItem = useWishlistStore((state) => state.toggleItem);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(productId);
    };

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-9 w-9",
    };

    const iconSizes = {
        sm: 16,
        md: 18,
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                "group/wishlist flex items-center justify-center rounded-full transition-all duration-200",
                sizeClasses[size],
                isWishlisted
                    ? "bg-red-50 hover:bg-red-100"
                    : "bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white hover:shadow-md",
                className,
            )}
            aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            aria-pressed={isWishlisted}
        >
            <HeartIcon
                size={iconSizes[size]}
                weight={isWishlisted ? "fill" : "regular"}
                className={cn(
                    "transition-colors duration-200",
                    isWishlisted
                        ? "text-red-500"
                        : "text-gray-500 group-hover/wishlist:text-red-500",
                )}
            />
        </button>
    );
}
