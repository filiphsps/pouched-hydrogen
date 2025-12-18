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
 * Premium typography with refined hierarchy and hover effects.
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
        sm: "text-[13px] leading-snug",
        md: "text-[15px] leading-snug",
        lg: "text-base leading-snug",
    };

    const vendorSizeClasses = {
        sm: "text-[10px]",
        md: "text-[11px]",
        lg: "text-xs",
    };

    return (
        <div className={cn("space-y-1", className)}>
            {/* Vendor/Brand - refined and elegant */}
            {showVendor && vendor && (
                <span
                    className={cn(
                        "block font-semibold text-gray-400 uppercase tracking-widest",
                        vendorSizeClasses[size],
                    )}
                    itemProp="brand"
                >
                    {vendor}
                </span>
            )}

            {/* Product Title - bold and clear with subtle hover */}
            <Link to={productUrl} prefetch="intent" className="block">
                <h3
                    className={cn(
                        "line-clamp-2 font-semibold text-gray-900 tracking-tight transition-colors duration-200 group-hover:text-gray-600",
                        titleSizeClasses[size],
                    )}
                    itemProp="name"
                >
                    {displayTitle}
                </h3>
            </Link>

            {/* Rating - with subtle styling */}
            {showRating && (
                <div className="pt-0.5">
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
