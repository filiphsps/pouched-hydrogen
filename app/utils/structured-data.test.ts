import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    generateBreadcrumbSchema,
    generateOrganizationSchema,
    generateProductSchema,
    generateWebsiteSchema,
} from "./structured-data";

describe("generateProductSchema", () => {
    const mockProduct = {
        title: "Test Product",
        description: "A great test product",
        seo: {
            description: "SEO optimized description",
        },
        featuredImage: {
            url: "https://example.com/image.jpg",
        },
        vendor: "Test Brand",
    };

    const mockVariant = {
        sku: "TEST-SKU-001",
        price: {
            amount: "29.99",
            currencyCode: "EUR",
        },
        availableForSale: true,
        compareAtPrice: null,
    };

    const mockUrl = "https://pouched.de/products/test-product";

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2024-12-18"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("basic schema structure", () => {
        it("should generate valid JSON-LD context and type", () => {
            const schema = generateProductSchema(
                mockProduct,
                mockVariant,
                mockUrl,
            );
            expect(schema["@context"]).toBe("https://schema.org");
            expect(schema["@type"]).toBe("Product");
        });

        it("should include product name", () => {
            const schema = generateProductSchema(
                mockProduct,
                mockVariant,
                mockUrl,
            );
            expect(schema.name).toBe("Test Product");
        });

        it("should use SEO description when available", () => {
            const schema = generateProductSchema(
                mockProduct,
                mockVariant,
                mockUrl,
            );
            expect(schema.description).toBe("SEO optimized description");
        });

        it("should fall back to product description when no SEO description", () => {
            const productWithoutSeo = { ...mockProduct, seo: null };
            const schema = generateProductSchema(
                productWithoutSeo,
                mockVariant,
                mockUrl,
            );
            expect(schema.description).toBe("A great test product");
        });

        it("should include featured image URL", () => {
            const schema = generateProductSchema(
                mockProduct,
                mockVariant,
                mockUrl,
            );
            expect(schema.image).toBe("https://example.com/image.jpg");
        });

        it("should handle product without featured image", () => {
            const productNoImage = { ...mockProduct, featuredImage: null };
            const schema = generateProductSchema(
                productNoImage,
                mockVariant,
                mockUrl,
            );
            expect(schema.image).toBeUndefined();
        });
    });

    describe("brand information", () => {
        it("should include brand with correct type", () => {
            const schema = generateProductSchema(
                mockProduct,
                mockVariant,
                mockUrl,
            );
            expect(schema.brand["@type"]).toBe("Brand");
            expect(schema.brand.name).toBe("Test Brand");
        });
    });

    describe("SKU handling", () => {
        it("should include variant SKU", () => {
            const schema = generateProductSchema(
                mockProduct,
                mockVariant,
                mockUrl,
            );
            expect(schema.sku).toBe("TEST-SKU-001");
        });

        it("should return empty string when variant has no SKU", () => {
            const variantNoSku = { ...mockVariant, sku: null };
            const schema = generateProductSchema(
                mockProduct,
                variantNoSku,
                mockUrl,
            );
            expect(schema.sku).toBe("");
        });

        it("should return empty string when no variant provided", () => {
            const schema = generateProductSchema(mockProduct, null, mockUrl);
            expect(schema.sku).toBe("");
        });
    });

    describe("offers schema", () => {
        it("should include offers when variant is provided", () => {
            const schema = generateProductSchema(
                mockProduct,
                mockVariant,
                mockUrl,
            );
            expect(schema.offers).toBeDefined();
            expect(schema.offers["@type"]).toBe("Offer");
        });

        it("should include correct URL in offers", () => {
            const schema = generateProductSchema(
                mockProduct,
                mockVariant,
                mockUrl,
            );
            expect(schema.offers.url).toBe(mockUrl);
        });

        it("should include price and currency", () => {
            const schema = generateProductSchema(
                mockProduct,
                mockVariant,
                mockUrl,
            );
            expect(schema.offers.price).toBe("29.99");
            expect(schema.offers.priceCurrency).toBe("EUR");
        });

        it("should set availability to InStock when available", () => {
            const schema = generateProductSchema(
                mockProduct,
                mockVariant,
                mockUrl,
            );
            expect(schema.offers.availability).toBe(
                "https://schema.org/InStock",
            );
        });

        it("should set availability to OutOfStock when not available", () => {
            const unavailableVariant = {
                ...mockVariant,
                availableForSale: false,
            };
            const schema = generateProductSchema(
                mockProduct,
                unavailableVariant,
                mockUrl,
            );
            expect(schema.offers.availability).toBe(
                "https://schema.org/OutOfStock",
            );
        });

        it("should set priceValidUntil 30 days in the future", () => {
            const schema = generateProductSchema(
                mockProduct,
                mockVariant,
                mockUrl,
            );
            expect(schema.offers.priceValidUntil).toBe("2025-01-17");
        });

        it("should not include offers when variant is null", () => {
            const schema = generateProductSchema(mockProduct, null, mockUrl);
            expect(schema.offers).toBeUndefined();
        });
    });

    describe("price specification", () => {
        it("should include priceSpecification when compareAtPrice exists", () => {
            const variantWithCompare = {
                ...mockVariant,
                compareAtPrice: { amount: "39.99", currencyCode: "EUR" },
            };
            const schema = generateProductSchema(
                mockProduct,
                variantWithCompare,
                mockUrl,
            );
            expect(schema.offers.priceSpecification).toBeDefined();
            expect(schema.offers.priceSpecification["@type"]).toBe(
                "PriceSpecification",
            );
            expect(schema.offers.priceSpecification.price).toBe("29.99");
            expect(schema.offers.priceSpecification.priceCurrency).toBe("EUR");
        });

        it("should not include priceSpecification when no compareAtPrice", () => {
            const schema = generateProductSchema(
                mockProduct,
                mockVariant,
                mockUrl,
            );
            expect(schema.offers.priceSpecification).toBeUndefined();
        });
    });
});

