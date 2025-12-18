/**
 * Tests for useAnimation hook.
 * Tests scroll-triggered animations using framer-motion.
 */

import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Use vi.hoisted to create mocks that can be referenced in vi.mock
const { mockAnimate, mockInView, mockScope, getMockRevealElementsOnScroll } =
    vi.hoisted(() => {
        let revealElementsOnScroll = true;
        return {
            mockAnimate: vi.fn(),
            mockInView: vi.fn(),
            mockScope: { current: null as HTMLElement | null },
            getMockRevealElementsOnScroll: () => revealElementsOnScroll,
            setMockRevealElementsOnScroll: (value: boolean) => {
                revealElementsOnScroll = value;
            },
        };
    });

// Need a way to set revealElementsOnScroll from tests
let testRevealElementsOnScroll = true;

vi.mock("framer-motion", () => ({
    animate: (...args: unknown[]) => mockAnimate(...args),
    inView: (...args: unknown[]) => mockInView(...args),
    useAnimate: () => [mockScope],
}));

vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: () => ({
        revealElementsOnScroll: testRevealElementsOnScroll,
    }),
}));

import { useAnimation } from "./use-animation";

describe("useAnimation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockScope.current = null;
        testRevealElementsOnScroll = true;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("scope initialization", () => {
        it("should return a scope ref", () => {
            const { result } = renderHook(() => useAnimation());

            expect(result.current).toBeDefined();
            expect(Array.isArray(result.current)).toBe(true);
            expect(result.current[0]).toBe(mockScope);
        });

        it("should forward ref when provided", () => {
            const mockElement = document.createElement("div");
            mockScope.current = mockElement;

            const forwardedRef = { current: null as HTMLElement | null };

            renderHook(() => useAnimation(forwardedRef));

            expect(forwardedRef.current).toBe(mockElement);
        });

        it("should not forward ref when scope.current is null", () => {
            mockScope.current = null;

            const forwardedRef = { current: null as HTMLElement | null };

            renderHook(() => useAnimation(forwardedRef));

            expect(forwardedRef.current).toBeNull();
        });
    });

    describe("animation setup", () => {
        it("should not set up animations when revealElementsOnScroll is disabled", () => {
            testRevealElementsOnScroll = false;
            const mockElement = document.createElement("div");
            mockScope.current = mockElement;

            renderHook(() => useAnimation());

            expect(mockInView).not.toHaveBeenCalled();
        });

        it("should set up animations when revealElementsOnScroll is enabled", () => {
            const mockElement = document.createElement("div");
            const mockChild = document.createElement("div");
            mockChild.setAttribute("data-motion", "fade-up");
            mockElement.appendChild(mockChild);

            mockScope.current = mockElement;

            renderHook(() => useAnimation());

            expect(mockElement.classList.contains("animated-scope")).toBe(true);
            expect(mockInView).toHaveBeenCalledTimes(1);
        });

        it("should set up inView for each data-motion element", () => {
            const mockElement = document.createElement("div");
            const child1 = document.createElement("div");
            child1.setAttribute("data-motion", "fade-up");
            const child2 = document.createElement("div");
            child2.setAttribute("data-motion", "zoom-in");
            const child3 = document.createElement("div");
            child3.setAttribute("data-motion", "slide-in");

            mockElement.appendChild(child1);
            mockElement.appendChild(child2);
            mockElement.appendChild(child3);

            mockScope.current = mockElement;

            renderHook(() => useAnimation());

            expect(mockInView).toHaveBeenCalledTimes(3);
        });

        it("should not set up animations when scope.current is null", () => {
            mockScope.current = null;

            renderHook(() => useAnimation());

            expect(mockInView).not.toHaveBeenCalled();
        });
    });

    describe("animation callbacks", () => {
        it("should animate element with fade-up animation", () => {
            const mockElement = document.createElement("div");
            const mockChild = document.createElement("div");
            mockChild.setAttribute("data-motion", "fade-up");
            mockElement.appendChild(mockChild);

            mockScope.current = mockElement;

            mockInView.mockImplementation(
                (elem: HTMLElement, callback: (el: Element) => void) => {
                    callback(elem);
                },
            );

            renderHook(() => useAnimation());

            expect(mockAnimate).toHaveBeenCalledWith(
                mockChild,
                { opacity: [0, 1], y: [20, 0] },
                expect.objectContaining({ duration: 0.5 }),
            );
        });

        it("should animate element with zoom-in animation", () => {
            const mockElement = document.createElement("div");
            const mockChild = document.createElement("div");
            mockChild.setAttribute("data-motion", "zoom-in");
            mockElement.appendChild(mockChild);

            mockScope.current = mockElement;

            mockInView.mockImplementation(
                (elem: HTMLElement, callback: (el: Element) => void) => {
                    callback(elem);
                },
            );

            renderHook(() => useAnimation());

            expect(mockAnimate).toHaveBeenCalledWith(
                mockChild,
                { opacity: [0, 1], scale: [0.8, 1], y: [20, 0] },
                expect.objectContaining({ duration: 0.5 }),
            );
        });

        it("should animate element with slide-in animation", () => {
            const mockElement = document.createElement("div");
            const mockChild = document.createElement("div");
            mockChild.setAttribute("data-motion", "slide-in");
            mockElement.appendChild(mockChild);

            mockScope.current = mockElement;

            mockInView.mockImplementation(
                (elem: HTMLElement, callback: (el: Element) => void) => {
                    callback(elem);
                },
            );

            renderHook(() => useAnimation());

            expect(mockAnimate).toHaveBeenCalledWith(
                mockChild,
                { opacity: [0, 1], x: [20, 0] },
                expect.objectContaining({ duration: 0.5 }),
            );
        });

        it("should default to fade-up when no motion type specified", () => {
            const mockElement = document.createElement("div");
            const mockChild = document.createElement("div");
            mockChild.setAttribute("data-motion", "");
            mockElement.appendChild(mockChild);

            mockScope.current = mockElement;

            mockInView.mockImplementation(
                (elem: HTMLElement, callback: (el: Element) => void) => {
                    callback(elem);
                },
            );

            renderHook(() => useAnimation());

            expect(mockAnimate).toHaveBeenCalledWith(
                mockChild,
                { opacity: [0, 1], y: [20, 0] },
                expect.objectContaining({ duration: 0.5 }),
            );
        });

        it("should use custom delay from data-delay attribute", () => {
            const mockElement = document.createElement("div");
            const mockChild = document.createElement("div");
            mockChild.setAttribute("data-motion", "fade-up");
            mockChild.setAttribute("data-delay", "0.5");
            mockElement.appendChild(mockChild);

            mockScope.current = mockElement;

            mockInView.mockImplementation(
                (elem: HTMLElement, callback: (el: Element) => void) => {
                    callback(elem);
                },
            );

            renderHook(() => useAnimation());

            expect(mockAnimate).toHaveBeenCalledWith(
                mockChild,
                expect.any(Object),
                expect.objectContaining({ delay: 0.5 }),
            );
        });

        it("should use staggered delay based on element index when no custom delay", () => {
            const mockElement = document.createElement("div");
            const child1 = document.createElement("div");
            child1.setAttribute("data-motion", "fade-up");
            const child2 = document.createElement("div");
            child2.setAttribute("data-motion", "fade-up");

            mockElement.appendChild(child1);
            mockElement.appendChild(child2);

            mockScope.current = mockElement;

            mockInView.mockImplementation(
                (elem: HTMLElement, callback: (el: Element) => void) => {
                    callback(elem);
                },
            );

            renderHook(() => useAnimation());

            // First call should have delay 0 (0 * 0.15)
            expect(mockAnimate).toHaveBeenNthCalledWith(
                1,
                child1,
                expect.any(Object),
                expect.objectContaining({ delay: 0 }),
            );

            // Second call should have delay 0.15 (1 * 0.15)
            expect(mockAnimate).toHaveBeenNthCalledWith(
                2,
                child2,
                expect.any(Object),
                expect.objectContaining({ delay: 0.15 }),
            );
        });

        it("should remove animated-scope class after last element animation", () => {
            const mockElement = document.createElement("div");
            const mockChild = document.createElement("div");
            mockChild.setAttribute("data-motion", "fade-up");
            mockElement.appendChild(mockChild);

            mockScope.current = mockElement;

            mockInView.mockImplementation(
                (elem: HTMLElement, callback: (el: Element) => void) => {
                    callback(elem);
                },
            );

            renderHook(() => useAnimation());

            // After the last element animates, the class should be removed
            expect(mockElement.classList.contains("animated-scope")).toBe(
                false,
            );
        });

        it("should keep animated-scope class until last element", () => {
            const mockElement = document.createElement("div");
            const child1 = document.createElement("div");
            child1.setAttribute("data-motion", "fade-up");
            const child2 = document.createElement("div");
            child2.setAttribute("data-motion", "fade-up");

            mockElement.appendChild(child1);
            mockElement.appendChild(child2);

            mockScope.current = mockElement;

            // Only trigger first callback
            let callCount = 0;
            mockInView.mockImplementation(
                (elem: HTMLElement, callback: (el: Element) => void) => {
                    if (callCount === 0) {
                        callback(elem);
                    }
                    callCount++;
                },
            );

            renderHook(() => useAnimation());

            // After first element, class should still be present
            expect(mockElement.classList.contains("animated-scope")).toBe(true);
        });
    });

    describe("inView options", () => {
        it("should call inView with amount option", () => {
            const mockElement = document.createElement("div");
            const mockChild = document.createElement("div");
            mockChild.setAttribute("data-motion", "fade-up");
            mockElement.appendChild(mockChild);

            mockScope.current = mockElement;

            renderHook(() => useAnimation());

            expect(mockInView).toHaveBeenCalledWith(
                mockChild,
                expect.any(Function),
                { amount: 0.3 },
            );
        });
    });
});
