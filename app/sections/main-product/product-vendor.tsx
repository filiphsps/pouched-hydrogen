import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import type { RefObject } from "react";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductVendorProps extends HydrogenComponentProps {}

const ProductVendor = ({
    ref,
    ...props
}: ProductVendorProps & { ref?: RefObject<HTMLDivElement | null> }) => {
    const { ...rest } = props;
    const { product } = useLoaderData<typeof productRouteLoader>();

    if (!product?.vendor) {
        return null;
    }

    return (
        <div ref={ref} {...rest} className="empty:hidden">
            <span className="text-body-subtle">{product.vendor}</span>
        </div>
    );
};

export default ProductVendor;

export const schema = createSchema({
    type: "mp--vendor",
    title: "Vendor",
    limit: 1,
    enabledOn: {
        pages: ["PRODUCT"],
    },
    settings: [],
});
