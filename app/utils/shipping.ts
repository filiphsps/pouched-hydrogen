/**
 * Shipping utilities for dynamic delivery estimates.
 *
 * Provides location-based shipping time calculations with support for:
 * - German federal state-specific holidays (using date-holidays package)
 * - Multiple shipping zones with different delivery times (from Shopify Metaobjects)
 * - Business day calculations that skip weekends and holidays
 *
 * Shipping zones can be configured via Shopify Metaobjects (type: "shipping_zone"):
 * - zone_id: Unique identifier (e.g., "domestic", "eu-fast")
 * - name: Display name (e.g., "Germany", "EU Fast")
 * - countries: JSON array of ISO 3166-1 alpha-2 country codes (e.g., ["DE"])
 * - min_days: Minimum business days for delivery
 * - max_days: Maximum business days for delivery
 * - is_default: Whether this is the default zone (true/false)
 *
 * @module utils/shipping
 */

import Holidays from "date-holidays";

/**
 * Shipping zone configuration with delivery time ranges.
 */
export interface ShippingZone {
    /** Zone identifier */
    id: string;
    /** Display name for the zone */
    name: string;
    /** ISO 3166-1 alpha-2 country codes in this zone */
    countries: string[];
    /** Minimum business days for delivery */
    minDays: number;
    /** Maximum business days for delivery */
    maxDays: number;
    /** Whether this is the default zone (used when location unknown) */
    isDefault?: boolean;
}

/**
 * Holiday instance for a specific country.
 * Uses the date-holidays package for accurate holiday detection.
 */
export type HolidayInstance = InstanceType<typeof Holidays>;

/**
 * Default shipping zones configuration.
 * Used as fallback when Shopify Metaobjects are not configured.
 * Ordered by priority - first match wins.
 */
export const DEFAULT_SHIPPING_ZONES: ShippingZone[] = [
    {
        id: "domestic",
        name: "Germany",
        countries: ["DE"],
        minDays: 2,
        maxDays: 4,
        isDefault: true,
    },
    {
        id: "eu-fast",
        name: "EU Fast (Neighboring)",
        countries: ["AT", "NL", "BE", "LU", "PL", "CZ", "DK"],
        minDays: 3,
        maxDays: 6,
    },
    {
        id: "eu-standard",
        name: "EU Standard",
        countries: [
            "FR",
            "IT",
            "ES",
            "PT",
            "SE",
            "FI",
            "NO",
            "IE",
            "GR",
            "HU",
            "RO",
            "BG",
            "SK",
            "SI",
            "HR",
            "EE",
            "LV",
            "LT",
            "MT",
            "CY",
        ],
        minDays: 4,
        maxDays: 8,
    },
    {
        id: "uk",
        name: "United Kingdom",
        countries: ["GB"],
        minDays: 5,
        maxDays: 10,
    },
    {
        id: "ch",
        name: "Switzerland",
        countries: ["CH"],
        minDays: 4,
        maxDays: 7,
    },
    {
        id: "international",
        name: "International",
        countries: [],
        minDays: 7,
        maxDays: 14,
    },
];

/**
 * @deprecated Use DEFAULT_SHIPPING_ZONES instead
 */
export const SHIPPING_ZONES = DEFAULT_SHIPPING_ZONES;

/**
 * GraphQL query to fetch shipping zones from Shopify Metaobjects.
 * Configure shipping zones in Shopify Admin under Content > Metaobjects > shipping_zone
 */
export const SHIPPING_ZONES_QUERY = `#graphql
    query ShippingZones {
        metaobjects(type: "shipping_zone", first: 50, sortKey: "updated_at") {
            nodes {
                id
                handle
                fields {
                    key
                    value
                }
            }
        }
    }
` as const;

/**
 * Response type for the shipping zones query.
 */
export interface ShippingZonesQueryResponse {
    metaobjects: {
        nodes: Array<{
            id: string;
            handle: string;
            fields: Array<{
                key: string;
                value: string | null;
            }>;
        }>;
    };
}

/**
 * Parses shipping zones from Shopify Metaobjects query response.
 *
 * @param response - The GraphQL query response
 * @returns Array of shipping zones, or default zones if parsing fails
 *
 * @example
 * ```ts
 * const response = await storefront.query(SHIPPING_ZONES_QUERY);
 * const zones = parseShippingZonesResponse(response);
 * ```
 */
