import { mapSelectedProductOptionToObject } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { useThemeSettings } from "@weaverse/hydrogen";
import { useState } from "react";
import { useViewTransitionState } from "react-router";
import type {
    ProductCardFragment,
    ProductVariantFragment,
} from "storefront-api.generated";
import { Link } from "~/components/link";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import { cn } from "~/utils/cn";
import { isCombinedListing } from "~/utils/combined-listings";
import { calculateAspectRatio } from "~/utils/image";
import { AttributePills } from "./attribute-pills";
import {
    CardActions,
    CardBadges,
    CardImage,
    CardInfo,
    CardPrice,
} from "./card-parts";
import { ProductCardOptions } from "./product-card-options";

/**
 * Layout variant for the ProductCard.
 */
export type ProductCardVariant = "grid" | "list" | "compact" | "featured";

/**
 * Props for the ProductCard component.
 */
export interface ProductCardProps {
    /** The product data from the GraphQL fragment. */
    product: ProductCardFragment;
    /** Layout variant (overrides Weaverse setting) */
    variant?: ProductCardVariant;
    /** Additional CSS class names for styling. */
    className?: string;
}

/**
 * A modern, extensible product card component with multiple layout variants.
 * Features include: Schema.org SEO markup, configurable badges, variant selection,
 * wishlist, quick shop, and responsive design.
 *
 * @param props - The component props
 * @returns A product card article element with SEO markup
 */
