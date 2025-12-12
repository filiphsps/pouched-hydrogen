/**
 * Free Shipping Progress Bar Component.
 * Displays a visual progress indicator showing how close the customer is
 * to qualifying for free shipping based on cart subtotal.
 *
 * @example
 * ```tsx
 * <FreeShippingProgress cartCost={cart.cost} />
 * ```
 */
import { PackageIcon, TruckIcon } from "@phosphor-icons/react";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { useThemeSettings } from "@weaverse/hydrogen";
import { useTranslation } from "react-i18next";
import { cn } from "~/utils/cn";

export interface FreeShippingProgressProps {
    /** Cart cost containing the subtotal amount */
    cartCost: {
        subtotalAmount?: MoneyV2 | null;
    } | null;
    /** Optional additional CSS classes */
    className?: string;
}

/**
 * Calculates the progress percentage toward free shipping threshold.
 *
 * @param {number} currentAmount - Current cart subtotal
 * @param {number} threshold - Free shipping threshold
 * @returns {number} Progress percentage (0-100)
 */
function calculateProgress(currentAmount: number, threshold: number): number {
    if (threshold <= 0) return 100;
    const progress = (currentAmount / threshold) * 100;
    return Math.min(progress, 100);
}

/**
 * Formats a number as currency.
 *
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - ISO currency code (e.g., "EUR")
 * @param {string} locale - Locale string for formatting (e.g., "de-DE")
 * @returns {string} Formatted currency string
 */
export function formatCurrency(
    amount: number,
    currencyCode: string,
    locale: string,
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Free Shipping Progress Bar.
 * Shows customers how much more they need to spend for free shipping.
 * Celebrates when threshold is reached with a success state.
 */
export function FreeShippingProgress({
    cartCost,
    className,
}: FreeShippingProgressProps) {
    const { t } = useTranslation();
    const {
        freeShippingEnabled = true,
        freeShippingThreshold = 75,
        freeShippingCurrency = "EUR",
    } = useThemeSettings();

    // Don't render if disabled or no threshold
    if (!freeShippingEnabled || freeShippingThreshold <= 0) {
        return null;
    }

    const subtotal = cartCost?.subtotalAmount;
    const currentAmount = subtotal ? Number.parseFloat(subtotal.amount) : 0;
    const currencyCode = subtotal?.currencyCode || freeShippingCurrency;
    const progress = calculateProgress(currentAmount, freeShippingThreshold);
    const hasReachedThreshold = progress >= 100;
    const amountRemaining = Math.max(0, freeShippingThreshold - currentAmount);

    // Determine locale based on currency (simplified for DE market)
    const locale = currencyCode === "EUR" ? "de-DE" : "en-US";

    return (
        <output
            className={cn(
                "block rounded-lg border border-line-subtle bg-gray-50 p-4",
                className,
            )}
            aria-live="polite"
        >
            {/* Message */}
            <div className="mb-3 flex items-center gap-2">
                {hasReachedThreshold ? (
                    <>
                        <TruckIcon
                            weight="fill"
                            className="size-5 shrink-0 text-green-600"
                            aria-hidden="true"
                        />
                        <span className="font-medium text-green-700 text-sm">
                            {t("cart.freeShipping.success")}
                        </span>
                    </>
                ) : (
                    <>
                        <PackageIcon
                            weight="fill"
                            className="size-5 shrink-0 text-body-subtle"
                            aria-hidden="true"
                        />
                        <span className="text-body-subtle text-sm">
                            {t("cart.freeShipping.remaining", {
                                amount: formatCurrency(
                                    amountRemaining,
                                    currencyCode,
                                    locale,
                                ),
                            })}
                        </span>
                    </>
                )}
            </div>

            {/* Progress bar */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        hasReachedThreshold ? "bg-green-500" : "bg-body",
                    )}
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t("cart.freeShipping.progressLabel", {
                        progress: Math.round(progress),
                    })}
                />
            </div>

            {/* Threshold markers */}
            <div className="mt-2 flex items-center justify-between text-body-subtle text-xs">
                <span>{formatCurrency(0, currencyCode, locale)}</span>
                <span className="font-medium">
                    {formatCurrency(
                        freeShippingThreshold,
                        currencyCode,
                        locale,
                    )}
                </span>
            </div>
        </output>
    );
}
