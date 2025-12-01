import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import { VariantSelector } from "~/components/product/variant-selector";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductVariantSelectorProps extends HydrogenComponentProps {
    showVariantImage: boolean;
}

const ProductVariantSelectorComponent = forwardRef<
    HTMLDivElement,
    ProductVariantSelectorProps
>((props, ref) => {
    const { showVariantImage, ...rest } = props;
    const { product } = useLoaderData<typeof productRouteLoader>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    if (!product) {
        return null;
    }

    const selectedVariant = product.selectedOrFirstAvailableVariant;

    const setSelectedVariant = (variant: any) => {
        if (!variant) return;

        const newParams = new URLSearchParams(searchParams);
        for (const option of variant.selectedOptions) {
            newParams.set(option.name, option.value);
        }

        navigate(`?${newParams.toString()}`, {
            preventScrollReset: true,
            replace: true,
        });
    };

    return (
        <div ref={ref} {...rest}>
            <VariantSelector
                product={product}
                selectedVariant={selectedVariant}
                setSelectedVariant={setSelectedVariant}
            />
        </div>
    );
});

export default ProductVariantSelectorComponent;

export const schema = createSchema({
    type: "mp--variant-selector",
    title: "Variant selector",
    limit: 1,
    enabledOn: {
        pages: ["PRODUCT"],
    },
    settings: [
        {
            group: "General",
            inputs: [
                {
                    type: "switch",
                    label: "Show variant image",
                    name: "showVariantImage",
                    defaultValue: true,
                },
            ],
        },
    ],
});
