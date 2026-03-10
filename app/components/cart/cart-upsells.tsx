/**
 * Cart Upsells Component.
 * Displays intelligent product recommendations inside the cart
 * based on items currently in the cart ("Pairs well with").
 *
 * Features:
 * - Intelligent recommendations based on ALL cart items
 * - Multiple algorithms for A/B testing (hybrid, shopify, popularity)
 * - One-click quick add to cart functionality
 * - Tracks algorithm used for analytics
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
import { Skeleton } from "~/components/skeleton";
import { Title } from "~/components/title";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type {
    CartUpsellsResponse,
    UpsellAlgorithm,
} from "~/routes/api/cart-upsells";
import type { CartLayoutType } from "~/types/others";
import { cn } from "~/utils/cn";
import { UpsellProductCard } from "./upsell-product-card";

/**
 * Props for the CartUpsells component.
 */
export interface CartUpsellsProps {
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
    layout?: CartLayoutType;
    /** Optional additional CSS classes */
    className?: string;
    /** Callback when algorithm is tracked (for A/B testing analytics) */
    onAlgorithmTrack?: (algorithm: UpsellAlgorithm) => void;
}

/**
 * Cart Upsells Component.
 * Fetches and displays intelligent product recommendations for items in cart.
 * Supports A/B testing with configurable recommendation algorithms.
 */
export function CartUpsells({
    cartLineItems,
    count = 4,
    layout = "drawer",
    className,
    onAlgorithmTrack,
}: CartUpsellsProps) {
    const { t } = useTranslation();
    const {
        cartUpsellsEnabled = true,
        cartUpsellsHeading,
        cartUpsellsAlgorithm = "hybrid",
        cartUpsellsQuickAdd = true,
    } = useThemeSettings();
    const { load, data, state } = useFetcher<CartUpsellsResponse>();

    // Extract product IDs from cart
    const productIds = cartLineItems
        .map((line) => line.merchandise?.product?.id)
        .filter(Boolean);

    // Build query params with algorithm for A/B testing
    const queryParams = new URLSearchParams({
        productIds: productIds.join(","),
        excludeIds: productIds.join(","),
        count: String(count),
        algorithm: cartUpsellsAlgorithm as string,
    });

    const upsellsApiPath = usePrefixPathWithLocale(
        `/api/cart-upsells?${queryParams.toString()}`,
    );

    // Fetch upsells when cart changes
    // biome-ignore lint/correctness/useExhaustiveDependencies: only refetch when product IDs or algorithm change
    useEffect(() => {
        if (cartUpsellsEnabled && productIds.length > 0) {
            load(upsellsApiPath);
        }
    }, [productIds.join(","), cartUpsellsEnabled, cartUpsellsAlgorithm]);

    // Track algorithm used for A/B testing analytics
    useEffect(() => {
        if (data?.algorithm && onAlgorithmTrack) {
            onAlgorithmTrack(data.algorithm);
        }
    }, [data?.algorithm, onAlgorithmTrack]);

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

    const displayCount = layout === "drawer" ? 2 : count;

    return (
        <div className={cn(className)} data-upsell-algorithm={data?.algorithm}>
            <Title as="h3" className="mb-3 font-medium" size="base">
                {cartUpsellsHeading || t("cart.upsells.heading")}
            </Title>

            <div
                className={cn(
                    "grid gap-3",
                    layout === "drawer"
                        ? "grid-cols-1"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                )}
            >
                {isLoading ? (
                    <CartUpsellsSkeleton count={Math.min(count, 2)} />
                ) : (
                    products
                        .slice(0, displayCount)
                        .map((product) => (
                            <UpsellProductCard
                                key={product.id}
                                product={product}
                                showQuickAdd={cartUpsellsQuickAdd}
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
                <div key={`${id}-${i}`} className="flex gap-4 p-4">
                    <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
                    <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="mt-auto flex justify-between">
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}