export function parseShippingZonesResponse(
    response: ShippingZonesQueryResponse | null | undefined,
): ShippingZone[] {
    if (!response?.metaobjects?.nodes?.length) {
        return DEFAULT_SHIPPING_ZONES;
    }

    const zones: ShippingZone[] = [];

    for (const node of response.metaobjects.nodes) {
        const fields = new Map(node.fields.map((f) => [f.key, f.value]));

        const zoneId = fields.get("zone_id");
        const name = fields.get("name");
        const countriesJson = fields.get("countries");
        const minDaysStr = fields.get("min_days");
        const maxDaysStr = fields.get("max_days");
        const isDefaultStr = fields.get("is_default");

        // Skip invalid entries
        if (!zoneId || !name) {
            continue;
        }

        // Parse countries JSON array
        let countries: string[] = [];
        if (countriesJson) {
            try {
                const parsed = JSON.parse(countriesJson);
                if (Array.isArray(parsed)) {
                    countries = parsed.map((c) => String(c).toUpperCase());
                }
            } catch {
                // Invalid JSON, skip countries
            }
        }

        const minDays = minDaysStr ? Number.parseInt(minDaysStr, 10) : 2;
        const maxDays = maxDaysStr ? Number.parseInt(maxDaysStr, 10) : 4;
        const isDefault = isDefaultStr === "true";

        zones.push({
            id: zoneId,
            name,
            countries,
            minDays: Number.isNaN(minDays) ? 2 : minDays,
            maxDays: Number.isNaN(maxDays) ? 4 : maxDays,
            isDefault,
        });
    }

    // If no valid zones were parsed, return defaults
    if (zones.length === 0) {
        return DEFAULT_SHIPPING_ZONES;
    }

    // Ensure there's at least one default zone
    if (!zones.some((z) => z.isDefault)) {
        zones[0].isDefault = true;
    }

    return zones;
}

// =============================================================================
// Admin API Support for Delivery Zones
// =============================================================================

/**
 * GraphQL query to fetch delivery zones from Shopify Admin API.
 * Requires Admin API access token with read_shipping scope.
 *
 * @see https://shopify.dev/docs/api/admin-graphql/latest/objects/DeliveryZone
 */
export const ADMIN_DELIVERY_ZONES_QUERY = `#graphql
    query DeliveryZones {
        deliveryProfiles(first: 10) {
            nodes {
                id
                name
                default
                profileLocationGroups {
                    locationGroup {
                        id
                    }
                    locationGroupZones(first: 50) {
                        nodes {
                            zone {
                                id
                                name
                                countries {
                                    code {
                                        countryCode
                                    }
                                    provinces {
                                        code
                                    }
                                }
                            }
                            methodDefinitions(first: 20) {
                                nodes {
                                    id
                                    name
                                    rateProvider {
                                        ... on DeliveryRateDefinition {
                                            id
                                            price {
                                                amount
                                                currencyCode
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
` as const;

/**
 * Response type for the Admin API delivery zones query.
 */
export interface AdminDeliveryZonesResponse {
    deliveryProfiles: {
        nodes: Array<{
            id: string;
            name: string;
            default: boolean;
            profileLocationGroups: Array<{
                locationGroup: {
                    id: string;
                };
                locationGroupZones: {
                    nodes: Array<{
                        zone: {
                            id: string;
                            name: string;
                            countries: Array<{
                                code: {
                                    countryCode: string;
                                };
                                provinces: Array<{
                                    code: string;
                                }>;
                            }>;
                        };
                        methodDefinitions: {
                            nodes: Array<{
                                id: string;
                                name: string;
                                rateProvider: {
                                    id?: string;
                                    price?: {
                                        amount: string;
                                        currencyCode: string;
                                    };
                                } | null;
                            }>;
                        };
                    }>;
                };
            }>;
        }>;
    };
}

/**
 * Estimated delivery days by zone name pattern.
 * Maps zone names to min/max business day estimates.
 * These are defaults - ideally should be configured per-zone in Shopify.
 */
const DELIVERY_DAYS_BY_ZONE: Record<
    string,
    { minDays: number; maxDays: number }
> = {
    domestic: { minDays: 2, maxDays: 4 },
    germany: { minDays: 2, maxDays: 4 },
    deutschland: { minDays: 2, maxDays: 4 },
    "eu fast": { minDays: 3, maxDays: 6 },
    "eu standard": { minDays: 4, maxDays: 8 },
    "united kingdom": { minDays: 5, maxDays: 10 },
    uk: { minDays: 5, maxDays: 10 },
    switzerland: { minDays: 4, maxDays: 7 },
    schweiz: { minDays: 4, maxDays: 7 },
    international: { minDays: 7, maxDays: 14 },
    "rest of world": { minDays: 7, maxDays: 14 },
};

