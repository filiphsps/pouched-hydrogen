import type { LoaderFunctionArgs } from "react-router";

vi.mock("~/weaverse", () => ({
    WeaverseContent: () => null,
}));

import { beforeEach, describe, expect, it, vi } from "vitest";
import { loader } from "./list";

describe("Product List Loader", () => {
    const mockStorefront = {
        query: vi.fn(),
        i18n: { country: "US", language: "en", currency: "USD" },
    };

    const mockWeaverse = {
        loadPage: vi.fn(),
    };

    const mockContext = {
        storefront: mockStorefront,
        weaverse: mockWeaverse,
    };

    const TEST_BASE_URL = "https://example.com";
    const mockRequest = new Request(`${TEST_BASE_URL}/products`);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return products and weaverse data", async () => {
        const mockProducts = {
            nodes: [
                {
                    id: "1",
                    title: "Product 1",
                    priceRange: {
                        minVariantPrice: {
                            amount: "10.00",
                            currencyCode: "USD",
                        },
                    },
                },
            ],
            pageInfo: {},
            productFilters: [],
            totalCount: 1,
        };

        const mockWeaverseData = { page: {} };

        mockStorefront.query.mockResolvedValue({ search: mockProducts });
        mockWeaverse.loadPage.mockResolvedValue(mockWeaverseData);

        const response = await loader({
            request: mockRequest,
            context: mockContext as any,
            params: {},
        } as LoaderFunctionArgs);

        expect(response.products.nodes).toHaveLength(1);
        expect(response.products.nodes[0].title).toBe("Product 1");
        expect(response.weaverseData).toEqual(mockWeaverseData);
        expect(mockStorefront.query).toHaveBeenCalled();
        expect(mockWeaverse.loadPage).toHaveBeenCalled();
    });

    it("should handle filters correctly", async () => {
        const requestWithFilters = new Request(
            `${TEST_BASE_URL}/products?filter.price=%7B%22min%22%3A10%2C%22max%22%3A100%7D`,
        );

        mockStorefront.query.mockResolvedValue({
            search: {
                nodes: [],
                productFilters: [
                    {
                        id: "filter.v.price",
                        values: [
                            {
                                id: "filter.v.price",
                                input: '{"price":{"min":10,"max":100}}',
                                label: "Price",
                            },
                        ],
                    },
                ],
            },
        });
        mockWeaverse.loadPage.mockResolvedValue({});

        const response = await loader({
            request: requestWithFilters,
            context: mockContext as any,
            params: {},
        } as LoaderFunctionArgs);

        expect(mockStorefront.query).toHaveBeenCalledWith(
            expect.stringContaining("query SearchProductsFiltered"),
            expect.objectContaining({
                variables: expect.objectContaining({
                    productFilters: [
                        {
                            price: { min: 10, max: 100 },
                        },
                    ],
                }),
            }),
        );

        // Verify applied filters logic
        expect(response.appliedFilters).toHaveLength(1);
        expect(response.appliedFilters[0].label).toBe("$10.00 - $100.00");
    });

    it("should filter out products without priceRange", async () => {
        const mockProducts = {
            nodes: [
                { id: "1", title: "Valid Product", priceRange: {} },
                { id: "2", title: "Invalid Product" }, // Missing priceRange
            ],
        };

        mockStorefront.query.mockResolvedValue({ search: mockProducts });
        mockWeaverse.loadPage.mockResolvedValue({});

        const response = await loader({
            request: mockRequest,
            context: mockContext as any,
            params: {},
        } as LoaderFunctionArgs);

        expect(response.products.nodes).toHaveLength(1);
        expect(response.products.nodes[0].title).toBe("Valid Product");
    });
});
