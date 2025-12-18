/**
 * Tests for useRecentlyViewed hook.
 * Tests localStorage persistence of recently viewed product handles.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        _getStore: () => store,
    };
})();

Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
});

import { act, renderHook } from "@testing-library/react";
import { useRecentlyViewed } from "./use-recently-viewed";

const STORAGE_KEY = "recently-viewed-products";

describe("useRecentlyViewed", () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    describe("initial state", () => {
        it("should complete loading after initialization", async () => {
            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });

        it("should return empty array when no stored products", async () => {
            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.recentlyViewed).toEqual([]);
        });

        it("should load previously stored products", async () => {
            localStorageMock.setItem(
                STORAGE_KEY,
                JSON.stringify(["product-1", "product-2", "product-3"]),
            );

            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.recentlyViewed).toEqual([
                "product-1",
                "product-2",
                "product-3",
            ]);
        });

        it("should handle invalid JSON in localStorage gracefully", async () => {
            localStorageMock.setItem(STORAGE_KEY, "invalid json");

            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.recentlyViewed).toEqual([]);
        });

        it("should return empty array when stored data contains non-string entries", async () => {
            // The hook validates that ALL entries are strings, otherwise returns empty array
            localStorageMock.setItem(
                STORAGE_KEY,
                JSON.stringify([
                    "valid-handle",
                    123,
                    null,
                    { handle: "invalid" },
                ]),
            );

            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Hook validates entire array - returns empty if any invalid entries
            expect(result.current.recentlyViewed).toEqual([]);
        });

        it("should handle empty array in localStorage", async () => {
            localStorageMock.setItem(STORAGE_KEY, JSON.stringify([]));

            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.recentlyViewed).toEqual([]);
        });
    });

    describe("currentHandle filtering", () => {
        it("should exclude currentHandle from the returned list", async () => {
            localStorageMock.setItem(
                STORAGE_KEY,
                JSON.stringify(["product-1", "product-2", "product-3"]),
            );

            const { result } = renderHook(() => useRecentlyViewed("product-2"));

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.recentlyViewed).toEqual([
                "product-1",
                "product-3",
            ]);
        });

        it("should return all products when no currentHandle provided", async () => {
            localStorageMock.setItem(
                STORAGE_KEY,
                JSON.stringify(["product-1", "product-2"]),
            );

            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.recentlyViewed).toEqual([
                "product-1",
                "product-2",
            ]);
        });

        it("should handle currentHandle that does not exist in list", async () => {
            localStorageMock.setItem(
                STORAGE_KEY,
                JSON.stringify(["product-1", "product-2"]),
            );

            const { result } = renderHook(() =>
                useRecentlyViewed("product-99"),
            );

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.recentlyViewed).toEqual([
                "product-1",
                "product-2",
            ]);
        });
    });

    describe("addToRecentlyViewed", () => {
        it("should add a product handle to the front of the list", async () => {
            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addToRecentlyViewed("new-product");
            });

            expect(result.current.recentlyViewed).toEqual(["new-product"]);
        });

        it("should move existing handle to front instead of duplicating", async () => {
            localStorageMock.setItem(
                STORAGE_KEY,
                JSON.stringify(["product-1", "product-2", "product-3"]),
            );

            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addToRecentlyViewed("product-2");
            });

            expect(result.current.recentlyViewed).toEqual([
                "product-2",
                "product-1",
                "product-3",
            ]);
        });

        it("should persist products to localStorage", async () => {
            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addToRecentlyViewed("new-product");
            });

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                STORAGE_KEY,
                JSON.stringify(["new-product"]),
            );
        });

        it("should not add empty handles", async () => {
            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addToRecentlyViewed("");
            });

            expect(result.current.recentlyViewed).toEqual([]);
        });

        it("should respect maxItems limit (default 12)", async () => {
            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Add 15 products
            act(() => {
                for (let i = 1; i <= 15; i++) {
                    result.current.addToRecentlyViewed(`product-${i}`);
                }
            });

            expect(result.current.recentlyViewed).toHaveLength(12);
            // Most recent should be first
            expect(result.current.recentlyViewed[0]).toBe("product-15");
        });

        it("should respect custom maxItems limit", async () => {
            const { result } = renderHook(() =>
                useRecentlyViewed(undefined, 5),
            );

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                for (let i = 1; i <= 10; i++) {
                    result.current.addToRecentlyViewed(`product-${i}`);
                }
            });

            expect(result.current.recentlyViewed).toHaveLength(5);
            expect(result.current.recentlyViewed).toEqual([
                "product-10",
                "product-9",
                "product-8",
                "product-7",
                "product-6",
            ]);
        });
    });

    describe("clearRecentlyViewed", () => {
        it("should clear all recently viewed products", async () => {
            localStorageMock.setItem(
                STORAGE_KEY,
                JSON.stringify(["product-1", "product-2", "product-3"]),
            );

            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.clearRecentlyViewed();
            });

            expect(result.current.recentlyViewed).toEqual([]);
        });

        it("should remove from localStorage", async () => {
            localStorageMock.setItem(
                STORAGE_KEY,
                JSON.stringify(["product-1"]),
            );

            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.clearRecentlyViewed();
            });

            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                STORAGE_KEY,
            );
        });
    });

    describe("concurrent updates", () => {
        it("should handle rapid additions correctly", async () => {
            const { result } = renderHook(() =>
                useRecentlyViewed(undefined, 10),
            );

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addToRecentlyViewed("product-1");
                result.current.addToRecentlyViewed("product-2");
                result.current.addToRecentlyViewed("product-3");
            });

            expect(result.current.recentlyViewed).toEqual([
                "product-3",
                "product-2",
                "product-1",
            ]);
        });

        it("should handle add then clear correctly", async () => {
            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addToRecentlyViewed("product-1");
            });

            expect(result.current.recentlyViewed).toEqual(["product-1"]);

            act(() => {
                result.current.clearRecentlyViewed();
            });

            expect(result.current.recentlyViewed).toEqual([]);

            act(() => {
                result.current.addToRecentlyViewed("product-2");
            });

            expect(result.current.recentlyViewed).toEqual(["product-2"]);
        });
    });

    describe("multiple hook instances", () => {
        it("should share state via localStorage", async () => {
            const { result: result1 } = renderHook(() => useRecentlyViewed());
            const { result: result2 } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result1.current.isLoading).toBe(false);
                expect(result2.current.isLoading).toBe(false);
            });

            act(() => {
                result1.current.addToRecentlyViewed("shared-product");
            });

            // Both instances should see the update
            expect(result1.current.recentlyViewed).toContain("shared-product");
            // Note: result2 won't automatically update without re-render
            // This tests that localStorage is being written correctly
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                STORAGE_KEY,
                expect.stringContaining("shared-product"),
            );
        });
    });

    describe("edge cases", () => {
        it("should handle localStorage errors gracefully when saving", async () => {
            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Simulate localStorage full error
            localStorageMock.setItem.mockImplementationOnce(() => {
                throw new Error("QuotaExceededError");
            });

            // Should not throw
            act(() => {
                result.current.addToRecentlyViewed("product-1");
            });

            // State should still update even if localStorage fails
            expect(result.current.recentlyViewed).toEqual(["product-1"]);
        });

        it("should handle localStorage errors gracefully when reading", async () => {
            localStorageMock.getItem.mockImplementationOnce(() => {
                throw new Error("SecurityError");
            });

            const { result } = renderHook(() => useRecentlyViewed());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.recentlyViewed).toEqual([]);
        });
    });
});
