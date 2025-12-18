import { ShoppingBagIcon } from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";
import { useTranslation } from "react-i18next";
import type { ProductVariantFragment } from "storefront-api.generated";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import { cn } from "~/utils/cn";
import { WishlistButton } from "../wishlist-button";

const variants = cva("transition-all duration-300", {
    variants: {
        layout: {
            inline: "flex items-center gap-2",
            overlay: "flex flex-col gap-2",
            stacked: "flex w-full items-center gap-3",
        },
    },
    defaultVariants: {
        layout: "inline",
    },
});

/**
 * Props for the CardActions component.
 */
export interface CardActionsProps extends VariantProps<typeof variants> {
    /** Product ID for wishlist */
    productId: string;
    /** Current selected variant for add to cart */
    variant?: ProductVariantFragment | null;
    /** Whether to show add to cart button */
    showQuickAdd?: boolean;
    /** Whether to show wishlist button */
    showWishlist?: boolean;
    /** Button type - icon only or with text */
    buttonType?: "icon" | "text";
    /** Additional CSS classes */
    className?: string;
    /** Whether to animate on hover */
    showOnHover?: boolean;
}

/**
 * Product card actions component with add to cart and wishlist.
 * Subtle, always-visible icon button that doesn't dominate the card.
 * Uses a refined bordered style that fills on hover.
 *
 * @param props - Component props
 * @returns Action buttons container
 */
export function CardActions({
    productId,
    variant,
    showQuickAdd = true,
    showWishlist = true,
    buttonType = "icon",
    layout = "inline",
    className,
    showOnHover = false,
}: CardActionsProps) {
    const { t } = useTranslation();

    const isAvailable = variant?.availableForSale ?? false;
    const lines = variant
        ? [{ merchandiseId: variant.id, quantity: 1, selectedVariant: variant }]
        : [];

    return (
        <div
            className={cn(
                variants({ layout }),
                showOnHover &&
                    "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
                className,
            )}
        >
            {showQuickAdd &&
                (buttonType === "icon" ? (
                    <AddToCartButton
                        lines={lines}
                        disabled={!isAvailable || !variant}
                        className="aspect-square h-9 w-9 rounded-full border border-gray-200 bg-white p-0 text-gray-600 shadow-none transition-all duration-200 hover:border-(--btn-primary-bg) hover:bg-(--btn-primary-bg) hover:text-(--btn-primary-text) hover:shadow-sm disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
                        width="auto"
                        aria-label={t("cart.addToCart")}
                    >
                        <ShoppingBagIcon size={16} weight="bold" />
                    </AddToCartButton>
                ) : (
                    <AddToCartButton
                        lines={lines}
                        disabled={!isAvailable || !variant}
                        className="aspect-square h-9 w-9 rounded-full border border-gray-200 bg-white p-0 text-gray-600 shadow-none transition-all duration-200 hover:border-(--btn-primary-bg) hover:bg-(--btn-primary-bg) hover:text-(--btn-primary-text) hover:shadow-sm disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
                        width="auto"
                        aria-label={t("cart.addToCart")}
                    >
                        <ShoppingBagIcon size={16} weight="bold" />
                    </AddToCartButton>
                ))}

            {showWishlist && <WishlistButton productId={productId} />}
        </div>
    );
}
