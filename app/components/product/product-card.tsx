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
import { useWishlistStore } from "./wishlist-store";

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

// Hook to encapsulate ProductCard logic
function useProductCard(
    product: ProductCardFragment,
    variantProp?: ProductCardVariant,
) {
    const settings = useThemeSettings();
    const {
        pcardVariant,
        pcardHoverEffect,
        pcardQuickShopButtonType,
        pcardImageRatio,
        pcardBorderRadius,
    } = settings;

    const cardVariant = variantProp || pcardVariant || "grid";
    const hoverEffect = pcardHoverEffect || "zoom";
    const buttonType = pcardQuickShopButtonType || "icon";

    const [selectedVariant, setSelectedVariant] =
        useState<ProductVariantFragment | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Wishlist state
    const isWishlisted = useWishlistStore((state) =>
        state.items.includes(product.id),
    );

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
    if (selectedVariant?.image) {
        image = selectedVariant.image;
    }

    const cardStyles = {
        "--pcard-radius": `${pcardBorderRadius}px`,
        "--pcard-image-ratio": calculateAspectRatio(image, pcardImageRatio),
    } as React.CSSProperties;

    const handleVariantChange = (v: ProductVariantFragment) => {
        const nextImage = v.image || images.nodes[0];
        const currentImage = selectedVariant?.image || images.nodes[0];

        if (nextImage?.url !== currentImage?.url) {
            setIsImageLoading(true);
        }
        setSelectedVariant(v);
    };

    return {
        settings,
        cardVariant,
        hoverEffect,
        buttonType,
        selectedVariant,
        setSelectedVariant: handleVariantChange,
        isImageLoading,
        setIsImageLoading,
        isHovered,
        setIsHovered,
        isTransitioning,
        currentVariant,
        params,
        isBestSellerProduct,
        isBundle,
        isSoldOut,
        image,
        cardStyles,
        minVariantPrice,
        maxVariantPrice,
        isWishlisted,
    };
}

// Wrapper for CardBadges to reduce prop passing
function ProductBadges({
    product,
    logic,
    position,
    className,
}: {
    product: ProductCardFragment;
    logic: ReturnType<typeof useProductCard>;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    className?: string;
}) {
    const {
        settings,
        minVariantPrice,
        maxVariantPrice,
        isBundle,
        isBestSellerProduct,
        isSoldOut,
    } = logic;
    const {
        pcardShowSaleBadge,
        pcardShowNewBadge,
        pcardShowBundleBadge,
        pcardShowBestSellerBadge,
        pcardShowOutOfStockBadge,
    } = settings;

    return (
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
            position={position}
            className={className}
        />
    );
}

// Wrapper for CardActions
function ProductActions({
    product,
    logic,
    layout = "inline",
    className,
    showWishlist,
}: {
    product: ProductCardFragment;
    logic: ReturnType<typeof useProductCard>;
    layout?: "inline" | "overlay" | "stacked";
    className?: string;
    showWishlist?: boolean;
}) {
    const { settings, buttonType } = logic;
    const { pcardEnableQuickShop, pcardShowWishlist, pcardQuickShopPanelType } =
        settings;

    // Determine if wishlist should be shown based on prop override or settings
    const shouldShowWishlist =
        showWishlist !== undefined ? showWishlist : pcardShowWishlist;

    if (!pcardEnableQuickShop && !shouldShowWishlist) return null;

    return (
        <CardActions
            productHandle={product.handle}
            productId={product.id}
            showQuickAdd={pcardEnableQuickShop}
            showWishlist={shouldShowWishlist}
            buttonType={buttonType}
            quickShopPanelType={pcardQuickShopPanelType}
            layout={layout}
            className={className}
        />
    );
}

// Standard Link Wrapper
function ProductLink({
    product,
    params,
    children,
    className,
    isTransitioning,
}: {
    product: ProductCardFragment;
    params: URLSearchParams;
    children: React.ReactNode;
    className?: string;
    isTransitioning?: boolean;
}) {
    return (
        <Link
            to={`/products/${product.handle}?${params.toString()}`}
            prefetch="intent"
            className={cn(
                className,
                isTransitioning &&
                    "[&_img]:[view-transition-name:image-expand]",
            )}
        >
            {children}
        </Link>
    );
}

// -- Layout Components --

function ProductCardList({
    product,
    className,
    logic,
}: {
    product: ProductCardFragment;
    className?: string;
    logic: ReturnType<typeof useProductCard>;
}) {
    const {
        settings,
        image,
        isImageLoading,
        setIsImageLoading,
        cardStyles,
        params,
        currentVariant,
        minVariantPrice,
    } = logic;

    const {
        pcardShowVendor,
        pcardRemoveVendorFromTitle,
        pcardShowReviews,
        pcardShowSalePrice,
    } = settings;

    return (
        <article
            className={cn(
                "group relative flex h-36 gap-4 overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-md",
                className,
            )}
            style={cardStyles}
            itemScope
            itemType="https://schema.org/Product"
        >
            <ProductLink product={product} params={params} className="contents">
                <CardImage
                    image={image}
                    hoverEffect="zoom"
                    isLoading={isImageLoading}
                    onLoad={() => setIsImageLoading(false)}
                    className="h-full p-3"
                />
            </ProductLink>

            <div className="flex min-w-0 flex-1 flex-col py-3">
                <ProductBadges
                    product={product}
                    logic={logic}
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
                <ProductActions
                    product={product}
                    logic={logic}
                    layout="inline"
                    className="mt-3"
                />
            </div>
        </article>
    );
}

