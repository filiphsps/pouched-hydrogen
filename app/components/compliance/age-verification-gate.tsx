/**
 * Age Verification Gate Component.
 * Displays a modal blocking all site content until user verifies they are 18+.
 * Required for German market compliance when selling tobacco-free snus.
 *
 * @example
 * ```tsx
 * <AgeVerificationGate />
 * ```
 */
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useThemeSettings } from "@weaverse/hydrogen";
import { useTranslation } from "react-i18next";
import { useRouteLoaderData } from "react-router";
import { Button } from "~/components/button";
import { Image } from "~/components/image";
import { Title } from "~/components/title";
import { useAgeVerification } from "~/hooks/use-age-verification";
import type { RootLoader } from "~/root";
import { cn } from "~/utils/cn";

/**
 * Age Verification Gate.
 * Renders a fullscreen modal that blocks all site content until
 * the user confirms they are 18 years or older.
 *
 * The verification is persisted in localStorage for 30 days.
 */
export function AgeVerificationGate() {
    const { t } = useTranslation();
    const { isVerified, isLoading, verifyAge } = useAgeVerification();
    const rootData = useRouteLoaderData<RootLoader>("root");

    // Get theme settings for customization
    const {
        ageVerificationEnabled = true,
        ageVerificationImage,
        ageVerificationHeading,
        ageVerificationDescription,
        ageVerificationConfirmText,
        ageVerificationDenyText,
        ageVerificationDenyUrl,
    } = useThemeSettings();

    // Don't render if disabled, verified, still loading (prevent flash), or bot (SEO)
    if (!ageVerificationEnabled || isVerified || isLoading || rootData?.isBot) {
        return null;
    }

    /**
     * Handle age confirmation.
     * Sets verification flag and closes the modal.
     */
    const handleConfirm = () => {
        verifyAge();
    };

    /**
     * Handle age denial.
     * Redirects user to specified URL (usually Google).
     */
    const handleDeny = () => {
        const redirectUrl = ageVerificationDenyUrl || "https://www.google.com";
        window.location.href = redirectUrl;
    };

    return (
        <Dialog.Root open modal>
            <Dialog.Portal>
                <Dialog.Overlay
                    className="fixed inset-0 z-100 bg-background/95 backdrop-blur-sm"
                    aria-label={t("ageVerification.overlay")}
                />
                <Dialog.Content
                    className="fixed inset-0 z-100 flex items-center justify-center p-4"
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                    aria-describedby="age-verification-description"
                >
                    <div className="relative w-full max-w-lg overflow-hidden rounded-lg bg-background shadow-2xl ring-1 ring-border">
                        {/* Optional image */}
                        {ageVerificationImage && (
                            <div className="relative h-48 w-full">
                                <Image
                                    data={ageVerificationImage}
                                    sizes="(max-width: 512px) 100vw, 512px"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="flex flex-col items-center p-8 text-center">
                            {/* 18+ Badge */}
                            <div
                                className={cn(
                                    "mb-6 flex size-16 items-center justify-center rounded-full border-2 border-red-700 bg-red-500 font-bold text-2xl text-white",
                                )}
                                aria-hidden="true"
                            >
                                18+
                            </div>

                            {/* Hidden accessible title for Dialog */}
                            <VisuallyHidden.Root asChild>
                                <Dialog.Title>
                                    {t("ageVerification.accessibleTitle")}
                                </Dialog.Title>
                            </VisuallyHidden.Root>

                            {/* Visible heading */}
                            <Title
                                as="h2"
                                size="2xl"
                                className="mb-4 font-bold"
                            >
                                {ageVerificationHeading ||
                                    t("ageVerification.heading")}
                            </Title>

                            <p
                                id="age-verification-description"
                                className="mb-8 text-body-subtle"
                            >
                                {ageVerificationDescription ||
                                    t("ageVerification.description")}
                            </p>

                            {/* Action buttons */}
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
                                <Button
                                    type="button"
                                    onClick={handleConfirm}
                                    className="flex-1 py-4"
                                    id="age-verify-confirm"
                                >
                                    {ageVerificationConfirmText ||
                                        t("ageVerification.confirm")}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleDeny}
                                    variant="secondary"
                                    className="flex-1 py-4"
                                    id="age-verify-deny"
                                >
                                    {ageVerificationDenyText ||
                                        t("ageVerification.deny")}
                                </Button>
                            </div>

                            {/* Legal disclaimer */}
                            <p className="mt-6 text-body-subtle text-xs">
                                {t("ageVerification.disclaimer")}
                            </p>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
