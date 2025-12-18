import { HandbagSimpleIcon, ImageIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import type {
    ProductQuery,
    ProductVariantFragment,
} from "storefront-api.generated";
import { Button } from "~/components/button";
import { Link } from "~/components/link";
import { ModalContainer } from "~/components/modal";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import { ProductMedia } from "~/components/product/product-media";
import { Quantity } from "~/components/product/quantity";
import { Skeleton } from "~/components/skeleton";
import { Title } from "~/components/title";
import JudgemeStarsRating from "~/sections/main-product/judgeme-stars-rating";
import { cn } from "~/utils/cn";
import { ProductBadges } from "./badges";
import { StyledShopPayButton } from "./styled-shop-pay-button";
import { VariantPrices } from "./variant-prices";
import { VariantSelector } from "./variant-selector";

interface QuickViewData {
    product: NonNullable<ProductQuery["product"]>;
    storeDomain: string;
}

/**
 * Quick shop content displayed inside the modal.
 * Shows product details, variant selection, and add to cart.
 *
 * @param data - Product data and store domain
 * @param panelType - Layout type (modal or drawer)
 */
export function QuickShop({
    data,
    panelType = "modal",
}: {
    data: QuickViewData;
    panelType?: "modal" | "drawer";
}) {
    const { product, storeDomain } = data || {};
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedVariant, setSelectedVariant] =
        useState<ProductVariantFragment | null>(
            product?.selectedOrFirstAvailableVariant || null,
        );

    return (
        <div className="bg-background">
            <div
                className={cn(
                    "grid grid-cols-1 items-start gap-5",
                    panelType === "modal" ? "lg:grid-cols-2" : "grid-cols-1",
                )}
            >
                <ProductMedia
                    mediaLayout="slider"
                    media={product?.media.nodes}
                    selectedVariant={selectedVariant}
                    showThumbnails={false}
                />
                <div className="flex flex-col justify-start gap-5 py-6 pr-5">
                    <div className="space-y-4">
                        <ProductBadges
                            product={product}
                            selectedVariant={selectedVariant}
                        />
                        <div className="flex flex-col gap-2">
                            <Title as="h5" size="xl">
                                {product.title}
                            </Title>
                        </div>
                        <VariantPrices variant={selectedVariant} />
                        <JudgemeStarsRating
                            productHandle={product.handle}
                            ratingText="{{rating}} ({{total_reviews}} reviews)"
                            errorText=""
                        />
                        {product.summary && (
                            <p className="leading-relaxed">{product.summary}</p>
                        )}
                        <VariantSelector
                            product={product}
                            selectedVariant={selectedVariant}
                            setSelectedVariant={setSelectedVariant}
                        />
                    </div>
                    <Quantity value={quantity} onChange={setQuantity} />
                    {/* TODO: fix quick-shop modal & cart drawer overlap each other */}
                    <AddToCartButton
                        disabled={!selectedVariant?.availableForSale}
                        lines={
                            selectedVariant
                                ? [
                                      {
                                          merchandiseId: selectedVariant?.id,
                                          quantity,
                                          selectedVariant,
                                      },
                                  ]
                                : []
                        }
                        data-test="add-to-cart"
                        className="w-full"
                    >
                        {selectedVariant?.availableForSale
                            ? "Add to cart"
                            : "Sold out"}
                    </AddToCartButton>
                    {selectedVariant?.availableForSale && (
                        <StyledShopPayButton
                            width="100%"
                            variantIdsAndQuantities={[
                                {
                                    id: selectedVariant?.id,
                                    quantity,
                                },
                            ]}
                            storeDomain={storeDomain}
                            className="-mt-2"
                        />
                    )}
                    <Link
                        to={`/products/${product.handle}`}
                        prefetch="intent"
                        variant="underline"
                        className="w-fit"
                    >
                        View full details →
                    </Link>
                </div>
            </div>
        </div>
    );
}

/**
 * Loading skeleton displayed while product data is loading.
 *
 * @param panelType - Layout type affecting skeleton grid layout
 */
function QuickShopSkeleton({
    panelType = "modal",
}: {
    panelType?: "modal" | "drawer";
}) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 items-start gap-5",
                panelType === "modal" ? "lg:grid-cols-2" : "grid-cols-1",
            )}
        >
            <Skeleton className="flex h-183 items-center justify-center">
                <ImageIcon className="h-16 w-16 text-body-subtle" />
            </Skeleton>
            <div className="flex flex-col justify-start gap-5 py-6 pr-5">
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="flex h-10 w-1/2 items-center justify-center">
                    <HandbagSimpleIcon className="h-5 w-5 text-body-subtle" />
                </Skeleton>
            </div>
        </div>
    );
}

/**
 * Trigger button and modal for quick shop functionality.
 * Opens a modal/drawer with product details and add to cart.
 *
 * @param productHandle - Handle of the product to display
 * @param showOnHover - Whether to show trigger only on hover
 * @param buttonType - Button style (icon or text)
 * @param buttonText - Text for text-style button
 * @param panelType - Modal or drawer panel type
 */
export function QuickShopTrigger({
    productHandle,
    showOnHover = true,
    buttonType = "icon",
    buttonText = "Quick shop",
    panelType = "modal",
}: {
    productHandle: string;
    showOnHover?: boolean;
    buttonType?: "icon" | "text";
    buttonText?: string;
    panelType?: "modal" | "drawer";
}) {
    const [open, setOpen] = useState(false);
    const { load, data } = useFetcher<{ product: ProductQuery["product"] }>();
    const { t } = useTranslation();

    // Fetch product data when modal opens
    // biome-ignore lint/correctness/useExhaustiveDependencies: open and state are intentionally excluded
    useEffect(() => {
        if (open && !data) {
            load(`/api/product/${productHandle}`);
        }
    }, [open]);

    return (
        <>
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild>
                    {buttonType === "icon" ? (
                        <button
                            type="button"
                            className={cn(
                                "flex items-center justify-center rounded-full bg-gray-900 p-2.5 text-white shadow-sm transition-all duration-300 hover:bg-gray-700 hover:shadow-md active:scale-95",
                                showOnHover &&
                                    "translate-y-1 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100",
                            )}
                            title={t("cart.addToCart")}
                        >
                            <HandbagSimpleIcon size={18} weight="bold" />
                        </button>
                    ) : (
                        <Button
                            animate={false}
                            variant="primary"
                            className={cn(
                                "w-full gap-2 shadow-sm hover:shadow-md",
                                showOnHover &&
                                    "translate-y-1 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100",
                            )}
                            title={t("cart.addToCart")}
                        >
                            {buttonText}
                        </Button>
                    )}
                </Dialog.Trigger>
            </Dialog.Root>
            <ModalContainer
                open={open}
                onOpenChange={setOpen}
                title="Quick shop modal"
                maxWidth={panelType === "drawer" ? 448 : "var(--breakpoint-xl)"}
                maxHeight="90vh"
                className={cn(
                    panelType === "drawer" && "mr-0 ml-auto min-h-screen p-4",
                )}
                showCloseButton={true}
            >
                {data?.product ? (
                    <QuickShop
                        data={data as QuickViewData}
                        panelType={panelType}
                    />
                ) : (
                    <QuickShopSkeleton panelType={panelType} />
                )}
            </ModalContainer>
        </>
    );
}
