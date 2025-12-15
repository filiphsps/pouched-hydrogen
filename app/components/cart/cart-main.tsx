import { useOptimisticCart } from "@shopify/hydrogen";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import useScroll from "react-use/esm/useScroll";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { CartActions } from "~/components/cart/cart-actions";
import { CartBestSellers } from "~/components/cart/cart-best-sellers";
import { CartLineItem } from "~/components/cart/cart-line-item";
import { CartSummary } from "~/components/cart/cart-summary";
import { CartUpsells } from "~/components/cart/cart-upsells";
import { FreeShippingProgress } from "~/components/cart/free-shipping-progress";
import { Link } from "~/components/link";
import { ScrollArea } from "~/components/scroll-area";
import { Section } from "~/components/section";
import type { CartLayoutType } from "~/types/others";
import { cn } from "~/utils/cn";

function CartEmpty({
    hidden = false,
    layout = "drawer",
    onClose,
}: {
    hidden: boolean;
    layout?: CartLayoutType;
    onClose?: () => void;
}) {
    const { t } = useTranslation();
    const scrollRef = useRef<HTMLDivElement>(null);
    const { y } = useScroll(scrollRef as React.RefObject<HTMLElement>);
    return (
        <div
            ref={scrollRef}
            data-testid="cart-empty"
            className={cn(
                layout === "drawer" && [
                    "flex h-screen-dynamic flex-col content-start justify-center space-y-12 overflow-y-scroll px-5 pb-5 text-center transition",
                    y > 0 && "border-t",
                ],
                layout === "modal" && [
                    "flex min-h-64 flex-col content-start justify-center space-y-8 overflow-y-auto px-6 py-8 text-center",
                ],
                layout === "page" && [
                    "w-full gap-4 pb-12 md:items-start md:gap-8 lg:gap-12",
                ],
            )}
            hidden={hidden}
        >
            <div className={cn(layout === "page" && "text-center")}>
                <p className="mb-4">{t("cart.emptyMessage")}</p>
                <Link
                    variant="outline"
                    to="/products"
                    className={cn(
                        layout === "drawer" || layout === "modal"
                            ? "w-full"
                            : "min-w-48",
                        "justify-center",
                    )}
                    onClick={onClose}
                >
                    {t("cart.startShopping")}
                </Link>
            </div>
            {layout === "page" && (
                <Section width="fixed" verticalPadding="medium">
                    <div className="grid gap-4">
                        <CartBestSellers
                            count={4}
                            heading={t("cart.shopBestSellers")}
                            sortKey="BEST_SELLING"
                        />
                    </div>
                </Section>
            )}
        </div>
    );
}

export function CartMain({
    layout,
    onClose,
    cart: originalCart,
}: {
    layout: CartLayoutType;
    onClose?: () => void;
    cart?: CartApiQueryFragment | null;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { y } = useScroll(scrollRef as React.RefObject<HTMLElement>);
    const cart = useOptimisticCart<CartApiQueryFragment>(
        originalCart || undefined,
    );
    const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
    const cartHasItems = Boolean(cart) && cart.totalQuantity > 0;

    const cost = cart?.cost ?? null;

    return (
        <>
            <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
            <div
                className={cn(
                    (layout === "drawer" || layout === "modal") &&
                        "grid min-h-0 grow grid-cols-1 grid-rows-[minmax(0,1fr)_auto]",
                    layout === "page" && [
                        "mx-auto w-full max-w-(--page-width) pb-12",
                        "grid md:items-start lg:grid-cols-[1fr_480px]",
                        "gap-8 md:gap-8 lg:gap-12",
                    ],
                )}
            >
                <div
                    ref={scrollRef}
                    className={cn([
                        y > 0 ? "border-line-subtle border-t" : "",
                        layout === "page" && "grow md:translate-y-4",
                        (layout === "drawer" || layout === "modal") &&
                            "flex h-full flex-col transition",
                    ])}
                >
                    <ScrollArea
                        rootClassName={cn(
                            (layout === "drawer" || layout === "modal") &&
                                "flex-1 overflow-hidden",
                        )}
                        size="sm"
                    >
                        <div
                            className={cn(
                                "flex flex-col gap-3 py-3 lg:py-6",
                                layout === "page" && "px-4",
                                layout === "drawer" && "px-4",
                                layout === "modal" && "px-6",
                            )}
                        >
                            {/* Free shipping progress bar */}
                            <FreeShippingProgress
                                cartCost={cost}
                                className="mb-4"
                            />

                            <ul
                                className={cn(
                                    "grid",
                                    layout === "page" && "gap-9",
                                    layout === "drawer" && "gap-5",
                                    layout === "modal" && "gap-5",
                                )}
                            >
                                {(cart?.lines?.nodes ?? []).map((line) => (
                                    <>
                                        <CartLineItem
                                            key={line.id}
                                            line={line}
                                            layout={layout}
                                        />
                                        <div className="border-line-subtle border-t" />
                                    </>
                                ))}
                            </ul>

                            {/* Dynamic cart upsells */}
                            <CartUpsells
                                cartLineItems={cart?.lines?.nodes ?? []}
                                layout={layout}
                            />

                            {/* Summary */}
                            {cartHasItems && (
                                <CartSummary cart={cart} layout={layout} />
                            )}
                        </div>
                    </ScrollArea>
                </div>
                {cartHasItems && <CartActions cart={cart} layout={layout} />}
            </div>
        </>
    );
}
