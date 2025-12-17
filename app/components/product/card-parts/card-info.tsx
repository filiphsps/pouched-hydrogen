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
 * Clean minimal design with clear typography hierarchy.
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
        sm: "text-sm leading-tight",
        md: "text-base leading-snug",
        lg: "text-lg leading-snug",
    };

    return (
        <div className={cn("space-y-0.5", className)}>
            {/* Vendor/Brand - subtle but readable */}
            {showVendor && vendor && (
                <span
                    className="block font-medium text-body-subtle text-xs uppercase tracking-wide"
                    itemProp="brand"
                >
                    {vendor}
                </span>
            )}

            {/* Product Title - prominent and clear */}
            <Link to={productUrl} prefetch="intent" className="block">
                <h3
                    className={cn(
                        "line-clamp-2 font-semibold text-foreground transition-colors duration-200 group-hover:text-foreground/70",
                        titleSizeClasses[size],
                    )}
                    itemProp="name"
                >
                    {displayTitle}
                </h3>
            </Link>

            {/* Rating */}
            {showRating && (
                <div className="pt-1">
                    <JudgemeStarsRating
                        productHandle={handle}
                        ratingText="{{rating}} ({{total_reviews}})"
                        errorText=""
                    />
                </div>
            )}
        </div>
    );
}
