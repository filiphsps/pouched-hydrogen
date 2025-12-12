/**
 * Recently Viewed Products Hook.
 * Tracks and persists recently viewed product handles in localStorage.
 * Used to display a "Recently Viewed" carousel on product pages.
 *
 * @example
 * ```tsx
 * const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed();
 *
 * // Add current product to history
 * useEffect(() => {
 *   addToRecentlyViewed(product.handle);
 * }, [product.handle]);
 * ```
 */
import { useCallback, useEffect, useState } from "react";

const RECENTLY_VIEWED_KEY = "recently-viewed-products";
const MAX_ITEMS = 12;

/**
 * Retrieves recently viewed product handles from localStorage.
 *
 * @returns {string[]} Array of product handles
 */
function getRecentlyViewed(): string[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (stored) {
            const parsed: unknown = JSON.parse(stored);
            if (
                Array.isArray(parsed) &&
                parsed.every((item): item is string => typeof item === "string")
            ) {
                return parsed;
            }
        }
    } catch {
        // Invalid JSON or localStorage error - return empty array
    }

    return [];
}

/**
 * Saves recently viewed product handles to localStorage.
 *
 * @param {string[]} handles - Array of product handles to save
 */
function saveRecentlyViewed(handles: string[]): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(handles));
    } catch {
        // localStorage full or unavailable - silently fail
    }
}

export interface UseRecentlyViewedReturn {
    /** Array of recently viewed product handles (excluding current) */
    recentlyViewed: string[];
    /** Add a product handle to the recently viewed list */
    addToRecentlyViewed: (handle: string) => void;
    /** Clear all recently viewed products */
    clearRecentlyViewed: () => void;
    /** Whether the data is still loading from localStorage */
    isLoading: boolean;
}

/**
 * Hook for managing recently viewed products.
 * Persists product handles in localStorage and provides methods to add/clear.
 *
 * @param {string} [currentHandle] - Current product handle to exclude from list
 * @param {number} [maxItems=12] - Maximum number of items to keep
 * @returns {UseRecentlyViewedReturn} Recently viewed state and methods
 */
export function useRecentlyViewed(
    currentHandle?: string,
    maxItems: number = MAX_ITEMS,
): UseRecentlyViewedReturn {
    const [allViewed, setAllViewed] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        setAllViewed(getRecentlyViewed());
        setIsLoading(false);
    }, []);

    // Add product to recently viewed
    const addToRecentlyViewed = useCallback(
        (handle: string) => {
            if (!handle) return;

            setAllViewed((prev) => {
                // Remove existing occurrence (if any) and add to front
                const filtered = prev.filter((h) => h !== handle);
                const updated = [handle, ...filtered].slice(0, maxItems);
                saveRecentlyViewed(updated);
                return updated;
            });
        },
        [maxItems],
    );

    // Clear all recently viewed
    const clearRecentlyViewed = useCallback(() => {
        setAllViewed([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem(RECENTLY_VIEWED_KEY);
        }
    }, []);

    // Filter out current product from the list
    const recentlyViewed = currentHandle
        ? allViewed.filter((h) => h !== currentHandle)
        : allViewed;

    return {
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
        isLoading,
    };
}
