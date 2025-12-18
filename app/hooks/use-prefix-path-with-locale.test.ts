/**
 * Tests for usePrefixPathWithLocale hook.
 * Tests path prefixing with locale-based path prefixes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-router
const mockRouteLoaderData: Record<string, unknown> = {};

vi.mock("react-router", () => ({
    useRouteLoaderData: (routeId: string) => mockRouteLoaderData[routeId],
}));

// Mock constants - need to match the actual DEFAULT_LOCALE structure
vi.mock("~/utils/const", () => ({
    DEFAULT_LOCALE: {
        label: "Deutschland (EUR €)",
        language: "DE",
        country: "DE",
        currency: "EUR",
        pathPrefix: "",
    },
}));

import { renderHook } from "@testing-library/react";
import { usePrefixPathWithLocale } from "./use-prefix-path-with-locale";

describe("usePrefixPathWithLocale", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mock data
        for (const key of Object.keys(mockRouteLoaderData)) {
            delete mockRouteLoaderData[key];
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("with locale prefix", () => {
        it("should prefix path with locale pathPrefix", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/en",
                    language: "EN",
                    country: "GB",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/products"),
            );

            expect(result.current).toBe("/en/products");
        });

        it("should handle path without leading slash", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/en",
                    language: "EN",
                    country: "GB",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("products"),
            );

            expect(result.current).toBe("/en/products");
        });

        it("should handle various locale prefixes", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/de-at",
                    language: "DE",
                    country: "AT",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/collections/all"),
            );

            expect(result.current).toBe("/de-at/collections/all");
        });
    });

    describe("without locale prefix (default locale)", () => {
        it("should return path with default empty prefix", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "",
                    language: "DE",
                    country: "DE",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/products"),
            );

            expect(result.current).toBe("/products");
        });

        it("should add leading slash to path without prefix", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "",
                    language: "DE",
                    country: "DE",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("cart"),
            );

            expect(result.current).toBe("/cart");
        });
    });

    describe("fallback to DEFAULT_LOCALE", () => {
        it("should use DEFAULT_LOCALE when root data is undefined", () => {
            mockRouteLoaderData.root = undefined;

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/products"),
            );

            // DEFAULT_LOCALE has empty pathPrefix
            expect(result.current).toBe("/products");
        });

        it("should use DEFAULT_LOCALE when selectedLocale is undefined", () => {
            mockRouteLoaderData.root = {};

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/about"),
            );

            expect(result.current).toBe("/about");
        });

        it("should use DEFAULT_LOCALE when selectedLocale is null", () => {
            mockRouteLoaderData.root = { selectedLocale: null };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/contact"),
            );

            expect(result.current).toBe("/contact");
        });
    });

    describe("edge cases", () => {
        it("should handle root path", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/en",
                    language: "EN",
                    country: "GB",
                },
            };

            const { result } = renderHook(() => usePrefixPathWithLocale("/"));

            expect(result.current).toBe("/en/");
        });

        it("should handle empty path", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/en",
                    language: "EN",
                    country: "GB",
                },
            };

            const { result } = renderHook(() => usePrefixPathWithLocale(""));

            expect(result.current).toBe("/en/");
        });

        it("should handle paths with query strings", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/fr",
                    language: "FR",
                    country: "FR",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/search?q=snus"),
            );

            expect(result.current).toBe("/fr/search?q=snus");
        });

        it("should handle paths with hash fragments", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/de",
                    language: "DE",
                    country: "DE",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/products#featured"),
            );

            expect(result.current).toBe("/de/products#featured");
        });

        it("should handle complex paths", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/en-us",
                    language: "EN",
                    country: "US",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale(
                    "/collections/nicotine-pouches/filter?vendor=zyn&sort=price-asc#results",
                ),
            );

            expect(result.current).toBe(
                "/en-us/collections/nicotine-pouches/filter?vendor=zyn&sort=price-asc#results",
            );
        });
    });

    describe("hook updates", () => {
        it("should return new path when path prop changes", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/en",
                    language: "EN",
                    country: "GB",
                },
            };

            const { result, rerender } = renderHook(
                ({ path }) => usePrefixPathWithLocale(path),
                { initialProps: { path: "/products" } },
            );

            expect(result.current).toBe("/en/products");

            rerender({ path: "/collections" });

            expect(result.current).toBe("/en/collections");
        });
    });

    describe("common use cases", () => {
        it("should prefix product page path", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/de",
                    language: "DE",
                    country: "DE",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/products/zyn-cool-mint"),
            );

            expect(result.current).toBe("/de/products/zyn-cool-mint");
        });

        it("should prefix collection page path", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/en",
                    language: "EN",
                    country: "GB",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/collections/all-snus"),
            );

            expect(result.current).toBe("/en/collections/all-snus");
        });

        it("should prefix cart path", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/fr",
                    language: "FR",
                    country: "FR",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/cart"),
            );

            expect(result.current).toBe("/fr/cart");
        });

        it("should prefix account path", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/es",
                    language: "ES",
                    country: "ES",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/account"),
            );

            expect(result.current).toBe("/es/account");
        });

        it("should prefix search path with query", () => {
            mockRouteLoaderData.root = {
                selectedLocale: {
                    pathPrefix: "/it",
                    language: "IT",
                    country: "IT",
                },
            };

            const { result } = renderHook(() =>
                usePrefixPathWithLocale("/search?q=mint"),
            );

            expect(result.current).toBe("/it/search?q=mint");
        });
    });
});
