import { XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Banner } from "~/components/banner";
import { Button } from "~/components/button";
import { IconButton } from "~/components/icon-button";
import { Input } from "~/components/input";
import { Textarea } from "~/components/textarea";
import {
    useApplyDiscount,
    useApplyGiftCard,
    useUpdateCartNote,
} from "~/lib/cart";
import { cn } from "~/utils/cn";

/**
 * Note dialog for adding/editing cart notes.
 * Derives success from hook data (no userErrors = success).
 */
export function NoteDialog({
    cartNote: currentNote = "",
}: {
    cartNote?: string | null;
}) {
    const { t } = useTranslation();
    const [note, setNote] = useState(currentNote || "");
    const { mutate, isLoading, userErrors, data, reset } = useUpdateCartNote();

    // Derive success/error from response
    const hasResponse = !isLoading && data != null;
    const hasError = hasResponse && userErrors.length > 0;
    const hasSuccess = hasResponse && userErrors.length === 0;

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formCartNote = formData.get("cartNote") as string;
        if (formCartNote) {
            mutate(formCartNote);
            setNote(formCartNote);
        }
    }

    return (
        <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-900/50 data-[state=open]:animate-fade-in" />
            <Dialog.Content
                onCloseAutoFocus={(e) => {
                    e.preventDefault();
                    setNote(currentNote || "");
                    reset();
                }}
                className={cn(
                    "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs",
                    "[--slide-up-from:20px]",
                    "data-[state=open]:animate-slide-up",
                )}
                aria-describedby={undefined}
            >
                <div className="relative w-full max-w-md overflow-hidden bg-white p-6 shadow-xl">
                    <Dialog.Close asChild>
                        <IconButton
                            variant="close"
                            position="top-right"
                            aria-label={t("cart.close")}
                        >
                            <XIcon size={16} />
                        </IconButton>
                    </Dialog.Close>

                    <Dialog.Title className="mb-4 font-medium text-lg">
                        {t("cart.addNote")}
                    </Dialog.Title>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <Textarea
                            variant="dialog"
                            placeholder={t("cart.notePlaceholder")}
                            rows={4}
                            name="cartNote"
                            value={note}
                            onChange={(e) => {
                                setNote(e.target.value);
                                reset();
                            }}
                        />
                        {hasSuccess && (
                            <Banner variant="success">
                                {t("cart.noteSaved")}
                            </Banner>
                        )}
                        {hasError && (
                            <Banner variant="error">
                                {userErrors[0].message}
                            </Banner>
                        )}
                        <div className="flex items-center justify-end gap-3">
                            <Dialog.Close asChild>
                                <Button
                                    variant="custom"
                                    className="w-24 border-none"
                                >
                                    {t("forms.cancel")}
                                </Button>
                            </Dialog.Close>
                            <Button
                                type="submit"
                                loading={isLoading}
                                disabled={isLoading}
                                className="w-24 leading-tight! [--spinner-duration:400ms]"
                            >
                                {t("cart.saveNote")}
                            </Button>
                        </div>
                    </form>
                </div>
            </Dialog.Content>
        </Dialog.Portal>
    );
}

/**
 * Discount code dialog.
 * Derives success/error from hook data — checks the response cart's discountCodes
 * for applicability.
 */
export function DiscountDialog({
    discountCodes = [],
}: {
    discountCodes: CartApiQueryFragment["discountCodes"];
}) {
    const { t } = useTranslation();
    const [code, setCode] = useState("");
    const { apply, isLoading, userErrors, data, reset, responseDiscountCodes } =
        useApplyDiscount(discountCodes);

    // Derive success/error from the action response
    const hasResponse = !isLoading && data != null && code !== "";
    const discountCodesForCheck = responseDiscountCodes ?? discountCodes;
    const codeIsApplicable =
        hasResponse &&
        discountCodesForCheck?.some((d) => d.code === code && d.applicable);
    const success = hasResponse && userErrors.length === 0 && codeIsApplicable;
    const error = hasResponse && !success;

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const discountCode = formData.get("discountCode") as string;
        if (discountCode) {
            apply(discountCode);
        }
    }

    return (
        <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-900/50 data-[state=open]:animate-fade-in" />
            <Dialog.Content
                onCloseAutoFocus={(e) => {
                    e.preventDefault();
                    setCode("");
                    reset();
                }}
                className={cn(
                    "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs",
                    "[--slide-up-from:20px]",
                    "data-[state=open]:animate-slide-up",
                )}
                aria-describedby={undefined}
            >
                <div className="relative w-full max-w-md overflow-hidden bg-white p-6 shadow-xl">
                    <Dialog.Close asChild>
                        <IconButton
                            variant="close"
                            position="top-right"
                            aria-label={t("cart.close")}
                        >
                            <XIcon size={16} />
                        </IconButton>
                    </Dialog.Close>

                    <Dialog.Title className="mb-4 font-medium text-xl">
                        {t("cart.discountTitle")}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            variant="dialog"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                reset();
                            }}
                            type="text"
                            name="discountCode"
                            placeholder={t("cart.discountPlaceholder")}
                            required
                        />
                        {success && (
                            <Banner variant="success">
                                {t("cart.discountApplied")}
                            </Banner>
                        )}
                        {error && (
                            <Banner variant="error">
                                {userErrors.length > 0
                                    ? userErrors[0].message
                                    : t("cart.discountInvalid")}
                            </Banner>
                        )}
                        <div className="flex items-center justify-end gap-3">
                            <Dialog.Close asChild>
                                <Button
                                    variant="custom"
                                    className="w-24 border-none"
                                >
                                    {t("forms.cancel")}
                                </Button>
                            </Dialog.Close>
                            <Button
                                type="submit"
                                className="w-24 leading-tight! [--spinner-duration:400ms]"
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                {t("cart.apply")}
                            </Button>
                        </div>
                    </form>
                </div>
            </Dialog.Content>
        </Dialog.Portal>
    );
}

