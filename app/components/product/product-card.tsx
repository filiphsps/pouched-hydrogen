import { mapSelectedProductOptionToObject } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva, type VariantProps } from "class-variance-authority";
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
 * Feature configuration for each variant.
 * Controls which elements are rendered.
 */
const VARIANT_FEATURES = {
    grid: {
        showVendor: true,
        showRating: true,
        showBadges: true,
        showOptions: true,
        showActions: true,
        showPills: true,
        showWishlistOnHover: true,
        imageAspect: "square",
        infoSize: "md",
    },
    list: {
        showVendor: true,
        showRating: false, // Hidden in list variant to save space
        showBadges: false, // Hidden in list variant for cleaner look
        showOptions: false,
        showActions: true,
        showPills: false,
        showWishlistOnHover: false,
        imageAspect: "square",
        infoSize: "sm", // Smaller text for compact layout
    },
    compact: {
        showVendor: false,
        showRating: false,
        showBadges: false,
        showOptions: false,
        showActions: false,
        showPills: false,
        showWishlistOnHover: false,
        imageAspect: "square",
        infoSize: "sm",
    },
    featured: {
        showVendor: true,
        showRating: true,
        showBadges: true,
        showOptions: true,
        showActions: true,
        showPills: false,
        showWishlistOnHover: true,
        imageAspect: "landscape",
        infoSize: "lg",
    },
} as const;

/**
 * CVA variants for the card wrapper.
 * Cards with clear boundaries that stand out from the background.
 */
const cardVariants = cva(
    "group relative flex bg-background transition-all duration-200",
    {
        variants: {
            layout: {
                grid: "flex-col rounded-xl border border-line-subtle hover:border-line hover:shadow-md",
                list: "h-28 flex-row rounded-lg border border-line-subtle hover:border-line",
                compact:
                    "flex-col rounded-lg border border-line-subtle hover:shadow-sm",
                featured:
                    "flex-col rounded-xl border border-line-subtle hover:shadow-lg",
            },
        },
        defaultVariants: {
            layout: "grid",
        },
    },
);

/**
 * CVA variants for the content/info section.
 * Comfortable spacing with clear visual hierarchy.
 */
const contentVariants = cva("flex flex-col", {
    variants: {
        layout: {
            grid: "flex-1 gap-3 p-4",
            list: "min-w-0 flex-1 justify-center gap-1.5 p-3",
            compact: "gap-2 p-3",
            featured: "gap-4 p-5",
        },
    },
    defaultVariants: {
        layout: "grid",
    },
});

/**
 * Props for the ProductCard component.
 */
export interface ProductCardProps extends VariantProps<typeof cardVariants> {
    /** The product data from the GraphQL fragment. */
    product: ProductCardFragment;
    /** Layout variant (overrides Weaverse setting) */
    variant?: ProductCardVariant;
    /** Additional CSS class names for styling. */
    className?: string;
}

/**
 * Hook to encapsulate ProductCard state and derived values.
 */
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

/**
 * A modern, extensible product card component with multiple layout variants.
 * Uses CVA for styling and a feature config for conditional rendering.
 *
 * Features: Schema.org SEO markup, configurable badges, variant selection,
 * wishlist, quick shop, and responsive design.
 */
