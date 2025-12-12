import { useOptimisticCart } from "@shopify/hydrogen";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import useScroll from "react-use/esm/useScroll";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Link } from "~/components/link";
import { ScrollArea } from "~/components/scroll-area";
import { Section } from "~/components/section";
import type { CartLayoutType } from "~/types/others";
import { cn } from "~/utils/cn";
import { CartBestSellers } from "./cart-best-sellers";
import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";
import { CartUpsells } from "./cart-upsells";

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
                        layout === "drawer" ? "w-full" : "min-w-48",
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

    return (
        <>
            <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
            <div
                className={cn(
                    layout === "drawer" &&
                        "grid grow grid-cols-1 grid-rows-[1fr_auto]",
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
                        "pb-4",
                        y > 0 ? "border-line-subtle border-t" : "",
                        layout === "page" && "grow md:translate-y-4",
                        layout === "drawer" && "transition",
                    ])}
                >
                    <ScrollArea
                        className={cn(
                            layout === "drawer" && "max-h-[calc(100vh-312px)]",
                        )}
                        size="sm"
                    >
                        <ul
                            className={cn(
                                "grid px-4",
                                layout === "page" && "gap-9",
                                layout === "drawer" && "gap-5",
                            )}
                        >
                            {(cart?.lines?.nodes ?? []).map((line) => (
                                <CartLineItem
                                    key={line.id}
                                    line={line}
                                    layout={layout}
                                />
                            ))}
                        </ul>
                    </ScrollArea>
                    {/* Dynamic cart upsells */}
                    <CartUpsells
                        cartLineItems={cart?.lines?.nodes ?? []}
                        layout={layout}
                        className="px-4"
                    />
                </div>
                {cartHasItems && <CartSummary cart={cart} layout={layout} />}
            </div>
        </>
    );
}
