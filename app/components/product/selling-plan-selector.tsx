import {
    getAdjacentAndFirstAvailableVariants,
    Money,
    useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { useProductQtyStore } from "~/sections/main-product/product-quantity-selector";
import { cn } from "~/utils/cn";

interface ProductWithSellingPlans {
    sellingPlanGroups?: {
        nodes: Array<{
            name: string;
            sellingPlans: {
                nodes: Array<{
                    id: string;
                    name: string;
                }>;
            };
        }>;
    };
}

export default function SellingPlanSelector() {
    const { product } = useLoaderData<typeof productRouteLoader>();
    const { sellingPlanId, setSellingPlanId } = useProductQtyStore();

    const selectedVariant = useOptimisticVariant(
        product?.selectedOrFirstAvailableVariant,
        getAdjacentAndFirstAvailableVariants(product),
    );

    const sellingPlanGroups =
        (product as unknown as ProductWithSellingPlans)?.sellingPlanGroups
            ?.nodes || [];
    const hasSellingPlans = sellingPlanGroups.length > 0;

    if (!hasSellingPlans || !selectedVariant) {
        return null;
    }

    // Determine the selected selling plan group based on the selected sellingPlanId
    // If no plan is selected (undefined), it's a one-time purchase
    const selectedValue = sellingPlanId || "onetime";

    const handleValueChange = (value: string) => {
        if (value === "onetime") {
            setSellingPlanId(undefined);
        } else {
            setSellingPlanId(value);
        }
    };

    return (
        <fieldset className="mb-4 select-none space-y-3">
            <legend className="mb-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Purchase Option
            </legend>
            <div className="flex flex-col gap-3">
                {/* One-time Purchase Option */}
                <label
                    className={cn(
                        "flex cursor-pointer items-center justify-between rounded-full border border-line-subtle p-4 transition-colors hover:bg-muted/50",
                        selectedValue === "onetime" ? "bg-primary/5" : "",
                    )}
                >
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            value="onetime"
                            checked={selectedValue === "onetime"}
                            onChange={() => handleValueChange("onetime")}
                            className="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span className="cursor-pointer font-medium text-sm leading-none">
                            One-time purchase
                        </span>
                    </div>
                    <div className="font-medium text-sm">
                        <Money data={selectedVariant.price} />
                    </div>
                </label>

                <div
                    className={cn(
                        "flex flex-col items-stretch justify-start gap-6 rounded-2xl border border-line-subtle p-4 transition-colors hover:bg-muted/50",
                        selectedValue === "onetime" ? "bg-primary/5" : "",
                    )}
                >
                    {/* Selling Plan Options */}
                    {sellingPlanGroups.map((group) => {
                        const firstPlan = group.sellingPlans.nodes[0];
                        if (!firstPlan) return null;

                        return (
                            <label
                                key={group.name}
                                className={cn(
                                    "flex cursor-pointer items-center justify-between transition-colors",
                                    selectedValue === firstPlan.id
                                        ? "bg-primary/5"
                                        : "",
                                )}
                            >
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        value={firstPlan.id}
                                        checked={selectedValue === firstPlan.id}
                                        onChange={() =>
                                            handleValueChange(firstPlan.id)
                                        }
                                        className="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <div className="flex flex-col">
                                        <span className="cursor-pointer font-medium text-sm leading-none">
                                            Subscribe & Save
                                        </span>
                                        <span className="mt-1 text-muted-foreground text-xs">
                                            {group.name} - {firstPlan.name}
                                        </span>
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>
        </fieldset>
    );
}

export const schema = createSchema({
    type: "mp--selling-plan-selector",
    title: "Selling Plan Selector",
    limit: 1,
    enabledOn: {
        pages: ["PRODUCT"],
    },
    settings: [],
});
