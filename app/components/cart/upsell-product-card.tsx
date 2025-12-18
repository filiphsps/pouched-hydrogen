/**
 * Upsell Product Card Component.
 * Compact product card designed for cart upsells with one-click add to cart.
 *
 * Features:
 * - Compact list-style layout optimized for cart drawer/modal
 * - One-click quick add to cart (no modal required)
 * - Shows product image, title, vendor, and price
 * - Uses CartForm for seamless cart integration
 */

import { HandbagSimpleIcon } from "@phosphor-icons/react";
import { CartForm, Image, Money } from "@shopify/hydrogen";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FetcherWithComponents } from "react-router";
import type { ProductCardFragment } from "storefront-api.generated";
import { Button } from "~/components/button";
import { Link } from "~/components/link";
import { Spinner } from "~/components/spinner";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import { cn } from "~/utils/cn";

/**
 * Props for the UpsellProductCard component.
 */
export interface UpsellProductCardProps {
    /** Product data from GraphQL fragment */
    product: ProductCardFragment;
    /** Whether to show quick add button */
    showQuickAdd?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Upsell Product Card with one-click add to cart.
 * Displays a compact product card optimized for cart upsells.
 */
export function UpsellProductCard({
    product,
    showQuickAdd = true,
    className,
}: UpsellProductCardProps) {
    const { t } = useTranslation();
    const productUrl = usePrefixPathWithLocale(`/products/${product.handle}`);

    const firstVariant = product.selectedOrFirstAvailableVariant;
    const image = product.images.nodes[0];
    const price = firstVariant?.price || product.priceRange.minVariantPrice;
    const compareAtPrice = firstVariant?.compareAtPrice;
    const isAvailable = firstVariant?.availableForSale ?? false;

    return (
        <article
            className={cn(
                "flex h-28 flex-row gap-3 rounded-lg border border-line-subtle p-3 transition-colors hover:border-line",
                className,
            )}
            itemScope
            itemType="https://schema.org/Product"
        >
            {/* Product Image */}
            <Link
                to={productUrl}
                prefetch="intent"
                className="relative h-full shrink-0 overflow-hidden rounded-md"
            >
                {image ? (
                    <Image
                        data={image}
                        aspectRatio="1/1"
                        className="h-full w-auto object-cover"
                        sizes="80px"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-20 items-center justify-center bg-gray-100">
                        <HandbagSimpleIcon className="h-6 w-6 text-gray-400" />
                    </div>
                )}
            </Link>

            {/* Product Info */}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                {/* Vendor */}
                {product.vendor && (
                    <span className="truncate text-body-subtle text-xs">
                        {product.vendor}
                    </span>
                )}

                {/* Title */}
                <Link to={productUrl} prefetch="intent">
                    <h4
                        className="line-clamp-1 font-medium text-foreground text-sm transition-colors hover:text-body-subtle"
                        itemProp="name"
                    >
                        {product.title}
                    </h4>
                </Link>

                {/* Price Row */}
                <div className="mt-auto flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Money
                            data={price}
                            className="font-medium text-foreground text-sm"
                        />
                        {compareAtPrice && (
                            <Money
                                data={compareAtPrice}
                                className="text-body-subtle text-xs line-through"
                            />
                        )}
                    </div>

                    {/* Quick Add Button */}
                    {showQuickAdd && firstVariant && (
                        <QuickAddButton
                            variantId={firstVariant.id}
                            available={isAvailable}
                        />
                    )}
                </div>
            </div>
        </article>
    );
}

/**
 * Props for the QuickAddButton component.
 */
interface QuickAddButtonProps {
    /** Variant ID to add to cart */
    variantId: string;
    /** Whether the variant is available for sale */
    available: boolean;
}

/**
 * One-click quick add button using CartForm.
 * Adds the first available variant directly to cart without opening a modal.
 */
function QuickAddButton({ variantId, available }: QuickAddButtonProps) {
    const { t } = useTranslation();

    return (
        <CartForm
            route="/cart"
            inputs={{
                lines: [{ merchandiseId: variantId, quantity: 1 }],
            }}
            action={CartForm.ACTIONS.LinesAdd}
        >
            {(fetcher: FetcherWithComponents<unknown>) => (
                <QuickAddButtonContent
                    fetcher={fetcher}
                    available={available}
                    label={t("product.add")}
                />
            )}
        </CartForm>
    );
}

/**
 * Props for the QuickAddButtonContent component.
 */
interface QuickAddButtonContentProps {
    /** Fetcher from CartForm */
    fetcher: FetcherWithComponents<unknown>;
    /** Whether the variant is available */
    available: boolean;
    /** Button label */
    label: string;
}

/**
 * Quick add button content with loading state.
 */
function QuickAddButtonContent({
    fetcher,
    available,
    label,
}: QuickAddButtonContentProps) {
    const { t } = useTranslation();
    const isLoading = fetcher.state !== "idle";
    const [showSuccess, setShowSuccess] = useState(false);
    const prevStateRef = useRef<"idle" | "submitting" | "loading">("idle");

    // Show success feedback briefly after adding to cart
    useEffect(() => {
        if (prevStateRef.current !== "idle" && fetcher.state === "idle") {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 1500);
            return () => clearTimeout(timer);
        }
        prevStateRef.current = fetcher.state;
    }, [fetcher.state]);

    if (!available) {
        return (
            <span className="whitespace-nowrap text-body-subtle text-xs">
                {t("product.outOfStock")}
            </span>
        );
    }

    return (
        <Button
            type="submit"
            variant="secondary"
            className="!px-3 !py-1.5 relative h-8 min-w-[60px] shrink-0 rounded-full text-xs"
            disabled={isLoading}
            aria-label={label}
        >
            <span className={cn((isLoading || showSuccess) && "invisible")}>
                {label}
            </span>
            {isLoading && (
                <Spinner
                    className="absolute inset-0 m-auto"
                    size={14}
                    duration={400}
                />
            )}
            {showSuccess && !isLoading && (
                <span className="absolute inset-0 flex items-center justify-center text-xs">
                    {t("cart.added")}
                </span>
            )}
        </Button>
    );
}
