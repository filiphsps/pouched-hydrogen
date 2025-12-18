import { describe, expect, it } from "vitest";
import {
    COMBINED_LISTINGS_CONFIGS,
    isCombinedListing,
    maybeFilterOutCombinedListingsQuery,
} from "./combined-listings";

describe("COMBINED_LISTINGS_CONFIGS", () => {
    it("should have redirectToFirstVariant config", () => {
        expect(COMBINED_LISTINGS_CONFIGS).toHaveProperty(
            "redirectToFirstVariant",
        );
        expect(typeof COMBINED_LISTINGS_CONFIGS.redirectToFirstVariant).toBe(
            "boolean",
        );
    });

    it("should have combinedListingTag config", () => {
        expect(COMBINED_LISTINGS_CONFIGS).toHaveProperty("combinedListingTag");
        expect(typeof COMBINED_LISTINGS_CONFIGS.combinedListingTag).toBe(
            "string",
        );
        expect(COMBINED_LISTINGS_CONFIGS.combinedListingTag).toBe("combined");
    });

    it("should have hideCombinedListingsFromProductList config", () => {
        expect(COMBINED_LISTINGS_CONFIGS).toHaveProperty(
            "hideCombinedListingsFromProductList",
        );
        expect(
            typeof COMBINED_LISTINGS_CONFIGS.hideCombinedListingsFromProductList,
        ).toBe("boolean");
    });

    it("should default redirectToFirstVariant to false", () => {
        expect(COMBINED_LISTINGS_CONFIGS.redirectToFirstVariant).toBe(false);
    });

    it("should default hideCombinedListingsFromProductList to false", () => {
        expect(
            COMBINED_LISTINGS_CONFIGS.hideCombinedListingsFromProductList,
        ).toBe(false);
    });
});

describe("maybeFilterOutCombinedListingsQuery", () => {
    it("should be a string", () => {
        expect(typeof maybeFilterOutCombinedListingsQuery).toBe("string");
    });

    it("should be empty when hideCombinedListingsFromProductList is false", () => {
        // Based on current config (hideCombinedListingsFromProductList: false)
        if (!COMBINED_LISTINGS_CONFIGS.hideCombinedListingsFromProductList) {
            expect(maybeFilterOutCombinedListingsQuery).toBe("");
        }
    });

    it("should contain NOT tag filter when hideCombinedListingsFromProductList is true", () => {
        // This test documents the expected behavior when the config is enabled
        // Currently it's disabled, so we verify the empty string case
        if (COMBINED_LISTINGS_CONFIGS.hideCombinedListingsFromProductList) {
            expect(maybeFilterOutCombinedListingsQuery).toContain("NOT tag:");
            expect(maybeFilterOutCombinedListingsQuery).toContain(
                COMBINED_LISTINGS_CONFIGS.combinedListingTag,
            );
        } else {
            expect(maybeFilterOutCombinedListingsQuery).toBe("");
        }
    });
});

describe("isCombinedListing", () => {
    const combinedTag = COMBINED_LISTINGS_CONFIGS.combinedListingTag;

    describe("valid product objects", () => {
        it("should return true for product with combined tag", () => {
            const product = { tags: [combinedTag] };
            expect(isCombinedListing(product)).toBe(true);
        });

        it("should return true when combined tag is among other tags", () => {
            const product = { tags: ["sale", combinedTag, "featured"] };
            expect(isCombinedListing(product)).toBe(true);
        });

        it("should return false for product without combined tag", () => {
            const product = { tags: ["sale", "featured", "new"] };
            expect(isCombinedListing(product)).toBe(false);
        });

        it("should return false for product with empty tags array", () => {
            const product = { tags: [] };
            expect(isCombinedListing(product)).toBe(false);
        });

        it("should be case-sensitive for tag matching", () => {
            const product = { tags: ["Combined", "COMBINED"] };
            expect(isCombinedListing(product)).toBe(false);
        });
    });

    describe("invalid inputs", () => {
        it("should return false for null", () => {
            expect(isCombinedListing(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isCombinedListing(undefined)).toBe(false);
        });

        it("should return false for empty object", () => {
            expect(isCombinedListing({})).toBe(false);
        });

        it("should return false for object without tags property", () => {
            const product = { title: "Test Product", price: 10 };
            expect(isCombinedListing(product)).toBe(false);
        });

        it("should return false when tags is not an array", () => {
            const product = { tags: "combined" };
            expect(isCombinedListing(product)).toBe(false);
        });

        it("should return false for string input", () => {
            expect(isCombinedListing("combined")).toBe(false);
        });

        it("should return false for number input", () => {
            expect(isCombinedListing(123)).toBe(false);
        });

        it("should return false for array input", () => {
            expect(isCombinedListing([combinedTag])).toBe(false);
        });

        it("should return false when tags contains non-strings", () => {
            const product = { tags: [123, null, undefined] };
            expect(isCombinedListing(product)).toBe(false);
        });
    });

    describe("edge cases", () => {
        it("should handle product with only combined tag", () => {
            const product = { tags: [combinedTag] };
            expect(isCombinedListing(product)).toBe(true);
        });

        it("should handle product with many tags", () => {
            const product = {
                tags: new Array(100).fill("tag").map((t, i) => `${t}-${i}`),
            };
            expect(isCombinedListing(product)).toBe(false);

            product.tags.push(combinedTag);
            expect(isCombinedListing(product)).toBe(true);
        });

        it("should handle product with duplicate combined tags", () => {
            const product = { tags: [combinedTag, combinedTag, combinedTag] };
            expect(isCombinedListing(product)).toBe(true);
        });

        it("should handle product with whitespace in tags", () => {
            const product = { tags: [" combined ", "combined "] };
            expect(isCombinedListing(product)).toBe(false);
        });
    });

    describe("real-world product shapes", () => {
        it("should work with Shopify-like product object", () => {
            const shopifyProduct = {
                id: "gid://shopify/Product/12345",
                title: "Test Product",
                handle: "test-product",
                vendor: "Test Vendor",
                tags: ["sale", combinedTag, "bestseller"],
                variants: {
                    nodes: [],
                },
            };
            expect(isCombinedListing(shopifyProduct)).toBe(true);
        });

        it("should work with minimal product object", () => {
            const minimalProduct = {
                tags: [combinedTag],
            };
            expect(isCombinedListing(minimalProduct)).toBe(true);
        });
    });
});
