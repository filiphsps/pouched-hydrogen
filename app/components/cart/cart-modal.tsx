import { HandbagIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { type CartReturn, useAnalytics } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { Suspense, useEffect } from "react";
import { Await, useLocation, useRouteLoaderData } from "react-router";
import Link from "~/components/link";
import { ModalContainer } from "~/components/modal";
import type { RootLoader } from "~/root";
import { cn } from "~/utils/cn";
import { CartContent } from "./cart-content";
import { useCartDrawerStore } from "./store";

/**
 * Cart modal component for desktop screens.
 * Displays the cart as a centered modal overlay using the shared ModalContainer.
 *
 * @example
 * ```tsx
 * // Used internally by CartContainer
 * <CartModal />
 * ```
 */
export function CartModal() {
    const rootData = useRouteLoaderData<RootLoader>("root");
    const { publish } = useAnalytics();
    const {
        isOpen,
        close: closeCartModal,
        toggle: toggleCartModal,
    } = useCartDrawerStore();
    const location = useLocation();
    const { cartModalMaxWidth = 768, cartModalAnimation = "slide-up" } =
        useThemeSettings();

    // Close on any route change
    // biome-ignore lint/correctness/useExhaustiveDependencies: close on any route change (including same page)
    useEffect(() => {
        closeCartModal();
    }, [location.key, closeCartModal]);

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
                    <>
                        <Dialog.Root
                            open={isOpen}
                            onOpenChange={toggleCartModal}
                        >
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
                        </Dialog.Root>
                        <ModalContainer
                            open={isOpen}
                            onOpenChange={toggleCartModal}
                            title="Shopping Cart"
                            maxWidth={cartModalMaxWidth}
                            maxHeight="85vh"
                            animation={
                                cartModalAnimation as
                                    | "slide-up"
                                    | "scale"
                                    | "fade"
                            }
                            showCloseButton={false}
                            className="flex flex-col"
                        >
                            <CartContent
                                cart={cart as CartReturn}
                                layout="modal"
                            />
                        </ModalContainer>
                    </>
                )}
            </Await>
        </Suspense>
    );
}
