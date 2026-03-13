import { HandbagIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { type CartReturn, useAnalytics } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { useCartDrawerStore, useCartStore } from "~/lib/cart";
import { cn } from "~/utils/cn";
import { CartContent } from "./cart-content";

/**
 * Cart drawer component — the single overlay cart entry point.
 * Displays the cart as a slide-in drawer from the right side on all screens.
 *
 * Cart data is awaited in the root loader (not deferred) to ensure
 * it always reflects the latest state after mutations.
 *
 * @example
 * ```tsx
 * // In header component
 * <CartDrawer />
 * ```
 */
export function CartDrawer() {
    const cart = useCartStore((s) => s.cart);
    const { publish } = useAnalytics();
    const {
        isOpen,
        close: closeCartDrawer,
        toggle: toggleCartDrawer,
    } = useCartDrawerStore();
    const location = useLocation();
    const { cartDrawerWidth = 480 } = useThemeSettings();

    // Close on any route change
    // biome-ignore lint/correctness/useExhaustiveDependencies: close on any route change (including same page)
    useEffect(() => {
        closeCartDrawer();
    }, [location.key, closeCartDrawer]);

    return (
        <Dialog.Root open={isOpen} onOpenChange={toggleCartDrawer}>
            <Dialog.Trigger
                onClick={() => publish("custom_sidecart_viewed", { cart })}
                className="relative flex h-8 w-8 items-center justify-center focus:ring-border"
            >
                <HandbagIcon className="h-5 w-5" />
                {cart && cart.totalQuantity > 0 && (
                    <div
                        className={cn(
                            "cart-count absolute top-0 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-center text-center font-medium text-[13px] leading-none transition-colors duration-300 group-hover/header:bg-(--color-header-text) group-hover/header:text-(--color-header-bg)",
                        )}
                    >
                        <span className="-mr-px">{cart.totalQuantity}</span>
                    </div>
                )}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-10 bg-black/50 data-[state=closed]:animate-[fade-out_150ms_ease-in] data-[state=open]:animate-[fade-in_150ms_ease-out]" />
                <Dialog.Content
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    className="fixed inset-y-0 right-0 z-10 w-screen bg-background pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] data-[state=closed]:animate-[exit-to-right_200ms_ease-in] data-[state=open]:animate-[enter-from-right_200ms_ease-out]"
                    style={{
                        maxWidth: `${cartDrawerWidth}px`,
                    }}
                    aria-describedby={undefined}
                >
                    <CartContent cart={cart as CartReturn} />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
