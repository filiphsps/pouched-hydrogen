import { createSchema } from "@weaverse/hydrogen";
import type { RefObject } from "react";

interface ProductMediaBelowProps {
    children?: React.ReactNode;
}

const ProductMediaBelow = ({
    ref,
    ...props
}: ProductMediaBelowProps & { ref?: RefObject<HTMLDivElement | null> }) => {
    const { children, ...rest } = props;
    return (
        <div ref={ref} {...rest} className="space-y-10 lg:mt-10">
            {children}
        </div>
    );
};

ProductMediaBelow.displayName = "ProductMediaBelow";
// Static identifier for reliable detection
(ProductMediaBelow as any).weaverseType = "mp--media-below";

export default ProductMediaBelow;

export const schema = createSchema({
    type: "mp--media-below",
    title: "Below Media Content",
    limit: 1,
    enabledOn: {
        pages: ["PRODUCT"],
    },
    settings: [],
    childTypes: [
        "mp--attribute-bar",
        "mp--facts",
        "mp--description",
        "mp--collapsible-details",
        "mp--shipping-estimate",
        "judgeme-stars-rating",
    ],
});
