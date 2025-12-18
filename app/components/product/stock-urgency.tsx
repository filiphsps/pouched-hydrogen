import { useThemeSettings } from "@weaverse/hydrogen";
import { cva, type VariantProps } from "class-variance-authority";
import { useTranslation } from "react-i18next";
import { cn } from "~/utils/cn";

/** Very low stock threshold for pulse animation */
const VERY_LOW_STOCK_THRESHOLD = 3;

/**
 * CVA variants for the stock urgency badge
 */
const stockUrgencyVariants = cva(
    "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
    {
        variants: {
            size: {
                sm: "px-2 py-0.5 text-xs",
                md: "px-2.5 py-1 text-sm",
                lg: "px-3 py-1.5 text-base",
            },
        },
        defaultVariants: {
            size: "md",
        },
    },
);

/**
 * Props for the StockUrgency component
 */
export interface StockUrgencyProps
    extends VariantProps<typeof stockUrgencyVariants> {
    /** The quantity available for the product/variant */
    quantityAvailable: number | null | undefined;
    /** Additional CSS class names */
    className?: string;
    /** Whether to show the warning icon */
    showIcon?: boolean;
}

/**
 * Warning icon for low stock indicator
 */
function WarningIcon({ className }: { className?: string }) {
    return (
        <svg
            data-testid="stock-urgency-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn("h-4 w-4", className)}
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
            />
        </svg>
    );
}

/**
 * StockUrgency displays a visual indicator when a product is low in stock.
 *
 * Features:
 * - Configurable threshold via Weaverse theme settings
 * - Different visual treatments for low stock vs very low stock
 * - Accessible with proper ARIA attributes
 * - i18n-ready with translation support
 *
 * @example
 * ```tsx
 * // Basic usage
 * <StockUrgency quantityAvailable={variant.quantityAvailable} />
 *
 * // With size variant
 * <StockUrgency quantityAvailable={5} size="sm" />
 *
 * // On product card (compact)
 * <StockUrgency quantityAvailable={3} size="sm" showIcon={false} />
 * ```
 */
export function StockUrgency({
    quantityAvailable,
    size,
    className,
    showIcon = true,
}: StockUrgencyProps) {
    const { t } = useTranslation("common");
    const settings = useThemeSettings();

    const {
        lowStockBadgeEnabled = true,
        lowStockThreshold = 10,
        lowStockBadgeColor = "#FEF3C7",
    } = settings;

    // Don't render if disabled or no quantity data
    if (!lowStockBadgeEnabled || quantityAvailable == null) {
        return null;
    }

    // Don't render for untracked inventory (Shopify returns -1)
    if (quantityAvailable < 0) {
        return null;
    }

    // Don't render if stock is adequate
    if (quantityAvailable > lowStockThreshold) {
        return null;
    }

    const isVeryLowStock = quantityAvailable <= VERY_LOW_STOCK_THRESHOLD;

    // Use i18next pluralization - the key changes based on count
    const stockText = t("product.onlyXLeft", { count: quantityAvailable });

    return (
        <output
            aria-live="polite"
            className={cn(
                stockUrgencyVariants({ size }),
                isVeryLowStock && "animate-pulse",
                className,
            )}
            style={{
                backgroundColor: lowStockBadgeColor,
                color: isVeryLowStock ? "#B45309" : "#92400E",
            }}
        >
            {showIcon && <WarningIcon />}
            <span>{stockText}</span>
        </output>
    );
}