/**
 * Gift card dialog.
 * Derives success/error from hook data.
 */
export function GiftCardDialog({
    appliedGiftCards = [],
}: {
    appliedGiftCards: CartApiQueryFragment["appliedGiftCards"];
}) {
    const { t } = useTranslation();
    const [code, setCode] = useState("");
    const [appliedCodes, setAppliedCodes] = useState<string[]>([]);
    const {
        apply,
        isApplyLoading,
        applyUserErrors,
        applyData,
        resetApply,
        responseGiftCards,
    } = useApplyGiftCard();

    // Derive success/error from the action response
    const hasResponse = !isApplyLoading && applyData != null && code !== "";
    const userErrors = applyUserErrors;
    const hasError = hasResponse && userErrors.length > 0;

    // Check if the applied gift card appears in the response
    const giftCardsForCheck = responseGiftCards ?? appliedGiftCards;
    const codeWasApplied =
        hasResponse &&
        giftCardsForCheck?.some((gc) =>
            code.toLowerCase().endsWith(gc.lastCharacters),
        );
    const success = hasResponse && !hasError && codeWasApplied;
    const error = hasResponse && !success;

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const giftCardCode = formData.get("giftCardCode") as string;
        if (giftCardCode) {
            const formattedCode = giftCardCode.replace(/\s/g, "");
            apply(formattedCode, appliedCodes);
            setAppliedCodes((prev) =>
                prev.includes(formattedCode) ? prev : [...prev, formattedCode],
            );
        }
    }

    return (
        <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-900/50 data-[state=open]:animate-fade-in" />
            <Dialog.Content
                onCloseAutoFocus={(e) => {
                    e.preventDefault();
                    setCode("");
                    resetApply();
                }}
                className={cn(
                    "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs",
                    "[--slide-up-from:20px]",
                    "data-[state=open]:animate-slide-up",
                )}
                aria-describedby={undefined}
            >
                <div className="relative w-full max-w-md overflow-hidden bg-white p-6 shadow-xl">
                    <Dialog.Close asChild>
                        <IconButton
                            variant="close"
                            position="top-right"
                            aria-label={t("cart.close")}
                        >
                            <XIcon size={16} />
                        </IconButton>
                    </Dialog.Close>

                    <Dialog.Title className="mb-4 font-medium text-xl">
                        {t("cart.redeemGiftCard")}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            variant="dialog"
                            type="text"
                            name="giftCardCode"
                            placeholder={t("cart.giftCardPlaceholder")}
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                resetApply();
                            }}
                            required
                        />
                        {success && (
                            <Banner variant="success">
                                {t("cart.giftCardApplied")}
                            </Banner>
                        )}
                        {error && (
                            <Banner variant="error">
                                {userErrors.length > 0
                                    ? userErrors[0].message
                                    : t("cart.giftCardInvalid")}
                            </Banner>
                        )}
                        <div className="flex items-center justify-end gap-3">
                            <Dialog.Close asChild>
                                <Button
                                    variant="custom"
                                    className="w-24 border-none"
                                >
                                    {t("forms.cancel")}
                                </Button>
                            </Dialog.Close>
                            <Button
                                type="submit"
                                className="w-24 leading-tight! [--spinner-duration:400ms]"
                                loading={isApplyLoading}
                                disabled={isApplyLoading}
                            >
                                {t("cart.redeem")}
                            </Button>
                        </div>
                    </form>
                </div>
            </Dialog.Content>
        </Dialog.Portal>
    );
}
