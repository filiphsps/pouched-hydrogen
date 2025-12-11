import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import { useTranslation } from "react-i18next";
import type { ProductCardFragment } from "storefront-api.generated";
import { cn } from "~/utils/cn";
import {
    formatMetafieldValue,
    getMetafieldValue,
    type MetafieldArray,
} from "~/utils/metafields";

/**
 * CVA variant definition for attribute pill styling.
 */
const pillVariants = cva(
    "rounded-full bg-background font-medium text-gray-700 text-xs",
    {
        variants: {
            size: {
                sm: "px-2.5 py-1",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    },
);

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
 * Reads the metafield keys from theme settings and displays their values as rounded pill badges.
 * Values are automatically formatted based on the metafield key using i18n translations.
 * Uses shared metafield utilities for consistent value extraction and formatting.
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
        <div className={cn("flex flex-wrap gap-2", className)}>
            {attribute1 && (
                <span className={pillVariants({ size: "sm" })}>
                    {formatMetafieldValue(t, key1, attribute1)}
                </span>
            )}
            {attribute2 && (
                <span className={pillVariants({ size: "sm" })}>
                    {formatMetafieldValue(t, key2, attribute2)}
                </span>
            )}
        </div>
    );
}
