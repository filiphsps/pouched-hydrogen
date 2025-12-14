import { Money, mapSelectedProductOptionToObject } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { useThemeSettings } from "@weaverse/hydrogen";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useViewTransitionState } from "react-router";
import type {
    ProductCardFragment,
    ProductVariantFragment,
} from "storefront-api.generated";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { RevealUnderline } from "~/components/reveal-underline";
import { Spinner } from "~/components/spinner";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import JudgemeStarsRating from "~/sections/main-product/judgeme-stars-rating";
import { cn } from "~/utils/cn";
import { isCombinedListing } from "~/utils/combined-listings";
import { calculateAspectRatio } from "~/utils/image";
import { removeVendorFromTitle } from "~/utils/product";
import { AttributePills } from "./attribute-pills";
import {
    BestSellerBadge,
    BundleBadge,
    NewBadge,
    SaleBadge,
    SoldOutBadge,
} from "./badges";
import { ProductCardOptions } from "./product-card-options";
import { QuickShopTrigger } from "./quick-shop";
import { VariantPrices } from "./variant-prices";
import { WishlistButton } from "./wishlist-button";

/**
 * Props for the ProductCard component.
 */
interface ProductCardProps {
    /** The product data from the GraphQL fragment. */
    product: ProductCardFragment;
    /** Additional CSS class names for styling. */
    className?: string;
}

/**
 * A product card component that displays product information in a card layout.
 * Features include: sale badge, wishlist button, product image with hover effect,
 * NEW badge, attribute pills, title, subtitle, price, and quick shop functionality.
 *
 * @param props - The component props
 * @returns A product card element
 */
