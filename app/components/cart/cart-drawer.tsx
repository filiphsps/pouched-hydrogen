import { HandbagIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { type CartReturn, useAnalytics } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { Suspense, useEffect } from "react";
import { Await, useLocation, useRouteLoaderData } from "react-router";
import Link from "~/components/link";
import type { RootLoader } from "~/root";
import { cn } from "~/utils/cn";
import { CartContent } from "./cart-content";
import { useCartDrawerStore } from "./store";

/**
 * Cart drawer component for mobile screens.
 * Displays the cart as a slide-in drawer from the right side.
 *
 * @example
 * ```tsx
 * // Used internally by CartContainer
 * <CartDrawer />
 * ```
 */
export function CartDrawer() {
    const rootData = useRouteLoaderData<RootLoader>("root");
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
        <Suspense
            fallback={
                <Link
                    to="/cart"
                    className="relative flex h-8 w-8 items-center justify-center focus:ring-border"
                >
                    <HandbagIcon className="h-5 w-5" />
                </Link>
            }
        >
            <Await resolve={rootData?.cart}>
                {(cart) => (
                    <Dialog.Root open={isOpen} onOpenChange={toggleCartDrawer}>
                        <Dialog.Trigger
                            onClick={() =>
                                publish("custom_sidecart_viewed", { cart })
                            }
                            className="relative flex h-8 w-8 items-center justify-center focus:ring-border"
                        >
                            <HandbagIcon className="h-5 w-5" />
                            {cart && cart?.totalQuantity > 0 && (
                                <div
                                    className={cn(
                                        "cart-count",
                                        "-right-1.5 absolute top-0",
                                        "flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-center",
                                        "text-center font-medium text-[13px] leading-none",
                                        "transition-colors duration-300",
                                        "group-hover/header:bg-(--color-header-text)",
                                        "group-hover/header:text-(--color-header-bg)",
                                    )}
                                >
                                    <span className="-mr-px">
                                        {cart?.totalQuantity}
                                    </span>
                                </div>
                            )}
                        </Dialog.Trigger>
                        <Dialog.Portal>
                            <Dialog.Overlay
                                className={cn(
                                    "fixed inset-0 z-10 bg-black/50",
                                    "data-[state=open]:animate-[fade-in_150ms_ease-out]",
                                    "data-[state=closed]:animate-[fade-out_150ms_ease-in]",
                                )}
                            />
                            <Dialog.Content
                                onCloseAutoFocus={(e) => e.preventDefault()}
                                className={cn(
                                    "fixed inset-y-0 right-0 z-10 w-screen bg-background pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]",
                                    "data-[state=open]:animate-[enter-from-right_200ms_ease-out]",
                                    "data-[state=closed]:animate-[exit-to-right_200ms_ease-in]",
                                )}
                                style={{
                                    maxWidth: `${cartDrawerWidth}px`,
                                }}
                                aria-describedby={undefined}
                            >
                                <CartContent
                                    cart={cart as CartReturn}
                                    layout="drawer"
                                />
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                )}
            </Await>
        </Suspense>
    );
}
