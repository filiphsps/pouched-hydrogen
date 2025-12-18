import {
    getAdjacentAndFirstAvailableVariants,
    useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import { StockUrgency } from "~/components/product/stock-urgency";
import type { loader as productRouteLoader } from "~/routes/products/product";

/**
 * Props for the ProductStockUrgency section
 */
interface ProductStockUrgencyProps extends HydrogenComponentProps {
    ref: React.Ref<HTMLDivElement>;
}

/**
 * ProductStockUrgency section displays a low stock indicator on the product page.
 *
 * This is a Weaverse-editable section that shows "Only X left" when inventory
 * is below the configured threshold. Settings are configured globally in
 * Theme Settings under "Product page > Stock urgency".
 */
export default function ProductStockUrgency(props: ProductStockUrgencyProps) {
    const { ref, ...rest } = props;
    const { product } = useLoaderData<typeof productRouteLoader>();

    const selectedVariant = useOptimisticVariant(
        product?.selectedOrFirstAvailableVariant,
        getAdjacentAndFirstAvailableVariants(product),
    );

    if (!product) {
        return null;
    }

    return (
        <div ref={ref} {...rest} className="empty:hidden">
            <StockUrgency
                quantityAvailable={selectedVariant?.quantityAvailable}
                size="md"
            />
        </div>
    );
}

export const schema = createSchema({
    type: "mp--stock-urgency",
    title: "Stock Urgency",
    limit: 1,
    enabledOn: {
        pages: ["PRODUCT"],
    },
    settings: [
        {
            group: "General",
            inputs: [
                {
                    type: "heading",
                    label: "Stock urgency configuration",
                    helpText:
                        "Stock urgency display settings are configured globally in Theme Settings. Go to Theme Settings > Product page > Stock urgency to customize the threshold and appearance.",
                },
            ],
        },
    ],
});