/**
 * Gets estimated delivery days for a zone based on its name.
 * Falls back to international shipping times if zone name is unknown.
 */
function getDeliveryDaysForZone(zoneName: string): {
    minDays: number;
    maxDays: number;
} {
    const lowerName = zoneName.toLowerCase();

    // Check for exact match
    if (DELIVERY_DAYS_BY_ZONE[lowerName]) {
        return DELIVERY_DAYS_BY_ZONE[lowerName];
    }

    // Check for partial matches
    for (const [key, days] of Object.entries(DELIVERY_DAYS_BY_ZONE)) {
        if (lowerName.includes(key) || key.includes(lowerName)) {
            return days;
        }
    }

    // Default to international
    return { minDays: 7, maxDays: 14 };
}

/**
 * Parses shipping zones from Shopify Admin API delivery zones response.
 *
 * @param response - The Admin API GraphQL query response
 * @returns Array of shipping zones, or default zones if parsing fails
 *
 * @example
 * ```ts
 * const response = await adminFetch(ADMIN_DELIVERY_ZONES_QUERY);
 * const zones = parseAdminDeliveryZonesResponse(response);
 * ```
 */
export function parseAdminDeliveryZonesResponse(
    response: AdminDeliveryZonesResponse | null | undefined,
): ShippingZone[] {
    if (!response?.deliveryProfiles?.nodes?.length) {
        return DEFAULT_SHIPPING_ZONES;
    }

    const zones: ShippingZone[] = [];
    const seenCountries = new Set<string>();

    // Process all profiles, preferring the default profile
    const profiles = [...response.deliveryProfiles.nodes].sort((a, b) =>
        a.default ? -1 : b.default ? 1 : 0,
    );

    for (const profile of profiles) {
        for (const group of profile.profileLocationGroups) {
            for (const zoneNode of group.locationGroupZones.nodes) {
                const { zone } = zoneNode;

                // Extract country codes
                const countries = zone.countries
                    .map((c) => c.code.countryCode.toUpperCase())
                    .filter((code) => !seenCountries.has(code));

                // Skip if all countries in this zone are already covered
                if (countries.length === 0) {
                    continue;
                }

                // Mark countries as seen
                for (const country of countries) {
                    seenCountries.add(country);
                }

                // Get delivery estimates based on zone name
                const { minDays, maxDays } = getDeliveryDaysForZone(zone.name);

                // Check if this is the domestic zone (Germany)
                const isDefault = countries.includes("DE");

                zones.push({
                    id: zone.id,
                    name: zone.name,
                    countries,
                    minDays,
                    maxDays,
                    isDefault,
                });
            }
        }
    }

    // If no valid zones were parsed, return defaults
    if (zones.length === 0) {
        return DEFAULT_SHIPPING_ZONES;
    }

    // Ensure there's at least one default zone
    if (!zones.some((z) => z.isDefault)) {
        zones[0].isDefault = true;
    }

    return zones;
}

/**
 * Fetches delivery zones from the Shopify Admin API.
 *
 * @param storeDomain - The Shopify store domain (e.g., "mystore.myshopify.com")
 * @param adminApiToken - The Admin API access token with read_shipping scope
 * @param apiVersion - The Admin API version (defaults to "2025-01")
 * @returns Promise resolving to the Admin API response
 *
 * @example
 * ```ts
 * const response = await fetchAdminDeliveryZones(
 *   env.PUBLIC_STORE_DOMAIN,
 *   env.SHOPIFY_ADMIN_API_TOKEN,
 * );
 * const zones = parseAdminDeliveryZonesResponse(response);
 * ```
 */
