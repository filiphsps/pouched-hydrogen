/**
 * Country data utilities for address forms and localization.
 *
 * Provides a comprehensive list of country codes following ISO 3166-1 alpha-2.
 * Country names are retrieved from i18n translation files.
 *
 * @module utils/countries
 */

/**
 * Priority countries shown at the top of selection lists.
 * These are the most common shipping destinations for the German market.
 */
export const PRIORITY_COUNTRY_CODES = ["DE", "AT", "CH"] as const;

/**
 * All supported country codes (ISO 3166-1 alpha-2).
 * Order matches priority countries first, then by region.
 */
export const COUNTRY_CODES = [
    // Priority countries (common shipping destinations)
    "DE",
    "AT",
    "CH",
    // EU countries
    "BE",
    "BG",
    "HR",
    "CY",
    "CZ",
    "DK",
    "EE",
    "FI",
    "FR",
    "GR",
    "HU",
    "IE",
    "IT",
    "LV",
    "LT",
    "LU",
    "MT",
    "NL",
    "PL",
    "PT",
    "RO",
    "SK",
    "SI",
    "ES",
    "SE",
    // Other European countries
    "GB",
    "NO",
    "IS",
    "LI",
    "MC",
    "SM",
    "VA",
    "AD",
    "AL",
    "BA",
    "BY",
    "MD",
    "ME",
    "MK",
    "RS",
    "UA",
    "XK",
    // North America
    "US",
    "CA",
    "MX",
    // Oceania
    "AU",
    "NZ",
    // Asia (major markets)
    "JP",
    "KR",
    "CN",
    "HK",
    "SG",
    "TW",
    "TH",
    "MY",
    "ID",
    "PH",
    "VN",
    "IN",
    "AE",
    "SA",
    "IL",
    "TR",
    // South America
    "BR",
    "AR",
    "CL",
    "CO",
    "PE",
    // Africa
    "ZA",
    "EG",
    "MA",
    "NG",
    "KE",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

/**
 * Validates if a string is a valid country code.
 *
 * @param code - The code to validate
 * @returns True if the code is in the COUNTRY_CODES list
 *
 * @example
 * ```ts
 * isValidCountryCode("DE"); // => true
 * isValidCountryCode("XX"); // => false
 * ```
 */
export function isValidCountryCode(code: string): code is CountryCode {
    return COUNTRY_CODES.includes(code.toUpperCase() as CountryCode);
}

/**
 * Gets country codes sorted with priority countries first.
 *
 * @returns Array of country codes with DE, AT, CH first
 *
 * @example
 * ```ts
 * const codes = getCountryCodesWithPriority();
 * // ["DE", "AT", "CH", "BE", "BG", ...]
 * ```
 */
export function getCountryCodesWithPriority(): readonly CountryCode[] {
    return COUNTRY_CODES;
}

/**
 * Checks if a country code is a priority country.
 *
 * @param code - Country code to check
 * @returns True if the code is in the priority list
 *
 * @example
 * ```ts
 * isPriorityCountry("DE"); // => true
 * isPriorityCountry("FR"); // => false
 * ```
 */
export function isPriorityCountry(code: string): boolean {
    return PRIORITY_COUNTRY_CODES.includes(
        code.toUpperCase() as (typeof PRIORITY_COUNTRY_CODES)[number],
    );
}