export function ProductCard({ product, variant, className }: ProductCardProps) {
    const {
        pcardBorderRadius,
        pcardVariant,
        pcardHoverEffect,
        pcardShowAddToCart,
        pcardImageRatio,
        pcardAlignment,
        pcardShowVendor,
        pcardRemoveVendorFromTitle,
        pcardShowReviews,
        pcardShowLowestPrice,
        pcardShowSalePrice,
        pcardEnableQuickShop,
        pcardShowQuickShopOnHover,
        pcardQuickShopButtonType,
        pcardQuickShopPanelType,
        pcardShowSaleBadge,
        pcardShowBundleBadge,
        pcardShowBestSellerBadge,
        pcardShowNewBadge,
        pcardShowOutOfStockBadge,
        pcardShowWishlist,
        pcardShowAttributePills,
    } = useThemeSettings();

    // Use prop variant or fall back to Weaverse setting
    const cardVariant = variant || pcardVariant || "grid";
    const hoverEffect = pcardHoverEffect || "zoom";
    const buttonType = pcardQuickShopButtonType || "icon";
    const showOnHover = pcardShowQuickShopOnHover ?? true;

    const [selectedVariant, setSelectedVariant] =
        useState<ProductVariantFragment | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const productPageHref = usePrefixPathWithLocale(
        `/products/${product.handle}`,
    );
    const isTransitioning = useViewTransitionState(productPageHref);

    const { images, badges, priceRange } = product;
    const { minVariantPrice, maxVariantPrice } = priceRange;

    const firstVariant = product.selectedOrFirstAvailableVariant;
    const currentVariant = selectedVariant || firstVariant;
    const params = new URLSearchParams(
        mapSelectedProductOptionToObject(currentVariant?.selectedOptions || []),
    );

    const isBestSellerProduct = badges
        .filter(Boolean)
        .some(({ key, value }) => key === "best_seller" && value === "true");
    const isBundle = Boolean(product?.isBundle?.requiresComponents);
    const isSoldOut = !currentVariant?.availableForSale;

    let [image] = images.nodes;
    const secondaryImage = images.nodes[1] || null;
    if (selectedVariant?.image) {
        image = selectedVariant.image;
    }

    // Common card styles
    const cardStyles = {
        "--pcard-radius": `${pcardBorderRadius}px`,
        "--pcard-image-ratio": calculateAspectRatio(image, pcardImageRatio),
    } as React.CSSProperties;

    // List variant layout
    if (cardVariant === "list") {
        return (
            <article
                className={cn(
                    "group relative flex gap-4 overflow-hidden rounded-2xl bg-card p-4 shadow-sm transition-all hover:shadow-md",
                    className,
                )}
                style={cardStyles}
                itemScope
                itemType="https://schema.org/Product"
            >
                <Link
                    to={`/products/${product.handle}?${params.toString()}`}
                    prefetch="intent"
                    className="w-32 shrink-0 sm:w-40"
                >
                    <CardImage
                        image={image}
                        aspectRatio="square"
                        hoverEffect="zoom"
                        isLoading={isImageLoading}
                        onLoad={() => setIsImageLoading(false)}
                        className="rounded-xl"
                    />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                    <CardBadges
                        showSale={pcardShowSaleBadge}
                        showNew={pcardShowNewBadge}
                        showBundle={pcardShowBundleBadge}
                        showBestseller={pcardShowBestSellerBadge}
                        isBundle={isBundle}
                        isBestseller={isBestSellerProduct}
                        publishedAt={product.publishedAt}
                        price={minVariantPrice as MoneyV2}
                        compareAtPrice={maxVariantPrice as MoneyV2}
                        position="top-left"
                        className="relative mb-2 flex-wrap"
                    />
                    <CardInfo
                        title={product.title}
                        handle={product.handle}
                        vendor={product.vendor}
                        showVendor={pcardShowVendor}
                        removeVendorFromTitle={pcardRemoveVendorFromTitle}
                        showRating={pcardShowReviews}
                        urlParams={params.toString()}
                        size="md"
                    />
                    <div className="mt-auto flex items-end justify-between gap-4 pt-3">
                        <CardPrice
                            price={currentVariant?.price || minVariantPrice}
                            compareAtPrice={currentVariant?.compareAtPrice}
                            showCompareAt={pcardShowSalePrice}
                            size="md"
                        />
                    </div>
                    {(pcardEnableQuickShop || pcardShowWishlist) && (
                        <CardActions
                            productHandle={product.handle}
                            productId={product.id}
                            showQuickAdd={pcardEnableQuickShop}
                            showWishlist={pcardShowWishlist}
                            buttonType={buttonType}
                            quickShopPanelType={pcardQuickShopPanelType}
                            layout="inline"
                            className="mt-3"
                        />
                    )}
                </div>
            </article>
        );
    }

    // Compact variant layout
    if (cardVariant === "compact") {
        return (
            <article
                className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md",
                    className,
                )}
                style={cardStyles}
                itemScope
                itemType="https://schema.org/Product"
            >
                <Link
                    to={`/products/${product.handle}?${params.toString()}`}
                    prefetch="intent"
                    className="block"
                >
                    <CardImage
                        image={image}
                        aspectRatio="square"
                        hoverEffect="zoom"
                        isLoading={isImageLoading}
                        onLoad={() => setIsImageLoading(false)}
                    />
                </Link>
                <div className="p-3">
                    <Link
                        to={`/products/${product.handle}?${params.toString()}`}
                        prefetch="intent"
                    >
                        <h3
                            className="line-clamp-1 font-medium text-foreground text-sm hover:underline"
                            itemProp="name"
                        >
                            {product.title}
                        </h3>
                    </Link>
                    <CardPrice
                        price={currentVariant?.price || minVariantPrice}
                        compareAtPrice={currentVariant?.compareAtPrice}
                        showCompareAt={pcardShowSalePrice}
                        size="sm"
                        className="mt-1"
                    />
                </div>
            </article>
        );
    }

    // Featured variant layout
    if (cardVariant === "featured") {
        return (
            <article
                className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-lg",
                    className,
                )}
                style={cardStyles}
                itemScope
                itemType="https://schema.org/Product"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Link
                    to={`/products/${product.handle}?${params.toString()}`}
                    prefetch="intent"
                    className="block"
                >
                    <CardImage
                        image={image}
                        aspectRatio="landscape"
                        hoverEffect="zoom"
                        isLoading={isImageLoading}
                        onLoad={() => setIsImageLoading(false)}
                    />
                </Link>
                <CardBadges
                    showSale={pcardShowSaleBadge}
                    showNew={pcardShowNewBadge}
                    showBundle={pcardShowBundleBadge}
                    showBestseller={pcardShowBestSellerBadge}
                    isBundle={isBundle}
                    isBestseller={isBestSellerProduct}
                    publishedAt={product.publishedAt}
                    price={minVariantPrice as MoneyV2}
                    compareAtPrice={maxVariantPrice as MoneyV2}
                    position="top-left"
                />
                <div
                    className={cn(
                        "absolute top-4 right-4 transition-all duration-300",
                        isHovered
                            ? "translate-y-0 opacity-100"
                            : "-translate-y-2 opacity-0",
                    )}
                >
                    <CardActions
                        productHandle={product.handle}
                        productId={product.id}
                        showQuickAdd={pcardEnableQuickShop}
                        showWishlist={pcardShowWishlist}
                        buttonType="icon"
                        quickShopPanelType={pcardQuickShopPanelType}
                        layout="overlay"
                    />
                </div>
                <div className="p-5">
                    <CardInfo
                        title={product.title}
                        handle={product.handle}
                        vendor={product.vendor}
                        showVendor={pcardShowVendor}
                        removeVendorFromTitle={pcardRemoveVendorFromTitle}
                        showRating={pcardShowReviews}
                        urlParams={params.toString()}
                        size="lg"
                    />
                    <div className="mt-4 flex items-center justify-between gap-4">
                        <CardPrice
                            price={currentVariant?.price || minVariantPrice}
                            compareAtPrice={currentVariant?.compareAtPrice}
                            showCompareAt={pcardShowSalePrice}
                            size="lg"
                        />
                    </div>
                    <ProductCardOptions
                        product={product}
                        selectedVariant={selectedVariant}
                        setSelectedVariant={(v: ProductVariantFragment) => {
                            if (v.image?.url !== selectedVariant?.image?.url) {
                                setIsImageLoading(true);
                            }
                            setSelectedVariant(v);
                        }}
                        className="mt-3"
                    />
                </div>
            </article>
        );
    }

    // Default: grid variant
    return (
        <article
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all hover:shadow-lg",
                className,
            )}
            style={cardStyles}
            itemScope
            itemType="https://schema.org/Product"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image section */}
            <div className="relative">
                <Link
                    to={`/products/${product.handle}?${params.toString()}`}
                    prefetch="intent"
                    className={cn(
                        "block",
                        isTransitioning &&
                            "[&_img]:[view-transition-name:image-expand]",
                    )}
                >
                    <CardImage
                        image={image}
                        secondaryImage={
                            hoverEffect === "swap" ? secondaryImage : null
                        }
                        aspectRatio="square"
                        hoverEffect={hoverEffect}
                        isLoading={isImageLoading}
                        onLoad={() => setIsImageLoading(false)}
                    />
                </Link>

                {/* Badges - top left */}
                <CardBadges
                    showSale={pcardShowSaleBadge}
                    showNew={pcardShowNewBadge}
                    showBundle={pcardShowBundleBadge}
                    showBestseller={pcardShowBestSellerBadge}
                    showSoldOut={pcardShowOutOfStockBadge}
                    isBundle={isBundle}
                    isBestseller={isBestSellerProduct}
                    isSoldOut={isSoldOut}
                    publishedAt={product.publishedAt}
                    price={minVariantPrice as MoneyV2}
                    compareAtPrice={maxVariantPrice as MoneyV2}
                    position="top-left"
                />

                {/* Wishlist - top right */}
                {pcardShowWishlist && (
                    <div
                        className={cn(
                            "absolute top-2 right-2 transition-all duration-300",
                            isHovered
                                ? "translate-y-0 opacity-100"
                                : "-translate-y-2 opacity-0",
                        )}
                    >
                        <CardActions
                            productHandle={product.handle}
                            productId={product.id}
                            showQuickAdd={false}
                            showWishlist
                            showAddToCart={false}
                            layout="overlay"
                        />
                    </div>
                )}
            </div>

            {/* Content section */}
            <div className="flex flex-1 flex-col gap-1.5 p-4">
                {/* Attribute pills */}
                {pcardShowAttributePills && (
                    <AttributePills product={product} className="mb-1" />
                )}

                {/* Info: vendor, title, rating */}
                <CardInfo
                    title={product.title}
                    handle={product.handle}
                    vendor={product.vendor}
                    showVendor={pcardShowVendor}
                    removeVendorFromTitle={pcardRemoveVendorFromTitle}
                    showRating={pcardShowReviews}
                    urlParams={params.toString()}
                    size="md"
                />

                {/* Price and Add to Cart row */}
                <div className="flex items-center justify-between gap-2">
                    {pcardShowLowestPrice || isCombinedListing(product) ? (
                        <CardPrice
                            price={minVariantPrice}
                            showCompareAt={false}
                        />
                    ) : (
                        <CardPrice
                            price={currentVariant?.price || minVariantPrice}
                            compareAtPrice={currentVariant?.compareAtPrice}
                            showCompareAt={pcardShowSalePrice}
                        />
                    )}

                    {/* Quick shop button next to price */}
                    {pcardEnableQuickShop && (
                        <CardActions
                            productHandle={product.handle}
                            productId={product.id}
                            showQuickAdd
                            showWishlist={false}
                            showAddToCart={false}
                            buttonType={buttonType}
                            quickShopPanelType={pcardQuickShopPanelType}
                            layout="inline"
                        />
                    )}
                </div>

                {/* Variant options */}
                <ProductCardOptions
                    product={product}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={(v: ProductVariantFragment) => {
                        if (v.image?.url !== selectedVariant?.image?.url) {
                            setIsImageLoading(true);
                        }
                        setSelectedVariant(v);
                    }}
                    className={cn(
                        pcardAlignment === "left" && "justify-start",
                        pcardAlignment === "center" && "justify-center",
                        pcardAlignment === "right" && "justify-end",
                    )}
                />
            </div>
        </article>
    );
}
