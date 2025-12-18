/**
 * Tests for useRecentSearches hook.
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

// Import after mocking
import { act, renderHook } from "@testing-library/react";
import { clearStoredSearches, useRecentSearches } from "./use-recent-searches";

describe("useRecentSearches", () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    describe("initial state", () => {
        it("should complete loading after initialization", async () => {
            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });

        it("should return empty array when no stored searches", async () => {
            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.recentSearches).toEqual([]);
        });

        it("should load previously stored searches", async () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["snus", "nicotine pouches", "mint"]),
            );

            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.recentSearches).toEqual([
                "snus",
                "nicotine pouches",
                "mint",
            ]);
        });

        it("should handle invalid JSON in localStorage gracefully", async () => {
            localStorageMock.setItem("recent-searches", "invalid json");

            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.recentSearches).toEqual([]);
        });

        it("should filter out invalid entries from stored searches", async () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["valid", 123, null, "", "a", "also valid"]),
            );

            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Should only include strings with length >= 2
            expect(result.current.recentSearches).toEqual([
                "valid",
                "also valid",
            ]);
        });
    });

    describe("addSearch", () => {
        it("should add a search term to the front of the list", async () => {
            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addSearch("snus");
            });

            expect(result.current.recentSearches).toEqual(["snus"]);
        });

        it("should move existing term to front instead of duplicating", async () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["mint", "snus", "nicotine"]),
            );

            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addSearch("snus");
            });

            expect(result.current.recentSearches).toEqual([
                "snus",
                "mint",
                "nicotine",
            ]);
        });

        it("should be case-insensitive when detecting duplicates", async () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["Snus", "Mint"]),
            );

            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addSearch("SNUS");
            });

            // Should replace with new casing and move to front
            expect(result.current.recentSearches).toEqual(["SNUS", "Mint"]);
        });

        it("should persist searches to localStorage", async () => {
            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addSearch("snus");
            });

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "recent-searches",
                JSON.stringify(["snus"]),
            );
        });

        it("should trim whitespace from search terms", async () => {
            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addSearch("  snus  ");
            });

            expect(result.current.recentSearches).toEqual(["snus"]);
        });

        it("should not add searches shorter than minimum length", async () => {
            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addSearch("a");
            });

            expect(result.current.recentSearches).toEqual([]);
        });

        it("should not add empty searches", async () => {
            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addSearch("");
                result.current.addSearch("   ");
            });

            expect(result.current.recentSearches).toEqual([]);
        });

        it("should respect maxSearches limit", async () => {
            const { result } = renderHook(() =>
                useRecentSearches({ maxSearches: 3 }),
            );

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addSearch("one");
                result.current.addSearch("two");
                result.current.addSearch("three");
                result.current.addSearch("four");
            });

            expect(result.current.recentSearches).toHaveLength(3);
            expect(result.current.recentSearches).toEqual([
                "four",
                "three",
                "two",
            ]);
        });

        it("should respect custom minLength option", async () => {
            const { result } = renderHook(() =>
                useRecentSearches({ minLength: 5 }),
            );

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addSearch("ab");
                result.current.addSearch("abcd");
                result.current.addSearch("abcde");
            });

            // Only "abcde" should be added (length 5)
            expect(result.current.recentSearches).toEqual(["abcde"]);
        });
    });

    describe("removeSearch", () => {
        it("should remove a specific search term", async () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["snus", "mint", "nicotine"]),
            );

            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.removeSearch("mint");
            });

            expect(result.current.recentSearches).toEqual(["snus", "nicotine"]);
        });

        it("should be case-insensitive when removing", async () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["Snus", "Mint"]),
            );

            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.removeSearch("snus");
            });

            expect(result.current.recentSearches).toEqual(["Mint"]);
        });

        it("should persist removal to localStorage", async () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["snus", "mint"]),
            );

            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            vi.clearAllMocks();

            act(() => {
                result.current.removeSearch("mint");
            });

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "recent-searches",
                JSON.stringify(["snus"]),
            );
        });

        it("should handle removing non-existent term gracefully", async () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["snus"]),
            );

            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.removeSearch("nonexistent");
            });

            expect(result.current.recentSearches).toEqual(["snus"]);
        });
    });

    describe("clearSearches", () => {
        it("should clear all searches", async () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["snus", "mint", "nicotine"]),
            );

            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.clearSearches();
            });

            expect(result.current.recentSearches).toEqual([]);
        });

        it("should remove from localStorage", async () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["snus"]),
            );

            const { result } = renderHook(() => useRecentSearches());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.clearSearches();
            });

            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                "recent-searches",
            );
        });
    });

    describe("clearStoredSearches helper", () => {
        it("should clear searches from localStorage", () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["snus"]),
            );

            clearStoredSearches();

            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                "recent-searches",
            );
        });
    });

    describe("options", () => {
        it("should respect maxSearches on initial load", async () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["one", "two", "three", "four", "five"]),
            );

            const { result } = renderHook(() =>
                useRecentSearches({ maxSearches: 3 }),
            );

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.recentSearches).toHaveLength(3);
            expect(result.current.recentSearches).toEqual([
                "one",
                "two",
                "three",
            ]);
        });
    });

    describe("concurrent updates", () => {
        it("should handle rapid additions correctly", async () => {
            const { result } = renderHook(() =>
                useRecentSearches({ maxSearches: 5 }),
            );

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.addSearch("one");
                result.current.addSearch("two");
                result.current.addSearch("three");
            });

            expect(result.current.recentSearches).toEqual([
                "three",
                "two",
                "one",
            ]);
        });
    });
});