describe("generateBreadcrumbSchema", () => {
    describe("basic structure", () => {
        it("should generate valid JSON-LD context and type", () => {
            const breadcrumbs = [{ name: "Home", url: "https://pouched.de" }];
            const schema = generateBreadcrumbSchema(breadcrumbs);
            expect(schema["@context"]).toBe("https://schema.org");
            expect(schema["@type"]).toBe("BreadcrumbList");
        });

        it("should return empty itemListElement for empty breadcrumbs", () => {
            const schema = generateBreadcrumbSchema([]);
            expect(schema.itemListElement).toEqual([]);
        });
    });

    describe("itemListElement generation", () => {
        it("should generate single breadcrumb item", () => {
            const breadcrumbs = [{ name: "Home", url: "https://pouched.de" }];
            const schema = generateBreadcrumbSchema(breadcrumbs);

            expect(schema.itemListElement).toHaveLength(1);
            expect(schema.itemListElement[0]["@type"]).toBe("ListItem");
            expect(schema.itemListElement[0].position).toBe(1);
            expect(schema.itemListElement[0].name).toBe("Home");
            expect(schema.itemListElement[0].item).toBe("https://pouched.de");
        });

        it("should generate multiple breadcrumb items with correct positions", () => {
            const breadcrumbs = [
                { name: "Home", url: "https://pouched.de" },
                { name: "Products", url: "https://pouched.de/products" },
                { name: "Velo", url: "https://pouched.de/products/velo" },
            ];
            const schema = generateBreadcrumbSchema(breadcrumbs);

            expect(schema.itemListElement).toHaveLength(3);
            expect(schema.itemListElement[0].position).toBe(1);
            expect(schema.itemListElement[1].position).toBe(2);
            expect(schema.itemListElement[2].position).toBe(3);
        });

        it("should preserve breadcrumb names and URLs", () => {
            const breadcrumbs = [
                { name: "Startseite", url: "https://pouched.de/de" },
                {
                    name: "Kollektionen",
                    url: "https://pouched.de/de/collections",
                },
            ];
            const schema = generateBreadcrumbSchema(breadcrumbs);

            expect(schema.itemListElement[0].name).toBe("Startseite");
            expect(schema.itemListElement[0].item).toBe(
                "https://pouched.de/de",
            );
            expect(schema.itemListElement[1].name).toBe("Kollektionen");
            expect(schema.itemListElement[1].item).toBe(
                "https://pouched.de/de/collections",
            );
        });
    });
});

