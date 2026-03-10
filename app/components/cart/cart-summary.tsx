import { GiftIcon, TagIcon, XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { CartForm, Money, type OptimisticCart } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Banner } from "~/components/banner";
import { Button } from "~/components/button";
import { Skeleton } from "~/components/skeleton";
import { Spinner } from "~/components/spinner";
import { Title } from "~/components/title";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { CartLayoutType } from "~/types/others";
import { cn } from "~/utils/cn";
import {
    DiscountDialog,
    GiftCardDialog,
    NoteDialog,
} from "./cart-summary-actions";

/** Response shape from the cart action */
interface CartActionResponse {
    userErrors?: Array<{ message: string }>;
}

/**
 * Cart summary component.
 * Displays applied gift cards, discount codes, order total,
 * and action dialogs for notes, discounts, and gift cards.
 *
 * @param props.cart - Optimistic cart data
 * @param props.layout - "drawer" or "page"
 */
export function CartSummary({
    cart,
    layout,
}: {
    cart: OptimisticCart<CartApiQueryFragment>;
    layout: CartLayoutType;
}) {
    const { t } = useTranslation();
    const cartRoute = usePrefixPathWithLocale("/cart");
    const { enableCartNote, enableDiscountCode, enableGiftCard } =
        useThemeSettings();
    const [removingDiscountCode, setRemovingDiscountCode] = useState<
        string | null
    >(null);
    const [removingGiftCard, setRemovingGiftCard] = useState<string | null>(
        null,
    );
    const dcRemoveFetcher = useFetcher<CartActionResponse>({
        key: "discount-code-remove",
    });
    const gcRemoveFetcher = useFetcher<CartActionResponse>({
        key: "gift-card-remove",
    });
    const { cost, discountCodes, isOptimistic, appliedGiftCards, note } = cart;

    // Show loading state for optimistic line item changes or pending cart actions
    const isCartUpdating =
        isOptimistic ||
        dcRemoveFetcher.state !== "idle" ||
        gcRemoveFetcher.state !== "idle";

    // Check for removal errors from fetcher responses
    const dcRemoveError =
        dcRemoveFetcher.state === "idle" &&
        dcRemoveFetcher.data?.userErrors?.length
            ? dcRemoveFetcher.data.userErrors[0].message
            : null;
    const gcRemoveError =
        gcRemoveFetcher.state === "idle" &&
        gcRemoveFetcher.data?.userErrors?.length
            ? gcRemoveFetcher.data.userErrors[0].message
            : null;

    // Memoize applicable discount codes to avoid O(n²) filtering on every render
    const applicableDiscountCodes = useMemo(
        () => discountCodes?.filter((d) => d.applicable) ?? [],
        [discountCodes],
    );

    return (
        <div>
            <Title as="h2" id="summary-heading" className="sr-only">
                {t("cart.orderSummary")}
            </Title>

            {/* Active Gift Cards */}
            {appliedGiftCards?.length > 0 && (
                <div className="mb-4 flex flex-wrap justify-end gap-2">
                    {appliedGiftCards.map((giftCard) => {
                        // Check if this specific gift card is being removed
                        const isGCRemoving =
                            gcRemoveFetcher.state !== "idle" &&
                            removingGiftCard === giftCard.lastCharacters;
                        return (
                            <div
                                key={giftCard.id}
                                className="flex items-center justify-center gap-2 rounded-md bg-gray-200 px-2 py-1.5 [&>form]:flex"
                            >
                                <GiftIcon
                                    weight="bold"
                                    className="size-4.5"
                                    aria-hidden="true"
                                />
                                <div className="flex items-center gap-1 leading-normal">
                                    <span>***{giftCard.lastCharacters}</span>
                                    <span className="inline-flex items-center">
                                        (-{<Money data={giftCard.amountUsed} />}
                                        )
                                    </span>
                                </div>
                                <CartForm
                                    route={cartRoute}
                                    action={
                                        CartForm.ACTIONS.GiftCardCodesRemove
                                    }
                                    inputs={{
                                        giftCardCodes: [giftCard.id],
                                    }}
                                    fetcherKey="gift-card-remove"
                                >
                                    <button
                                        type="submit"
                                        className="relative ml-1 size-4 transition-colors hover:text-red-600"
                                        aria-label={t("cart.removeGiftCard", {
                                            code: giftCard.id,
                                        })}
                                        onClick={() =>
                                            setRemovingGiftCard(
                                                giftCard.lastCharacters,
                                            )
                                        }
                                    >
                                        {isGCRemoving ? (
                                            <Spinner size={16} />
                                        ) : (
                                            <XIcon
                                                className="size-4"
                                                weight="regular"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </CartForm>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Gift card removal error */}
            {gcRemoveError && (
                <Banner variant="error" className="mb-4">
                    {gcRemoveError}
                </Banner>
            )}

            {/* Active Discount Codes*/}
            {applicableDiscountCodes.length > 0 && (
                <div className="mb-4 flex flex-wrap justify-end gap-2">
                    {applicableDiscountCodes.map((discount) => {
                        // Get all codes except the current one for removal
                        const updatedCodes = applicableDiscountCodes
                            .filter((d) => d.code !== discount.code)
                            .map((d) => d.code);

                        // Check if this specific discount is being removed
                        const isDCRemoving =
                            dcRemoveFetcher.state !== "idle" &&
                            removingDiscountCode === discount.code;

                        return (
                            <div
                                key={discount.code}
                                className="flex items-center justify-center gap-2 rounded-md bg-gray-200 px-2 py-1.5 [&>form]:flex"
                            >
                                <TagIcon
                                    weight="bold"
                                    className="size-4.5"
                                    aria-hidden="true"
                                />
                                <span className="leading-normal">
                                    {discount.code}
                                </span>
                                <CartForm
                                    route={cartRoute}
                                    action={
                                        CartForm.ACTIONS.DiscountCodesUpdate
                                    }
                                    inputs={{
                                        discountCodes: updatedCodes || [],
                                    }}
                                    fetcherKey="discount-code-remove"
                                >
                                    <button
                                        type="submit"
                                        className="relative ml-1 size-4 transition-colors hover:text-red-600"
                                        aria-label={t("cart.removeDiscount", {
                                            code: discount.code,
                                        })}
                                        onClick={() =>
                                            setRemovingDiscountCode(
                                                discount.code,
                                            )
                                        }
                                    >
                                        {isDCRemoving ? (
                                            <Spinner size={16} />
                                        ) : (
                                            <XIcon
                                                className="size-4"
                                                weight="regular"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </CartForm>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Discount removal error */}
            {dcRemoveError && (
                <Banner variant="error" className="mb-4">
                    {dcRemoveError}
                </Banner>
            )}

            <dl className="mb-4 grid">
                <div
                    className={cn(
                        "flex items-center justify-between font-medium",
                        layout === "page" && "text-xl",
                    )}
                >
                    <dt>{t("cart.total")}:</dt>
                    {isCartUpdating ? (
                        <Skeleton className="h-4 w-20 rounded" />
                    ) : (
                        <dd>
                            {cost?.totalAmount?.amount ? (
                                <Money data={cost?.totalAmount} />
                            ) : (
                                "-"
                            )}
                        </dd>
                    )}
                </div>
            </dl>
            <div className="mb-2 text-right text-body-subtle">
                {t("cart.taxesDiscountsShipping")}
            </div>

            {(enableCartNote || enableDiscountCode || enableGiftCard) && (
                <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
                    {/* Note */}
                    {enableCartNote && (
                        <>
                            <Dialog.Root>
                                <Dialog.Trigger asChild>
                                    <Button variant="underline">
                                        {t("cart.addNote")}
                                    </Button>
                                </Dialog.Trigger>
                                <NoteDialog cartNote={note} />
                            </Dialog.Root>
                            {(enableDiscountCode || enableGiftCard) && (
                                <span>/</span>
                            )}
                        </>
                    )}

                    {/* Discount */}
                    {enableDiscountCode && (
                        <>
                            <Dialog.Root>
                                <Dialog.Trigger asChild>
                                    <Button variant="underline">
                                        {t("cart.addDiscount")}
                                    </Button>
                                </Dialog.Trigger>
                                <DiscountDialog discountCodes={discountCodes} />
                            </Dialog.Root>
                            {enableGiftCard && <span>/</span>}
                        </>
                    )}

                    {/* Gift Card */}
                    {enableGiftCard && (
                        <Dialog.Root>
                            <Dialog.Trigger asChild>
                                <Button variant="underline">
                                    {t("cart.redeemGiftCard")}
                                </Button>
                            </Dialog.Trigger>
                            <GiftCardDialog
                                appliedGiftCards={appliedGiftCards}
                            />
                        </Dialog.Root>
                    )}
                </div>
            )}
        </div>
    );
}
