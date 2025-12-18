/**
 * Tests for useWeaverseStudioCheck hook.
 * Tests detection of Weaverse Studio design mode.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Note: We use vi.doMock for per-test mock configuration
// This avoids the hoisting issues with vi.mock

import { renderHook } from "@testing-library/react";

describe("useWeaverseStudioCheck", () => {
    const originalLocation = window.location;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        // Restore original location
        Object.defineProperty(window, "location", {
            writable: true,
            value: originalLocation,
        });
    });

    describe("with isDesignMode defined", () => {
        it("should return true when isDesignMode is true", async () => {
            // Re-mock with specific values
            vi.doMock("@weaverse/hydrogen", () => ({
                isIframe: false,
                useWeaverse: () => ({
                    isDesignMode: true,
                }),
            }));

            // Re-import to get new mock
            const { useWeaverseStudioCheck } = await import(
                "./use-weaverse-studio-check"
            );

            const { result } = renderHook(() => useWeaverseStudioCheck());

            expect(result.current).toBe(true);
        });

        it("should return false when isDesignMode is false", async () => {
            vi.doMock("@weaverse/hydrogen", () => ({
                isIframe: false,
                useWeaverse: () => ({
                    isDesignMode: false,
                }),
            }));

            const { useWeaverseStudioCheck } = await import(
                "./use-weaverse-studio-check"
            );

            const { result } = renderHook(() => useWeaverseStudioCheck());

            expect(result.current).toBe(false);
        });
    });

    describe("with isDesignMode undefined (outside Weaverse page context)", () => {
        it("should check URL for design mode when in iframe", async () => {
            // Mock location with isDesignMode=true in search params
            Object.defineProperty(window, "location", {
                writable: true,
                value: {
                    ...originalLocation,
                    search: "?isDesignMode=true&other=param",
                },
            });

            vi.doMock("@weaverse/hydrogen", () => ({
                isIframe: true,
                useWeaverse: () => ({
                    isDesignMode: undefined,
                }),
            }));

            const { useWeaverseStudioCheck } = await import(
                "./use-weaverse-studio-check"
            );

            const { result } = renderHook(() => useWeaverseStudioCheck());

            expect(result.current).toBe(true);
        });

        it("should return false when URL does not contain isDesignMode=true", async () => {
            Object.defineProperty(window, "location", {
                writable: true,
                value: {
                    ...originalLocation,
                    search: "?other=param",
                },
            });

            vi.doMock("@weaverse/hydrogen", () => ({
                isIframe: true,
                useWeaverse: () => ({
                    isDesignMode: undefined,
                }),
            }));

            const { useWeaverseStudioCheck } = await import(
                "./use-weaverse-studio-check"
            );

            const { result } = renderHook(() => useWeaverseStudioCheck());

            expect(result.current).toBe(false);
        });

        it("should return undefined when not in iframe and isDesignMode is undefined", async () => {
            vi.doMock("@weaverse/hydrogen", () => ({
                isIframe: false,
                useWeaverse: () => ({
                    isDesignMode: undefined,
                }),
            }));

            const { useWeaverseStudioCheck } = await import(
                "./use-weaverse-studio-check"
            );

            const { result } = renderHook(() => useWeaverseStudioCheck());

            expect(result.current).toBeUndefined();
        });

        it("should handle empty search string in iframe", async () => {
            Object.defineProperty(window, "location", {
                writable: true,
                value: {
                    ...originalLocation,
                    search: "",
                },
            });

            vi.doMock("@weaverse/hydrogen", () => ({
                isIframe: true,
                useWeaverse: () => ({
                    isDesignMode: undefined,
                }),
            }));

            const { useWeaverseStudioCheck } = await import(
                "./use-weaverse-studio-check"
            );

            const { result } = renderHook(() => useWeaverseStudioCheck());

            expect(result.current).toBe(false);
        });

        it("should handle isDesignMode=false in URL", async () => {
            Object.defineProperty(window, "location", {
                writable: true,
                value: {
                    ...originalLocation,
                    search: "?isDesignMode=false",
                },
            });

            vi.doMock("@weaverse/hydrogen", () => ({
                isIframe: true,
                useWeaverse: () => ({
                    isDesignMode: undefined,
                }),
            }));

            const { useWeaverseStudioCheck } = await import(
                "./use-weaverse-studio-check"
            );

            const { result } = renderHook(() => useWeaverseStudioCheck());

            expect(result.current).toBe(false);
        });

        it("should handle partial match in URL", async () => {
            // Should NOT match "isDesignModeFalse=true" or similar
            Object.defineProperty(window, "location", {
                writable: true,
                value: {
                    ...originalLocation,
                    search: "?notIsDesignMode=true",
                },
            });

            vi.doMock("@weaverse/hydrogen", () => ({
                isIframe: true,
                useWeaverse: () => ({
                    isDesignMode: undefined,
                }),
            }));

            const { useWeaverseStudioCheck } = await import(
                "./use-weaverse-studio-check"
            );

            const { result } = renderHook(() => useWeaverseStudioCheck());

            expect(result.current).toBe(false);
        });
    });

    describe("edge cases", () => {
        it("should prioritize weaverse context over URL params", async () => {
            // Even with isDesignMode=true in URL, if weaverse context says false, return false
            Object.defineProperty(window, "location", {
                writable: true,
                value: {
                    ...originalLocation,
                    search: "?isDesignMode=true",
                },
            });

            vi.doMock("@weaverse/hydrogen", () => ({
                isIframe: true,
                useWeaverse: () => ({
                    isDesignMode: false, // Explicitly false from context
                }),
            }));

            const { useWeaverseStudioCheck } = await import(
                "./use-weaverse-studio-check"
            );

            const { result } = renderHook(() => useWeaverseStudioCheck());

            expect(result.current).toBe(false);
        });

        it("should handle URL with multiple query params", async () => {
            Object.defineProperty(window, "location", {
                writable: true,
                value: {
                    ...originalLocation,
                    search: "?foo=bar&isDesignMode=true&baz=qux",
                },
            });

            vi.doMock("@weaverse/hydrogen", () => ({
                isIframe: true,
                useWeaverse: () => ({
                    isDesignMode: undefined,
                }),
            }));

            const { useWeaverseStudioCheck } = await import(
                "./use-weaverse-studio-check"
            );

            const { result } = renderHook(() => useWeaverseStudioCheck());

            expect(result.current).toBe(true);
        });
    });
});
