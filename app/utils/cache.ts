import {
    CacheCustom,
    CacheNone,
    generateCacheControlHeader,
} from "@shopify/hydrogen";

// Re-export Hydrogen's built-in cache utilities for convenience
export {
    CacheCustom,
    CacheLong,
    CacheNone,
    CacheShort,
    generateCacheControlHeader,
} from "@shopify/hydrogen";

/**
 * Cache duration constants in seconds
 */
export const CACHE_DURATIONS = {
    /** 1 second - for real-time data */
    REALTIME: 1,
    /** 1 minute */
    ONE_MINUTE: 60,
    /** 2 minutes */
    TWO_MINUTES: 120,
    /** 5 minutes */
    FIVE_MINUTES: 300,
    /** 10 minutes */
    TEN_MINUTES: 600,
    /** 30 minutes */
    THIRTY_MINUTES: 1800,
    /** 1 hour */
    ONE_HOUR: 3600,
    /** 1 day */
    ONE_DAY: 86400,
} as const;

/**
 * Stale-While-Revalidate (SWR) cache strategy types
 */
export type CacheStrategyType =
    | "none"
    | "short"
    | "medium"
    | "long"
    | "homepage"
    | "product"
    | "collection"
    | "search"
    | "api";

/**
 * Cache strategy configuration
 */
export interface CacheStrategyConfig {
    /** Cache mode: public, private, or no-store */
    mode: "public" | "private" | "no-store" | "must-revalidate";
    /** Max age in seconds - how long the response is "fresh" */
    maxAge: number;
    /** Stale-while-revalidate in seconds - serve stale while fetching fresh */
    staleWhileRevalidate: number;
    /** Stale-if-error in seconds - serve stale if origin fails (optional) */
    staleIfError?: number;
}

/**
 * Pre-configured SWR cache strategies for different route types
 *
 * These strategies balance freshness with performance:
 * - `maxAge`: How long CDN/browser considers response "fresh" (serves without revalidation)
 * - `staleWhileRevalidate`: Serves stale content immediately while fetching fresh in background
 * - `staleIfError`: Serves stale content if origin is unavailable (resilience)
 */
export const CACHE_STRATEGIES: Record<CacheStrategyType, CacheStrategyConfig> =
    {
        /** No caching - for personalized or sensitive data */
        none: {
            mode: "no-store",
            maxAge: 0,
            staleWhileRevalidate: 0,
        },

        /** Short cache - for highly dynamic content (1s fresh, 9s SWR) */
        short: {
            mode: "public",
            maxAge: CACHE_DURATIONS.REALTIME,
            staleWhileRevalidate: 9,
        },

        /** Medium cache - for moderately dynamic content (2min fresh, 10min SWR) */
        medium: {
            mode: "public",
            maxAge: CACHE_DURATIONS.TWO_MINUTES,
            staleWhileRevalidate: CACHE_DURATIONS.TEN_MINUTES,
            staleIfError: CACHE_DURATIONS.ONE_HOUR,
        },

        /** Long cache - for stable content (1hr fresh, 23hr SWR) */
        long: {
            mode: "public",
            maxAge: CACHE_DURATIONS.ONE_HOUR,
            staleWhileRevalidate:
                CACHE_DURATIONS.ONE_DAY - CACHE_DURATIONS.ONE_HOUR,
            staleIfError: CACHE_DURATIONS.ONE_DAY,
        },

        /**
         * Homepage cache strategy
         * - Content changes when promotions/featured products update
         * - 2 minutes fresh, 10 minutes SWR for good balance
         */
        homepage: {
            mode: "public",
            maxAge: CACHE_DURATIONS.TWO_MINUTES,
            staleWhileRevalidate: CACHE_DURATIONS.TEN_MINUTES,
            staleIfError: CACHE_DURATIONS.ONE_HOUR,
        },

        /**
         * Product page cache strategy
         * - Product data is relatively stable (title, description, images)
         * - Inventory/pricing can change but SWR handles this well
         * - 5 minutes fresh, 1 hour SWR for optimal performance
         */
        product: {
            mode: "public",
            maxAge: CACHE_DURATIONS.FIVE_MINUTES,
            staleWhileRevalidate: CACHE_DURATIONS.ONE_HOUR,
            staleIfError: CACHE_DURATIONS.ONE_DAY,
        },

        /**
         * Collection page cache strategy
         * - Changes when products are added/removed from collection
         * - Filter/sort states are URL-based (separate cache entries)
         * - 3 minutes fresh, 30 minutes SWR
         */
        collection: {
            mode: "public",
            maxAge: CACHE_DURATIONS.TWO_MINUTES + CACHE_DURATIONS.ONE_MINUTE,
            staleWhileRevalidate: CACHE_DURATIONS.THIRTY_MINUTES,
            staleIfError: CACHE_DURATIONS.ONE_HOUR,
        },

        /**
         * Search results cache strategy
         * - Results are query-specific (URL-based cache keys)
         * - Short freshness since search indices update frequently
         * - 1 minute fresh, 5 minutes SWR
         */
        search: {
            mode: "public",
            maxAge: CACHE_DURATIONS.ONE_MINUTE,
            staleWhileRevalidate: CACHE_DURATIONS.FIVE_MINUTES,
            staleIfError: CACHE_DURATIONS.THIRTY_MINUTES,
        },

        /**
         * API endpoint cache strategy
         * - For JSON API routes (countries, products API, etc.)
         * - Long cache since data rarely changes
         * - 1 hour fresh, 23 hours SWR
         */
        api: {
            mode: "public",
            maxAge: CACHE_DURATIONS.ONE_HOUR,
            staleWhileRevalidate:
                CACHE_DURATIONS.ONE_DAY - CACHE_DURATIONS.ONE_HOUR,
            staleIfError: CACHE_DURATIONS.ONE_DAY,
        },
    };

