/**
 * Cart Upsells Component.
 * Displays intelligent product recommendations inside the cart
 * based on items currently in the cart ("Pairs well with").
 *
 * @example
 * ```tsx
 * <CartUpsells cartLineItems={cart.lines.nodes} />
 * ```
 */

import { useThemeSettings } from "@weaverse/hydrogen";
import { useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import type { ProductCardFragment } from "storefront-api.generated";
import { ProductCard } from "~/components/product/product-card";
import { Skeleton } from "~/components/skeleton";
import { Title } from "~/components/title";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import { cn } from "~/utils/cn";

interface CartUpsellsProps {
    /** Cart line items to get recommendations for */
    cartLineItems: Array<{
        merchandise: {
            product: {
                id: string;
            };
        };
    }>;
    /** Number of upsell products to display */
    count?: number;
    /** Layout variant */
    layout?: "drawer" | "page";
    /** Optional additional CSS classes */
    className?: string;
}

interface CartUpsellsResponse {
    products: ProductCardFragment[];
}

/**
 * Cart Upsells Component.
 * Fetches and displays product recommendations for items in cart.
 */
export function CartUpsells({
    cartLineItems,
    count = 4,
    layout = "drawer",
    className,
}: CartUpsellsProps) {
    const { t } = useTranslation();
    const { cartUpsellsEnabled = true, cartUpsellsHeading } =
        useThemeSettings();
    const { load, data, state } = useFetcher<CartUpsellsResponse>();

    // Extract product IDs from cart
    const productIds = cartLineItems
        .map((line) => line.merchandise?.product?.id)
        .filter(Boolean);

    // Build query params
    const queryParams = new URLSearchParams({
        productIds: productIds.join(","),
        excludeIds: productIds.join(","), // Exclude products already in cart
        count: String(count),
    });

    const upsellsApiPath = usePrefixPathWithLocale(
        `/api/cart-upsells?${queryParams.toString()}`,
    );

    // Fetch upsells when cart changes
    // biome-ignore lint/correctness/useExhaustiveDependencies: only refetch when product IDs change
    useEffect(() => {
        if (cartUpsellsEnabled && productIds.length > 0) {
            load(upsellsApiPath);
        }
    }, [productIds.join(","), cartUpsellsEnabled]);

    // Don't render if disabled or no products in cart
    if (!cartUpsellsEnabled || productIds.length === 0) {
        return null;
    }

    const products = data?.products || [];
    const isLoading = state === "loading";
    const hasProducts = products.length > 0;

    // Don't render if no upsells found
    if (!isLoading && !hasProducts) {
        return null;
    }

    return (
        <div className={cn("mt-4 border-line-subtle border-t pt-4", className)}>
            <Title as="h3" className="mb-3 font-medium" size="base">
                {cartUpsellsHeading || t("cart.upsells.heading")}
            </Title>

            <div
                className={cn(
                    "grid gap-3",
                    layout === "drawer"
                        ? "grid-cols-2"
                        : "grid-cols-2 sm:grid-cols-4",
                )}
            >
                {isLoading ? (
                    <CartUpsellsSkeleton count={Math.min(count, 2)} />
                ) : (
                    products
                        .slice(0, layout === "drawer" ? 2 : count)
                        .map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                className="[&_.best-seller-badge,&_.bundle-badge,&_.new-badge]:hidden"
                            />
                        ))
                )}
            </div>
        </div>
    );
}

/**
 * Loading skeleton for cart upsells.
 */
function CartUpsellsSkeleton({ count = 2 }: { count?: number }) {
    const id = useId();

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={`${id}-${i}`} className="grid gap-2">
                    <Skeleton className="aspect-square" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </>
    );
}
