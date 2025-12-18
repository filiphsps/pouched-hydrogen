/**
 * Cookie Consent Banner Component (GDPR/DSGVO Compliant).
 * Displays a consent banner allowing users to manage cookie preferences.
 * Integrates with Google Consent Mode v2 for proper analytics tracking.
 *
 * @example
 * ```tsx
 * <CookieConsentBanner />
 * ```
 */

import { CheckIcon, CookieIcon, XIcon } from "@phosphor-icons/react";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Dialog from "@radix-ui/react-dialog";
import { useThemeSettings } from "@weaverse/hydrogen";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouteLoaderData } from "react-router";
import { Button } from "~/components/button";
import { Title } from "~/components/title";
import { useCookieConsent } from "~/hooks/use-cookie-consent";
import type { RootLoader } from "~/root";
import { cn } from "~/utils/cn";
import type { ConsentState } from "~/utils/consent-mode";

/**
 * Cookie category configuration for preferences panel.
 */
interface CookieCategory {
    id: keyof ConsentState;
    translationKey: string;
    required?: boolean;
}

const COOKIE_CATEGORIES: CookieCategory[] = [
    {
        id: "functional",
        translationKey: "functional",
        required: false,
    },
    {
        id: "analytics",
        translationKey: "analytics",
        required: false,
    },
    {
        id: "marketing",
        translationKey: "marketing",
        required: false,
    },
];

/**
 * Cookie Consent Banner.
 * Displays a bottom banner for cookie consent with options to:
 * - Accept all cookies
 * - Reject all (only essential)
 * - Manage preferences (granular control)
 *
 * Configurable via Weaverse theme settings.
 */
