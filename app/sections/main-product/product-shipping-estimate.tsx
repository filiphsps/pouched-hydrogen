/**
 * Shipping Estimate Weaverse Section.
 * Displays estimated delivery date range based on current day and configured
 * shipping times from theme settings. Shows urgency messaging for same-day shipping cutoffs.
 *
 * Uses centralized theme settings (schema.server.ts) for shipping configuration,
 * ensuring consistency with cart drawer shipping estimates.
 */
import { ClockIcon, PackageIcon, TruckIcon } from "@phosphor-icons/react";
import {
    createSchema,
    type HydrogenComponentProps,
    useThemeSettings,
} from "@weaverse/hydrogen";
import { useTranslation } from "react-i18next";
import { useLoaderData, useRouteLoaderData } from "react-router";
import { formatCurrency } from "~/components/cart/free-shipping-progress";
import type { RootLoader } from "~/root";
import type { loader as productRouteLoader } from "~/routes/products/product";
import { cn } from "~/utils/cn";
import { DEFAULT_LOCALE } from "~/utils/const";
import {
    addBusinessDays,
    formatShortDate,
    getHoursUntilCutoff,
} from "~/utils/date";

interface ShippingEstimateProps extends HydrogenComponentProps {
    ref: React.Ref<HTMLDivElement>;
}

/**
 * Weaverse section for shipping estimate display.
 * Reads configuration from centralized theme settings.
 */
export default function ShippingEstimate(props: ShippingEstimateProps) {
    const { ref, ...rest } = props;
    const { t } = useTranslation();
    const loaderData = useLoaderData<typeof productRouteLoader>();
    const rootData = useRouteLoaderData<RootLoader>("root");
    const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;

    // Read from centralized theme settings (same as cart drawer)
    const {
        shippingEstimateEnabled = true,
        shippingEstimateMinDays = 2,
        shippingEstimateMaxDays = 4,
        shippingCutoffHour = 14,
        freeShippingThreshold = 75,
    } = useThemeSettings();

    const product = loaderData?.product;
    const selectedVariant = product?.selectedOrFirstAvailableVariant;
    const availableForSale = selectedVariant?.availableForSale;

    // Don't render if disabled or product is out of stock
    if (!shippingEstimateEnabled || !availableForSale) {
        return null;
    }

    const now = new Date();
    const locale = `${selectedLocale.language}-${selectedLocale.country}`;
    const hoursUntilCutoff = getHoursUntilCutoff(shippingCutoffHour);
    const ordersTodayShipToday = hoursUntilCutoff > 0;

    const shippingStartDate = ordersTodayShipToday
        ? now
        : addBusinessDays(now, 1);
    const minDeliveryDate = addBusinessDays(
        shippingStartDate,
        shippingEstimateMinDays,
    );
    const maxDeliveryDate = addBusinessDays(
        shippingStartDate,
        shippingEstimateMaxDays,
    );

    const minDateFormatted = formatShortDate(minDeliveryDate, locale);
    const maxDateFormatted = formatShortDate(maxDeliveryDate, locale);

    // Get currency from product variant price
    const currencyCode = selectedVariant?.price?.currencyCode || "EUR";

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
                                  hour: shippingCutoffHour,
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
