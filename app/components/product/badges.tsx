import { useMoney } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { useThemeSettings } from "@weaverse/hydrogen";
import { colord } from "colord";
import { useTranslation } from "react-i18next";
import type {
    ProductQuery,
    ProductVariantFragment,
} from "storefront-api.generated";
import { cn } from "~/utils/cn";

function Badge({
    text,
    backgroundColor,
    className,
}: {
    text: string;
    backgroundColor: string;
    className?: string;
}) {
    const {
        colorText,
        colorTextInverse,
        badgeBorderRadius,
        badgeTextTransform,
    } = useThemeSettings();
    return (
        <span
            style={{
                "--bg-color": backgroundColor,
                color: colord(backgroundColor).isDark()
                    ? colorTextInverse
                    : colorText,
                borderRadius: `${badgeBorderRadius}px`,
                textTransform: badgeTextTransform,
            }}
            className={cn(
                "pointer-events-none select-none bg-(--bg-color) px-2.5 py-1 font-medium text-[11px] uppercase tracking-wide transition-colors duration-200",
                className,
            )}
        >
            {text}
        </span>
    );
}

export function NewBadge({
    publishedAt,
    className,
}: {
    publishedAt: string;
    className?: string;
}) {
    const { t } = useTranslation();
    const { newBadgeDaysOld, colorBackground } = useThemeSettings();

    if (isNewArrival(publishedAt, newBadgeDaysOld)) {
        return (
            <Badge
                text={t("product.new")}
                backgroundColor={colorBackground}
                className={cn("new-badge", className)}
            />
        );
    }
    return null;
}

export function BestSellerBadge({ className }: { className?: string }) {
    const { bestSellerBadgeText, bestSellerBadgeColor } = useThemeSettings();
    return (
        <Badge
            text={bestSellerBadgeText}
            backgroundColor={bestSellerBadgeColor}
            className={cn("best-seller-badge", className)}
        />
    );
}

export function SoldOutBadge({ className }: { className?: string }) {
    const { soldOutBadgeText, soldOutBadgeColor } = useThemeSettings();
    return (
        <Badge
            text={soldOutBadgeText}
            backgroundColor={soldOutBadgeColor}
            className={cn("sold-out-badge", className)}
        />
    );
}

export function BundleBadge({ className }: { className?: string }) {
    const { bundleBadgeText, bundleBadgeColor } = useThemeSettings();
    return (
        <Badge
            text={bundleBadgeText}
            backgroundColor={bundleBadgeColor}
            className={cn("bundle-badge", className)}
        />
    );
}

export function SaleBadge({
    price,
    compareAtPrice,
    className,
}: {
    price: MoneyV2;
    compareAtPrice: MoneyV2;
    className?: string;
}) {
    const { saleBadgeText = "Sale", saleBadgeColor } = useThemeSettings();
    const { amount, percentage } = calculateDiscount(price, compareAtPrice);
    const discountAmount = useMoney({
        amount,
        currencyCode: price.currencyCode,
    });
    const text = saleBadgeText
        .replace("[amount]", discountAmount.withoutTrailingZeros)
        .replace("[percentage]", percentage);

    if (percentage !== "0") {
        return (
            <Badge
                text={text}
                backgroundColor={saleBadgeColor}
                className={cn("sale-badge", className)}
            />
        );
    }
    return null;
}

/**
 * Low Stock Badge.
 * Displays urgency message when inventory is running low.
 * Shows "Only X left" or "Low stock" based on threshold settings.
 */
export function LowStockBadge({
    quantityAvailable,
    className,
}: {
    quantityAvailable: number | null | undefined;
    className?: string;
}) {
    const { t } = useTranslation();
    const {
        lowStockBadgeEnabled = true,
        lowStockThreshold = 10,
        lowStockBadgeColor = "#FEF3C7", // amber-100
    } = useThemeSettings();

    // Don't show if disabled or no quantity info
    if (
        !lowStockBadgeEnabled ||
        quantityAvailable === null ||
        quantityAvailable === undefined
    ) {
        return null;
    }

    // Don't show if sold out (SoldOutBadge handles that)
    if (quantityAvailable <= 0) {
        return null;
    }

    // Only show if below threshold
    if (quantityAvailable > lowStockThreshold) {
        return null;
    }

    // Show specific quantity for very low stock (1-3 items)
    const text =
        quantityAvailable <= 3
            ? t("product.onlyXLeft", { count: quantityAvailable })
            : t("product.lowStock");

    return (
        <Badge
            text={text}
            backgroundColor={lowStockBadgeColor}
            className={cn("low-stock-badge", className)}
        />
    );
}

function calculateDiscount(price: MoneyV2, compareAtPrice: MoneyV2) {
    if (price?.amount && compareAtPrice?.amount) {
        const priceNumber = Number(price.amount);
        const compareAtPriceNumber = Number(compareAtPrice.amount);
        if (compareAtPriceNumber > priceNumber) {
            return {
                amount: String(compareAtPriceNumber - priceNumber),
                percentage: Math.round(
                    ((compareAtPriceNumber - priceNumber) /
                        compareAtPriceNumber) *
                        100,
                ).toString(),
            };
        }
    }
    return { amount: "0", percentage: "0" };
}

function isNewArrival(date: string, daysOld = 30) {
    return (
        new Date(date).valueOf() >
        new Date().setDate(new Date().getDate() - daysOld).valueOf()
    );
}

export function ProductBadges({
    product,
    selectedVariant,
    className = "",
    as: Component = "div",
}: {
    product: NonNullable<ProductQuery["product"]>;
    selectedVariant: ProductVariantFragment | null;
    className?: string;
    as?: React.ElementType;
}) {
    if (!(product && selectedVariant)) {
        return null;
    }

    const isBundle = Boolean(product?.isBundle?.requiresComponents);
    const { publishedAt, badges } = product;
    const isBestSellerProduct = badges
        .filter(Boolean)
        .some(({ key, value }) => key === "best_seller" && value === "true");

    const isFragment = Component.toString() === "Symbol(react.fragment)";
    const componentProps = isFragment
        ? {}
        : {
              className: cn(
                  "flex items-center gap-2 text-sm empty:hidden",
                  className,
              ),
          };

    return (
        <Component {...componentProps}>
            {selectedVariant.availableForSale ? (
                <>
                    {isBundle && <BundleBadge />}
                    <SaleBadge
                        price={selectedVariant.price as MoneyV2}
                        compareAtPrice={
                            selectedVariant.compareAtPrice as MoneyV2
                        }
                    />
                    <LowStockBadge
                        quantityAvailable={selectedVariant.quantityAvailable}
                    />
                    <NewBadge
                        publishedAt={publishedAt}
                        className="bg-gray-100"
                    />
                    {isBestSellerProduct && <BestSellerBadge />}
                </>
            ) : (
                <SoldOutBadge />
            )}
        </Component>
    );
}