export function ProductCard({ product, className }: ProductCardProps) {
    const {
        pcardBorderRadius,
        pcardImageRatio,
        pcardTitlePricesAlignment,
        pcardAlignment,
        pcardShowVendor,
        pcardRemoveVendorFromTitle,
        pcardShowReviews,
        pcardShowLowestPrice,
        pcardShowSalePrice,
        pcardEnableQuickShop,
        pcardQuickShopPanelType,
        pcardShowSaleBadge,
        pcardShowBundleBadge,
        pcardShowBestSellerBadge,
        pcardShowNewBadge,
        pcardShowOutOfStockBadge,
        pcardShowWishlist,
        pcardShowSubtitle,
        pcardShowAttributePills,
    } = useThemeSettings();

    const [selectedVariant, setSelectedVariant] =
        useState<ProductVariantFragment | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const productPageHref = usePrefixPathWithLocale(
        `/products/${product.handle}`,
    );
    const isTransitioning = useViewTransitionState(productPageHref);
    const { t } = useTranslation();

    const { images, badges, priceRange } = product;
    const { minVariantPrice, maxVariantPrice } = priceRange;

    const firstVariant = product.selectedOrFirstAvailableVariant;
    const params = new URLSearchParams(
        mapSelectedProductOptionToObject(
            (selectedVariant || firstVariant)?.selectedOptions || [],
        ),
    );

    const isVertical = pcardTitlePricesAlignment === "vertical";
    const isBestSellerProduct = badges
        .filter(Boolean)
        .some(({ key, value }) => key === "best_seller" && value === "true");
    const isBundle = Boolean(product?.isBundle?.requiresComponents);

    let [image] = images.nodes;
    if (selectedVariant?.image) {
        image = selectedVariant.image;
    }

    return (
        <div
            className={cn(
                "group/card group flex flex-col overflow-hidden rounded-(--pcard-radius) bg-gray-150 ring-0 ring-line transition-all duration-200 hover:ring-2 hover:ring-offset-2",
                className,
            )}
            style={
                {
                    "--pcard-radius": `${pcardBorderRadius}px`,
                    "--pcard-image-ratio": calculateAspectRatio(
                        image,
                        pcardImageRatio,
                    ),
                } as React.CSSProperties
            }
        >
            {/* Image section with overlaid badges */}
            <div className="relative overflow-hidden p-2">
                {image && (
                    <div className="relative rounded-(--pcard-radius) rounded-t-(--pcard-radius) bg-transparent transition-colors duration-300 group-hover/card:bg-background">
                        <Link
                            to={`/products/${product.handle}?${params.toString()}`}
                            prefetch="intent"
                            className="group/media block aspect-(--pcard-image-ratio) overflow-hidden rounded-t-(--pcard-radius)"
                        >
                            {/* Loading skeleton overlay */}
                            {isImageLoading && <Spinner />}

                            <Image
                                className={cn([
                                    "h-full w-full object-contain p-4",
                                    "transition-transform duration-300 group-hover/media:scale-105",
                                    isTransitioning &&
                                        "[&_img]:[view-transition-name:image-expand]",
                                ])}
                                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                                data={image}
                                width={700}
                                alt={
                                    image.altText ||
                                    `Picture of ${product.title}`
                                }
                                loading="lazy"
                                onLoad={() => setIsImageLoading(false)}
                            />
                        </Link>

                        {/* Sale badge - top left */}
                        <div className="absolute top-2 left-2 flex gap-1">
                            {isBundle && pcardShowBundleBadge && (
                                <BundleBadge />
                            )}
                            {pcardShowSaleBadge && (
                                <SaleBadge
                                    price={minVariantPrice as MoneyV2}
                                    compareAtPrice={maxVariantPrice as MoneyV2}
                                />
                            )}
                            {pcardShowBestSellerBadge &&
                                isBestSellerProduct && <BestSellerBadge />}
                        </div>

                        {/* Wishlist button - top right */}
                        {pcardShowWishlist && (
                            <div className="absolute top-2 right-2 z-5">
                                <WishlistButton
                                    productId={product.id}
                                    className="group-hover/card:bg-gray-150"
                                />
                            </div>
                        )}

                        {/* NEW badge - top left of image */}
                        {pcardShowNewBadge && (
                            <div className="absolute top-2 left-2">
                                <NewBadge
                                    publishedAt={product.publishedAt}
                                    className="group-hover/card:bg-gray-150"
                                />
                            </div>
                        )}

                        {/* Out of stock badge - bottom left of image */}
                        {pcardShowOutOfStockBadge && (
                            <div className="absolute bottom-2 left-2">
                                <SoldOutBadge />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content section */}
            <div
                className={cn(
                    "group/details flex flex-col gap-2 p-4 pt-0 text-sm",
                    isVertical && [
                        pcardAlignment === "left" && "text-left",
                        pcardAlignment === "center" && "text-center",
                        pcardAlignment === "right" && "text-right",
                    ],
                )}
            >
                {/* Reviews */}
                {pcardShowReviews && (
                    <JudgemeStarsRating
                        productHandle={product.handle}
                        ratingText="{{rating}} ({{total_reviews}} reviews)"
                        errorText=""
                    />
                )}

                {/* Attribute pills */}
                {pcardShowAttributePills && (
                    <AttributePills product={product} className="mb-1.5" />
                )}

                {/* Title and price section */}
                <div
                    className={cn(
                        "relative flex",
                        isVertical
                            ? [
                                  "flex-col gap-1",
                                  [
                                      pcardAlignment === "left" &&
                                          "items-start",
                                      pcardAlignment === "center" &&
                                          "items-center",
                                      pcardAlignment === "right" && "items-end",
                                  ],
                              ]
                            : "flex-col gap-1",
                    )}
                >
                    {/* Product title */}
                    <Link
                        to={`/products/${product.handle}?${params.toString()}`}
                        prefetch="intent"
                        className="inline-block font-bold"
                    >
                        <RevealUnderline className="bg-position-[left_calc(1em+3px)] leading-normal tracking-tight">
                            {pcardShowVendor && (
                                <span className="pr-1 font-semibold text-body-subtle">
                                    {product.vendor}
                                </span>
                            )}

                            {removeVendorFromTitle(
                                product.title,
                                product.vendor,
                                pcardRemoveVendorFromTitle,
                            )}
                        </RevealUnderline>
                    </Link>

                    {/* Subtitle */}
                    {pcardShowSubtitle &&
                        (() => {
                            const subtitleMetafield =
                                product.customMetafields?.find(
                                    (mf) =>
                                        mf?.key === "subtitle" &&
                                        mf?.namespace === "custom",
                                );
                            return subtitleMetafield?.value ? (
                                <p className="text-body-subtle text-xs">
                                    {subtitleMetafield.value}
                                </p>
                            ) : null;
                        })()}

                    {/* Price and quick shop row */}
                    <div className="flex items-center justify-between">
                        {pcardShowLowestPrice || isCombinedListing(product) ? (
                            <div className="flex gap-1">
                                <span>From</span>
                                <Money
                                    withoutTrailingZeros
                                    data={minVariantPrice}
                                />
                                {isCombinedListing(product) && (
                                    <>
                                        <span>–</span>
                                        <Money
                                            withoutTrailingZeros
                                            data={maxVariantPrice}
                                        />
                                    </>
                                )}
                            </div>
                        ) : (
                            <VariantPrices
                                variant={selectedVariant || firstVariant}
                                showCompareAtPrice={pcardShowSalePrice}
                            />
                        )}

                        {/* Quick shop button - next to price */}
                        {pcardEnableQuickShop && (
                            <QuickShopTrigger
                                productHandle={product.handle}
                                showOnHover={false}
                                buttonType="icon"
                                buttonText={t("cart.addToCart")}
                                panelType={pcardQuickShopPanelType}
                            />
                        )}
                    </div>
                </div>

                {/* Product options */}
                <ProductCardOptions
                    product={product}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={(variant: ProductVariantFragment) => {
                        if (
                            variant.image?.url !== selectedVariant?.image?.url
                        ) {
                            setIsImageLoading(true);
                        }
                        setSelectedVariant(variant);
                    }}
                    className={cn(
                        isVertical && [
                            pcardAlignment === "left" && "justify-start",
                            pcardAlignment === "center" && "justify-center",
                            pcardAlignment === "right" && "justify-end",
                        ],
                    )}
                />
            </div>
        </div>
    );
}
