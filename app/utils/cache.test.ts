import { describe, expect, it } from "vitest";
import {
    CACHE_DURATIONS,
    CACHE_STRATEGIES,
    type CacheStrategyConfig,
    type CacheStrategyType,
    createCustomCacheHeader,
    generateCacheHeader,
    getCacheStrategy,
    getLoaderCacheHeaders,
    routeHeaders,
    routeHeadersWithStrategy,
} from "./cache";

describe("CACHE_DURATIONS", () => {
    it("should have correct values for all durations", () => {
        expect(CACHE_DURATIONS.REALTIME).toBe(1);
        expect(CACHE_DURATIONS.ONE_MINUTE).toBe(60);
        expect(CACHE_DURATIONS.TWO_MINUTES).toBe(120);
        expect(CACHE_DURATIONS.FIVE_MINUTES).toBe(300);
        expect(CACHE_DURATIONS.TEN_MINUTES).toBe(600);
        expect(CACHE_DURATIONS.THIRTY_MINUTES).toBe(1800);
        expect(CACHE_DURATIONS.ONE_HOUR).toBe(3600);
        expect(CACHE_DURATIONS.ONE_DAY).toBe(86400);
    });
});

describe("CACHE_STRATEGIES", () => {
    it("should have all expected strategy types", () => {
        const expectedTypes: CacheStrategyType[] = [
            "none",
            "short",
            "medium",
            "long",
            "homepage",
            "product",
            "collection",
            "search",
            "api",
        ];

        for (const type of expectedTypes) {
            expect(CACHE_STRATEGIES[type]).toBeDefined();
        }
    });

    it("should have correct config for 'none' strategy", () => {
        expect(CACHE_STRATEGIES.none).toEqual({
            mode: "no-store",
            maxAge: 0,
            staleWhileRevalidate: 0,
        });
    });

    it("should have correct config for 'short' strategy", () => {
        expect(CACHE_STRATEGIES.short).toEqual({
            mode: "public",
            maxAge: 1,
            staleWhileRevalidate: 9,
        });
    });

    it("should have correct config for 'medium' strategy", () => {
        expect(CACHE_STRATEGIES.medium.mode).toBe("public");
        expect(CACHE_STRATEGIES.medium.maxAge).toBe(
            CACHE_DURATIONS.TWO_MINUTES,
        );
        expect(CACHE_STRATEGIES.medium.staleWhileRevalidate).toBe(
            CACHE_DURATIONS.TEN_MINUTES,
        );
        expect(CACHE_STRATEGIES.medium.staleIfError).toBe(
            CACHE_DURATIONS.ONE_HOUR,
        );
    });

    it("should have correct config for 'long' strategy", () => {
        expect(CACHE_STRATEGIES.long.mode).toBe("public");
        expect(CACHE_STRATEGIES.long.maxAge).toBe(CACHE_DURATIONS.ONE_HOUR);
        expect(CACHE_STRATEGIES.long.staleWhileRevalidate).toBe(
            CACHE_DURATIONS.ONE_DAY - CACHE_DURATIONS.ONE_HOUR,
        );
        expect(CACHE_STRATEGIES.long.staleIfError).toBe(
            CACHE_DURATIONS.ONE_DAY,
        );
    });

    it("should have correct config for 'homepage' strategy", () => {
        expect(CACHE_STRATEGIES.homepage.mode).toBe("public");
        expect(CACHE_STRATEGIES.homepage.maxAge).toBe(
            CACHE_DURATIONS.TWO_MINUTES,
        );
        expect(CACHE_STRATEGIES.homepage.staleWhileRevalidate).toBe(
            CACHE_DURATIONS.TEN_MINUTES,
        );
        expect(CACHE_STRATEGIES.homepage.staleIfError).toBe(
            CACHE_DURATIONS.ONE_HOUR,
        );
    });

    it("should have correct config for 'product' strategy", () => {
        expect(CACHE_STRATEGIES.product.mode).toBe("public");
        expect(CACHE_STRATEGIES.product.maxAge).toBe(
            CACHE_DURATIONS.FIVE_MINUTES,
        );
        expect(CACHE_STRATEGIES.product.staleWhileRevalidate).toBe(
            CACHE_DURATIONS.ONE_HOUR,
        );
        expect(CACHE_STRATEGIES.product.staleIfError).toBe(
            CACHE_DURATIONS.ONE_DAY,
        );
    });

    it("should have correct config for 'collection' strategy", () => {
        expect(CACHE_STRATEGIES.collection.mode).toBe("public");
        expect(CACHE_STRATEGIES.collection.maxAge).toBe(
            CACHE_DURATIONS.TWO_MINUTES + CACHE_DURATIONS.ONE_MINUTE,
        );
        expect(CACHE_STRATEGIES.collection.staleWhileRevalidate).toBe(
            CACHE_DURATIONS.THIRTY_MINUTES,
        );
        expect(CACHE_STRATEGIES.collection.staleIfError).toBe(
            CACHE_DURATIONS.ONE_HOUR,
        );
    });

    it("should have correct config for 'search' strategy", () => {
        expect(CACHE_STRATEGIES.search.mode).toBe("public");
        expect(CACHE_STRATEGIES.search.maxAge).toBe(CACHE_DURATIONS.ONE_MINUTE);
        expect(CACHE_STRATEGIES.search.staleWhileRevalidate).toBe(
            CACHE_DURATIONS.FIVE_MINUTES,
        );
        expect(CACHE_STRATEGIES.search.staleIfError).toBe(
            CACHE_DURATIONS.THIRTY_MINUTES,
        );
    });

    it("should have correct config for 'api' strategy", () => {
        expect(CACHE_STRATEGIES.api.mode).toBe("public");
        expect(CACHE_STRATEGIES.api.maxAge).toBe(CACHE_DURATIONS.ONE_HOUR);
        expect(CACHE_STRATEGIES.api.staleWhileRevalidate).toBe(
            CACHE_DURATIONS.ONE_DAY - CACHE_DURATIONS.ONE_HOUR,
        );
        expect(CACHE_STRATEGIES.api.staleIfError).toBe(CACHE_DURATIONS.ONE_DAY);
    });
});