export async function fetchAdminDeliveryZones(
    storeDomain: string,
    adminApiToken: string,
    apiVersion = "2025-01",
): Promise<AdminDeliveryZonesResponse | null> {
    try {
        const response = await fetch(
            `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": adminApiToken,
                },
                body: JSON.stringify({ query: ADMIN_DELIVERY_ZONES_QUERY }),
            },
        );

        if (!response.ok) {
            console.error(
                `Admin API error: ${response.status} ${response.statusText}`,
            );
            return null;
        }

        const json = (await response.json()) as {
            data: AdminDeliveryZonesResponse;
        };
        return json.data;
    } catch (error) {
        console.error("Failed to fetch delivery zones from Admin API:", error);
        return null;
    }
}

// =============================================================================
// Shipping Zones Cache
// =============================================================================

/**
 * Cache entry for shipping zones.
 * Stores the zones and their expiration time.
 */
interface ShippingZonesCache {
    zones: ShippingZone[];
    expiresAt: number;
    /** Promise to prevent concurrent fetches */
    fetchPromise?: Promise<ShippingZone[]>;
}

/**
 * In-memory cache for shipping zones.
 * Minimizes Admin API calls by caching zones with a configurable TTL.
 *
 * CACHING STRATEGY:
 * - Shipping zones are cached for 1 hour by default (configurable)
 * - The cache is shared across all requests in the same worker instance
 * - When the cache expires, the next request will refresh it
 * - Concurrent requests during a refresh will share the same fetch promise
 * - Falls back to DEFAULT_SHIPPING_ZONES if fetch fails
 */
let shippingZonesCache: ShippingZonesCache | null = null;

/** Default cache TTL: 1 hour (in milliseconds) */
const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Gets cached shipping zones or fetches from Admin API if stale/missing.
 *
 * This function implements a stale-while-revalidate pattern:
 * - Returns cached zones immediately if available and not expired
 * - Fetches new zones from Admin API when cache is stale
 * - Prevents concurrent fetches using a shared promise
 * - Falls back to DEFAULT_SHIPPING_ZONES on error
 *
 * @param storeDomain - The Shopify store domain
 * @param adminApiToken - The Admin API access token (optional)
 * @param cacheTtlMs - Cache TTL in milliseconds (default: 1 hour)
 * @returns Promise resolving to shipping zones
 *
 * @example
 * ```ts
 * // In root loader
 * const shippingZones = await getCachedShippingZones(
 *   env.PUBLIC_STORE_DOMAIN,
 *   env.SHOPIFY_ADMIN_API_TOKEN,
 * );
 * ```
 */
export async function getCachedShippingZones(
    storeDomain: string,
    adminApiToken?: string,
    cacheTtlMs = DEFAULT_CACHE_TTL_MS,
): Promise<ShippingZone[]> {
    const now = Date.now();

    // If no Admin API token, always use defaults (no caching needed)
    if (!adminApiToken) {
        return DEFAULT_SHIPPING_ZONES;
    }

    // Return cached zones if still valid
    if (shippingZonesCache && now < shippingZonesCache.expiresAt) {
        return shippingZonesCache.zones;
    }

    // If a fetch is already in progress, wait for it
    if (shippingZonesCache?.fetchPromise) {
        return shippingZonesCache.fetchPromise;
    }

    // Create a new fetch promise to prevent concurrent fetches
    const fetchPromise = (async (): Promise<ShippingZone[]> => {
        try {
            const adminResponse = await fetchAdminDeliveryZones(
                storeDomain,
                adminApiToken,
            );

            if (adminResponse) {
                const zones = parseAdminDeliveryZonesResponse(adminResponse);
                if (zones.length > 0) {
                    // Update cache with new zones
                    shippingZonesCache = {
                        zones,
                        expiresAt: now + cacheTtlMs,
                    };
                    console.debug(
                        `Shipping zones cached (${zones.length} zones, expires in ${Math.round(cacheTtlMs / 60000)} min)`,
                    );
                    return zones;
                }
            }

            // Admin API returned no zones, use defaults
            console.debug(
                "Admin API returned no delivery zones - caching default zones",
            );
            shippingZonesCache = {
                zones: DEFAULT_SHIPPING_ZONES,
                expiresAt: now + cacheTtlMs,
            };
            return DEFAULT_SHIPPING_ZONES;
        } catch (error) {
            console.error("Failed to fetch shipping zones:", error);
            // On error, cache defaults for a shorter period (5 minutes)
            // to retry sooner
            shippingZonesCache = {
                zones: DEFAULT_SHIPPING_ZONES,
                expiresAt: now + 5 * 60 * 1000,
            };
            return DEFAULT_SHIPPING_ZONES;
        } finally {
            // Clear the fetch promise when done
            if (shippingZonesCache) {
                shippingZonesCache.fetchPromise = undefined;
            }
        }
    })();

    // Store the promise to prevent concurrent fetches
    if (!shippingZonesCache) {
        shippingZonesCache = {
            zones: DEFAULT_SHIPPING_ZONES,
            expiresAt: 0,
            fetchPromise,
        };
    } else {
        shippingZonesCache.fetchPromise = fetchPromise;
    }

    return fetchPromise;
}

/**
 * Clears the shipping zones cache.
 * Useful for testing or forcing a refresh.
 */
export function clearShippingZonesCache(): void {
    shippingZonesCache = null;
}

/**
 * Gets the current cache status (for debugging/monitoring).
 */
export function getShippingZonesCacheStatus(): {
    isCached: boolean;
    expiresAt: number | null;
    zoneCount: number;
    ttlRemaining: number;
} {
    if (!shippingZonesCache) {
        return {
            isCached: false,
            expiresAt: null,
            zoneCount: 0,
            ttlRemaining: 0,
        };
    }

    const now = Date.now();
    return {
        isCached: now < shippingZonesCache.expiresAt,
        expiresAt: shippingZonesCache.expiresAt,
        zoneCount: shippingZonesCache.zones.length,
        ttlRemaining: Math.max(0, shippingZonesCache.expiresAt - now),
    };
}

/**
 * Cache for holiday instances by country code.
 * Prevents repeated instantiation of the Holidays class.
 */
const holidayCache = new Map<string, HolidayInstance>();

/**
 * Gets or creates a holiday instance for a country.
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Holiday instance for the country, or null if not supported
 *
 * @example
 * ```ts
 * const holidays = getHolidayInstance("DE");
 * if (holidays?.isHoliday(new Date())) {
 *   console.log("Today is a holiday in Germany");
 * }
 * ```
 */
export function getHolidayInstance(
    countryCode: string,
): HolidayInstance | null {
    const upperCode = countryCode.toUpperCase();

    if (holidayCache.has(upperCode)) {
        return holidayCache.get(upperCode) ?? null;
    }

    try {
        const holidays = new Holidays(upperCode);
        holidayCache.set(upperCode, holidays);
        return holidays;
    } catch {
        // Country not supported by the library
        holidayCache.set(upperCode, null as unknown as HolidayInstance);
        return null;
    }
}

/**
 * Checks if a given date is a public holiday in the specified country.
 *
 * @param date - The date to check
 * @param countryCode - ISO 3166-1 alpha-2 country code (defaults to "DE")
 * @returns True if the date is a public holiday
 *
 * @example
 * ```ts
 * // Check if December 25, 2024 is a holiday in Germany
 * isPublicHoliday(new Date("2024-12-25"), "DE"); // => true (Christmas)
 *
 * // Check if a regular Monday is a holiday
 * isPublicHoliday(new Date("2024-12-16"), "DE"); // => false
 * ```
 */
export function isPublicHoliday(date: Date, countryCode = "DE"): boolean {
    const holidays = getHolidayInstance(countryCode);
    if (!holidays) {
        return false;
    }

    const result = holidays.isHoliday(date);
    if (!result) {
        return false;
    }

    // The result can be an array of holidays or false
    // We only consider "public" and "bank" type holidays (not observance or optional)
    const holidayArray = Array.isArray(result) ? result : [result];
    return holidayArray.some((h) => h.type === "public" || h.type === "bank");
}

/**
 * Checks if a date is a non-working day (weekend or public holiday).
 *
 * @param date - The date to check
 * @param countryCode - ISO 3166-1 alpha-2 country code (defaults to "DE")
 * @returns True if the date is a weekend or public holiday
 *
 * @example
 * ```ts
 * // Saturday
 * isNonWorkingDay(new Date("2024-12-14"), "DE"); // => true (weekend)
 *
 * // Christmas
 * isNonWorkingDay(new Date("2024-12-25"), "DE"); // => true (holiday)
 *
 * // Regular Monday
 * isNonWorkingDay(new Date("2024-12-16"), "DE"); // => false
 * ```
 */
export function isNonWorkingDay(date: Date, countryCode = "DE"): boolean {
    const dayOfWeek = date.getDay();

    // Weekend check (Saturday = 6, Sunday = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return true;
    }

    // Holiday check
    return isPublicHoliday(date, countryCode);
}

/**
 * Adds business days to a date, skipping weekends and public holidays.
 *
 * @param startDate - The starting date
 * @param days - Number of business days to add (must be >= 0)
 * @param countryCode - ISO 3166-1 alpha-2 country code for holiday lookup (defaults to "DE")
 * @returns New date with business days added
 *
 * @example
 * ```ts
 * // Adding 2 business days from Monday, skipping weekends and holidays
 * addBusinessDaysWithHolidays(new Date("2024-12-23"), 2, "DE");
 * // => Thursday Dec 26, 2024 (skips Dec 24 half-day, Dec 25-26 Christmas)
 * ```
 */
export function addBusinessDaysWithHolidays(
    startDate: Date,
    days: number,
    countryCode = "DE",
): Date {
    const result = new Date(startDate);
    let addedDays = 0;

    while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        if (!isNonWorkingDay(result, countryCode)) {
            addedDays++;
        }
    }

    return result;
}

/**
 * Gets the shipping zone for a given country code.
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "DE", "FR")
 * @param zones - Optional custom zones array (from Shopify Metaobjects)
 * @returns The matching shipping zone, or the default zone
 *
 * @example
 * ```ts
 * // Using default zones
 * getShippingZone("DE"); // => domestic zone (2-4 days)
 * getShippingZone("FR"); // => EU standard zone (4-8 days)
 * getShippingZone("US"); // => international zone (7-14 days)
 *
 * // Using custom zones from Shopify
 * const customZones = parseShippingZonesResponse(response);
 * getShippingZone("DE", customZones);
 * ```
 */
export function getShippingZone(
    countryCode?: string,
    zones: ShippingZone[] = DEFAULT_SHIPPING_ZONES,
): ShippingZone {
    if (!countryCode) {
        return zones.find((z) => z.isDefault) ?? zones[0];
    }

    const upperCode = countryCode.toUpperCase();

    // Find matching zone
    const matchedZone = zones.find((zone) =>
        zone.countries.includes(upperCode),
    );

    if (matchedZone) {
        return matchedZone;
    }

    // Return last zone (typically international) if no match
    return zones.at(-1) ?? zones[0];
}

/**
 * Estimated delivery date range.
 */
export interface DeliveryEstimate {
    /** Minimum delivery date */
    minDate: Date;
    /** Maximum delivery date */
    maxDate: Date;
    /** The shipping zone used for the estimate */
    zone: ShippingZone;
    /** Whether the order can ship today (before cutoff time) */
    canShipToday: boolean;
    /** Hours remaining until cutoff (0 if past cutoff) */
    hoursUntilCutoff: number;
}

/**
 * Calculates the estimated delivery date range based on location.
 *
 * @param options - Calculation options
 * @param options.countryCode - Destination country code (defaults to "DE")
 * @param options.originCountry - Origin country for holidays (defaults to "DE")
 * @param options.cutoffHour - Hour of day for same-day shipping cutoff (defaults to 14)
 * @param options.referenceDate - Reference date for calculations (defaults to now)
 * @param options.minDaysOverride - Override minimum days from theme settings
 * @param options.maxDaysOverride - Override maximum days from theme settings
 * @param options.shippingZones - Custom shipping zones (from Shopify Metaobjects)
 * @returns Delivery estimate with date range and shipping information
 *
 * @example
 * ```ts
 * // Calculate delivery to France with default zones
 * const estimate = calculateDeliveryEstimate({
 *   countryCode: "FR",
 *   cutoffHour: 14,
 * });
 * // => { minDate: ..., maxDate: ..., zone: EU standard, canShipToday: true, ... }
 *
 * // Calculate with custom zones from Shopify
 * const customZones = parseShippingZonesResponse(response);
 * const estimate = calculateDeliveryEstimate({
 *   countryCode: "FR",
 *   shippingZones: customZones,
 * });
 * ```
 */
export function calculateDeliveryEstimate(options: {
    countryCode?: string;
    originCountry?: string;
    cutoffHour?: number;
    referenceDate?: Date;
    minDaysOverride?: number;
    maxDaysOverride?: number;
    shippingZones?: ShippingZone[];
}): DeliveryEstimate {
    const {
        countryCode = "DE",
        originCountry = "DE",
        cutoffHour = 14,
        referenceDate = new Date(),
        minDaysOverride,
        maxDaysOverride,
        shippingZones = DEFAULT_SHIPPING_ZONES,
    } = options;

    const zone = getShippingZone(countryCode, shippingZones);

    // Use overrides if provided, otherwise use zone defaults
    const minDays = minDaysOverride ?? zone.minDays;
    const maxDays = maxDaysOverride ?? zone.maxDays;

    // Calculate hours until cutoff
    const cutoff = new Date(referenceDate);
    cutoff.setHours(cutoffHour, 0, 0, 0);

    const hoursUntilCutoff =
        referenceDate < cutoff
            ? Math.ceil(
                  (cutoff.getTime() - referenceDate.getTime()) /
                      (1000 * 60 * 60),
              )
            : 0;

    const canShipToday =
        hoursUntilCutoff > 0 && !isNonWorkingDay(referenceDate, originCountry);

    // Determine the shipping start date
    // If we can ship today, start counting from today
    // Otherwise, start from the next business day
    let shippingStartDate = new Date(referenceDate);
    if (!canShipToday) {
        // Find the next business day
        shippingStartDate = addBusinessDaysWithHolidays(
            referenceDate,
            1,
            originCountry,
        );
    }

    // Calculate delivery dates using the destination country's holidays
    // (for international, we use origin country holidays for shipping)
    const deliveryCountry =
        countryCode === originCountry ? originCountry : originCountry;

    const minDate = addBusinessDaysWithHolidays(
        shippingStartDate,
        minDays,
        deliveryCountry,
    );
    const maxDate = addBusinessDaysWithHolidays(
        shippingStartDate,
        maxDays,
        deliveryCountry,
    );

    return {
        minDate,
        maxDate,
        zone,
        canShipToday,
        hoursUntilCutoff,
    };
}

/**
 * Gets the list of upcoming holidays for a country.
 * Useful for displaying holiday notices on the shipping estimate.
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param days - Number of days to look ahead (defaults to 14)
 * @param referenceDate - Starting date for the lookup
 * @returns Array of upcoming public holidays with names and dates
 *
 * @example
 * ```ts
 * const holidays = getUpcomingHolidays("DE", 30, new Date("2024-12-15"));
 * // => [{ name: "1. Weihnachtstag", date: Date("2024-12-25"), ... }, ...]
 * ```
 */
export function getUpcomingHolidays(
    countryCode = "DE",
    days = 14,
    referenceDate = new Date(),
): Array<{ name: string; date: Date; type: string }> {
    const holidays = getHolidayInstance(countryCode);
    if (!holidays) {
        return [];
    }

    const upcomingHolidays: Array<{ name: string; date: Date; type: string }> =
        [];
    const endDate = new Date(referenceDate);
    endDate.setDate(endDate.getDate() + days);

    // Normalize dates to a day number (days since epoch) for timezone-safe comparison.
    // We use UTC to ensure consistent comparison across timezones.
    // For holiday dates, we add 12 hours before extracting UTC components to handle
    // the case where a holiday at midnight local time (e.g., CET) appears as the
    // previous day in UTC (e.g., New Year's at 00:00 CET = Dec 31 23:00 UTC).
    const normalizeToDay = (date: Date, isHoliday = false): number => {
        const d = isHoliday
            ? new Date(date.getTime() + 12 * 60 * 60 * 1000)
            : date;
        return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    };

    // Create a normalized holiday date at noon UTC on the correct calendar day.
    // This ensures getMonth()/getDate() return the expected values regardless of timezone.
    const createNormalizedHolidayDate = (holidayStart: Date): Date => {
        const shifted = new Date(holidayStart.getTime() + 12 * 60 * 60 * 1000);
        return new Date(
            Date.UTC(
                shifted.getUTCFullYear(),
                shifted.getUTCMonth(),
                shifted.getUTCDate(),
                12,
                0,
                0,
            ),
        );
    };

    const refDateNormalized = normalizeToDay(referenceDate);
    const endDateNormalized = normalizeToDay(endDate);

    const year = referenceDate.getUTCFullYear();
    const allHolidays = [
        ...holidays.getHolidays(year),
        ...holidays.getHolidays(year + 1),
    ];

    for (const holiday of allHolidays) {
        const holidayDateNormalized = normalizeToDay(holiday.start, true);
        if (
            holidayDateNormalized >= refDateNormalized &&
            holidayDateNormalized <= endDateNormalized &&
            (holiday.type === "public" || holiday.type === "bank")
        ) {
            upcomingHolidays.push({
                name: holiday.name,
                date: createNormalizedHolidayDate(holiday.start),
                type: holiday.type,
            });
        }
    }

    return upcomingHolidays.sort((a, b) => a.date.getTime() - b.date.getTime());
}
