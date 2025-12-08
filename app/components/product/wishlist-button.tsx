import { Heart } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "~/utils/cn";

/**
 * Props for the WishlistButton component.
 */
interface WishlistButtonProps {
    /** The unique identifier of the product. */
    productId: string;
    /** Whether the product is initially wishlisted. */
    initialWishlisted?: boolean;
    /** Additional CSS class names for styling. */
    className?: string;
}

/**
 * A wishlist button component that displays a heart icon.
 * Toggles between filled (wishlisted) and outline (not wishlisted) states.
 * Currently uses local state - can be integrated with backend wishlist API.
 *
 * @param props - The component props
 * @returns A button element with a heart icon
 */
export function WishlistButton({
    productId,
    initialWishlisted = false,
    className,
}: WishlistButtonProps) {
    const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);

    /**
     * Handles the click event on the wishlist button.
     * Toggles the wishlisted state and prevents event propagation.
     *
     * @param e - The mouse event
     */
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
        // TODO: Implement wishlist backend integration
        // This could call a wishlist API or update local storage
        console.log(
            `Wishlist ${isWishlisted ? "removed" : "added"} for product: ${productId}`,
        );
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full shadow-md outline-none transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
                isWishlisted
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white text-gray-700 hover:bg-gray-50",
                className,
            )}
            aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            aria-pressed={isWishlisted}
        >
            <Heart size={20} weight={isWishlisted ? "fill" : "regular"} />
        </button>
    );
}
