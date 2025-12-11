import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { cn } from "~/utils/cn";
import { getMetafieldValue, type MetafieldArray } from "~/utils/metafields";

/**
 * Props for the ProductAttributeBar Weaverse section.
 */
interface ProductAttributeBarProps extends HydrogenComponentProps {
    ref: React.Ref<HTMLDivElement>;
    /** Metafield key for attribute 1 */
    attribute1Key: string;
    /** Display label for attribute 1 (customizable via Weaverse) */
    attribute1Label: string;
    /** Metafield key for attribute 2 */
    attribute2Key: string;
    /** Display label for attribute 2 (customizable via Weaverse) */
    attribute2Label: string;
    /** Metafield key for attribute 3 */
    attribute3Key: string;
    /** Display label for attribute 3 (customizable via Weaverse) */
    attribute3Label: string;
}

/**
 * Represents an attribute to display in the attribute bar.
 */
interface AttributeDisplay {
    label: string;
    value: string;
}

/**
 * Weaverse section component for displaying key product attributes in a horizontal bar.
 * Shows up to 3 configurable attributes (e.g., Strength, Size, Content) in a clean layout.
 * Styled to match reference design with light border and centered text.
 *
 * @param props - The component props including Weaverse configuration
 * @returns The attribute bar section, or null if no attributes are found
 */
export default function ProductAttributeBar(props: ProductAttributeBarProps) {
    const {
        ref,
        attribute1Key,
        attribute1Label,
        attribute2Key,
        attribute2Label,
        attribute3Key,
        attribute3Label,
        ...rest
    } = props;

    const { product } = useLoaderData<typeof productRouteLoader>();

    if (!product) {
        return null;
    }

    // Type assertion needed until codegen runs with updated query
    const metafields = (product as { customMetafields?: MetafieldArray })
        .customMetafields;

    // Build attributes array from configuration using shared utility
    const attributes: AttributeDisplay[] = [];

    if (attribute1Key) {
        const value = getMetafieldValue(metafields, attribute1Key);
        if (value) {
            attributes.push({ label: attribute1Label, value });
        }
    }

    if (attribute2Key) {
        const value = getMetafieldValue(metafields, attribute2Key);
        if (value) {
            attributes.push({ label: attribute2Label, value });
        }
    }

    if (attribute3Key) {
        const value = getMetafieldValue(metafields, attribute3Key);
        if (value) {
            attributes.push({ label: attribute3Label, value });
        }
    }

    // Don't render if no attributes found
    if (attributes.length === 0) {
        return null;
    }

    return (
        <div
            ref={ref}
            {...rest}
            className="overflow-hidden rounded-lg border border-line bg-background"
            data-motion="fade-up"
        >
            <div className="flex divide-x divide-line">
                {attributes.map((attr, index) => (
                    <div
                        key={attr.label}
                        className={cn(
                            "flex flex-1 flex-col items-center justify-center px-4 py-4 text-center",
                            index === 0 && "rounded-l-lg",
                            index === attributes.length - 1 && "rounded-r-lg",
                        )}
                    >
                        <span className="font-normal text-body-subtle text-sm">
                            {attr.label}
                        </span>
                        <span className="mt-1 font-semibold text-base">
                            {attr.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export const schema = createSchema({
    type: "mp--attribute-bar",
    title: "Attribute bar",
    limit: 1,
    enabledOn: {
        pages: ["PRODUCT"],
    },
    settings: [
        {
            group: "Attribute 1",
            inputs: [
                {
                    type: "text",
                    label: "Metafield key",
                    name: "attribute1Key",
                    defaultValue: "strength",
                    placeholder: "strength",
                    helpText:
                        "The metafield key to read the value from. Note: Key must exist in the GraphQL query.",
                },
                {
                    type: "text",
                    label: "Display label",
                    name: "attribute1Label",
                    defaultValue: "Strength",
                    placeholder: "Strength",
                },
            ],
        },
        {
            group: "Attribute 2",
            inputs: [
                {
                    type: "text",
                    label: "Metafield key",
                    name: "attribute2Key",
                    defaultValue: "format",
                    placeholder: "format",
                },
                {
                    type: "text",
                    label: "Display label",
                    name: "attribute2Label",
                    defaultValue: "Size",
                    placeholder: "Size",
                },
            ],
        },
        {
            group: "Attribute 3",
            inputs: [
                {
                    type: "text",
                    label: "Metafield key",
                    name: "attribute3Key",
                    defaultValue: "bags_per_can",
                    placeholder: "bags_per_can",
                },
                {
                    type: "text",
                    label: "Display label",
                    name: "attribute3Label",
                    defaultValue: "Content",
                    placeholder: "Content",
                },
            ],
        },
    ],
});
