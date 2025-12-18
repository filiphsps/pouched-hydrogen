import { Link } from "~/components/link";
import {
    VendorBadge,
    type VendorBadgeSize,
} from "~/components/product/vendor-badge";
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
 * Product card info section with vendor, title, and optional rating.
 * Clean Scandinavian-inspired typography with refined hierarchy.
 * Title and vendor always maintain consistent positioning.
 *
 * @param props - Component props
 * @returns Info section with vendor, title, and optional rating
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
        sm: "text-[13px] leading-tight",
        md: "text-sm leading-tight",
        lg: "text-base leading-tight",
    };

    /** Map CardInfo size to VendorBadge size */
    const vendorSizeMap: Record<string, VendorBadgeSize> = {
        sm: "xs",
        md: "sm",
        lg: "md",
    };

    return (
        <div className={cn("space-y-0.5", className)}>
            {/* Vendor/Brand - subtle, uppercase treatment */}
            {showVendor && vendor && (
                <VendorBadge
                    vendor={vendor}
                    size={vendorSizeMap[size]}
                    withSchema
                />
            )}

            {/* Product Title - medium weight, clean lines */}
            <Link to={productUrl} prefetch="intent" className="block">
                <h3
                    className={cn(
                        "line-clamp-2 font-medium text-gray-800 tracking-tight transition-colors duration-200 group-hover:text-gray-950",
                        titleSizeClasses[size],
                    )}
                    itemProp="name"
                >
                    {displayTitle}
                </h3>
            </Link>

            {/* Rating - compact inline display */}
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
