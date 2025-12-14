import { HeartIcon } from "@phosphor-icons/react";
import { Button } from "~/components/button";
import { cn } from "~/utils/cn";
import { useWishlistStore } from "./wishlist-store";

/**
 * Props for the WishlistButton component.
 */
interface WishlistButtonProps {
    /** The unique identifier of the product. */
    productId: string;
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
export function WishlistButton({ productId, className }: WishlistButtonProps) {
    const isWishlisted = useWishlistStore((state) =>
        state.items.includes(productId),
    );
    const toggleItem = useWishlistStore((state) => state.toggleItem);

    /**
     * Handles the click event on the wishlist button.
     * Toggles the wishlisted state and prevents event propagation.
     *
     * @param e - The mouse event
     */
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(productId);
    };

    return (
        <Button
            variant="custom"
            type="button"
            onClick={handleClick}
            className={cn(
                "group/wishlist flex h-10 w-10 items-center justify-center rounded-full border-0 p-0 shadow-xs outline-none ring-0 ring-line transition-all duration-200 hover:ring-2 hover:ring-offset-2",
                isWishlisted
                    ? "bg-red-500 text-white hover:bg-background"
                    : "bg-background text-gray-700 hover:bg-background",
                className,
            )}
            aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            aria-pressed={isWishlisted}
        >
            <HeartIcon
                size={20}
                weight={isWishlisted ? "fill" : "regular"}
                className={cn(
                    "transition-colors duration-200",
                    isWishlisted
                        ? "text-white group-hover/wishlist:text-body"
                        : "text-body group-hover/wishlist:text-red-500",
                )}
            />
        </Button>
    );
}
