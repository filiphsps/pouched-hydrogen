/**
 * Tests for useCookieConsent hook.
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

// Mock gtag
const mockGtag = vi.fn();
Object.defineProperty(window, "gtag", {
    value: mockGtag,
    writable: true,
    configurable: true,
});

Object.defineProperty(window, "dataLayer", {
    value: [],
    writable: true,
    configurable: true,
});

// Import after mocking
import { act, renderHook } from "@testing-library/react";
import { clearStoredConsent, useCookieConsent } from "./use-cookie-consent";

describe("useCookieConsent", () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
        window.dataLayer = [];
    });

    describe("initial state", () => {
        it("should complete loading after initialization", async () => {
            const { result } = renderHook(() => useCookieConsent());

            // RTL runs effects synchronously, so isLoading resolves immediately
            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });

        it("should resolve to hasConsented false when no stored consent but with granted default", async () => {
            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // hasConsented is false (user hasn't explicitly chosen)
            // but consent defaults to all granted per business requirement
            expect(result.current.hasConsented).toBe(false);
            expect(result.current.consent).toEqual({
                analytics: true,
                marketing: true,
                functional: true,
            });
        });

        it("should recognize previously stored consent", async () => {
            // Set up stored consent
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 365);

            localStorageMock.setItem(
                "cookie-consent",
                JSON.stringify({
                    analytics: true,
                    marketing: false,
                    functional: true,
                }),
            );
            localStorageMock.setItem(
                "cookie-consent-expiry",
                futureDate.toISOString(),
            );
            localStorageMock.setItem("cookie-consent-version", "1");

            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasConsented).toBe(true);
            expect(result.current.consent).toEqual({
                analytics: true,
                marketing: false,
                functional: true,
            });
        });

        it("should treat expired consent as not consented", async () => {
            // Set up expired consent
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            localStorageMock.setItem(
                "cookie-consent",
                JSON.stringify({
                    analytics: true,
                    marketing: true,
                    functional: true,
                }),
            );
            localStorageMock.setItem(
                "cookie-consent-expiry",
                pastDate.toISOString(),
            );
            localStorageMock.setItem("cookie-consent-version", "1");

            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasConsented).toBe(false);
        });

        it("should invalidate outdated consent version", async () => {
            // Set up consent with old version
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 365);

            localStorageMock.setItem(
                "cookie-consent",
                JSON.stringify({
                    analytics: true,
                    marketing: true,
                    functional: true,
                }),
            );
            localStorageMock.setItem(
                "cookie-consent-expiry",
                futureDate.toISOString(),
            );
            localStorageMock.setItem("cookie-consent-version", "0"); // Old version

            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasConsented).toBe(false);
        });
    });

    describe("acceptAll", () => {
        it("should set all consents to true", async () => {
            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.acceptAll();
            });

            expect(result.current.hasConsented).toBe(true);
            expect(result.current.consent).toEqual({
                analytics: true,
                marketing: true,
                functional: true,
            });
        });

        it("should persist to localStorage", async () => {
            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.acceptAll();
            });

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "cookie-consent",
                JSON.stringify({
                    analytics: true,
                    marketing: true,
                    functional: true,
                }),
            );
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "cookie-consent-expiry",
                expect.any(String),
            );
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "cookie-consent-version",
                "1",
            );
        });

        it("should close preferences panel", async () => {
            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Open preferences first
            act(() => {
                result.current.openPreferences();
            });

            expect(result.current.isPreferencesOpen).toBe(true);

            // Accept all should close it
            act(() => {
                result.current.acceptAll();
            });

            expect(result.current.isPreferencesOpen).toBe(false);
        });
    });

    describe("rejectAll", () => {
        it("should set all consents to false", async () => {
            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.rejectAll();
            });

            expect(result.current.hasConsented).toBe(true);
            expect(result.current.consent).toEqual({
                analytics: false,
                marketing: false,
                functional: false,
            });
        });

        it("should persist rejection to localStorage", async () => {
            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.rejectAll();
            });

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "cookie-consent",
                JSON.stringify({
                    analytics: false,
                    marketing: false,
                    functional: false,
                }),
            );
        });
    });

    describe("updateConsent", () => {
        it("should update individual consent categories", async () => {
            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.updateConsent({
                    analytics: true,
                    marketing: false,
                    functional: true,
                });
            });

            expect(result.current.hasConsented).toBe(true);
            expect(result.current.consent).toEqual({
                analytics: true,
                marketing: false,
                functional: true,
            });
        });
    });

    describe("preferences panel", () => {
        it("should open preferences panel", async () => {
            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isPreferencesOpen).toBe(false);

            act(() => {
                result.current.openPreferences();
            });

            expect(result.current.isPreferencesOpen).toBe(true);
        });

        it("should close preferences panel", async () => {
            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.openPreferences();
            });

            expect(result.current.isPreferencesOpen).toBe(true);

            act(() => {
                result.current.closePreferences();
            });

            expect(result.current.isPreferencesOpen).toBe(false);
        });
    });

    describe("clearConsent", () => {
        it("should clear stored consent and reset to granted default", async () => {
            const { result } = renderHook(() => useCookieConsent());

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // First reject (to change from default)
            act(() => {
                result.current.rejectAll();
            });

            expect(result.current.hasConsented).toBe(true);
            expect(result.current.consent).toEqual({
                analytics: false,
                marketing: false,
                functional: false,
            });

            // Then clear - should reset to granted default
            act(() => {
                result.current.clearConsent();
            });

            expect(result.current.hasConsented).toBe(false);
            // Consent resets to granted (no interaction = accept all)
            expect(result.current.consent).toEqual({
                analytics: true,
                marketing: true,
                functional: true,
            });
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                "cookie-consent",
            );
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                "cookie-consent-expiry",
            );
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                "cookie-consent-version",
            );
        });
    });

    describe("clearStoredConsent helper", () => {
        it("should clear all consent keys from localStorage", () => {
            localStorageMock.setItem("cookie-consent", "{}");
            localStorageMock.setItem("cookie-consent-expiry", "date");
            localStorageMock.setItem("cookie-consent-version", "1");

            clearStoredConsent();

            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                "cookie-consent",
            );
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                "cookie-consent-expiry",
            );
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                "cookie-consent-version",
            );
        });
    });

    describe("options", () => {
        it("should respect custom expiry days", async () => {
            const { result } = renderHook(() =>
                useCookieConsent({ expiryDays: 30 }),
            );

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.acceptAll();
            });

            // Check that expiry was set (we verify via the setItem call)
            const expiryCall = localStorageMock.setItem.mock.calls.find(
                ([key]) => key === "cookie-consent-expiry",
            );
            expect(expiryCall).toBeDefined();

            // Verify the expiry date is approximately 30 days from now
            if (expiryCall) {
                const expiryDate = new Date(expiryCall[1]);
                const expectedDate = new Date();
                expectedDate.setDate(expectedDate.getDate() + 30);

                // Should be within 1 day of expected (to account for test timing)
                const diffDays = Math.abs(
                    (expiryDate.getTime() - expectedDate.getTime()) /
                        (1000 * 60 * 60 * 24),
                );
                expect(diffDays).toBeLessThan(1);
            }
        });

        it("should disable Google Consent Mode when option is false", async () => {
            const { result } = renderHook(() =>
                useCookieConsent({ enableGoogleConsent: false }),
            );

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // The gtag should not have been called for consent mode
            // (it may have been called from previous tests, so we check after accept)
            const callCountBefore = mockGtag.mock.calls.length;

            act(() => {
                result.current.acceptAll();
            });

            // Should not have made additional gtag calls
            expect(mockGtag.mock.calls.length).toBe(callCountBefore);
        });
    });
});
