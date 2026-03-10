import type { CartReturn } from "@shopify/hydrogen";
import { CartMain } from "~/components/cart/cart-main";
import { CartHeader } from "./cart-header";

/**
 * Props for the CartContent component.
 */
interface CartContentProps {
    /** Cart data from Shopify */
    cart: CartReturn;
}

/**
 * Cart content wrapper used by the CartDrawer.
 * Contains the header, cart items, upsells, and summary.
 *
 * @example
 * ```tsx
 * <CartContent cart={cart} />
 * ```
 */
export function CartContent({ cart }: CartContentProps) {
    return (
        <div className="flex h-full flex-col space-y-3">
            <CartHeader totalQuantity={cart?.totalQuantity ?? 0} />
            <CartMain layout="drawer" cart={cart} />
        </div>
    );
}
