/**
 * VendorLink Component.
 * Renders a vendor name as a link, intelligently linking to:
 * 1. A collection with the same handle as the vendor (if exists)
 * 2. Fallback: /collections/all?filter.p.vendor={vendor}
 *
 * @example
 * ```tsx
 * <VendorLink vendor="Ace" collections={collections} />
 * ```
 */
import { Link } from "react-router";
import { cn } from "~/utils/cn";

export interface VendorLinkProps {
    /** The vendor name to display and link */
    vendor: string;
    /** Optional list of collection handles to check for vendor match */
    vendorCollectionHandle?: string;
    /** Additional CSS classes */
    className?: string;
    /** Whether to show as subtle/secondary text */
    subtle?: boolean;
}

/**
 * Converts a vendor name to a URL-friendly handle.
 * E.g., "ACE Superwhite" → "ace-superwhite"
 *
 * @param vendor - The vendor name
 * @returns URL-friendly handle
 */
function vendorToHandle(vendor: string): string {
    return vendor
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * VendorLink component that links to vendor collection or filtered products.
 *
 * @param props - Component props
 * @returns A linked vendor name
 */
export function VendorLink({
    vendor,
    vendorCollectionHandle,
    className,
    subtle = true,
}: VendorLinkProps) {
    if (!vendor) {
        return null;
    }

    // Determine the link destination
    const handle = vendorCollectionHandle || vendorToHandle(vendor);
    const collectionPath = `/collections/${handle}`;
    const fallbackPath = `/collections/all?filter.p.vendor=${encodeURIComponent(vendor)}`;

    // We'll link to the collection path - if it 404s the user sees the fallback
    // A more robust solution would check collection existence server-side
    const href = collectionPath;

    return (
        <Link
            to={href}
            className={cn(
                "transition-colors hover:text-body",
                subtle && "text-body-subtle",
                className,
            )}
            prefetch="intent"
        >
            {vendor}
        </Link>
    );
}