describe("getCacheStrategy", () => {
    it("should return CacheNone for 'none' strategy", () => {
        const strategy = getCacheStrategy("none");
        expect(strategy).toBeDefined();
        expect(strategy.mode).toBe("no-store");
    });

    it("should return CacheCustom for 'product' strategy", () => {
        const strategy = getCacheStrategy("product");
        expect(strategy).toBeDefined();
        expect(strategy.mode).toBe("public");
        // Type guard to access maxAge/staleWhileRevalidate properties
        if ("maxAge" in strategy) {
            expect(strategy.maxAge).toBe(CACHE_DURATIONS.FIVE_MINUTES);
            expect(strategy.staleWhileRevalidate).toBe(
                CACHE_DURATIONS.ONE_HOUR,
            );
        }
    });

    it("should return CacheCustom for 'collection' strategy", () => {
        const strategy = getCacheStrategy("collection");
        expect(strategy).toBeDefined();
        expect(strategy.mode).toBe("public");
        if ("maxAge" in strategy) {
            expect(strategy.maxAge).toBe(
                CACHE_DURATIONS.TWO_MINUTES + CACHE_DURATIONS.ONE_MINUTE,
            );
        }
    });

    it("should return CacheCustom for 'homepage' strategy", () => {
        const strategy = getCacheStrategy("homepage");
        expect(strategy).toBeDefined();
        expect(strategy.mode).toBe("public");
        if ("maxAge" in strategy) {
            expect(strategy.maxAge).toBe(CACHE_DURATIONS.TWO_MINUTES);
        }
    });
});

describe("generateCacheHeader", () => {
    it("should generate no-store header for 'none' strategy", () => {
        const header = generateCacheHeader("none");
        expect(header).toBe("no-store");
    });

    it("should generate correct header for 'product' strategy", () => {
        const header = generateCacheHeader("product");
        expect(header).toContain("public");
        expect(header).toContain("max-age=300");
        expect(header).toContain("stale-while-revalidate=3600");
        expect(header).toContain("stale-if-error=86400");
    });

    it("should generate correct header for 'homepage' strategy", () => {
        const header = generateCacheHeader("homepage");
        expect(header).toContain("public");
        expect(header).toContain("max-age=120");
        expect(header).toContain("stale-while-revalidate=600");
        expect(header).toContain("stale-if-error=3600");
    });

    it("should generate correct header for 'collection' strategy", () => {
        const header = generateCacheHeader("collection");
        expect(header).toContain("public");
        expect(header).toContain("max-age=180");
        expect(header).toContain("stale-while-revalidate=1800");
    });

    it("should generate correct header for 'short' strategy", () => {
        const header = generateCacheHeader("short");
        expect(header).toContain("public");
        expect(header).toContain("max-age=1");
        expect(header).toContain("stale-while-revalidate=9");
    });

    it("should generate correct header for 'long' strategy", () => {
        const header = generateCacheHeader("long");
        expect(header).toContain("public");
        expect(header).toContain("max-age=3600");
        expect(header).toContain("stale-while-revalidate=82800");
    });
});

describe("createCustomCacheHeader", () => {
    it("should create header with provided values", () => {
        const header = createCustomCacheHeader({
            mode: "public",
            maxAge: 60,
            staleWhileRevalidate: 300,
        });
        expect(header).toContain("public");
        expect(header).toContain("max-age=60");
        expect(header).toContain("stale-while-revalidate=300");
    });

    it("should use default values when not provided", () => {
        const header = createCustomCacheHeader({});
        expect(header).toContain("public");
        expect(header).toContain("max-age=60");
        expect(header).toContain("stale-while-revalidate=300");
    });

    it("should handle no-store mode", () => {
        const header = createCustomCacheHeader({
            mode: "no-store",
        });
        expect(header).toBe("no-store");
    });

    it("should include staleIfError when provided", () => {
        const header = createCustomCacheHeader({
            mode: "public",
            maxAge: 60,
            staleWhileRevalidate: 300,
            staleIfError: 3600,
        });
        expect(header).toContain("stale-if-error=3600");
    });
});

