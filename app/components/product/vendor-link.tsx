/**
 * VendorLink Component.
 * Renders a vendor name as a link with a pre-resolved destination URL.
 * The URL is determined server-side by the product loader.
 *
 * @example
 * ```tsx
 * <VendorLink vendor="Ace" href={vendorCollectionUrl} />
 * ```
 */
import { Link } from "react-router";
import { cn } from "~/utils/cn";

export interface VendorLinkProps {
    /** The vendor name to display */
    vendor: string;
    /** Pre-resolved URL from loader (collection or filtered products) */
    href: string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * VendorLink component with server-resolved destination.
 *
 * @param props - Component props
 * @returns A linked vendor name
 */
export function VendorLink({ vendor, href, className }: VendorLinkProps) {
    if (!vendor || !href) {
        return null;
    }

    return (
        <Link
            to={href}
            className={cn(
                "text-body-subtle transition-colors hover:text-body",
                className,
            )}
            prefetch="intent"
        >
            {vendor}
        </Link>
    );
}
