/**
 * Tests for usePredictiveSearch hook.
 * Tests fetcher-based predictive search result handling.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-router fetchers
let mockFetchers: Array<{
    state: string;
    data?: { searchResults?: unknown; [key: string]: unknown };
    formData?: FormData;
}> = [];

vi.mock("react-router", () => ({
    useFetchers: () => mockFetchers,
}));

import { renderHook } from "@testing-library/react";
import type { NormalizedPredictiveSearchResults } from "~/types/predictive-search";
import {
    NO_PREDICTIVE_SEARCH_RESULTS,
    usePredictiveSearch,
} from "./use-predictive-search";

describe("usePredictiveSearch", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFetchers = [];
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("NO_PREDICTIVE_SEARCH_RESULTS constant", () => {
        it("should have correct structure", () => {
            expect(NO_PREDICTIVE_SEARCH_RESULTS).toHaveLength(5);
            expect(NO_PREDICTIVE_SEARCH_RESULTS[0]).toEqual({
                type: "queries",
                items: [],
            });
            expect(NO_PREDICTIVE_SEARCH_RESULTS[1]).toEqual({
                type: "products",
                items: [],
            });
            expect(NO_PREDICTIVE_SEARCH_RESULTS[2]).toEqual({
                type: "collections",
                items: [],
            });
            expect(NO_PREDICTIVE_SEARCH_RESULTS[3]).toEqual({
                type: "pages",
                items: [],
            });
            expect(NO_PREDICTIVE_SEARCH_RESULTS[4]).toEqual({
                type: "articles",
                items: [],
            });
        });
    });

    describe("initial state", () => {
        it("should return empty results when no fetchers exist", () => {
            mockFetchers = [];

            const { result } = renderHook(() => usePredictiveSearch());

            expect(result.current.results).toEqual(
                NO_PREDICTIVE_SEARCH_RESULTS,
            );
            expect(result.current.totalResults).toBe(0);
        });

        it("should return empty searchTerm ref initially", () => {
            mockFetchers = [];

            const { result } = renderHook(() => usePredictiveSearch());

            expect(result.current.searchTerm.current).toBe("");
        });
    });

    describe("fetcher with search results", () => {
        it("should return search results from fetcher", () => {
            const mockResults: NormalizedPredictiveSearchResults = [
                { type: "queries", items: [] },
                {
                    type: "products",
                    items: [
                        {
                            id: "product-1",
                            handle: "test-product",
                            title: "Test Product",
                            url: "/products/test-product",
                            vendor: "Test Vendor",
                        },
                    ],
                },
                { type: "collections", items: [] },
                { type: "pages", items: [] },
                { type: "articles", items: [] },
            ];

            mockFetchers = [
                {
                    state: "idle",
                    data: {
                        searchResults: {
                            results: mockResults,
                            totalResults: 1,
                        },
                    },
                },
            ];

            const { result } = renderHook(() => usePredictiveSearch());

            expect(result.current.results).toEqual(mockResults);
            expect(result.current.totalResults).toBe(1);
        });

        it("should find search fetcher among multiple fetchers", () => {
            const mockResults: NormalizedPredictiveSearchResults = [
                { type: "queries", items: [] },
                {
                    type: "products",
                    items: [
                        {
                            id: "product-1",
                            handle: "snus",
                            title: "Snus Product",
                            url: "/products/snus",
                            vendor: "Brand",
                        },
                    ],
                },
                { type: "collections", items: [] },
                { type: "pages", items: [] },
                { type: "articles", items: [] },
            ];

            mockFetchers = [
                { state: "idle", data: { otherData: "something" } },
                {
                    state: "idle",
                    data: {
                        searchResults: {
                            results: mockResults,
                            totalResults: 1,
                        },
                    },
                },
                { state: "idle", data: {} },
            ];

            const { result } = renderHook(() => usePredictiveSearch());

            expect(result.current.results).toEqual(mockResults);
        });

        it("should handle fetcher without searchResults data", () => {
            mockFetchers = [
                { state: "idle", data: { otherData: "something" } },
            ];

            const { result } = renderHook(() => usePredictiveSearch());

            expect(result.current.results).toEqual(
                NO_PREDICTIVE_SEARCH_RESULTS,
            );
        });
    });

    describe("loading state", () => {
        it("should capture searchTerm from formData when fetcher is loading", () => {
            const formData = new FormData();
            formData.set("q", "snus mint");

            mockFetchers = [
                {
                    state: "loading",
                    data: { searchResults: {} },
                    formData,
                },
            ];

            const { result } = renderHook(() => usePredictiveSearch());

            expect(result.current.searchTerm.current).toBe("snus mint");
        });

        it("should handle empty formData query", () => {
            const formData = new FormData();

            mockFetchers = [
                {
                    state: "loading",
                    data: { searchResults: {} },
                    formData,
                },
            ];

            const { result } = renderHook(() => usePredictiveSearch());

            expect(result.current.searchTerm.current).toBe("");
        });

        it("should not update searchTerm when fetcher is idle", () => {
            const formData = new FormData();
            formData.set("q", "should not capture");

            mockFetchers = [
                {
                    state: "idle",
                    data: { searchResults: {} },
                    formData,
                },
            ];

            const { result } = renderHook(() => usePredictiveSearch());

            // Should remain empty since fetcher is idle
            expect(result.current.searchTerm.current).toBe("");
        });
    });

    describe("result types", () => {
        it("should handle query suggestions", () => {
            const mockResults: NormalizedPredictiveSearchResults = [
                {
                    type: "queries",
                    items: [
                        {
                            id: "query-1",
                            handle: "snus",
                            title: "snus",
                            url: "/search?q=snus",
                            vendor: "",
                            __typename: "SearchQuerySuggestion",
                        },
                    ],
                },
                { type: "products", items: [] },
                { type: "collections", items: [] },
                { type: "pages", items: [] },
                { type: "articles", items: [] },
            ];

            mockFetchers = [
                {
                    state: "idle",
                    data: {
                        searchResults: {
                            results: mockResults,
                            totalResults: 1,
                        },
                    },
                },
            ];

            const { result } = renderHook(() => usePredictiveSearch());

            expect(result.current.results[0].items).toHaveLength(1);
            expect(result.current.results[0].items[0].__typename).toBe(
                "SearchQuerySuggestion",
            );
        });

        it("should handle products with full data", () => {
            const mockResults: NormalizedPredictiveSearchResults = [
                { type: "queries", items: [] },
                {
                    type: "products",
                    items: [
                        {
                            id: "gid://shopify/Product/123",
                            handle: "zyn-cool-mint",
                            title: "ZYN Cool Mint",
                            url: "/products/zyn-cool-mint",
                            vendor: "ZYN",
                            __typename: "Product",
                            price: { amount: "5.99", currencyCode: "EUR" },
                            compareAtPrice: {
                                amount: "6.99",
                                currencyCode: "EUR",
                            },
                            image: {
                                url: "https://cdn.shopify.com/image.jpg",
                                altText: "ZYN Cool Mint",
                                width: 400,
                                height: 400,
                            },
                        },
                    ],
                },
                { type: "collections", items: [] },
                { type: "pages", items: [] },
                { type: "articles", items: [] },
            ];

            mockFetchers = [
                {
                    state: "idle",
                    data: {
                        searchResults: {
                            results: mockResults,
                            totalResults: 1,
                        },
                    },
                },
            ];

            const { result } = renderHook(() => usePredictiveSearch());

            const productResults = result.current.results.find(
                (r) => r.type === "products",
            );
            expect(productResults?.items).toHaveLength(1);
            expect(productResults?.items[0].price).toBeDefined();
            expect(productResults?.items[0].compareAtPrice).toBeDefined();
            expect(productResults?.items[0].image).toBeDefined();
        });

        it("should handle collections", () => {
            const mockResults: NormalizedPredictiveSearchResults = [
                { type: "queries", items: [] },
                { type: "products", items: [] },
                {
                    type: "collections",
                    items: [
                        {
                            id: "gid://shopify/Collection/456",
                            handle: "all-snus",
                            title: "All Snus",
                            url: "/collections/all-snus",
                            vendor: "",
                            image: {
                                url: "https://cdn.shopify.com/collection.jpg",
                                altText: "All Snus Collection",
                                width: 800,
                                height: 400,
                            },
                        },
                    ],
                },
                { type: "pages", items: [] },
                { type: "articles", items: [] },
            ];

            mockFetchers = [
                {
                    state: "idle",
                    data: {
                        searchResults: {
                            results: mockResults,
                            totalResults: 1,
                        },
                    },
                },
            ];

            const { result } = renderHook(() => usePredictiveSearch());

            const collectionResults = result.current.results.find(
                (r) => r.type === "collections",
            );
            expect(collectionResults?.items).toHaveLength(1);
        });

        it("should handle articles", () => {
            const mockResults: NormalizedPredictiveSearchResults = [
                { type: "queries", items: [] },
                { type: "products", items: [] },
                { type: "collections", items: [] },
                { type: "pages", items: [] },
                {
                    type: "articles",
                    items: [
                        {
                            id: "gid://shopify/Article/789",
                            handle: "what-is-snus",
                            title: "What is Snus?",
                            url: "/blogs/news/what-is-snus",
                            vendor: "",
                            __typename: "Article",
                            image: {
                                url: "https://cdn.shopify.com/article.jpg",
                                altText: "Article Image",
                                width: 600,
                                height: 400,
                            },
                        },
                    ],
                },
            ];

            mockFetchers = [
                {
                    state: "idle",
                    data: {
                        searchResults: {
                            results: mockResults,
                            totalResults: 1,
                        },
                    },
                },
            ];

            const { result } = renderHook(() => usePredictiveSearch());

            const articleResults = result.current.results.find(
                (r) => r.type === "articles",
            );
            expect(articleResults?.items).toHaveLength(1);
        });

        it("should handle pages", () => {
            const mockResults: NormalizedPredictiveSearchResults = [
                { type: "queries", items: [] },
                { type: "products", items: [] },
                { type: "collections", items: [] },
                {
                    type: "pages",
                    items: [
                        {
                            id: "gid://shopify/Page/101",
                            handle: "about-us",
                            title: "About Us",
                            url: "/pages/about-us",
                            vendor: "",
                        },
                    ],
                },
                { type: "articles", items: [] },
            ];

            mockFetchers = [
                {
                    state: "idle",
                    data: {
                        searchResults: {
                            results: mockResults,
                            totalResults: 1,
                        },
                    },
                },
            ];

            const { result } = renderHook(() => usePredictiveSearch());

            const pageResults = result.current.results.find(
                (r) => r.type === "pages",
            );
            expect(pageResults?.items).toHaveLength(1);
        });
    });

    describe("totalResults", () => {
        it("should return correct totalResults count", () => {
            const mockResults: NormalizedPredictiveSearchResults = [
                {
                    type: "queries",
                    items: [
                        {
                            id: "q1",
                            handle: "",
                            title: "",
                            url: "",
                            vendor: "",
                        },
                    ],
                },
                {
                    type: "products",
                    items: [
                        {
                            id: "p1",
                            handle: "",
                            title: "",
                            url: "",
                            vendor: "",
                        },
                        {
                            id: "p2",
                            handle: "",
                            title: "",
                            url: "",
                            vendor: "",
                        },
                    ],
                },
                {
                    type: "collections",
                    items: [
                        {
                            id: "c1",
                            handle: "",
                            title: "",
                            url: "",
                            vendor: "",
                        },
                    ],
                },
                { type: "pages", items: [] },
                { type: "articles", items: [] },
            ];

            mockFetchers = [
                {
                    state: "idle",
                    data: {
                        searchResults: {
                            results: mockResults,
                            totalResults: 4,
                        },
                    },
                },
            ];

            const { result } = renderHook(() => usePredictiveSearch());

            expect(result.current.totalResults).toBe(4);
        });

        it("should return 0 when no results", () => {
            mockFetchers = [];

            const { result } = renderHook(() => usePredictiveSearch());

            expect(result.current.totalResults).toBe(0);
        });
    });

    describe("hook stability", () => {
        it("should preserve searchTerm ref across rerenders", () => {
            const formData = new FormData();
            formData.set("q", "test search");

            mockFetchers = [
                {
                    state: "loading",
                    data: { searchResults: {} },
                    formData,
                },
            ];

            const { result, rerender } = renderHook(() =>
                usePredictiveSearch(),
            );

            const firstRef = result.current.searchTerm;
            rerender();
            const secondRef = result.current.searchTerm;

            // Ref should be stable
            expect(firstRef).toBe(secondRef);
        });
    });
});