describe("routeHeaders", () => {
    it("should pass through Cache-Control from loader headers", () => {
        const loaderHeaders = new Headers({
            "Cache-Control": "public, max-age=300",
        });
        const result = routeHeaders({ loaderHeaders });
        expect(result["Cache-Control"]).toBe("public, max-age=300");
    });

    it("should return null Cache-Control if not set in loader headers", () => {
        const loaderHeaders = new Headers();
        const result = routeHeaders({ loaderHeaders });
        expect(result["Cache-Control"]).toBeNull();
    });
});

describe("routeHeadersWithStrategy", () => {
    it("should use loader Cache-Control if present", () => {
        const loaderHeaders = new Headers({
            "Cache-Control": "public, max-age=60",
        });
        const result = routeHeadersWithStrategy({ loaderHeaders }, "product");
        expect(result["Cache-Control"]).toBe("public, max-age=60");
    });

    it("should use strategy default if loader Cache-Control is not set", () => {
        const loaderHeaders = new Headers();
        const result = routeHeadersWithStrategy({ loaderHeaders }, "product");
        expect(result["Cache-Control"]).toContain("public");
        expect(result["Cache-Control"]).toContain("max-age=300");
    });
});

describe("getLoaderCacheHeaders", () => {
    it("should return headers object with Cache-Control for product strategy", () => {
        const headers = getLoaderCacheHeaders("product");
        expect(headers["Cache-Control"]).toContain("public");
        expect(headers["Cache-Control"]).toContain("max-age=300");
        expect(headers["Cache-Control"]).toContain(
            "stale-while-revalidate=3600",
        );
    });

    it("should return headers object with Cache-Control for homepage strategy", () => {
        const headers = getLoaderCacheHeaders("homepage");
        expect(headers["Cache-Control"]).toContain("public");
        expect(headers["Cache-Control"]).toContain("max-age=120");
        expect(headers["Cache-Control"]).toContain(
            "stale-while-revalidate=600",
        );
    });

    it("should return headers object with Cache-Control for collection strategy", () => {
        const headers = getLoaderCacheHeaders("collection");
        expect(headers["Cache-Control"]).toContain("public");
        expect(headers["Cache-Control"]).toContain("max-age=180");
        expect(headers["Cache-Control"]).toContain(
            "stale-while-revalidate=1800",
        );
    });

    it("should return headers object with no-store for none strategy", () => {
        const headers = getLoaderCacheHeaders("none");
        expect(headers["Cache-Control"]).toBe("no-store");
    });
});

describe("SWR header validation", () => {
    it("should have stale-while-revalidate greater than or equal to max-age for all public strategies", () => {
        const publicStrategies: CacheStrategyType[] = [
            "short",
            "medium",
            "long",
            "homepage",
            "product",
            "collection",
            "search",
            "api",
        ];

        for (const strategyType of publicStrategies) {
            const strategy = CACHE_STRATEGIES[strategyType];
            if (strategy.mode !== "no-store") {
                expect(strategy.staleWhileRevalidate).toBeGreaterThanOrEqual(
                    strategy.maxAge,
                );
            }
        }
    });

    it("should have stale-if-error greater than or equal to stale-while-revalidate when defined", () => {
        for (const [_, strategy] of Object.entries(CACHE_STRATEGIES)) {
            const config = strategy as CacheStrategyConfig;
            if (
                config.staleIfError !== undefined &&
                config.mode !== "no-store"
            ) {
                expect(config.staleIfError).toBeGreaterThanOrEqual(
                    config.staleWhileRevalidate,
                );
            }
        }
    });

    it("should ensure product pages have longer cache than homepage", () => {
        expect(CACHE_STRATEGIES.product.maxAge).toBeGreaterThan(
            CACHE_STRATEGIES.homepage.maxAge,
        );
    });

    it("should ensure collection pages have appropriate SWR duration", () => {
        expect(CACHE_STRATEGIES.collection.staleWhileRevalidate).toBe(
            CACHE_DURATIONS.THIRTY_MINUTES,
        );
    });

    it("should ensure search has shortest cache among page routes", () => {
        const pageRoutes = [
            "homepage",
            "product",
            "collection",
            "search",
        ] as const;
        for (const route of pageRoutes) {
            if (route !== "search") {
                expect(CACHE_STRATEGIES[route].maxAge).toBeGreaterThanOrEqual(
                    CACHE_STRATEGIES.search.maxAge,
                );
            }
        }
    });
});
