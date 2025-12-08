import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import {
    type ProductFact,
    ProductFactsTable,
} from "~/components/product/product-facts-table";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { extractMetafieldFacts, type MetafieldArray } from "~/utils/metafields";

/**
 * Props for the ProductFacts Weaverse section.
 */
interface ProductFactsProps extends HydrogenComponentProps {
    ref: React.Ref<HTMLDivElement>;
    /** Section title */
    title: string;
    /** Comma-separated metafield keys to display */
    metafieldKeys: string;
}

/**
 * Weaverse section component for displaying product facts/specifications.
 * Reads metafield values and displays them in a clean table format.
 * Uses shared metafield utilities with i18n support for labels.
 *
 * @param props - The component props including Weaverse configuration
 * @returns The product facts section, or null if no facts are found
 */
export default function ProductFacts(props: ProductFactsProps) {
    const { ref, title, metafieldKeys, ...rest } = props;
    const { t } = useTranslation();
    const { product } = useLoaderData<typeof productRouteLoader>();

    if (!product) {
        return null;
    }

    // Parse metafield keys
    const keys = metafieldKeys
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0 && k !== "brand"); // Exclude brand since we add vendor

    // Type assertion needed until codegen runs with updated query
    const metafields = (product as { customMetafields?: MetafieldArray })
        .customMetafields;

    const facts: ProductFact[] = [];

    // Always add vendor/brand from Shopify product data
    if (product.vendor) {
        facts.push({
            label: t("product.metafield.label.brand", {
                defaultValue: "Brand",
            }),
            value: product.vendor,
        });
    }

    // Extract remaining facts using shared utility
    const metafieldFacts = extractMetafieldFacts(t, metafields, keys);
    facts.push(...metafieldFacts);

    // Don't render if no facts found
    if (facts.length === 0) {
        return null;
    }

    return (
        <div ref={ref} {...rest} className="empty:hidden" data-motion="fade-up">
            <ProductFactsTable facts={facts} title={title} />
        </div>
    );
}

export const schema = createSchema({
    type: "mp--facts",
    title: "Product facts",
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
                    label: "Section title",
                    name: "title",
                    defaultValue: "Facts",
                    placeholder: "Facts",
                },
                {
                    type: "text",
                    label: "Metafield keys",
                    name: "metafieldKeys",
                    defaultValue:
                        "strength,nicotine,aroma,format,bags_per_can,weight_per_bag",
                    placeholder: "strength,nicotine,aroma,format",
                    helpText:
                        "Comma-separated metafield keys to display. The product vendor is automatically included as 'Brand'. Note: Additional metafield keys may need to be added to the GraphQL query.",
                },
            ],
        },
    ],
});
