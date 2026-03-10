import { ArrowsClockwise, TrashIcon } from "@phosphor-icons/react";
import {
    CartForm,
    Money,
    type OptimisticCart,
    OptimisticInput,
    useOptimisticData,
} from "@shopify/hydrogen";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Link } from "~/components/link";
import { ProductImage } from "~/components/product/product-image";
import { VendorBadge } from "~/components/product/vendor-badge";
import { RevealUnderline } from "~/components/reveal-underline";
import { Skeleton } from "~/components/skeleton";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { CartLayoutType } from "~/types/others";
import { cn } from "~/utils/cn";
import { removeVendorFromTitle } from "~/utils/product";
import { CartLineQuantityAdjust } from "./cart-line-qty-adjust";
import { useCartDrawerStore } from "./store";

type CartLine = OptimisticCart<CartApiQueryFragment>["lines"]["nodes"][0];

/** Typed selling plan allocation from the cart line GraphQL fragment. */
interface SellingPlanAllocation {
    sellingPlan: {
        name: string;
    };
}

export type CartLineOptimisticData = {
    action?: string;
    quantity?: number;
};

/**
 * Individual cart line item component.
 * Shows product image, title, variant, selling plan, quantity adjuster, and price.
 * Supports optimistic removal by returning null when action is "remove".
 *
 * @param props.line - Cart line item from optimistic cart
 * @param props.layout - "drawer" or "page"
 */
export function CartLineItem({
    line,
    layout,
}: {
    line: CartLine;
    layout: CartLayoutType;
}) {
    const { close: closeCartDrawer } = useCartDrawerStore();
    const optimisticData = useOptimisticData<CartLineOptimisticData>(line?.id);

    if (!line?.id) {
        return null;
    }

    // Return null for optimistic removal — clean DOM removal instead of CSS hack
    if (optimisticData?.action === "remove") {
        return null;
    }

    const { id, quantity, merchandise, isOptimistic: lineOptimistic } = line;

    /**
     * Determines if the current line item is in an optimistic state.
     * Uses the presence of optimistic data as a fallback when lineOptimistic is undefined.
     */
    const isOptimistic =
        lineOptimistic === undefined
            ? optimisticData != null && Object.keys(optimisticData).length > 0
            : lineOptimistic;

    if (typeof quantity === "undefined" || !merchandise?.product) {
        return null;
    }

    const { image, title, product, selectedOptions } = merchandise;

    // Build product URL with variant params
    let url = `/products/${product.handle}`;
    if (selectedOptions?.length) {
        const params = new URLSearchParams();
        for (const option of selectedOptions) {
            params.append(option.name, option.value);
        }
        url += `?${params.toString()}`;
    }
    let isDefaultVariant = false;
    if (selectedOptions?.length === 1) {
        const { name, value } = selectedOptions[0];
        isDefaultVariant = name === "Title" && value === "Default Title";
    }

    // Type-safe access to selling plan allocation
    const sellingPlanAllocation = (
        line as CartLine & { sellingPlanAllocation?: SellingPlanAllocation }
    ).sellingPlanAllocation;

    const productTitle: ReactNode = product?.title ? (
        <span className="inline-flex flex-col">
            <VendorBadge vendor={product.vendor} size="xs" inline />
            <span className="leading-tight">
                {removeVendorFromTitle(product.title, product.vendor, true)}
            </span>
        </span>
    ) : null;

    return (
        <div className="flex gap-4">
            {image && (
                <div className="relative flex h-full shrink-0 items-center overflow-hidden rounded-2xl bg-gray-100 p-2">
                    <ProductImage
                        image={image}
                        size="small"
                        aspectRatio="1/1"
                        alt={title}
                        className="aspect-square size-24"
                    />
                </div>
            )}

            <div className="flex grow flex-col gap-3 gap-y-1">
                <div className="flex justify-between gap-4">
                    <div>
                        <div className="mb-1">
                            {product?.handle ? (
                                <Link
                                    to={url}
                                    className="inline-block"
                                    onClick={closeCartDrawer}
                                >
                                    <RevealUnderline>
                                        {productTitle}
                                    </RevealUnderline>
                                </Link>
                            ) : (
                                <p>{productTitle}</p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 text-gray-500 text-sm">
                            {!isDefaultVariant && <span>{title}</span>}
                            {sellingPlanAllocation?.sellingPlan?.name && (
                                <span className="flex items-center gap-1 text-xs">
                                    <ArrowsClockwise size={14} />
                                    <span>
                                        {sellingPlanAllocation.sellingPlan.name}
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>
                    {layout === "drawer" && (
                        <ItemRemoveButton
                            lineId={id}
                            className="-mt-1.5 -mr-2"
                        />
                    )}
                </div>
                <div
                    className={cn(
                        "flex w-full items-center gap-3",
                        layout === "drawer" &&
                            "flex-col items-start justify-start gap-1",
                    )}
                >
                    <CartLineQuantityAdjust line={line} />
                    {layout === "page" && <ItemRemoveButton lineId={id} />}
                    <CartLinePrice line={line} isOptimistic={isOptimistic} />
                </div>
            </div>
        </div>
    );
}

/**
 * Remove button for a cart line item.
 * Submits a CartForm with LinesRemove action and optimistic data.
 */
function ItemRemoveButton({
    lineId,
    className,
}: {
    lineId: CartLine["id"];
    className?: string;
}) {
    const { t } = useTranslation();
    const cartRoute = usePrefixPathWithLocale("/cart");
    return (
        <CartForm
            route={cartRoute}
            action={CartForm.ACTIONS.LinesRemove}
            inputs={{ lineIds: [lineId] }}
        >
            <button
                className={cn(
                    "flex h-8 w-8 items-center justify-center border-none",
                    className,
                )}
                type="submit"
            >
                <span className="sr-only">{t("cart.remove")}</span>
                <TrashIcon aria-hidden="true" className="size-4.5" />
            </button>
            <OptimisticInput id={lineId} data={{ action: "remove" }} />
        </CartForm>
    );
}

/**
 * Displays line item price with skeleton loading during optimistic updates.
 */
function CartLinePrice({
    line,
    priceType = "regular",
    isOptimistic,
    className,
}: {
    line: CartLine;
    priceType?: "regular" | "compareAt";
    isOptimistic?: boolean;
    className?: string;
}) {
    if (!(line?.cost?.amountPerQuantity && line?.cost?.totalAmount)) {
        return null;
    }

    const moneyV2 =
        priceType === "regular"
            ? line.cost.totalAmount
            : line.cost.compareAtAmountPerQuantity;

    if (moneyV2 == null) {
        return null;
    }

    if (isOptimistic) {
        return (
            <Skeleton
                as="span"
                className={cn("ml-auto h-4 w-16 rounded", className)}
            />
        );
    }
    return (
        <Money
            withoutTrailingZeros
            as="span"
            data={moneyV2}
            className={cn("ml-auto", className)}
        />
    );
}
