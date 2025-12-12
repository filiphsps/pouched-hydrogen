/**
 * Shipping Estimate Weaverse Section.
 * Displays estimated delivery date range based on current day and configured
 * shipping times. Shows urgency messaging for same-day shipping cutoffs.
 */
import { ClockIcon, PackageIcon, TruckIcon } from "@phosphor-icons/react";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { cn } from "~/utils/cn";

interface ShippingEstimateProps extends HydrogenComponentProps {
    ref: React.Ref<HTMLDivElement>;
    /** Minimum shipping days */
    minDays: number;
    /** Maximum shipping days */
    maxDays: number;
    /** Same-day shipping cutoff hour (24h format) */
    cutoffHour: number;
    /** Free shipping threshold amount */
    freeShippingThreshold: number;
}

/**
 * Formats a date as a localized string (e.g., "Mon, Dec 16").
 */
function formatDate(date: Date, locale: string): string {
    return date.toLocaleDateString(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

/**
 * Adds business days to a date, skipping weekends.
 */
function addBusinessDays(startDate: Date, days: number): Date {
    const result = new Date(startDate);
    let addedDays = 0;

    while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            addedDays++;
        }
    }

    return result;
}

/**
 * Calculates hours remaining until a cutoff time.
 */
function getHoursUntilCutoff(cutoffHour: number): number {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(cutoffHour, 0, 0, 0);

    if (now >= cutoff) {
        return 0;
    }

    return Math.ceil((cutoff.getTime() - now.getTime()) / (1000 * 60 * 60));
}

/**
 * Weaverse section for shipping estimate display.
 */
export default function ShippingEstimate(props: ShippingEstimateProps) {
    const {
        ref,
        minDays = 2,
        maxDays = 4,
        cutoffHour = 14,
        freeShippingThreshold = 75,
        ...rest
    } = props;
    const { t } = useTranslation();
    const loaderData = useLoaderData<typeof productRouteLoader>();

    const product = loaderData?.product;
    const selectedVariant = product?.selectedOrFirstAvailableVariant;
    const availableForSale = selectedVariant?.availableForSale;

    // Don't render if product is out of stock
    if (!availableForSale) {
        return null;
    }

    const now = new Date();
    const locale = "de-DE";
    const hoursUntilCutoff = getHoursUntilCutoff(cutoffHour);
    const ordersTodayShipToday = hoursUntilCutoff > 0;

    const shippingStartDate = ordersTodayShipToday
        ? now
        : addBusinessDays(now, 1);
    const minDeliveryDate = addBusinessDays(shippingStartDate, minDays);
    const maxDeliveryDate = addBusinessDays(shippingStartDate, maxDays);

    const minDateFormatted = formatDate(minDeliveryDate, locale);
    const maxDateFormatted = formatDate(maxDeliveryDate, locale);

    return (
        <div
            ref={ref}
            {...rest}
            className={cn(
                "flex flex-col gap-2 border-line border-y py-3 text-sm",
            )}
        >
            {/* Delivery estimate */}
            <div className="flex items-center gap-2">
                <TruckIcon
                    weight="fill"
                    className="size-5 shrink-0 text-green-600"
                    aria-hidden="true"
                />
                <span>
                    <span className="font-medium">
                        {t("product.shippingEstimate.estimatedDelivery")}:
                    </span>{" "}
                    {minDateFormatted} – {maxDateFormatted}
                </span>
            </div>

            {/* Same-day shipping urgency */}
            {ordersTodayShipToday && (
                <div className="flex items-center gap-2 text-amber-700">
                    <ClockIcon
                        weight="fill"
                        className="size-5 shrink-0"
                        aria-hidden="true"
                    />
                    <span>
                        {hoursUntilCutoff <= 2
                            ? t(
                                  "product.shippingEstimate.orderSoonShipsToday",
                                  {
                                      hours: hoursUntilCutoff,
                                  },
                              )
                            : t("product.shippingEstimate.orderByShipsToday", {
                                  hour: cutoffHour,
                              })}
                    </span>
                </div>
            )}

            {/* Free shipping note */}
            <div className="flex items-center gap-2 text-body-subtle">
                <PackageIcon
                    weight="fill"
                    className="size-5 shrink-0"
                    aria-hidden="true"
                />
                <span>
                    {t("product.shippingEstimate.freeShippingNote", {
                        amount: freeShippingThreshold,
                    })}
                </span>
            </div>
        </div>
    );
}

export const schema = createSchema({
    type: "mp--shipping-estimate",
    title: "Shipping estimate",
    limit: 1,
    enabledOn: {
        pages: ["PRODUCT"],
    },
    settings: [
        {
            group: "Shipping",
            inputs: [
                {
                    type: "range",
                    label: "Minimum delivery days",
                    name: "minDays",
                    defaultValue: 2,
                    configs: {
                        min: 1,
                        max: 14,
                        step: 1,
                        unit: "days",
                    },
                },
                {
                    type: "range",
                    label: "Maximum delivery days",
                    name: "maxDays",
                    defaultValue: 4,
                    configs: {
                        min: 1,
                        max: 14,
                        step: 1,
                        unit: "days",
                    },
                },
                {
                    type: "range",
                    label: "Same-day shipping cutoff",
                    name: "cutoffHour",
                    defaultValue: 14,
                    configs: {
                        min: 8,
                        max: 20,
                        step: 1,
                        unit: ":00",
                    },
                    helpText:
                        "Orders placed before this hour can ship the same day",
                },
                {
                    type: "range",
                    label: "Free shipping threshold",
                    name: "freeShippingThreshold",
                    defaultValue: 75,
                    configs: {
                        min: 0,
                        max: 200,
                        step: 5,
                        unit: "€",
                    },
                },
            ],
        },
    ],
});