/**
 * Creates a Hydrogen-compatible cache strategy from a strategy type
 *
 * @param type - The cache strategy type
 * @returns A Hydrogen CachingStrategy object
 *
 * @example
 * ```ts
 * // In a loader
 * const cacheStrategy = getCacheStrategy('product');
 * const data = await storefront.query(QUERY, { cache: cacheStrategy });
 * ```
 */
export function getCacheStrategy(type: CacheStrategyType) {
    const config = CACHE_STRATEGIES[type];

    if (config.mode === "no-store") {
        return CacheNone();
    }

    return CacheCustom({
        mode: config.mode,
        maxAge: config.maxAge,
        staleWhileRevalidate: config.staleWhileRevalidate,
        staleIfError: config.staleIfError,
    });
}

/**
 * Generates a Cache-Control header string for a given strategy type
 *
 * @param type - The cache strategy type
 * @returns A Cache-Control header string
 *
 * @example
 * ```ts
 * // Returns: "public, max-age=300, stale-while-revalidate=3600, stale-if-error=86400"
 * const header = generateCacheHeader('product');
 * ```
 */
export function generateCacheHeader(type: CacheStrategyType): string {
    return generateCacheControlHeader(getCacheStrategy(type));
}

/**
 * Creates custom cache headers with explicit values
 *
 * @param config - Custom cache configuration
 * @returns A Cache-Control header string
 *
 * @example
 * ```ts
 * const header = createCustomCacheHeader({
 *   mode: 'public',
 *   maxAge: 60,
 *   staleWhileRevalidate: 600,
 * });
 * ```
 */
export function createCustomCacheHeader(
    config: Partial<CacheStrategyConfig>,
): string {
    const fullConfig: CacheStrategyConfig = {
        mode: config.mode ?? "public",
        maxAge: config.maxAge ?? CACHE_DURATIONS.ONE_MINUTE,
        staleWhileRevalidate:
            config.staleWhileRevalidate ?? CACHE_DURATIONS.FIVE_MINUTES,
        staleIfError: config.staleIfError,
    };

    if (fullConfig.mode === "no-store") {
        return generateCacheControlHeader(CacheNone());
    }

    return generateCacheControlHeader(
        CacheCustom({
            mode: fullConfig.mode,
            maxAge: fullConfig.maxAge,
            staleWhileRevalidate: fullConfig.staleWhileRevalidate,
            staleIfError: fullConfig.staleIfError,
        }),
    );
}

/**
 * Route headers handler that applies SWR caching
 *
 * This function is used as the `headers` export in route files.
 * It passes through loader headers but ensures proper cache control.
 *
 * @param loaderHeaders - Headers from the route loader
 * @returns Headers object with Cache-Control
 *
 * @example
 * ```ts
 * // In a route file
 * export const headers = routeHeaders;
 *
 * // Or with a specific strategy
 * export const headers = ({ loaderHeaders }) =>
 *   routeHeadersWithStrategy({ loaderHeaders }, 'product');
 * ```
 */
export function routeHeaders({ loaderHeaders }: { loaderHeaders: Headers }) {
    // Keep the same cache-control headers when loading the page directly
    // versus when transitioning to the page from other areas in the app
    return {
        "Cache-Control": loaderHeaders.get("Cache-Control"),
    };
}

/**
 * Route headers handler that applies a specific SWR cache strategy
 *
 * Use this when you want to enforce a specific caching strategy
 * regardless of what the loader sets.
 *
 * @param params - The route headers params
 * @param strategy - The cache strategy type to apply
 * @returns Headers object with Cache-Control
 *
 * @example
 * ```ts
 * // In a route file
 * export const headers = (params) => routeHeadersWithStrategy(params, 'product');
 * ```
 */
export function routeHeadersWithStrategy(
    { loaderHeaders }: { loaderHeaders: Headers },
    strategy: CacheStrategyType,
) {
    // Use the loader's Cache-Control if set, otherwise use the strategy default
    const loaderCacheControl = loaderHeaders.get("Cache-Control");

    return {
        "Cache-Control": loaderCacheControl || generateCacheHeader(strategy),
    };
}

/**
 * Creates headers for loader responses with SWR caching
 *
 * @param strategy - The cache strategy type
 * @returns Headers object for use in loader return
 *
 * @example
 * ```ts
 * // In a loader
 * return data(
 *   { product, weaverseData },
 *   { headers: getLoaderCacheHeaders('product') }
 * );
 * ```
 */
export function getLoaderCacheHeaders(
    strategy: CacheStrategyType,
): HeadersInit {
    return {
        "Cache-Control": generateCacheHeader(strategy),
    };
}
