import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import {
    type QuantityBreak,
    QuantityBreakSelector,
} from "~/components/product/quantity-break-selector";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { isCombinedListing } from "~/utils/combined-listings";
import { useProductQtyStore } from "./product-quantity-selector";

/**
 * Mock discount data for quantity breaks.
 * This will be replaced with actual API data when the quantity break system is integrated.
 */
const MOCK_DISCOUNTS: Record<number, number> = {
    1: 10,
    10: 17,
    30: 19,
    50: 27,
};

/**
 * Props for the ProductQuantityBreaks Weaverse section.
 */
interface ProductQuantityBreaksProps extends HydrogenComponentProps {
    ref: React.Ref<HTMLDivElement>;
    /** Label text for the quantity selector */
    labelText: string;
    /** Comma-separated quantities for break options */
    quantities: string;
    /** Whether to show the custom quantity input */
    showCustomInput: boolean;
}

/**
 * Parses a comma-separated string of quantities into QuantityBreak objects.
 * Uses mock discount data for now, to be replaced with API data.
 *
 * @param quantitiesStr - Comma-separated quantities string (e.g., "1,10,30,50")
 * @returns Array of QuantityBreak objects with quantities and discounts
 */
function parseQuantityBreaks(quantitiesStr: string): QuantityBreak[] {
    return quantitiesStr
        .split(",")
        .map((q) => q.trim())
        .filter((q) => q.length > 0)
        .map((q) => {
            const quantity = Number.parseInt(q, 10);
            return {
                quantity: Number.isNaN(quantity) ? 1 : quantity,
                discountPercentage: MOCK_DISCOUNTS[quantity] || 0,
            };
        });
}

/**
 * Weaverse section component for quantity break selection.
 * Displays preset quantity options with discount badges and optional custom input.
 *
 * @param props - The component props including Weaverse configuration
 * @returns The quantity break selector section, or null for combined listings
 */
export default function ProductQuantityBreaks(
    props: ProductQuantityBreaksProps,
) {
    const { ref, labelText, quantities, showCustomInput, ...rest } = props;

    const { product } = useLoaderData<typeof productRouteLoader>();
    const { quantity, setQuantity } = useProductQtyStore();

    const combinedListing = isCombinedListing(product);

    // Don't render for combined listings
    if (!product || combinedListing) {
        return null;
    }

    const breaks = parseQuantityBreaks(quantities);

    return (
        <div ref={ref} {...rest} className="empty:hidden">
            <QuantityBreakSelector
                breaks={breaks}
                selectedQuantity={quantity}
                onQuantityChange={setQuantity}
                showCustomInput={showCustomInput}
                label={labelText}
            />
        </div>
    );
}

export const schema = createSchema({
    type: "mp--quantity-breaks",
    title: "Quantity breaks",
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
                    label: "Label text",
                    name: "labelText",
                    defaultValue: "Quantity",
                    placeholder: "Quantity",
                },
                {
                    type: "text",
                    label: "Preset quantities",
                    name: "quantities",
                    defaultValue: "1,10,30,50",
                    placeholder: "1,10,30,50",
                    helpText:
                        "Enter quantities separated by commas. Discount percentages are currently using mock data.",
                },
                {
                    type: "switch",
                    label: "Show custom quantity input",
                    name: "showCustomInput",
                    defaultValue: true,
                },
            ],
        },
    ],
});
