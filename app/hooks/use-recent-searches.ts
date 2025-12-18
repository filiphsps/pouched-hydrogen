/**
 * Recent searches hook for tracking and persisting user search history.
 * Stores recent searches in localStorage and provides functions to manage them.
 *
 * @example
 * ```tsx
 * const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();
 *
 * // Add a search when user submits
 * addSearch('nicotine pouches');
 *
 * // Display recent searches
 * recentSearches.map(search => <button onClick={() => addSearch(search)}>{search}</button>);
 * ```
 */
import { useCallback, useEffect, useState } from "react";

/** LocalStorage key for recent searches */
const RECENT_SEARCHES_KEY = "recent-searches";

/** Maximum number of recent searches to store */
const MAX_RECENT_SEARCHES = 10;

/** Minimum length for a search term to be stored */
const MIN_SEARCH_LENGTH = 2;

/**
 * Get stored recent searches from localStorage.
 *
 * @returns Array of recent search terms
 */
function getStoredSearches(): string[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(
            (item): item is string =>
                typeof item === "string" && item.length >= MIN_SEARCH_LENGTH,
        );
    } catch {
        return [];
    }
}

/**
 * Store recent searches in localStorage.
 *
 * @param searches - Array of search terms to store
 */
function storeSearches(searches: string[]): void {
    if (typeof window === "undefined") {
        return;
    }

    try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch {
        // Storage might be full or disabled - fail silently
    }
}

/**
 * Clear stored searches from localStorage.
 */
export function clearStoredSearches(): void {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem(RECENT_SEARCHES_KEY);
}

/**
 * Hook options.
 */
export interface UseRecentSearchesOptions {
    /** Maximum number of searches to store (default: 10) */
    maxSearches?: number;
    /** Minimum length for a search term to be stored (default: 2) */
    minLength?: number;
}

/**
 * Hook return type.
 */
export interface UseRecentSearchesReturn {
    /** Array of recent search terms (most recent first) */
    recentSearches: string[];
    /** Whether searches are still loading from localStorage */
    isLoading: boolean;
    /** Add a search term to history */
    addSearch: (term: string) => void;
    /** Remove a specific search term from history */
    removeSearch: (term: string) => void;
    /** Clear all recent searches */
    clearSearches: () => void;
}

/**
 * Hook for managing recent search history.
 * Persists searches in localStorage and limits stored entries.
 *
 * @param options - Configuration options
 * @returns Recent searches state and control functions
 */
export function useRecentSearches(
    options: UseRecentSearchesOptions = {},
): UseRecentSearchesReturn {
    const { maxSearches = MAX_RECENT_SEARCHES, minLength = MIN_SEARCH_LENGTH } =
        options;

    const [isLoading, setIsLoading] = useState(true);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Load stored searches on mount
    useEffect(() => {
        const stored = getStoredSearches();
        setRecentSearches(stored.slice(0, maxSearches));
        setIsLoading(false);
    }, [maxSearches]);

    /**
     * Add a search term to history.
     * Moves the term to the front if it already exists.
     * Trims and normalizes the search term.
     */
    const addSearch = useCallback(
        (term: string) => {
            const normalizedTerm = term.trim().toLowerCase();

            // Don't store empty or too short searches
            if (normalizedTerm.length < minLength) {
                return;
            }

            setRecentSearches((prev) => {
                // Remove the term if it already exists (we'll add it to the front)
                const filtered = prev.filter(
                    (s) => s.toLowerCase() !== normalizedTerm,
                );

                // Add to front and limit to max
                // Store the original casing of the search
                const updated = [term.trim(), ...filtered].slice(
                    0,
                    maxSearches,
                );

                // Persist to localStorage
                storeSearches(updated);

                return updated;
            });
        },
        [maxSearches, minLength],
    );

    /**
     * Remove a specific search term from history.
     */
    const removeSearch = useCallback((term: string) => {
        const normalizedTerm = term.toLowerCase();

        setRecentSearches((prev) => {
            const updated = prev.filter(
                (s) => s.toLowerCase() !== normalizedTerm,
            );

            // Persist to localStorage
            storeSearches(updated);

            return updated;
        });
    }, []);

    /**
     * Clear all recent searches.
     */
    const clearSearches = useCallback(() => {
        clearStoredSearches();
        setRecentSearches([]);
    }, []);

    return {
        recentSearches,
        isLoading,
        addSearch,
        removeSearch,
        clearSearches,
    };
}
