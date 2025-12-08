import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import Paragraph from "~/components/paragraph";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductDescriptionProps extends HydrogenComponentProps {
    ref: React.Ref<HTMLDivElement>;
}

export default function ProductDescription(props: ProductDescriptionProps) {
    const { ref, ...rest } = props;
    const { product } = useLoaderData<typeof productRouteLoader>();

    if (!product?.descriptionHtml && !product?.description) {
        return null;
    }

    return (
        <div ref={ref} {...rest} className="empty:hidden">
            <Paragraph
                className="leading-relaxed"
                content={product.descriptionHtml || product.description}
            />
        </div>
    );
}

export const schema = createSchema({
    type: "mp--description",
    title: "Description",
    limit: 1,
    enabledOn: {
        pages: ["PRODUCT"],
    },
    settings: [],
});
