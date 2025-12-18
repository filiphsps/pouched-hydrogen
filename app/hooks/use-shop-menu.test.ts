/**
 * Tests for useShopMenu hook.
 * Tests retrieval of shop menu data from the root loader.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-router
const mockRouteLoaderData: Record<string, unknown> = {};

vi.mock("react-router", () => ({
    useRouteLoaderData: (routeId: string) => mockRouteLoaderData[routeId],
}));

import { renderHook } from "@testing-library/react";
import type { EnhancedMenu } from "~/types/menu";
import { useShopMenu } from "./use-shop-menu";

describe("useShopMenu", () => {
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

    describe("data retrieval", () => {
        it("should return shop name from root loader", () => {
            mockRouteLoaderData.root = {
                layout: {
                    shop: { name: "Pouched Store" },
                    headerMenu: null,
                    footerMenu: null,
                    megaMenu: null,
                },
            };

            const { result } = renderHook(() => useShopMenu());

            expect(result.current.shopName).toBe("Pouched Store");
        });

        it("should return header menu from root loader", () => {
            const mockHeaderMenu = {
                id: "header-menu",
                items: [
                    {
                        id: "item-1",
                        title: "Products",
                        url: "/products",
                        type: "HTTP",
                        tags: [],
                        to: "/products",
                        target: "_self",
                        items: [],
                    },
                    {
                        id: "item-2",
                        title: "About",
                        url: "/about",
                        type: "HTTP",
                        tags: [],
                        to: "/about",
                        target: "_self",
                        items: [],
                    },
                ],
            } as EnhancedMenu;

            mockRouteLoaderData.root = {
                layout: {
                    shop: { name: "Test Shop" },
                    headerMenu: mockHeaderMenu,
                    footerMenu: null,
                    megaMenu: null,
                },
            };

            const { result } = renderHook(() => useShopMenu());

            expect(result.current.headerMenu).toEqual(mockHeaderMenu);
        });

        it("should return footer menu from root loader", () => {
            const mockFooterMenu = {
                id: "footer-menu",
                items: [
                    {
                        id: "footer-1",
                        title: "Privacy",
                        url: "/privacy",
                        type: "HTTP",
                        tags: [],
                        to: "/privacy",
                        target: "_self",
                        items: [],
                    },
                    {
                        id: "footer-2",
                        title: "Terms",
                        url: "/terms",
                        type: "HTTP",
                        tags: [],
                        to: "/terms",
                        target: "_self",
                        items: [],
                    },
                ],
            } as EnhancedMenu;

            mockRouteLoaderData.root = {
                layout: {
                    shop: { name: "Test Shop" },
                    headerMenu: null,
                    footerMenu: mockFooterMenu,
                    megaMenu: null,
                },
            };

            const { result } = renderHook(() => useShopMenu());

            expect(result.current.footerMenu).toEqual(mockFooterMenu);
        });

        it("should return mega menu from root loader", () => {
            const mockMegaMenu = {
                enabled: true,
                items: [{ id: "mega-1", title: "Shop All", collections: [] }],
            };

            mockRouteLoaderData.root = {
                layout: {
                    shop: { name: "Test Shop" },
                    headerMenu: null,
                    footerMenu: null,
                    megaMenu: mockMegaMenu,
                },
            };

            const { result } = renderHook(() => useShopMenu());

            expect(result.current.megaMenu).toEqual(mockMegaMenu);
        });

        it("should return all menu data together", () => {
            const mockHeaderMenu: Partial<EnhancedMenu> = {
                id: "header-menu",
                items: [],
            };
            const mockFooterMenu: Partial<EnhancedMenu> = {
                id: "footer-menu",
                items: [],
            };
            const mockMegaMenu = { enabled: true };

            mockRouteLoaderData.root = {
                layout: {
                    shop: { name: "Complete Store" },
                    headerMenu: mockHeaderMenu,
                    footerMenu: mockFooterMenu,
                    megaMenu: mockMegaMenu,
                },
            };

            const { result } = renderHook(() => useShopMenu());

            expect(result.current).toEqual({
                shopName: "Complete Store",
                headerMenu: mockHeaderMenu,
                footerMenu: mockFooterMenu,
                megaMenu: mockMegaMenu,
            });
        });
    });

    describe("missing data handling", () => {
        it("should return undefined when root loader data is not available", () => {
            mockRouteLoaderData.root = undefined;

            const { result } = renderHook(() => useShopMenu());

            expect(result.current.shopName).toBeUndefined();
            expect(result.current.headerMenu).toBeUndefined();
            expect(result.current.footerMenu).toBeUndefined();
            expect(result.current.megaMenu).toBeUndefined();
        });

        it("should return undefined when layout is not available", () => {
            mockRouteLoaderData.root = {};

            const { result } = renderHook(() => useShopMenu());

            expect(result.current.shopName).toBeUndefined();
            expect(result.current.headerMenu).toBeUndefined();
            expect(result.current.footerMenu).toBeUndefined();
            expect(result.current.megaMenu).toBeUndefined();
        });

        it("should return undefined shopName when shop is not available", () => {
            mockRouteLoaderData.root = {
                layout: {
                    shop: null,
                    headerMenu: { id: "header" },
                    footerMenu: { id: "footer" },
                    megaMenu: null,
                },
            };

            const { result } = renderHook(() => useShopMenu());

            expect(result.current.shopName).toBeUndefined();
            expect(result.current.headerMenu).toBeDefined();
            expect(result.current.footerMenu).toBeDefined();
        });

        it("should handle partial menu data", () => {
            mockRouteLoaderData.root = {
                layout: {
                    shop: { name: "Partial Store" },
                    headerMenu: { id: "header-only" },
                    footerMenu: null,
                    megaMenu: undefined,
                },
            };

            const { result } = renderHook(() => useShopMenu());

            expect(result.current.shopName).toBe("Partial Store");
            expect(result.current.headerMenu).toEqual({ id: "header-only" });
            expect(result.current.footerMenu).toBeNull();
            expect(result.current.megaMenu).toBeUndefined();
        });
    });

    describe("type safety", () => {
        it("should properly type cast headerMenu as EnhancedMenu", () => {
            const mockHeaderMenu = {
                id: "header-menu",
                items: [
                    {
                        id: "item-1",
                        title: "Products",
                        url: "/products",
                        type: "HTTP",
                        tags: [],
                        to: "/products",
                        target: "_self",
                        items: [
                            {
                                id: "sub-1",
                                title: "All Products",
                                url: "/collections/all",
                                type: "HTTP",
                                tags: [],
                                to: "/collections/all",
                                target: "_self",
                            },
                        ],
                    },
                ],
            } as EnhancedMenu;

            mockRouteLoaderData.root = {
                layout: {
                    shop: { name: "Test" },
                    headerMenu: mockHeaderMenu,
                    footerMenu: null,
                    megaMenu: null,
                },
            };

            const { result } = renderHook(() => useShopMenu());

            // Verify the type allows accessing EnhancedMenu properties
            expect(result.current.headerMenu?.items?.[0]?.items).toBeDefined();
        });

        it("should properly type cast footerMenu as EnhancedMenu", () => {
            const mockFooterMenu = {
                id: "footer-menu",
                items: [
                    {
                        id: "item-1",
                        title: "Contact",
                        url: "/contact",
                        type: "HTTP",
                        tags: [],
                        to: "/contact",
                        target: "_self",
                        items: [],
                    },
                ],
            } as EnhancedMenu;

            mockRouteLoaderData.root = {
                layout: {
                    shop: { name: "Test" },
                    headerMenu: null,
                    footerMenu: mockFooterMenu,
                    megaMenu: null,
                },
            };

            const { result } = renderHook(() => useShopMenu());

            // Verify the type allows accessing EnhancedMenu properties
            expect(result.current.footerMenu?.items?.[0]?.title).toBe(
                "Contact",
            );
        });
    });

    describe("hook stability", () => {
        it("should return consistent object reference structure", () => {
            mockRouteLoaderData.root = {
                layout: {
                    shop: { name: "Test" },
                    headerMenu: null,
                    footerMenu: null,
                    megaMenu: null,
                },
            };

            const { result, rerender } = renderHook(() => useShopMenu());

            const firstResult = result.current;
            rerender();
            const secondResult = result.current;

            // Object structure should be consistent
            expect(Object.keys(firstResult)).toEqual(Object.keys(secondResult));
        });
    });
});
