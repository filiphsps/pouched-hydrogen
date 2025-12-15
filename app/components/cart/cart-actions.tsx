import type { OptimisticCart } from "@shopify/hydrogen";
import { useTranslation } from "react-i18next";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Button } from "~/components/button";
import { Link } from "~/components/link";
import type { CartLayoutType } from "~/types/others";
import { cn } from "~/utils/cn";

export function CartActions({
    cart: { checkoutUrl },
    layout,
}: {
    cart: OptimisticCart<CartApiQueryFragment>;
    layout: CartLayoutType;
}) {
    const { t } = useTranslation();

    if (!checkoutUrl) {
        return null;
    }

    return (
        <div
            className={cn(
                layout === "drawer" &&
                    "grid border-line-subtle border-t px-4 pt-4",
                layout === "modal" &&
                    "grid border-line-subtle border-t px-6 py-4",
                layout === "page" &&
                    "sticky top-(--height-nav) grid w-full rounded-sm py-4 md:translate-y-4 md:px-6 lg:py-0",
            )}
        >
            {checkoutUrl && (
                <div className="mt-4 flex flex-col gap-3">
                    <a href={checkoutUrl} target="_self">
                        <Button className="w-full">
                            {t("cart.continueToCheckout")}
                        </Button>
                    </a>
                    {/* @todo: <CartShopPayButton cart={cart} /> */}
                    {(layout === "drawer" || layout === "modal") && (
                        <Link
                            variant="underline"
                            to="/cart"
                            className="mx-auto w-fit"
                        >
                            {t("cart.viewCart")}
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
