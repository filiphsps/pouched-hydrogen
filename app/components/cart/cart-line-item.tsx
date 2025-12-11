import { TrashIcon } from "@phosphor-icons/react";
import {
    CartForm,
    Money,
    type OptimisticCart,
    OptimisticInput,
    useOptimisticData,
} from "@shopify/hydrogen";
import clsx from "clsx";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { RevealUnderline } from "~/components/reveal-underline";
import { Skeleton } from "~/components/skeleton";
import type { CartLayoutType } from "~/types/others";
import { cn } from "~/utils/cn";
import { calculateAspectRatio } from "~/utils/image";
import { removeVendorFromTitle } from "~/utils/product";
import { CartLineQuantityAdjust } from "./cart-line-qty-adjust";
import { useCartDrawerStore } from "./store";

type CartLine = OptimisticCart<CartApiQueryFragment>["lines"]["nodes"][0];

export type CartLineOptimisticData = {
    action?: string;
    quantity?: number;
};

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

    const { id, quantity, merchandise, isOptimistic: lineOptimistic } = line;
    /**
     * Determines if the current line item is in an optimistic state.
     * Note: The isOptimistic field on the line does not update as documented
     * in https://shopify.dev/docs/api/hydrogen/latest/hooks/useoptimisticcart#useOptimisticCart-returns,
     * so we manually check it via the optimisticData object when lineOptimistic is undefined.
     */
    const isOptimistic =
        lineOptimistic === undefined
            ? JSON.stringify(optimisticData) !== "{}"
            : lineOptimistic;

    if (typeof quantity === "undefined" || !merchandise?.product) {
        return null;
    }

    const { image, title, product, selectedOptions } = merchandise;
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

    const productTitle: ReactNode = product?.title ? (
        <span className="inline-flex gap-1">
            <span className="inline-block font-medium text-body-subtle uppercase">
                {product.vendor}
            </span>
            {removeVendorFromTitle(product.title, product.vendor, true)}
        </span>
    ) : null;

    return (
        <li
            className="flex gap-4 border-line-subtle border-t pt-4"
            style={{
                // Hide the line item if the optimistic data action is remove
                // Do not remove the form from the DOM
                display: optimisticData?.action === "remove" ? "none" : "flex",
            }}
        >
            <div className="relative shrink-0">
                {image && (
                    <Image
                        width={250}
                        height={250}
                        data={image}
                        className="aspect-square h-auto w-24 rounded-2xl bg-gray-100"
                        alt={title}
                        aspectRatio={calculateAspectRatio(image, "adapt")}
                    />
                )}
            </div>
            <div className="flex grow flex-col gap-3 gap-y-1">
                <div className="flex justify-between gap-4">
                    <div>
                        <div>
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
                        {!isDefaultVariant && (
                            <div className="space-y-0.5 text-gray-500 text-sm">
                                {title}
                            </div>
                        )}
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
        </li>
    );
}

function ItemRemoveButton({
    lineId,
    className,
}: {
    lineId: CartLine["id"];
    className?: string;
}) {
    const { t } = useTranslation();
    return (
        <CartForm
            route="/cart"
            action={CartForm.ACTIONS.LinesRemove}
            inputs={{ lineIds: [lineId] }}
        >
            <button
                className={clsx(
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
