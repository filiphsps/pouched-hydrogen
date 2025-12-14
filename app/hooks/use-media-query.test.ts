import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useIsDesktop, useMediaQuery } from "./use-media-query";

describe("useMediaQuery", () => {
    let mockMatchMedia: ReturnType<typeof vi.fn>;
    let mockAddEventListener: ReturnType<typeof vi.fn>;
    let mockRemoveEventListener: ReturnType<typeof vi.fn>;
    let changeHandler: ((event: MediaQueryListEvent) => void) | null = null;

    beforeEach(() => {
        mockAddEventListener = vi.fn((event, handler) => {
            if (event === "change") {
                changeHandler = handler;
            }
        });
        mockRemoveEventListener = vi.fn();

        mockMatchMedia = vi.fn((query: string) => ({
            matches: query === "(min-width: 768px)",
            media: query,
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: mockMatchMedia,
        });
    });

    afterEach(() => {
        changeHandler = null;
        vi.restoreAllMocks();
    });

    it("should return false initially for non-matching query", () => {
        mockMatchMedia.mockReturnValue({
            matches: false,
            media: "(min-width: 1024px)",
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
        });

        const { result } = renderHook(() =>
            useMediaQuery("(min-width: 1024px)"),
        );

        expect(result.current).toBe(false);
    });

    it("should return true for matching query", () => {
        mockMatchMedia.mockReturnValue({
            matches: true,
            media: "(min-width: 768px)",
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
        });

        const { result } = renderHook(() =>
            useMediaQuery("(min-width: 768px)"),
        );

        expect(result.current).toBe(true);
    });

    it("should add and remove event listener", () => {
        const { unmount } = renderHook(() =>
            useMediaQuery("(min-width: 768px)"),
        );

        expect(mockAddEventListener).toHaveBeenCalledWith(
            "change",
            expect.any(Function),
        );

        unmount();

        expect(mockRemoveEventListener).toHaveBeenCalledWith(
            "change",
            expect.any(Function),
        );
    });

    it("should update when media query changes", () => {
        mockMatchMedia.mockReturnValue({
            matches: false,
            media: "(min-width: 768px)",
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
        });

        const { result } = renderHook(() =>
            useMediaQuery("(min-width: 768px)"),
        );

        expect(result.current).toBe(false);

        // Simulate media query change
        act(() => {
            if (changeHandler) {
                changeHandler({ matches: true } as MediaQueryListEvent);
            }
        });

        expect(result.current).toBe(true);
    });
});

describe("useIsDesktop", () => {
    beforeEach(() => {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: vi.fn((query: string) => ({
                matches: query === "(min-width: 768px)",
                media: query,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            })),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should use the correct breakpoint query", () => {
        const { result } = renderHook(() => useIsDesktop());

        // Should return true because mock returns true for 768px query
        expect(result.current).toBe(true);
        expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 768px)");
    });
});
