import type { OptimisticCart } from "@shopify/hydrogen";
import { useTranslation } from "react-i18next";
import { useRouteLoaderData } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Button } from "~/components/button";
import { Link } from "~/components/link";
import { StyledShopPayButton } from "~/components/product/styled-shop-pay-button";
import type { RootLoader } from "~/root";
import type { CartLayoutType } from "~/types/others";
import { cn } from "~/utils/cn";

/**
 * Cart actions component with checkout, Shop Pay, and view cart buttons.
 *
 * @param props.cart - Optimistic cart data
 * @param props.layout - "drawer" or "page"
 */
export function CartActions({
    cart: { checkoutUrl, lines },
    layout,
}: {
    cart: OptimisticCart<CartApiQueryFragment>;
    layout: CartLayoutType;
}) {
    const { t } = useTranslation();
    const rootData = useRouteLoaderData<RootLoader>("root");
    const storeDomain = rootData?.layout?.shop?.primaryDomain?.url ?? "";

    if (!checkoutUrl) {
        return null;
    }

    // Extract variant IDs for Shop Pay button
    const variantIds =
        lines?.nodes?.map((line) => line.merchandise?.id).filter(Boolean) ?? [];

    return (
        <div
            className={cn(
                layout === "drawer" &&
                    "grid border-line-subtle border-t px-4 pt-4",
                layout === "page" &&
                    "sticky top-(--height-nav) grid w-full rounded-sm py-4 md:translate-y-4 md:px-6 lg:py-0",
            )}
        >
            <div className="mt-4 flex flex-col gap-3">
                <a href={checkoutUrl} target="_self">
                    <Button className="w-full">
                        {t("cart.continueToCheckout")}
                    </Button>
                </a>
                {variantIds.length > 0 && storeDomain && (
                    <StyledShopPayButton
                        variantIds={variantIds}
                        storeDomain={storeDomain}
                        className="w-full"
                    />
                )}
                {layout === "drawer" && (
                    <Link
                        variant="underline"
                        to="/cart"
                        className="mx-auto w-fit"
                    >
                        {t("cart.viewCart")}
                    </Link>
                )}
            </div>
        </div>
    );
}
