import { cn } from "~/utils/cn";

/**
 * Size variants for the VendorBadge component.
 */
export type VendorBadgeSize = "xs" | "sm" | "md" | "lg";

/**
 * Props for the VendorBadge component.
 */
export interface VendorBadgeProps {
    /** The vendor/brand name to display */
    vendor: string;
    /** Size variant for the text */
    size?: VendorBadgeSize;
    /** Whether to render as a block element (default) or inline */
    inline?: boolean;
    /** Whether to include Schema.org brand markup */
    withSchema?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/** Size classes for each variant */
const SIZE_CLASSES: Record<VendorBadgeSize, string> = {
    xs: "text-[9px]",
    sm: "text-[10px]",
    md: "text-[11px]",
    lg: "text-xs",
};

/**
 * A reusable vendor/brand badge component with premium styling.
 * Displays the vendor name in uppercase with elegant tracking.
 *
 * @example
 * // Block display (default)
 * <VendorBadge vendor="VELO" size="md" />
 *
 * @example
 * // Inline display for use with titles
 * <VendorBadge vendor="ZYN" size="sm" inline />
 *
 * @param props - Component props
 * @returns Styled vendor badge element
 */
export function VendorBadge({
    vendor,
    size = "md",
    inline = false,
    withSchema = false,
    className,
}: VendorBadgeProps) {
    if (!vendor) {
        return null;
    }

    return (
        <span
            className={cn(
                "font-semibold text-gray-400 uppercase tracking-widest",
                inline ? "inline-block" : "block",
                SIZE_CLASSES[size],
                className,
            )}
            itemProp={withSchema ? "brand" : undefined}
        >
            {vendor}
        </span>
    );
}
