import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMergedMenuData } from "./use-merged-menu-data";

// Mock hooks
const mockUseShopMenu = vi.fn();
vi.mock("~/hooks/use-shop-menu", () => ({
    useShopMenu: () => mockUseShopMenu(),
}));

const mockUseThemeSettings = vi.fn();
vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: () => mockUseThemeSettings(),
}));

// Mock utils to simplify test logic (optional, but consistent with unit testing)
// But useMergedMenuData uses them heavily.
// Let's rely on real utils if they are simple pure functions we already tested.
// The real utils use `getField`, `getReferenceList` etc.
// We need to construct mock data that matches the structure expected by utils.

describe("useMergedMenuData", () => {
    it("returns empty array if headerMenu is missing", () => {
        mockUseShopMenu.mockReturnValue({ headerMenu: null });
        mockUseThemeSettings.mockReturnValue({});

        const { result } = renderHook(() => useMergedMenuData());
        expect(result.current).toEqual([]);
    });

    it("returns native items if no mega menu match found", () => {
        const nativeItems = [{ id: "1", title: "Home", to: "/" }];
        mockUseShopMenu.mockReturnValue({
            headerMenu: { items: nativeItems },
            megaMenu: { nodes: [] },
        });

        const { result } = renderHook(() => useMergedMenuData());
        expect(result.current).toEqual(nativeItems);
    });

    it("merges mega menu data when title matches", () => {
        const nativeItems = [{ id: "1", title: "Products", to: "/products" }];

        const megaMenuItemWithLinks = {
            id: "mm1",
            fields: [
                { key: "title", value: "Products" },
                {
                    key: "dropdown_content",
                    references: {
                        nodes: [
                            {
                                id: "sect1",
                                fields: [
                                    { key: "title", value: "Section 1" },
                                    {
                                        key: "links",
                                        references: {
                                            nodes: [
                                                {
                                                    id: "link1",
                                                    fields: [
                                                        {
                                                            key: "title",
                                                            value: "Custom Link",
                                                        },
                                                        {
                                                            key: "url",
                                                            value: "/custom",
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
        };

        mockUseShopMenu.mockReturnValue({
            headerMenu: { items: nativeItems },
            megaMenu: {
                nodes: [
                    {
                        fields: [
                            {
                                key: "items",
                                references: { nodes: [megaMenuItemWithLinks] },
                            },
                        ],
                    },
                ],
            },
        });

        const { result } = renderHook(() => useMergedMenuData());

        const mergedItem = result.current[0] as any;
        expect(mergedItem.isMegaMenu).toBe(true);
        expect(mergedItem.items).toHaveLength(1);
        expect(mergedItem.items[0].title).toBe("Section 1");
        expect(mergedItem.items[0].items[0].title).toBe("Custom Link");
        expect(mergedItem.items[0].items[0].to).toBe("/custom");
    });
});