export function CookieConsentBanner() {
    const { t } = useTranslation();
    const {
        consent,
        hasConsented,
        isLoading,
        isPreferencesOpen,
        acceptAll,
        rejectAll,
        updateConsent,
        openPreferences,
        closePreferences,
    } = useCookieConsent();
    const rootData = useRouteLoaderData<RootLoader>("root");

    // Get theme settings
    const { cookieConsentEnabled = true } = useThemeSettings();

    // Local state for preferences editing
    const [localConsent, setLocalConsent] = useState<ConsentState>(consent);

    // Don't render if disabled, already consented, still loading, or bot (SEO)
    if (!cookieConsentEnabled || hasConsented || isLoading || rootData?.isBot) {
        return null;
    }

    /**
     * Handle preference toggle for a specific category.
     */
    const handleToggle = (category: keyof ConsentState) => {
        setLocalConsent((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    /**
     * Save custom preferences.
     */
    const handleSavePreferences = () => {
        updateConsent(localConsent);
    };

    /**
     * Reset local consent when opening preferences.
     */
    const handleOpenPreferences = () => {
        setLocalConsent(consent);
        openPreferences();
    };

    return (
        <>
            {/* Main Banner */}
            <AnimatePresence>
                {!isPreferencesOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="fixed right-0 bottom-0 left-0 z-50 border-border border-t bg-background p-4 shadow-lg md:p-6"
                        role="dialog"
                        aria-labelledby="cookie-banner-title"
                        aria-describedby="cookie-banner-description"
                    >
                        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            {/* Content */}
                            <div className="flex items-start gap-3 md:flex-1">
                                <CookieIcon
                                    className="mt-0.5 h-6 w-6 shrink-0 text-body-subtle"
                                    aria-hidden="true"
                                />
                                <div>
                                    <Title
                                        id="cookie-banner-title"
                                        as="h2"
                                        size="base"
                                        className="mb-1 font-semibold"
                                    >
                                        {t("cookieConsent.title")}
                                    </Title>
                                    <p
                                        id="cookie-banner-description"
                                        className="text-body-subtle text-sm"
                                    >
                                        {t("cookieConsent.description")}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:shrink-0">
                                <Button
                                    variant="outline"
                                    onClick={handleOpenPreferences}
                                    className="order-3 w-full px-4 py-2 text-sm sm:order-1 sm:w-auto"
                                >
                                    {t("cookieConsent.managePreferences")}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={rejectAll}
                                    className="order-2 w-full px-4 py-2 text-sm sm:w-auto"
                                >
                                    {t("cookieConsent.rejectAll")}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={acceptAll}
                                    className="order-1 w-full px-4 py-2 text-sm sm:order-3 sm:w-auto"
                                >
                                    {t("cookieConsent.acceptAll")}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preferences Dialog */}
            <Dialog.Root
                open={isPreferencesOpen}
                onOpenChange={closePreferences}
            >
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm" />
                    <Dialog.Content
                        className={cn(
                            "-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-100 w-full max-w-lg p-4",
                            "focus:outline-none",
                        )}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            className="relative overflow-hidden rounded-lg bg-background shadow-2xl ring-1 ring-border"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-border border-b p-4">
                                <Dialog.Title asChild>
                                    <Title
                                        as="h2"
                                        size="lg"
                                        className="font-semibold"
                                    >
                                        {t("cookieConsent.preferencesTitle")}
                                    </Title>
                                </Dialog.Title>
                                <Dialog.Close asChild>
                                    <button
                                        type="button"
                                        className="rounded-full p-1 text-body-subtle transition-colors hover:bg-muted hover:text-body"
                                        aria-label={t("cookieConsent.close")}
                                    >
                                        <XIcon className="h-5 w-5" />
                                    </button>
                                </Dialog.Close>
                            </div>

                            {/* Content */}
                            <div className="max-h-[60vh] overflow-y-auto p-4">
                                <Dialog.Description className="mb-6 text-body-subtle text-sm">
                                    {t("cookieConsent.preferencesDescription")}
                                </Dialog.Description>

                                {/* Essential Cookies (Always On) */}
                                <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-body text-sm">
                                                {t(
                                                    "cookieConsent.categories.essential.title",
                                                )}
                                            </h3>
                                            <p className="mt-1 text-body-subtle text-xs">
                                                {t(
                                                    "cookieConsent.categories.essential.description",
                                                )}
                                            </p>
                                        </div>
                                        <span className="ml-4 shrink-0 rounded-full bg-primary px-2 py-0.5 font-medium text-primary-foreground text-xs">
                                            {t("cookieConsent.required")}
                                        </span>
                                    </div>
                                </div>

                                {/* Optional Cookie Categories */}
                                <div className="space-y-3">
                                    {COOKIE_CATEGORIES.map((category) => (
                                        <div
                                            key={category.id}
                                            className="rounded-lg border border-border p-4"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <label
                                                        htmlFor={`cookie-${category.id}`}
                                                        className="cursor-pointer font-medium text-body text-sm"
                                                    >
                                                        {t(
                                                            `cookieConsent.categories.${category.translationKey}.title`,
                                                        )}
                                                    </label>
                                                    <p className="mt-1 text-body-subtle text-xs">
                                                        {t(
                                                            `cookieConsent.categories.${category.translationKey}.description`,
                                                        )}
                                                    </p>
                                                </div>
                                                <Checkbox.Root
                                                    id={`cookie-${category.id}`}
                                                    checked={
                                                        localConsent[
                                                            category.id
                                                        ]
                                                    }
                                                    onCheckedChange={() =>
                                                        handleToggle(
                                                            category.id,
                                                        )
                                                    }
                                                    className={cn(
                                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                                                        localConsent[
                                                            category.id
                                                        ]
                                                            ? "border-primary bg-primary"
                                                            : "border-border bg-background",
                                                    )}
                                                >
                                                    <Checkbox.Indicator>
                                                        <CheckIcon className="h-3 w-3 text-primary-foreground" />
                                                    </Checkbox.Indicator>
                                                </Checkbox.Root>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col gap-2 border-border border-t p-4 sm:flex-row sm:justify-end">
                                <Button
                                    variant="secondary"
                                    onClick={rejectAll}
                                    className="w-full px-4 py-2 text-sm sm:w-auto"
                                >
                                    {t("cookieConsent.rejectAll")}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSavePreferences}
                                    className="w-full px-4 py-2 text-sm sm:w-auto"
                                >
                                    {t("cookieConsent.savePreferences")}
                                </Button>
                            </div>
                        </motion.div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}
