import { useEffect, useState } from "react";

/**
 * Hook for responsive media query detection.
 * SSR-safe with initial false value, uses matchMedia API with event listener.
 *
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if query matches
 *
 * @example
 * ```tsx
 * const isLargeScreen = useMediaQuery("(min-width: 1024px)");
 * ```
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // Check if window is available (SSR safety)
        if (typeof window === "undefined") {
            return;
        }

        const mediaQuery = window.matchMedia(query);

        // Set initial value
        setMatches(mediaQuery.matches);

        /**
         * Handler for media query change events.
         * @param event - MediaQueryListEvent containing the new match state
         */
        function handleChange(event: MediaQueryListEvent): void {
            setMatches(event.matches);
        }

        // Add event listener for changes
        mediaQuery.addEventListener("change", handleChange);

        // Cleanup listener on unmount or query change
        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, [query]);

    return matches;
}

/**
 * Convenience hook for detecting desktop screens.
 * Uses md breakpoint (768px) by default - matches Tailwind's md breakpoint.
 *
 * @returns boolean indicating if viewport is desktop-sized (≥768px)
 *
 * @example
 * ```tsx
 * const isDesktop = useIsDesktop();
 * if (isDesktop) {
 *     return <DesktopLayout />;
 * }
 * return <MobileLayout />;
 * ```
 */
export function useIsDesktop(): boolean {
    return useMediaQuery("(min-width: 768px)");
}
