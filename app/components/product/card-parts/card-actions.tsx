import { useTranslation } from "react-i18next";
import { Button } from "~/components/button";
import { cn } from "~/utils/cn";
import { QuickShopTrigger } from "../quick-shop";
import { WishlistButton } from "../wishlist-button";

/**
 * Props for the CardActions component.
 */
export interface CardActionsProps {
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
    /** Layout style */
    layout?: "inline" | "overlay" | "stacked";
    /** Additional CSS classes */
    className?: string;
    /** Callback when add to cart is clicked */
    onAddToCart?: () => void;
}

/**
 * Product card actions component with quick shop, wishlist, and add to cart.
 * Supports multiple layout styles for different card variants.
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
}: CardActionsProps) {
    const { t } = useTranslation();

    const layoutClasses = {
        inline: "flex items-center gap-2",
        overlay: "flex flex-col gap-2",
        stacked: "flex flex-col gap-2 w-full",
    };

    return (
        <div className={cn(layoutClasses[layout], className)}>
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
                    className={cn(layout === "stacked" && "w-full")}
                    onClick={onAddToCart}
                >
                    {t("cart.addToCart")}
                </Button>
            )}
        </div>
    );
}
