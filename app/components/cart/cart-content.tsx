import type { CartReturn } from "@shopify/hydrogen";
import { CartMain } from "~/components/cart/cart-main";
import type { CartLayoutType } from "~/types/others";
import { cn } from "~/utils/cn";
import { CartHeader } from "./cart-header";

/**
 * Props for the CartContent component.
 */
interface CartContentProps {
    /** Cart data from Shopify */
    cart: CartReturn;
    /** Layout variant affecting styling and behavior */
    layout: Exclude<CartLayoutType, "page">;
}

/**
 * Unified cart content wrapper used by both CartDrawer and CartModal.
 * Contains the header, cart items, upsells, and summary.
 *
 * @example
 * ```tsx
 * <CartContent cart={cart} layout="drawer" />
 * ```
 */
export function CartContent({ cart, layout }: CartContentProps) {
    return (
        <div
            className={cn(
                "flex flex-col",
                layout === "drawer" && "h-full space-y-3",
                layout === "modal" &&
                    "h-full max-h-full min-h-0 overflow-hidden",
            )}
        >
            <CartHeader
                totalQuantity={cart?.totalQuantity ?? 0}
                layout={layout}
            />
            <CartMain layout={layout} cart={cart} />
        </div>
    );
}
