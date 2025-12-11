import type { ProductVariantComponent } from "@shopify/hydrogen/storefront-api-types";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import type { RefObject } from "react";
import { useLoaderData } from "react-router";
import { BundledVariants } from "~/components/product/bundled-variants";
import { Title } from "~/components/title";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductBundledVariantsProps extends HydrogenComponentProps {
    headingText: string;
}

const ProductBundledVariants = ({
    ref,
    ...props
}: ProductBundledVariantsProps & {
    ref?: RefObject<HTMLDivElement | null>;
}) => {
    const { headingText, ...rest } = props;
    const { product } = useLoaderData<typeof productRouteLoader>();

    const isBundle = Boolean(product?.isBundle?.requiresComponents);
    const bundledVariants = isBundle
        ? product?.isBundle?.components.nodes
        : null;

    if (!(product && isBundle && bundledVariants)) {
        return null;
    }

    return (
        <div ref={ref} {...rest} className="space-y-3 empty:hidden">
            <Title as="h4" size="2xl">
                {headingText}
            </Title>
            <BundledVariants
                variants={bundledVariants as ProductVariantComponent[]}
            />
        </div>
    );
};

export default ProductBundledVariants;

export const schema = createSchema({
    type: "mp--bundled-variants",
    title: "Bundled variants",
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
                    label: "Bundled variants",
                    helpText:
                        "This component will only show if the product is a bundled product. Learn more about <a href='https://shopify.dev/docs/apps/build/product-merchandising/bundles' target='_blank'>Shopify product bundles</a>.",
                },
                {
                    type: "text",
                    label: "Heading text",
                    name: "headingText",
                    defaultValue: "Buy more save more",
                    placeholder: "Buy more save more",
                },
            ],
        },
    ],
});
