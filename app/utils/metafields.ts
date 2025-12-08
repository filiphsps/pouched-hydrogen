import type { TFunction } from "i18next";

/**
 * Represents a metafield from Shopify's Storefront API.
 */
export interface Metafield {
    key: string;
    namespace: string;
    value: string;
}

/**
 * Type for metafield arrays that may contain null values.
 */
export type MetafieldArray = Array<Metafield | null> | undefined;

/**
 * Gets a metafield value from a metafields array by key.
 * Supports both simple keys ("nicotine") and namespaced keys ("custom.nicotine").
 *
 * @param metafields - Array of metafields from the product
 * @param key - The metafield key to search for
 * @param namespace - Optional namespace to filter by (defaults to "custom")
 * @returns The metafield value or undefined if not found
 */
export function getMetafieldValue(
    metafields: MetafieldArray,
    key: string,
    namespace = "custom",
): string | undefined {
    if (!metafields) return undefined;

    // Remove namespace prefix if provided (e.g., "custom.nicotine" -> "nicotine")
    const cleanKey = key.includes(".") ? key.split(".").pop() : key;

    const metafield = metafields.find(
        (mf) => mf?.key === cleanKey && mf?.namespace === namespace,
    );
    return metafield?.value ?? undefined;
}

/**
 * Gets a human-readable label for a metafield key using i18n.
 * Falls back to a formatted version of the key if no translation exists.
 *
 * @param t - The i18n translation function
 * @param key - The metafield key
 * @returns The localized label for the metafield
 */
export function getMetafieldLabel(t: TFunction, key: string): string {
    // Remove namespace prefix if provided
    const cleanKey = key.includes(".") ? (key.split(".").pop() ?? key) : key;

    // Try to get translation, fall back to formatted key
    const translationKey = `product.metafield.label.${cleanKey}`;
    const translated = t(translationKey, { defaultValue: "" });

    // If no translation found, format the key nicely
    if (!translated) {
        return formatKeyAsLabel(cleanKey);
    }

    return translated;
}

/**
 * Formats a metafield value based on its key using i18n.
 * Some metafields have special formatting (e.g., adding units).
 *
 * @param t - The i18n translation function
 * @param key - The metafield key
 * @param value - The raw metafield value
 * @returns The formatted display string
 */
export function formatMetafieldValue(
    t: TFunction,
    key: string,
    value: string,
): string {
    // Remove namespace prefix if provided
    const cleanKey = key.includes(".") ? (key.split(".").pop() ?? key) : key;

    // Try to get a formatted translation with the value interpolated
    const translationKey = `product.metafield.format.${cleanKey}`;
    const formatted = t(translationKey, { value, defaultValue: "" });

    // If no special formatting, return the raw value
    return formatted || value;
}

/**
 * Formats a metafield key as a human-readable label.
 * Converts snake_case to Title Case.
 *
 * @param key - The metafield key
 * @returns A formatted label string
 */
export function formatKeyAsLabel(key: string): string {
    return key
        .split("_")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
}

/**
 * Extracts multiple metafield values from a product and returns them as label-value pairs.
 *
 * @param t - The i18n translation function
 * @param metafields - Array of metafields from the product
 * @param keys - Array of metafield keys to extract
 * @returns Array of objects with label and value properties
 */
export function extractMetafieldFacts(
    t: TFunction,
    metafields: MetafieldArray,
    keys: string[],
): Array<{ label: string; value: string }> {
    const facts: Array<{ label: string; value: string }> = [];

    for (const key of keys) {
        const value = getMetafieldValue(metafields, key);
        if (value) {
            facts.push({
                label: getMetafieldLabel(t, key),
                value: formatMetafieldValue(t, key, value),
            });
        }
    }

    return facts;
}
