import { useThemeSettings } from "@weaverse/hydrogen";
import { useTranslation } from "react-i18next";
import type { ProductCardFragment } from "storefront-api.generated";
import { cn } from "~/utils/cn";
import {
    formatMetafieldValue,
    getMetafieldValue,
    type MetafieldArray,
} from "~/utils/metafields";

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
 * Displays product attribute pills from metafields.
 * Shows key product attributes like nicotine strength in compact pill format.
 * Clean minimal design with subtle borders and refined typography.
 *
 * @param props - The component props
 * @returns A div containing attribute pills, or null if no attributes exist
 */
export function AttributePills({ product, className }: AttributePillsProps) {
    const { t } = useTranslation();
    const { pcardAttribute1MetafieldKey, pcardAttribute2MetafieldKey } =
        useThemeSettings();

    const key1 = pcardAttribute1MetafieldKey || "nicotine";
    const key2 = pcardAttribute2MetafieldKey || "nicotine_pouch";

    const metafields = product.customMetafields as MetafieldArray;
    const attribute1 = getMetafieldValue(metafields, key1);
    const attribute2 = getMetafieldValue(metafields, key2);

    if (!attribute1 && !attribute2) return null;

    return (
        <div className={cn("flex flex-wrap gap-1.5", className)}>
            {attribute1 && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-body-subtle text-xs">
                    {formatMetafieldValue(t, key1, attribute1)}
                </span>
            )}
            {attribute2 && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-body-subtle text-xs">
                    {formatMetafieldValue(t, key2, attribute2)}
                </span>
            )}
        </div>
    );
}