export function ProductCard({ product, variant, className }: ProductCardProps) {
    const logic = useProductCard(product, variant);
    const {
        settings,
        cardVariant,
        hoverEffect,
        buttonType,
        image,
        isImageLoading,
        setIsImageLoading,
        isHovered,
        setIsHovered,
        isTransitioning,
        currentVariant,
        selectedVariant,
        setSelectedVariant,
        params,
        cardStyles,
        minVariantPrice,
        maxVariantPrice,
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
        pcardAlignment,
        pcardShowNewBadge,
        pcardShowBundleBadge,
        pcardShowBestSellerBadge,
        pcardShowOutOfStockBadge,
        pcardShowOptionValues,
        pcardQuickShopPanelType,
    } = settings;

    const features = VARIANT_FEATURES[cardVariant];
    const productUrl = `/products/${product.handle}?${params.toString()}`;
    const isListLayout = cardVariant === "list";
    const isCompactLayout = cardVariant === "compact";

    // Determine image aspect ratio
    const imageAspect =
        features.imageAspect === "landscape"
            ? "landscape"
            : features.imageAspect === "square"
              ? "square"
              : "auto";

    return (
        <article
            className={cn(cardVariants({ layout: cardVariant }), className)}
            style={cardStyles}
            itemScope
            itemType="https://schema.org/Product"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Section */}
            <div className={cn("relative", isListLayout && "h-full shrink-0")}>
                <Link
                    to={productUrl}
                    prefetch="intent"
                    className={cn(
                        "block",
                        isListLayout ? "h-full" : "aspect-square",
                        isTransitioning &&
                            "[&_img]:[view-transition-name:image-expand]",
                    )}
                >
                    <CardImage
                        image={image}
                        aspectRatio={imageAspect}
                        hoverEffect={hoverEffect}
                        isLoading={isImageLoading}
                        onLoad={() => setIsImageLoading(false)}
                        className={cn(
                            isListLayout && "aspect-square h-full w-auto",
                        )}
                    />
                </Link>

                {/* Badges - positioned over image */}
                {features.showBadges && !isListLayout && (
                    <CardBadges
                        showNew={pcardShowNewBadge}
                        showBundle={pcardShowBundleBadge}
                        showBestseller={pcardShowBestSellerBadge}
                        showSoldOut={pcardShowOutOfStockBadge}
                        isBundle={isBundle}
                        isBestseller={isBestSellerProduct}
                        isSoldOut={isSoldOut}
                        publishedAt={product.publishedAt}
                        position="top-left"
                    />
                )}

                {/* Wishlist button - hover reveal */}
                {features.showWishlistOnHover && pcardShowWishlist && (
                    <div
                        className={cn(
                            "absolute top-3 right-3 transition-all duration-200",
                            isHovered || isWishlisted
                                ? "opacity-100"
                                : "opacity-0",
                        )}
                    >
                        <CardActions
                            productHandle={product.handle}
                            productId={product.id}
                            showQuickAdd={false}
                            showWishlist={true}
                            layout="overlay"
                        />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className={contentVariants({ layout: cardVariant })}>
                {/* Attribute Pills - grid only */}
                {features.showPills && pcardShowAttributePills && (
                    <AttributePills product={product} />
                )}

                {/* Product Info */}
                {isCompactLayout ? (
                    // Compact: minimal info
                    <>
                        <Link to={productUrl} prefetch="intent">
                            <h3
                                className="line-clamp-1 font-medium text-foreground text-sm leading-snug transition-colors group-hover:text-body-subtle"
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
                    </>
                ) : (
                    // Grid/List/Featured: full info
                    <>
                        {/* Badges for list layout (inline, not overlaid) */}
                        {isListLayout && features.showBadges && (
                            <CardBadges
                                showNew={pcardShowNewBadge}
                                showBundle={pcardShowBundleBadge}
                                showBestseller={pcardShowBestSellerBadge}
                                showSoldOut={pcardShowOutOfStockBadge}
                                isBundle={isBundle}
                                isBestseller={isBestSellerProduct}
                                isSoldOut={isSoldOut}
                                publishedAt={product.publishedAt}
                                className="relative mb-1 flex-row flex-wrap"
                            />
                        )}

                        <CardInfo
                            title={product.title}
                            handle={product.handle}
                            vendor={product.vendor}
                            showVendor={features.showVendor && pcardShowVendor}
                            removeVendorFromTitle={pcardRemoveVendorFromTitle}
                            showRating={features.showRating && pcardShowReviews}
                            urlParams={params.toString()}
                            size={features.infoSize as "sm" | "md" | "lg"}
                        />

                        {/* Variant Options (swatches) */}
                        {features.showOptions && pcardShowOptionValues && (
                            <ProductCardOptions
                                product={product}
                                selectedVariant={selectedVariant}
                                setSelectedVariant={setSelectedVariant}
                                className={cn(
                                    pcardAlignment === "left" &&
                                        "justify-start",
                                    pcardAlignment === "center" &&
                                        "justify-center",
                                    pcardAlignment === "right" && "justify-end",
                                )}
                            />
                        )}

                        {/* Price Row - with button inline for list layout */}
                        <div
                            className={cn(
                                "mt-auto",
                                isListLayout &&
                                    "flex items-center justify-between gap-2",
                            )}
                        >
                            {pcardShowLowestPrice ||
                            isCombinedListing(product) ? (
                                <CardPrice
                                    price={minVariantPrice}
                                    showCompareAt={false}
                                    size={
                                        features.infoSize as "sm" | "md" | "lg"
                                    }
                                />
                            ) : (
                                <CardPrice
                                    price={
                                        currentVariant?.price || minVariantPrice
                                    }
                                    compareAtPrice={
                                        currentVariant?.compareAtPrice
                                    }
                                    showCompareAt={pcardShowSalePrice}
                                    size={
                                        features.infoSize as "sm" | "md" | "lg"
                                    }
                                />
                            )}

                            {/* Button inline for list layout */}
                            {isListLayout && features.showActions && (
                                <CardActions
                                    productHandle={product.handle}
                                    productId={product.id}
                                    showQuickAdd={true}
                                    showWishlist={false}
                                    buttonType="icon"
                                    quickShopPanelType={pcardQuickShopPanelType}
                                    layout="inline"
                                />
                            )}
                        </div>

                        {/* Full-width button for non-list layouts */}
                        {!isListLayout && features.showActions && (
                            <CardActions
                                productHandle={product.handle}
                                productId={product.id}
                                showQuickAdd={true}
                                showWishlist={false}
                                buttonType="text"
                                quickShopPanelType={pcardQuickShopPanelType}
                                layout="stacked"
                            />
                        )}
                    </>
                )}
            </div>
        </article>
    );
}
