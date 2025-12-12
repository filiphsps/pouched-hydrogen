import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import type { RefObject } from "react";
import { useLoaderData } from "react-router";
import { VendorLink } from "~/components/product/vendor-link";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { removeVendorFromTitle } from "~/utils/product";

interface ProductTitleProps extends HydrogenComponentProps {
    headingTag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    showVendor: boolean;
    removeVendorFromTitle: boolean;
}

const ProductTitle = ({
    ref,
    ...props
}: ProductTitleProps & { ref?: RefObject<HTMLDivElement | null> }) => {
    const {
        headingTag: Tag,
        showVendor,
        removeVendorFromTitle: shouldRemoveVendor,
        ...rest
    } = props;
    const { product, vendorCollectionUrl } =
        useLoaderData<typeof productRouteLoader>();

    if (!product) {
        return null;
    }

    return (
        <div ref={ref} {...rest}>
            <Tag className="h3 leading-normal tracking-tight">
                {showVendor && (
                    <VendorLink
                        vendor={product.vendor}
                        href={vendorCollectionUrl}
                        className="pr-2 font-semibold"
                    />
                )}

                {removeVendorFromTitle(
                    product.title,
                    product.vendor,
                    shouldRemoveVendor,
                )}
            </Tag>
        </div>
    );
};

export default ProductTitle;

export const schema = createSchema({
    type: "mp--title",
    title: "Title",
    limit: 1,
    enabledOn: {
        pages: ["PRODUCT"],
    },
    settings: [
        {
            group: "General",
            inputs: [
                {
                    type: "select",
                    label: "Heading tag",
                    name: "headingTag",
                    defaultValue: "h1",
                    configs: {
                        options: [
                            { value: "h1", label: "H1" },
                            { value: "h2", label: "H2" },
                            { value: "h3", label: "H3" },
                            { value: "h4", label: "H4" },
                            { value: "h5", label: "H5" },
                            { value: "h6", label: "H6" },
                        ],
                    },
                },
                {
                    type: "switch",
                    label: "Show vendor",
                    name: "showVendor",
                    defaultValue: true,
                },
                {
                    type: "switch",
                    label: "Remove vendor from title",
                    name: "removeVendorFromTitle",
                    defaultValue: true,
                },
            ],
        },
    ],
});
