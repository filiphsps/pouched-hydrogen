import { useThemeSettings } from "@weaverse/hydrogen";
import type { ProductCardFragment } from "storefront-api.generated";
import { cn } from "~/utils/cn";

/**
 * Props for the AttributePills component.
 */
interface AttributePillsProps {
    /** The product data containing custom metafields. */
    product: ProductCardFragment;
    /** Additional CSS class names for styling. */
    className?: string;
}

/**
 * Helper function to find a metafield value by key from the customMetafields array.
 *
 * @param metafields - Array of metafields from the product
 * @param key - The metafield key to search for (e.g., "nicotine" or "custom.nicotine")
 * @returns The metafield value or undefined if not found
 */
function getMetafieldValue(
    metafields: ProductCardFragment["customMetafields"],
    key: string,
): string | undefined {
    // Remove namespace prefix if provided (e.g., "custom.nicotine" -> "nicotine")
    const cleanKey = key.includes(".") ? key.split(".").pop() : key;

    const metafield = metafields.find(
        (mf) => mf?.key === cleanKey && mf?.namespace === "custom",
    );
    return metafield?.value ?? undefined;
}

/**
 * Displays product attribute pills from metafields.
 * Reads the metafield keys from theme settings and displays their values as rounded pill badges.
 *
 * @param props - The component props
 * @returns A div containing attribute pills, or null if no attributes exist
 */
export function AttributePills({ product, className }: AttributePillsProps) {
    const { pcardAttribute1MetafieldKey, pcardAttribute2MetafieldKey } =
        useThemeSettings();

    const attribute1 = getMetafieldValue(
        product.customMetafields || [],
        pcardAttribute1MetafieldKey || "nicotine",
    );
    const attribute2 = getMetafieldValue(
        product.customMetafields || [],
        pcardAttribute2MetafieldKey || "nicotine_pouch",
    );

    if (!attribute1 && !attribute2) return null;

    // TODO: Format known metafield values.

    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {attribute1 && (
                <span className="rounded-full bg-gray-200 px-3 py-1 font-medium text-gray-700 text-xs">
                    {attribute1}
                </span>
            )}
            {attribute2 && (
                <span className="rounded-full bg-gray-200 px-3 py-1 font-medium text-gray-700 text-xs">
                    {attribute2}
                </span>
            )}
        </div>
    );
}
