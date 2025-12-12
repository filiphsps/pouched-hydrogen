import type { ProductVariantComponent } from "@shopify/hydrogen/storefront-api-types";
import {
    type ComponentLoaderArgs,
    createSchema,
    type HydrogenComponentProps,
    type WeaverseProduct,
} from "@weaverse/hydrogen";
import { useState } from "react";
import type {
    ProductQuery,
    ProductVariantFragment,
} from "storefront-api.generated";
import invariant from "tiny-invariant";
import Link from "~/components/link";
import Paragraph from "~/components/paragraph";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import { ProductBadges } from "~/components/product/badges";
import { BundledVariants } from "~/components/product/bundled-variants";
import { ProductMedia } from "~/components/product/product-media";
import { Quantity } from "~/components/product/quantity";
import { StyledShopPayButton } from "~/components/product/styled-shop-pay-button";
import { VariantPrices } from "~/components/product/variant-prices";
import { VariantSelector } from "~/components/product/variant-selector";
import { layoutInputs, Section } from "~/components/section";
import { Title } from "~/components/title";
import { PRODUCT_QUERY } from "~/graphql/queries";
import { useAnimation } from "~/hooks/use-animation";
import JudgemeStarsRating from "../main-product/judgeme-stars-rating";

interface SingleProductData {
    productsCount: number;
    product: WeaverseProduct;
    showThumbnails: boolean;
}

type SingleProductProps = HydrogenComponentProps<
    Awaited<ReturnType<typeof loader>>
> &
    SingleProductData & {
        ref: React.Ref<HTMLElement>;
    };

export default function SingleProduct(props: SingleProductProps) {
    const {
        ref,
        loaderData,
        product: _product,
        showThumbnails,
        ...rest
    } = props;
    const { storeDomain, product } = loaderData || {};
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedVariant, setSelectedVariant] =
        useState<ProductVariantFragment | null>(
            product?.selectedOrFirstAvailableVariant || null,
        );
    const [scope] = useAnimation();

    invariant(product, "Product not found");

    const isBundle = Boolean(product?.isBundle?.requiresComponents);
    const bundledVariants = isBundle
        ? product?.isBundle?.components.nodes
        : null;
    let atcText = "Add to Cart";
    if (selectedVariant?.availableForSale) {
        atcText = isBundle ? "Add bundle to cart" : "Add to Cart";
    } else if (selectedVariant?.quantityAvailable === -1) {
        atcText = "Unavailable";
    } else {
        atcText = "Sold Out";
    }

    return (
        <Section ref={ref} {...rest}>
            <div ref={scope}>
                <div className="fade-up grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-12">
                    <ProductMedia
                        mediaLayout="slider"
                        imageAspectRatio="adapt"
                        media={product?.media.nodes}
                        selectedVariant={selectedVariant}
                        showThumbnails={showThumbnails}
                    />

                    <div
                        className="flex flex-col justify-start space-y-5 rounded-2xl bg-background"
                        data-motion="slide-in"
                    >
                        <div className="space-y-4">
                            <ProductBadges
                                product={product}
                                selectedVariant={selectedVariant}
                                className="[&_span:nth-child(n+3)]:hidden"
                            />
                            <Title
                                as="h3"
                                size="3xl"
                                data-motion="fade-up"
                                className="tracking-tight"
                            >
                                {product?.title}
                            </Title>
                            <VariantPrices variant={selectedVariant} />
                            <JudgemeStarsRating
                                productHandle={product.handle}
                                ratingText="{{rating}} ({{total_reviews}} reviews)"
                                errorText=""
                            />
                            <Paragraph
                                className="fade-up line-clamp-5 leading-relaxed"
                                content={product?.descriptionHtml}
                            />
                            {isBundle && (
                                <div className="space-y-3">
                                    <Title as="h4" size="2xl">
                                        Bundled Products
                                    </Title>
                                    <BundledVariants
                                        variants={
                                            bundledVariants as ProductVariantComponent[]
                                        }
                                    />
                                </div>
                            )}
                            <VariantSelector
                                product={product}
                                selectedVariant={selectedVariant}
                                setSelectedVariant={setSelectedVariant}
                            />
                        </div>
                        <Quantity value={quantity} onChange={setQuantity} />
                        <AddToCartButton
                            disabled={!selectedVariant?.availableForSale}
                            lines={
                                selectedVariant
                                    ? [
                                          {
                                              merchandiseId:
                                                  selectedVariant?.id,
                                              quantity,
                                              selectedVariant,
                                          },
                                      ]
                                    : []
                            }
                            variant="primary"
                            className="-mt-2 w-full"
                            data-test="add-to-cart"
                        >
                            {atcText}
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
        </Section>
    );
}

export const loader = async (args: ComponentLoaderArgs<SingleProductData>) => {
    const { weaverse, data } = args;
    const { storefront } = weaverse;
    if (!data.product) {
        return null;
    }
    const productHandle = data.product.handle;
    const { product, shop } = await storefront.query<ProductQuery>(
        PRODUCT_QUERY,
        {
            variables: {
                handle: productHandle,
                selectedOptions: [],
                language: storefront.i18n.language,
                country: storefront.i18n.country,
            },
        },
    );

    return {
        product,
        storeDomain: shop.primaryDomain.url,
    };
};

export const schema = createSchema({
    type: "single-product",
    title: "Single product",
    settings: [
        {
            group: "Layout",
            inputs: layoutInputs,
        },
        {
            group: "Product",
            inputs: [
                {
                    label: "Select product",
                    type: "product",
                    name: "product",
                    shouldRevalidate: true,
                },
            ],
        },
        {
            group: "Product Media",
            inputs: [
                {
                    label: "Show thumbnails",
                    name: "showThumbnails",
                    type: "switch",
                    defaultValue: false,
                },
            ],
        },
    ],
});
