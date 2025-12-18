/**
 * Cookie Settings Popup Component.
 * Allows users to manage cookie preferences after initial consent.
 * Can be placed in the footer or other areas of the site.
 *
 * @example
 * ```tsx
 * <CookieSettingsPopup />
 * ```
 */

import { CheckIcon, CookieIcon, XIcon } from "@phosphor-icons/react";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Dialog from "@radix-ui/react-dialog";
import { useThemeSettings } from "@weaverse/hydrogen";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/button";
import { Title } from "~/components/title";
import { useCookieConsent } from "~/hooks/use-cookie-consent";
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
 * Props for CookieSettingsPopup component.
 */
export interface CookieSettingsPopupProps {
    /** Custom trigger element. If not provided, renders a default link. */
    trigger?: React.ReactNode;
    /** Additional class name for the trigger */
    className?: string;
}

/**
 * Cookie Settings Popup.
 * Renders a trigger (button/link) that opens a dialog for managing cookie preferences.
 * Users can modify their cookie settings even after initial consent.
 */
export function CookieSettingsPopup({
    trigger,
    className,
}: CookieSettingsPopupProps) {
    const { t } = useTranslation();
    const { consent, updateConsent, rejectAll } = useCookieConsent();
    const { cookieConsentEnabled = true } = useThemeSettings();

    // Dialog open state
    const [isOpen, setIsOpen] = useState(false);

    // Local state for preferences editing
    const [localConsent, setLocalConsent] = useState<ConsentState>(consent);

    // Don't render if cookie consent is disabled
    if (!cookieConsentEnabled) {
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
        setIsOpen(false);
    };

    /**
     * Handle reject all and close dialog.
     */
    const handleRejectAll = () => {
        rejectAll();
        setIsOpen(false);
    };

    /**
     * Reset local consent when opening dialog.
     */
    const handleOpenChange = (open: boolean) => {
        if (open) {
            setLocalConsent(consent);
        }
        setIsOpen(open);
    };

    const defaultTrigger = (
        <button
            type="button"
            className={cn(
                "inline-flex items-center gap-1.5 text-inherit text-sm transition-opacity hover:opacity-70",
                className,
            )}
        >
            <CookieIcon className="h-4 w-4" aria-hidden="true" />
            {t("cookieConsent.settingsLink")}
        </button>
    );

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Dialog.Trigger asChild>{trigger || defaultTrigger}</Dialog.Trigger>
            <AnimatePresence>
                {isOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm"
                            />
                        </Dialog.Overlay>
                        <Dialog.Content
                            className={cn(
                                "-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-100 w-full max-w-lg p-4",
                                "focus:outline-none",
                            )}
                            asChild
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
                            >
                                <div className="relative overflow-hidden rounded-lg bg-background shadow-2xl ring-1 ring-border">
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-border border-b p-4">
                                        <Dialog.Title asChild>
                                            <Title
                                                as="h2"
                                                size="lg"
                                                className="font-semibold"
                                            >
                                                {t(
                                                    "cookieConsent.preferencesTitle",
                                                )}
                                            </Title>
                                        </Dialog.Title>
                                        <Dialog.Close asChild>
                                            <button
                                                type="button"
                                                className="rounded-full p-1 text-body-subtle transition-colors hover:bg-muted hover:text-body"
                                                aria-label={t(
                                                    "cookieConsent.close",
                                                )}
                                            >
                                                <XIcon className="h-5 w-5" />
                                            </button>
                                        </Dialog.Close>
                                    </div>

                                    {/* Content */}
                                    <div className="max-h-[60vh] overflow-y-auto p-4">
                                        <Dialog.Description className="mb-6 text-body-subtle text-sm">
                                            {t(
                                                "cookieConsent.preferencesDescription",
                                            )}
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
                                                    {t(
                                                        "cookieConsent.required",
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Optional Cookie Categories */}
                                        <div className="space-y-3">
                                            {COOKIE_CATEGORIES.map(
                                                (category) => (
                                                    <div
                                                        key={category.id}
                                                        className="rounded-lg border border-border p-4"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <label
                                                                    htmlFor={`cookie-settings-${category.id}`}
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
                                                                id={`cookie-settings-${category.id}`}
                                                                checked={
                                                                    localConsent[
                                                                        category
                                                                            .id
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
                                                                        category
                                                                            .id
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
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex flex-col gap-2 border-border border-t p-4 sm:flex-row sm:justify-end">
                                        <Button
                                            variant="secondary"
                                            onClick={handleRejectAll}
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
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
