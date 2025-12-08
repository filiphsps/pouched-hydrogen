import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { ProductCardFragment } from "storefront-api.generated";
import { cn } from "~/utils/cn";

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
 * Creates metafield formatters with i18n support.
 * Each formatter receives the translation function to support localization.
 * Add new entries here to extend formatting for additional metafield types.
 *
 * @param t - The i18n translation function
 * @returns A record of metafield keys to their format functions
 */
function createMetafieldFormatters(
    t: TFunction,
): Record<string, (value: string) => string> {
    return {
        /** Nicotine content in mg/g */
        nicotine: (value) =>
            t("product.metafield.nicotine", {
                value,
                defaultValue: `${value} mg/g`,
            }),
        /** Nicotine per pouch in mg */
        nicotine_pouch: (value) =>
            t("product.metafield.nicotine_pouch", {
                value,
                defaultValue: `${value} mg/pouch`,
            }),
        /** Strength level */
        strength: (value) => value,
        /** Product format */
        format: (value) => value,
        /** Flavor profile */
        flavor: (value) => value,
    };
}

/**
 * Formats a metafield value based on its key using i18n translations.
 *
 * @param t - The i18n translation function
 * @param key - The metafield key (e.g., "nicotine" or "custom.nicotine")
 * @param value - The raw metafield value
 * @returns The formatted display string
 */
function formatMetafieldValue(
    t: TFunction,
    key: string,
    value: string,
): string {
    // Remove namespace prefix if provided (e.g., "custom.nicotine" -> "nicotine")
    const cleanKey = key.includes(".") ? (key.split(".").pop() ?? key) : key;
    const formatters = createMetafieldFormatters(t);
    const formatter = formatters[cleanKey];
    return formatter ? formatter(value) : value;
}

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
 * Values are automatically formatted based on the metafield key using i18n translations.
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

    const attribute1 = getMetafieldValue(product.customMetafields || [], key1);
    const attribute2 = getMetafieldValue(product.customMetafields || [], key2);

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
