import { cva, type VariantProps } from "class-variance-authority";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/button";
import { cn } from "~/utils/cn";
import { QuickShopTrigger } from "../quick-shop";
import { WishlistButton } from "../wishlist-button";

const variants = cva("transition-all duration-300", {
    variants: {
        layout: {
            inline: "flex items-center gap-2",
            overlay: "flex flex-col gap-2",
            stacked: "flex w-full flex-col gap-2",
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
    /** Product handle for quick shop */
    productHandle: string;
    /** Product ID for wishlist */
    productId: string;
    /** Whether to show quick add button */
    showQuickAdd?: boolean;
    /** Whether to show wishlist button */
    showWishlist?: boolean;
    /** Whether to show add to cart button */
    showAddToCart?: boolean;
    /** Quick shop button type */
    buttonType?: "icon" | "text";
    /** Quick shop panel type */
    quickShopPanelType?: "modal" | "drawer";
    /** Additional CSS classes */
    className?: string;
    /** Callback when add to cart is clicked */
    onAddToCart?: () => void;
    /** Whether to animate on hover */
    showOnHover?: boolean;
}

/**
 * Product card actions component with quick shop, wishlist, and add to cart.
 * Features refined styling and smooth hover reveal animations.
 *
 * @param props - Component props
 * @returns Action buttons container
 */
export function CardActions({
    productHandle,
    productId,
    showQuickAdd = true,
    showWishlist = true,
    showAddToCart = false,
    buttonType = "icon",
    quickShopPanelType = "modal",
    layout = "inline",
    className,
    onAddToCart,
    showOnHover = false,
}: CardActionsProps) {
    const { t } = useTranslation();

    return (
        <div
            className={cn(
                variants({ layout }),
                showOnHover &&
                    "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
                className,
            )}
        >
            {showQuickAdd && (
                <QuickShopTrigger
                    productHandle={productHandle}
                    showOnHover={false}
                    buttonType={buttonType}
                    buttonText={t("cart.addToCart")}
                    panelType={quickShopPanelType}
                />
            )}

            {showWishlist && <WishlistButton productId={productId} />}

            {showAddToCart && (
                <Button
                    variant="primary"
                    className={cn(
                        layout === "stacked" && "w-full",
                        layout === "inline" && "aspect-square h-full w-auto",
                    )}
                    onClick={onAddToCart}
                >
                    {t("cart.addToCart")}
                </Button>
            )}
        </div>
    );
}
