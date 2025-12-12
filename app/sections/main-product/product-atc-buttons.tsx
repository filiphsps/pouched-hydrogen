/**
 * Product ATC Buttons Weaverse Section.
 * Uses the unified PaymentButtons component with Weaverse configuration.
 */
import {
    getAdjacentAndFirstAvailableVariants,
    useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import { PaymentButtons } from "~/components/product/payment-buttons";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { isCombinedListing } from "~/utils/combined-listings";
import { useProductQtyStore } from "./product-quantity-selector";

interface ProductATCButtonsProps extends HydrogenComponentProps {
    ref: React.Ref<HTMLDivElement>;
    addBundleToCartText: string;
    soldOutText: string;
    showShopPayButton: boolean;
}

/**
 * Weaverse section wrapper for PaymentButtons.
 */
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

    if (!product || combinedListing) {
        return null;
    }

    return (
        <div ref={ref} {...rest} id="atc-buttons" className="mb-8 empty:hidden">
            <PaymentButtons
                variant={selectedVariant}
                quantity={quantity}
                sellingPlanId={sellingPlanId}
                storeDomain={storeDomain}
                showShopPay={showShopPayButton}
                bundleText={addBundleToCartText}
                soldOutText={soldOutText}
                isBundle={isBundle}
            />
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
