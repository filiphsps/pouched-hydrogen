import { Link } from "~/components/link";
import JudgemeStarsRating from "~/sections/main-product/judgeme-stars-rating";
import { cn } from "~/utils/cn";
import { removeVendorFromTitle } from "~/utils/product";

/**
 * Props for the CardInfo component.
 */
export interface CardInfoProps {
    /** Product title */
    title: string;
    /** Product handle for linking */
    handle: string;
    /** Vendor/brand name */
    vendor?: string;
    /** Whether to show vendor */
    showVendor?: boolean;
    /** Whether to remove vendor from title */
    removeVendorFromTitle?: boolean;
    /** Whether to show rating */
    showRating?: boolean;
    /** URL params for variant selection */
    urlParams?: string;
    /** Size variant for text */
    size?: "sm" | "md" | "lg";
    /** Additional CSS classes */
    className?: string;
}

/**
 * Product card info section with title, vendor, and rating.
 * Includes Schema.org Product markup for SEO.
 *
 * @param props - Component props
 * @returns Info section with title, vendor, and optional extras
 */
export function CardInfo({
    title,
    handle,
    vendor,
    showVendor = true,
    removeVendorFromTitle: shouldRemoveVendor = false,
    showRating = true,
    urlParams = "",
    size = "md",
    className,
}: CardInfoProps) {
    const productUrl = `/products/${handle}${urlParams ? `?${urlParams}` : ""}`;
    const displayTitle = removeVendorFromTitle(
        title,
        vendor,
        shouldRemoveVendor,
    );

    const titleSizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg font-semibold",
    };

    return (
        <div className={cn("space-y-1", className)}>
            {/* Vendor/Brand */}
            {showVendor && vendor && (
                <span
                    className="block text-muted-foreground text-xs uppercase tracking-wide"
                    itemProp="brand"
                >
                    {vendor}
                </span>
            )}

            {/* Product Title */}
            <Link to={productUrl} prefetch="intent">
                <h3
                    className={cn(
                        "line-clamp-2 font-medium text-foreground leading-snug hover:underline",
                        titleSizeClasses[size],
                    )}
                    itemProp="name"
                >
                    {displayTitle}
                </h3>
            </Link>

            {/* Rating */}
            {showRating && (
                <JudgemeStarsRating
                    productHandle={handle}
                    ratingText="{{rating}} ({{total_reviews}} reviews)"
                    errorText=""
                />
            )}
        </div>
    );
}
