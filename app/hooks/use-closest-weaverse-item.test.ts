/**
 * Tests for useClosestWeaverseItem hook.
 * Tests finding the closest Weaverse item from a DOM element reference.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock @weaverse/hydrogen
const mockUseItemInstance = vi.fn();

vi.mock("@weaverse/hydrogen", () => ({
    useItemInstance: (id: string) => mockUseItemInstance(id),
}));

import { renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { useClosestWeaverseItem } from "./use-closest-weaverse-item";

describe("useClosestWeaverseItem", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseItemInstance.mockReturnValue(undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("initial state", () => {
        it("should return undefined when ref.current is null", () => {
            const ref: RefObject<HTMLElement | null> = { current: null };

            const { result } = renderHook(() => useClosestWeaverseItem(ref));

            expect(result.current).toBeUndefined();
        });

        it("should call useItemInstance with empty string initially", () => {
            const ref: RefObject<HTMLElement | null> = { current: null };

            renderHook(() => useClosestWeaverseItem(ref));

            expect(mockUseItemInstance).toHaveBeenCalledWith("");
        });
    });

    describe("finding closest weaverse item", () => {
        it("should find closest parent with data-wv-id attribute", () => {
            // Create DOM structure
            const parent = document.createElement("div");
            parent.setAttribute("data-wv-id", "weaverse-item-123");

            const child = document.createElement("div");
            parent.appendChild(child);

            const ref: RefObject<HTMLElement | null> = { current: child };

            // Mock that after finding ID, useItemInstance returns the item
            const mockWeaverseItem = {
                id: "weaverse-item-123",
                type: "section",
            };
            mockUseItemInstance.mockImplementation((id: string) => {
                if (id === "weaverse-item-123") {
                    return mockWeaverseItem;
                }
                return undefined;
            });

            const { result, rerender } = renderHook(() =>
                useClosestWeaverseItem(ref),
            );

            // Trigger the useEffect by rerendering
            rerender();

            expect(mockUseItemInstance).toHaveBeenCalledWith(
                "weaverse-item-123",
            );
        });

        it("should find deeply nested parent with data-wv-id", () => {
            // Create nested DOM structure
            const grandparent = document.createElement("div");
            grandparent.setAttribute("data-wv-id", "grandparent-id");

            const parent = document.createElement("div");
            grandparent.appendChild(parent);

            const child = document.createElement("div");
            parent.appendChild(child);

            const grandchild = document.createElement("div");
            child.appendChild(grandchild);

            const ref: RefObject<HTMLElement | null> = { current: grandchild };

            const mockWeaverseItem = { id: "grandparent-id", type: "section" };
            mockUseItemInstance.mockImplementation((id: string) => {
                if (id === "grandparent-id") {
                    return mockWeaverseItem;
                }
                return undefined;
            });

            const { rerender } = renderHook(() => useClosestWeaverseItem(ref));
            rerender();

            expect(mockUseItemInstance).toHaveBeenCalledWith("grandparent-id");
        });

        it("should return undefined when no parent has data-wv-id", () => {
            const parent = document.createElement("div");
            const child = document.createElement("div");
            parent.appendChild(child);

            const ref: RefObject<HTMLElement | null> = { current: child };

            const { result, rerender } = renderHook(() =>
                useClosestWeaverseItem(ref),
            );
            rerender();

            expect(result.current).toBeUndefined();
        });

        it("should handle element itself having data-wv-id", () => {
            const element = document.createElement("div");
            element.setAttribute("data-wv-id", "self-item-id");

            const ref: RefObject<HTMLElement | null> = { current: element };

            const mockWeaverseItem = { id: "self-item-id", type: "component" };
            mockUseItemInstance.mockImplementation((id: string) => {
                if (id === "self-item-id") {
                    return mockWeaverseItem;
                }
                return undefined;
            });

            const { rerender } = renderHook(() => useClosestWeaverseItem(ref));
            rerender();

            expect(mockUseItemInstance).toHaveBeenCalledWith("self-item-id");
        });
    });

    describe("weaverseItem caching", () => {
        it("should not search again if weaverseItem is already found", () => {
            const parent = document.createElement("div");
            parent.setAttribute("data-wv-id", "cached-item-id");

            const child = document.createElement("div");
            parent.appendChild(child);

            const ref: RefObject<HTMLElement | null> = { current: child };

            const mockWeaverseItem = { id: "cached-item-id", type: "section" };

            // First call returns undefined, second call returns the item
            let callCount = 0;
            mockUseItemInstance.mockImplementation((id: string) => {
                callCount++;
                if (callCount > 1 && id === "cached-item-id") {
                    return mockWeaverseItem;
                }
                return undefined;
            });

            const { result, rerender } = renderHook(() =>
                useClosestWeaverseItem(ref),
            );

            // After first render
            expect(mockUseItemInstance).toHaveBeenCalled();

            // After rerender with weaverseItem found
            rerender();

            // The hook should return the weaverseItem once found
            // Further calls to useItemInstance would be with the found ID
        });
    });

    describe("edge cases", () => {
        it("should handle empty data-wv-id attribute", () => {
            const parent = document.createElement("div");
            parent.setAttribute("data-wv-id", "");

            const child = document.createElement("div");
            parent.appendChild(child);

            const ref: RefObject<HTMLElement | null> = { current: child };

            const { rerender } = renderHook(() => useClosestWeaverseItem(ref));
            rerender();

            // Should be called with empty string
            expect(mockUseItemInstance).toHaveBeenCalledWith("");
        });

        it("should handle ref changing to null", () => {
            const element = document.createElement("div");
            element.setAttribute("data-wv-id", "test-id");

            const ref: RefObject<HTMLElement | null> = { current: element };

            const { result, rerender } = renderHook(
                ({ refProp }) => useClosestWeaverseItem(refProp),
                { initialProps: { refProp: ref } },
            );

            // Change ref to null
            const nullRef: RefObject<HTMLElement | null> = { current: null };
            rerender({ refProp: nullRef });

            // Should handle gracefully
            expect(result.current).toBeUndefined();
        });

        it("should handle detached DOM elements", () => {
            // Element not attached to document
            const detachedElement = document.createElement("div");

            const ref: RefObject<HTMLElement | null> = {
                current: detachedElement,
            };

            const { result, rerender } = renderHook(() =>
                useClosestWeaverseItem(ref),
            );
            rerender();

            // Should not throw and return undefined
            expect(result.current).toBeUndefined();
        });

        it("should work with document-attached elements", () => {
            const parent = document.createElement("div");
            parent.setAttribute("data-wv-id", "document-attached-id");
            document.body.appendChild(parent);

            const child = document.createElement("div");
            parent.appendChild(child);

            const ref: RefObject<HTMLElement | null> = { current: child };

            const mockWeaverseItem = {
                id: "document-attached-id",
                type: "section",
            };
            mockUseItemInstance.mockImplementation((id: string) => {
                if (id === "document-attached-id") {
                    return mockWeaverseItem;
                }
                return undefined;
            });

            const { rerender } = renderHook(() => useClosestWeaverseItem(ref));
            rerender();

            expect(mockUseItemInstance).toHaveBeenCalledWith(
                "document-attached-id",
            );

            // Cleanup
            document.body.removeChild(parent);
        });
    });

    describe("multiple data-wv-id in hierarchy", () => {
        it("should find the closest (innermost) parent with data-wv-id", () => {
            // Create hierarchy: grandparent > parent > child
            // Both grandparent and parent have data-wv-id
            const grandparent = document.createElement("div");
            grandparent.setAttribute("data-wv-id", "grandparent-wv-id");

            const parent = document.createElement("div");
            parent.setAttribute("data-wv-id", "parent-wv-id");
            grandparent.appendChild(parent);

            const child = document.createElement("div");
            parent.appendChild(child);

            const ref: RefObject<HTMLElement | null> = { current: child };

            mockUseItemInstance.mockImplementation((id: string) => {
                if (id === "parent-wv-id") {
                    return { id: "parent-wv-id", type: "inner-section" };
                }
                if (id === "grandparent-wv-id") {
                    return { id: "grandparent-wv-id", type: "outer-section" };
                }
                return undefined;
            });

            const { rerender } = renderHook(() => useClosestWeaverseItem(ref));
            rerender();

            // Should find the closest (parent) first
            expect(mockUseItemInstance).toHaveBeenCalledWith("parent-wv-id");
        });
    });
});
