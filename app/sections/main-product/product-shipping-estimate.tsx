/**
 * Shipping Estimate Weaverse Section.
 * Displays dynamic delivery date range based on user location and German public holidays.
 *
 * Features:
 * - Location-based shipping zones with different delivery times
 * - German public holiday awareness using date-holidays package
 * - Same-day shipping cutoff urgency messaging
 * - Holiday notices when holidays affect delivery
 *
 * Uses centralized theme settings (schema.server.ts) for base configuration,
 * but dynamically adjusts based on the user's selected locale/country.
 */
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    PackageIcon,
    TruckIcon,
} from "@phosphor-icons/react";
import {
    createSchema,
    type HydrogenComponentProps,
    useThemeSettings,
} from "@weaverse/hydrogen";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData, useRouteLoaderData } from "react-router";
import { formatCurrency } from "~/components/cart/free-shipping-progress";
import type { RootLoader } from "~/root";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { cn } from "~/utils/cn";
import { DEFAULT_LOCALE } from "~/utils/const";
import { formatShortDate } from "~/utils/date";
import {
    calculateDeliveryEstimate,
    getUpcomingHolidays,
} from "~/utils/shipping";
import { filterDOMProps } from "~/utils/weaverse";

interface ShippingEstimateProps extends HydrogenComponentProps {
    ref: React.Ref<HTMLDivElement>;
}

/**
 * Weaverse section for shipping estimate display.
 * Provides dynamic, location-aware delivery estimates.
 */
export default function ShippingEstimate(props: ShippingEstimateProps) {
    const { ref, ...rest } = props;
    const domProps = filterDOMProps(rest);
    const { t } = useTranslation();
    const loaderData = useLoaderData<typeof productRouteLoader>();
    const rootData = useRouteLoaderData<RootLoader>("root");
    const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;

    // Read from centralized theme settings (same as cart drawer)
    const {
        shippingEstimateEnabled = true,
        shippingEstimateMinDays,
        shippingEstimateMaxDays,
        shippingCutoffHour = 14,
        freeShippingThreshold = 75,
    } = useThemeSettings();

    const product = loaderData?.product;
    const selectedVariant = product?.selectedOrFirstAvailableVariant;
    const availableForSale = selectedVariant?.availableForSale;

    // Calculate locale string for date formatting
    const locale = `${selectedLocale.language}-${selectedLocale.country}`;
    const destinationCountry = selectedLocale.country;

    // Get shipping zones from root loader (fetched from Admin API or defaults)
    const shippingZones = rootData?.shippingZones;

    // Calculate delivery estimate based on location
    const deliveryEstimate = useMemo(
        () =>
            calculateDeliveryEstimate({
                countryCode: destinationCountry,
                originCountry: "DE", // Always shipping from Germany
                cutoffHour: shippingCutoffHour,
                // Use theme setting overrides if provided
                minDaysOverride: shippingEstimateMinDays,
                maxDaysOverride: shippingEstimateMaxDays,
                // Use zones from root loader (from Admin API or defaults)
                shippingZones,
            }),
        [
            destinationCountry,
            shippingCutoffHour,
            shippingEstimateMinDays,
            shippingEstimateMaxDays,
            shippingZones,
        ],
    );

    // Get upcoming holidays that might affect delivery
    const upcomingHolidays = useMemo(() => getUpcomingHolidays("DE", 7), []);

    // Don't render if disabled or product is out of stock
    if (!shippingEstimateEnabled || !availableForSale) {
        return null;
    }

    const { minDate, maxDate, zone, canShipToday, hoursUntilCutoff } =
        deliveryEstimate;

    const minDateFormatted = formatShortDate(minDate, locale);
    const maxDateFormatted = formatShortDate(maxDate, locale);

    // Get currency from product variant price
    const currencyCode = selectedVariant?.price?.currencyCode || "EUR";

    // Check if we're shipping internationally (not to Germany)
    const isInternational = destinationCountry !== "DE";

    // Get the next holiday if within delivery window
    const nextHoliday =
        upcomingHolidays.length > 0 ? upcomingHolidays[0] : null;

    return (
        <div
            ref={ref}
            {...domProps}
            className={cn(
                "flex flex-col gap-2 border-line border-y py-3 text-sm",
                domProps.className,
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

            {/* International shipping zone indicator */}
            {isInternational && (
                <div className="flex items-center gap-2 text-body-subtle">
                    <MapPinIcon
                        weight="fill"
                        className="size-5 shrink-0"
                        aria-hidden="true"
                    />
                    <span>
                        {t("product.shippingEstimate.shippingTo", {
                            zone: zone.name,
                            defaultValue: `Shipping to ${zone.name}`,
                        })}
                    </span>
                </div>
            )}

            {/* Same-day shipping urgency */}
            {canShipToday && (
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
                                  hour: shippingCutoffHour,
                              })}
                    </span>
                </div>
            )}

            {/* Holiday notice */}
            {nextHoliday && (
                <div className="flex items-center gap-2 text-body-subtle">
                    <CalendarIcon
                        weight="fill"
                        className="size-5 shrink-0"
                        aria-hidden="true"
                    />
                    <span>
                        {t("product.shippingEstimate.holidayNotice", {
                            holiday: nextHoliday.name,
                            date: formatShortDate(nextHoliday.date, locale),
                            defaultValue: `Note: {{holiday}} on {{date}} may affect delivery`,
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
                        amount: formatCurrency(
                            freeShippingThreshold,
                            currencyCode,
                            locale,
                        ),
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
    // No settings needed - reads from centralized theme settings
    settings: [],
});