function ProductCardCompact({
    product,
    className,
    logic,
}: {
    product: ProductCardFragment;
    className?: string;
    logic: ReturnType<typeof useProductCard>;
}) {
    const {
        settings,
        image,
        isImageLoading,
        setIsImageLoading,
        cardStyles,
        params,
        currentVariant,
        minVariantPrice,
    } = logic;

    const { pcardShowSalePrice } = settings;

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
            <ProductLink product={product} params={params} className="block">
                <CardImage
                    image={image}
                    aspectRatio="square"
                    hoverEffect="zoom"
                    isLoading={isImageLoading}
                    onLoad={() => setIsImageLoading(false)}
                />
            </ProductLink>
            <div className="p-3">
                <ProductLink product={product} params={params}>
                    <h3
                        className="line-clamp-1 font-medium text-foreground text-sm hover:underline"
                        itemProp="name"
                    >
                        {product.title}
                    </h3>
                </ProductLink>
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

function ProductCardFeatured({
    product,
    className,
    logic,
}: {
    product: ProductCardFragment;
    className?: string;
    logic: ReturnType<typeof useProductCard>;
}) {
    const {
        settings,
        image,
        isImageLoading,
        setIsImageLoading,
        cardStyles,
        params,
        currentVariant,
        minVariantPrice,
        isHovered,
        setIsHovered,
        selectedVariant,
        setSelectedVariant,
        isWishlisted,
    } = logic;

    const {
        pcardShowVendor,
        pcardRemoveVendorFromTitle,
        pcardShowReviews,
        pcardShowSalePrice,
    } = settings;

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
            <ProductLink product={product} params={params} className="block">
                <CardImage
                    image={image}
                    aspectRatio="landscape"
                    hoverEffect="zoom"
                    isLoading={isImageLoading}
                    onLoad={() => setIsImageLoading(false)}
                />
            </ProductLink>
            <ProductBadges
                product={product}
                logic={logic}
                position="top-left"
            />
            <div
                className={cn(
                    "absolute top-4 right-4 transition-all duration-300",
                    isHovered || isWishlisted
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-2 opacity-0",
                )}
            >
                <ProductActions
                    product={product}
                    logic={logic}
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
                    setSelectedVariant={setSelectedVariant}
                    className="mt-3"
                />
            </div>
        </article>
    );
}

function ProductCardGrid({
    product,
    className,
    logic,
}: {
    product: ProductCardFragment;
    className?: string;
    logic: ReturnType<typeof useProductCard>;
}) {
    const {
        settings,
        image,
        isImageLoading,
        setIsImageLoading,
        cardStyles,
        params,
        currentVariant,
        minVariantPrice,
        isHovered,
        setIsHovered,
        selectedVariant,
        setSelectedVariant,
        hoverEffect,
        isTransitioning,
        isBestSellerProduct,
        isBundle,
        isSoldOut,
        isWishlisted,
    } = logic;

    const {
        pcardShowVendor,
        pcardRemoveVendorFromTitle,
        pcardShowReviews,
        pcardShowSalePrice,
        pcardShowLowestPrice,
        pcardShowWishlist,
        pcardShowAttributePills,
        pcardEnableQuickShop,
        pcardAlignment,
    } = settings;

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
            <div className="relative">
                <ProductLink
                    product={product}
                    params={params}
                    className="block p-3"
                    isTransitioning={isTransitioning}
                >
                    <CardImage
                        image={image}
                        aspectRatio="square"
                        hoverEffect={hoverEffect}
                        isLoading={isImageLoading}
                        onLoad={() => setIsImageLoading(false)}
                        className="p-3"
                    />
                </ProductLink>

                <ProductBadges
                    product={product}
                    logic={logic}
                    position="top-left"
                />

                {pcardShowWishlist && (
                    <div
                        className={cn(
                            "absolute top-2 right-2 transition-all duration-300",
                            isHovered || isWishlisted
                                ? "translate-y-0 opacity-100"
                                : "-translate-y-2 opacity-0",
                        )}
                    >
                        {/* Manually invoking CardActions because wrapper logic differs for wishlist-only usage in grid */}
                        <CardActions
                            productHandle={product.handle}
                            productId={product.id}
                            showQuickAdd={false}
                            showWishlist={true}
                            showAddToCart={false}
                            layout="overlay"
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5 p-4">
                {pcardShowAttributePills && (
                    <AttributePills product={product} className="mb-1" />
                )}

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

                <ProductCardOptions
                    product={product}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                    className={cn(
                        pcardAlignment === "left" && "justify-start",
                        pcardAlignment === "center" && "justify-center",
                        pcardAlignment === "right" && "justify-end",
                    )}
                />

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

                    {pcardEnableQuickShop && (
                        <ProductActions
                            product={product}
                            logic={logic}
                            layout="inline"
                            showWishlist={false} // Disable duplicates in grid view
                        />
                    )}
                </div>
            </div>
        </article>
    );
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
    const logic = useProductCard(product, variant);
    // Use logic.cardVariant which is derived from props/settings
    const { cardVariant } = logic;

    switch (cardVariant) {
        case "list":
            return (
                <ProductCardList
                    product={product}
                    className={className}
                    logic={logic}
                />
            );
        case "compact":
            return (
                <ProductCardCompact
                    product={product}
                    className={className}
                    logic={logic}
                />
            );
        case "featured":
            return (
                <ProductCardFeatured
                    product={product}
                    className={className}
                    logic={logic}
                />
            );
        default:
            return (
                <ProductCardGrid
                    product={product}
                    className={className}
                    logic={logic}
                />
            );
    }
}
