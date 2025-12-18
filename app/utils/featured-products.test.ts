import { describe, expect, it, vi } from "vitest";
import {
    FEATURED_PRODUCTS_QUERY,
    getFeaturedProducts,
} from "./featured-products";

// Mock tiny-invariant
vi.mock("tiny-invariant", () => ({
    default: (condition: unknown, message: string) => {
        if (!condition) {
            throw new Error(message);
        }
    },
}));

describe("getFeaturedProducts", () => {
    const mockProducts = {
        featuredProducts: {
            nodes: [
                { id: "product-1", title: "Product 1" },
                { id: "product-2", title: "Product 2" },
            ],
        },
    };

    it("should call storefront.query with correct query", async () => {
        const mockStorefront = {
            query: vi.fn().mockResolvedValue(mockProducts),
            i18n: {
                country: "DE",
                language: "DE",
            },
        };

        await getFeaturedProducts(mockStorefront as any);

        expect(mockStorefront.query).toHaveBeenCalledWith(
            FEATURED_PRODUCTS_QUERY,
            expect.objectContaining({
                variables: expect.objectContaining({
                    pageBy: 16,
                    country: "DE",
                    language: "DE",
                }),
            }),
        );
    });

    it("should pass correct variables including country and language", async () => {
        const mockStorefront = {
            query: vi.fn().mockResolvedValue(mockProducts),
            i18n: {
                country: "US",
                language: "EN",
            },
        };

        await getFeaturedProducts(mockStorefront as any);

        const callArgs = mockStorefront.query.mock.calls[0][1];
        expect(callArgs.variables.country).toBe("US");
        expect(callArgs.variables.language).toBe("EN");
        expect(callArgs.variables.pageBy).toBe(16);
    });

    it("should return featured products data on success", async () => {
        const mockStorefront = {
            query: vi.fn().mockResolvedValue(mockProducts),
            i18n: {
                country: "DE",
                language: "DE",
            },
        };

        const result = await getFeaturedProducts(mockStorefront as any);

        expect(result).toEqual(mockProducts);
    });

    it("should throw error when no data returned", async () => {
        const mockStorefront = {
            query: vi.fn().mockResolvedValue(null),
            i18n: {
                country: "DE",
                language: "DE",
            },
        };

        await expect(
            getFeaturedProducts(mockStorefront as any),
        ).rejects.toThrow(
            "No featured products data returned from Shopify API",
        );
    });

    it("should throw error when undefined data returned", async () => {
        const mockStorefront = {
            query: vi.fn().mockResolvedValue(undefined),
            i18n: {
                country: "DE",
                language: "DE",
            },
        };

        await expect(
            getFeaturedProducts(mockStorefront as any),
        ).rejects.toThrow(
            "No featured products data returned from Shopify API",
        );
    });

    it("should pass query filter for combined listings", async () => {
        const mockStorefront = {
            query: vi.fn().mockResolvedValue(mockProducts),
            i18n: {
                country: "DE",
                language: "DE",
            },
        };

        await getFeaturedProducts(mockStorefront as any);

        const callArgs = mockStorefront.query.mock.calls[0][1];
        // maybeFilterOutCombinedListingsQuery is imported from combined-listings
        expect(callArgs.variables).toHaveProperty("query");
    });
});

describe("FEATURED_PRODUCTS_QUERY", () => {
    it("should be a valid GraphQL query string", () => {
        expect(typeof FEATURED_PRODUCTS_QUERY).toBe("string");
        expect(FEATURED_PRODUCTS_QUERY).toContain("#graphql");
    });

    it("should include featuredProducts query", () => {
        expect(FEATURED_PRODUCTS_QUERY).toContain("featuredProducts");
    });

    it("should query products sorted by BEST_SELLING", () => {
        expect(FEATURED_PRODUCTS_QUERY).toContain("sortKey: BEST_SELLING");
    });

    it("should include country and language context", () => {
        expect(FEATURED_PRODUCTS_QUERY).toContain("$country: CountryCode");
        expect(FEATURED_PRODUCTS_QUERY).toContain("$language: LanguageCode");
        expect(FEATURED_PRODUCTS_QUERY).toContain("@inContext");
    });

    it("should include pageBy variable with default of 16", () => {
        expect(FEATURED_PRODUCTS_QUERY).toContain("$pageBy: Int = 16");
        expect(FEATURED_PRODUCTS_QUERY).toContain("first: $pageBy");
    });

    it("should include query variable for filtering", () => {
        expect(FEATURED_PRODUCTS_QUERY).toContain("$query: String");
        expect(FEATURED_PRODUCTS_QUERY).toContain("query: $query");
    });

    it("should include ProductCard fragment", () => {
        expect(FEATURED_PRODUCTS_QUERY).toContain("...ProductCard");
    });
});
