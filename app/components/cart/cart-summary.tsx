import { GiftIcon, TagIcon, XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { Money, type OptimisticCart } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Banner } from "~/components/banner";
import { Button } from "~/components/button";
import { Skeleton } from "~/components/skeleton";
import { Spinner } from "~/components/spinner";
import { Title } from "~/components/title";
import { useApplyDiscount, useApplyGiftCard } from "~/lib/cart";
import type { CartLayoutType } from "~/types/others";
import { cn } from "~/utils/cn";
import {
    DiscountDialog,
    GiftCardDialog,
    NoteDialog,
} from "./cart-summary-actions";

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
    const { enableCartNote, enableDiscountCode, enableGiftCard } =
        useThemeSettings();
    const [removingDiscountCode, setRemovingDiscountCode] = useState<
        string | null
    >(null);
    const [removingGiftCard, setRemovingGiftCard] = useState<string | null>(
        null,
    );

    const { cost, discountCodes, isOptimistic, appliedGiftCards, note } = cart;

    const discountHook = useApplyDiscount(discountCodes);
    const giftCardHook = useApplyGiftCard();

    // Show loading state for optimistic line item changes or pending cart actions
    const isCartUpdating =
        isOptimistic || discountHook.isLoading || giftCardHook.isRemoveLoading;

    // Check for removal errors
    const dcRemoveError =
        !discountHook.isLoading && discountHook.userErrors.length
            ? discountHook.userErrors[0].message
            : null;
    const gcRemoveError =
        !giftCardHook.isRemoveLoading && giftCardHook.removeUserErrors.length
            ? giftCardHook.removeUserErrors[0].message
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
                        const isGCRemoving =
                            giftCardHook.isRemoveLoading &&
                            removingGiftCard === giftCard.lastCharacters;
                        return (
                            <div
                                key={giftCard.id}
                                className="flex items-center justify-center gap-2 rounded-md bg-gray-200 px-2 py-1.5"
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
                                <button
                                    type="button"
                                    className="relative ml-1 size-4 transition-colors hover:text-red-600"
                                    aria-label={t("cart.removeGiftCard", {
                                        code: giftCard.id,
                                    })}
                                    onClick={() => {
                                        setRemovingGiftCard(
                                            giftCard.lastCharacters,
                                        );
                                        giftCardHook.remove([giftCard.id]);
                                    }}
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
                        const isDCRemoving =
                            discountHook.isLoading &&
                            removingDiscountCode === discount.code;

                        return (
                            <div
                                key={discount.code}
                                className="flex items-center justify-center gap-2 rounded-md bg-gray-200 px-2 py-1.5"
                            >
                                <TagIcon
                                    weight="bold"
                                    className="size-4.5"
                                    aria-hidden="true"
                                />
                                <span className="leading-normal">
                                    {discount.code}
                                </span>
                                <button
                                    type="button"
                                    className="relative ml-1 size-4 transition-colors hover:text-red-600"
                                    aria-label={t("cart.removeDiscount", {
                                        code: discount.code,
                                    })}
                                    onClick={() => {
                                        setRemovingDiscountCode(discount.code);
                                        discountHook.remove(discount.code);
                                    }}
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
