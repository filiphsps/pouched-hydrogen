import {
    getAdjacentAndFirstAvailableVariants,
    useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { AddToCartButton } from "~/components/product/add-to-cart-button";
import { StyledShopPayButton } from "~/components/product/styled-shop-pay-button";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { isCombinedListing } from "~/utils/combined-listings";
import { useProductQtyStore } from "./product-quantity-selector";

interface ProductATCButtonsProps extends HydrogenComponentProps {
    ref: React.Ref<HTMLDivElement>;
    addBundleToCartText: string;
    soldOutText: string;
    showShopPayButton: boolean;
}

export default function ProductATCButtons(props: ProductATCButtonsProps) {
    const {
        ref,
        addBundleToCartText,
        soldOutText,
        showShopPayButton,
        ...rest
    } = props;
    const { product, storeDomain } = useLoaderData<typeof productRouteLoader>();
    const { quantity, sellingPlanId } = useProductQtyStore();

    const selectedVariant = useOptimisticVariant(
        product?.selectedOrFirstAvailableVariant,
        getAdjacentAndFirstAvailableVariants(product),
    );

    const combinedListing = isCombinedListing(product);
    const isBundle = Boolean(product?.isBundle?.requiresComponents);

    const { t } = useTranslation();

    if (!product || combinedListing) {
        return null;
    }

    let atcButtonText: string;
    if (selectedVariant.availableForSale) {
        atcButtonText = isBundle ? addBundleToCartText : t("cart.addToCart");
    } else {
        atcButtonText = soldOutText;
    }

    return (
        <div
            ref={ref}
            {...rest}
            id="atc-buttons"
            style={{ "--shop-pay-button-height": "100%" }}
            className="space-y-2 empty:hidden"
        >
            <AddToCartButton
                disabled={!selectedVariant?.availableForSale}
                lines={[
                    {
                        merchandiseId: selectedVariant?.id,
                        quantity,
                        selectedVariant,
                        sellingPlanId,
                    },
                ]}
                data-test="add-to-cart"
                className="h-14 w-full uppercase"
            >
                {atcButtonText}
            </AddToCartButton>
            {showShopPayButton && selectedVariant?.availableForSale && (
                <StyledShopPayButton
                    width="100%"
                    variantIdsAndQuantities={[
                        {
                            id: selectedVariant?.id,
                            quantity,
                        },
                    ]}
                    storeDomain={storeDomain}
                />
            )}
        </div>
    );
}

export const schema = createSchema({
    type: "mp--atc-buttons",
    title: "Buy buttons",
    limit: 1,
    enabledOn: {
        pages: ["PRODUCT"],
    },
    settings: [
        {
            group: "General",
            inputs: [
                {
                    type: "text",
                    label: "Bundle add to cart text",
                    name: "addBundleToCartText",
                    defaultValue: "Add bundle to cart",
                    placeholder: "Add bundle to cart",
                    helpText:
                        "Apply if the product is a bundled product. Learn more about <a href='https://shopify.dev/docs/apps/build/product-merchandising/bundles' target='_blank'>Shopify product bundles</a>.",
                },
                {
                    type: "text",
                    label: "Sold out text",
                    name: "soldOutText",
                    defaultValue: "Sold out",
                    placeholder: "Sold out",
                },
                {
                    type: "switch",
                    label: "Show Shop Pay button",
                    name: "showShopPayButton",
                    defaultValue: true,
                },
            ],
        },
    ],
});