describe("generateOrganizationSchema", () => {
    const shopName = "Pouched";
    const shopUrl = "https://pouched.de";

    describe("basic structure", () => {
        it("should generate valid JSON-LD context and type", () => {
            const schema = generateOrganizationSchema(shopName, shopUrl);
            expect(schema["@context"]).toBe("https://schema.org");
            expect(schema["@type"]).toBe("Organization");
        });

        it("should include organization name", () => {
            const schema = generateOrganizationSchema(shopName, shopUrl);
            expect(schema.name).toBe("Pouched");
        });

        it("should include organization URL", () => {
            const schema = generateOrganizationSchema(shopName, shopUrl);
            expect(schema.url).toBe("https://pouched.de");
        });
    });

    describe("logo URL", () => {
        it("should generate logo URL based on shop URL", () => {
            const schema = generateOrganizationSchema(shopName, shopUrl);
            expect(schema.logo).toBe("https://pouched.de/logo.png");
        });

        it("should handle shop URL without trailing slash", () => {
            const schema = generateOrganizationSchema(
                shopName,
                "https://example.com",
            );
            expect(schema.logo).toBe("https://example.com/logo.png");
        });
    });

    describe("sameAs array", () => {
        it("should include empty sameAs array by default", () => {
            const schema = generateOrganizationSchema(shopName, shopUrl);
            expect(schema.sameAs).toBeDefined();
            expect(Array.isArray(schema.sameAs)).toBe(true);
            expect(schema.sameAs).toHaveLength(0);
        });
    });
});

describe("generateWebsiteSchema", () => {
    const shopName = "Pouched";
    const shopUrl = "https://pouched.de";

    describe("basic structure", () => {
        it("should generate valid JSON-LD context and type", () => {
            const schema = generateWebsiteSchema(shopName, shopUrl);
            expect(schema["@context"]).toBe("https://schema.org");
            expect(schema["@type"]).toBe("WebSite");
        });

        it("should include website name", () => {
            const schema = generateWebsiteSchema(shopName, shopUrl);
            expect(schema.name).toBe("Pouched");
        });

        it("should include website URL", () => {
            const schema = generateWebsiteSchema(shopName, shopUrl);
            expect(schema.url).toBe("https://pouched.de");
        });
    });

    describe("potentialAction (SearchAction)", () => {
        it("should include potentialAction with SearchAction type", () => {
            const schema = generateWebsiteSchema(shopName, shopUrl);
            expect(schema.potentialAction).toBeDefined();
            expect(schema.potentialAction["@type"]).toBe("SearchAction");
        });

        it("should include target with EntryPoint type", () => {
            const schema = generateWebsiteSchema(shopName, shopUrl);
            expect(schema.potentialAction.target["@type"]).toBe("EntryPoint");
        });

        it("should generate correct search URL template", () => {
            const schema = generateWebsiteSchema(shopName, shopUrl);
            expect(schema.potentialAction.target.urlTemplate).toBe(
                "https://pouched.de/search?q={search_term_string}",
            );
        });

        it("should include correct query-input specification", () => {
            const schema = generateWebsiteSchema(shopName, shopUrl);
            expect(schema.potentialAction["query-input"]).toBe(
                "required name=search_term_string",
            );
        });
    });

    describe("with different URLs", () => {
        it("should handle URLs with different domains", () => {
            const schema = generateWebsiteSchema(
                "Test Shop",
                "https://test.shop",
            );
            expect(schema.potentialAction.target.urlTemplate).toBe(
                "https://test.shop/search?q={search_term_string}",
            );
        });

        it("should handle localized URLs", () => {
            const schema = generateWebsiteSchema(
                "Pouched DE",
                "https://pouched.de",
            );
            expect(schema.url).toBe("https://pouched.de");
            expect(schema.potentialAction.target.urlTemplate).toContain(
                "pouched.de/search",
            );
        });
    });
});
