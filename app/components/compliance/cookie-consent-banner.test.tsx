/**
 * Tests for CookieConsentBanner component.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CookieConsentBanner } from "./cookie-consent-banner";

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

// Mock Weaverse settings
vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: vi.fn(() => ({
        cookieConsentEnabled: true,
    })),
}));

describe("CookieConsentBanner", () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
        window.dataLayer = [];
    });

    describe("rendering", () => {
        it("should render the banner when not consented", async () => {
            render(<CookieConsentBanner />);

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.title"),
                ).toBeInTheDocument();
            });
        });

        it("should show Accept All, Reject All, and Manage Preferences buttons", async () => {
            render(<CookieConsentBanner />);

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.acceptAll"),
                ).toBeInTheDocument();
                expect(
                    screen.getByText("cookieConsent.rejectAll"),
                ).toBeInTheDocument();
                expect(
                    screen.getByText("cookieConsent.managePreferences"),
                ).toBeInTheDocument();
            });
        });

        it("should not render when already consented", async () => {
            // Set up stored consent
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
            localStorageMock.setItem("cookie-consent-version", "1");

            render(<CookieConsentBanner />);

            // Wait for loading to complete
            await waitFor(() => {
                expect(
                    screen.queryByText("cookieConsent.title"),
                ).not.toBeInTheDocument();
            });
        });

        it("should not render when disabled via theme settings", async () => {
            const { useThemeSettings } = await import("@weaverse/hydrogen");
            vi.mocked(useThemeSettings).mockReturnValue({
                cookieConsentEnabled: false,
            });

            render(<CookieConsentBanner />);

            await waitFor(() => {
                expect(
                    screen.queryByText("cookieConsent.title"),
                ).not.toBeInTheDocument();
            });

            // Reset mock
            vi.mocked(useThemeSettings).mockReturnValue({
                cookieConsentEnabled: true,
            });
        });
    });

    describe("Accept All button", () => {
        it("should hide banner when Accept All is clicked", async () => {
            render(<CookieConsentBanner />);

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.acceptAll"),
                ).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("cookieConsent.acceptAll"));

            await waitFor(() => {
                expect(
                    screen.queryByText("cookieConsent.title"),
                ).not.toBeInTheDocument();
            });
        });

        it("should store all consents as true when Accept All is clicked", async () => {
            render(<CookieConsentBanner />);

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.acceptAll"),
                ).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("cookieConsent.acceptAll"));

            await waitFor(() => {
                expect(localStorageMock.setItem).toHaveBeenCalledWith(
                    "cookie-consent",
                    JSON.stringify({
                        analytics: true,
                        marketing: true,
                        functional: true,
                    }),
                );
            });
        });
    });

    describe("Reject All button", () => {
        it("should hide banner when Reject All is clicked", async () => {
            render(<CookieConsentBanner />);

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.rejectAll"),
                ).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("cookieConsent.rejectAll"));

            await waitFor(() => {
                expect(
                    screen.queryByText("cookieConsent.title"),
                ).not.toBeInTheDocument();
            });
        });

        it("should store all consents as false when Reject All is clicked", async () => {
            render(<CookieConsentBanner />);

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.rejectAll"),
                ).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("cookieConsent.rejectAll"));

            await waitFor(() => {
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
    });

    describe("Manage Preferences", () => {
        it("should open preferences dialog when Manage Preferences is clicked", async () => {
            render(<CookieConsentBanner />);

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.managePreferences"),
                ).toBeInTheDocument();
            });

            fireEvent.click(
                screen.getByText("cookieConsent.managePreferences"),
            );

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.preferencesTitle"),
                ).toBeInTheDocument();
            });
        });

        it("should show cookie categories in preferences dialog", async () => {
            render(<CookieConsentBanner />);

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.managePreferences"),
                ).toBeInTheDocument();
            });

            fireEvent.click(
                screen.getByText("cookieConsent.managePreferences"),
            );

            await waitFor(() => {
                // Essential cookies (always on)
                expect(
                    screen.getByText(
                        "cookieConsent.categories.essential.title",
                    ),
                ).toBeInTheDocument();

                // Optional categories
                expect(
                    screen.getByText(
                        "cookieConsent.categories.functional.title",
                    ),
                ).toBeInTheDocument();
                expect(
                    screen.getByText(
                        "cookieConsent.categories.analytics.title",
                    ),
                ).toBeInTheDocument();
                expect(
                    screen.getByText(
                        "cookieConsent.categories.marketing.title",
                    ),
                ).toBeInTheDocument();
            });
        });

        it("should show Save Preferences button in preferences dialog", async () => {
            render(<CookieConsentBanner />);

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.managePreferences"),
                ).toBeInTheDocument();
            });

            fireEvent.click(
                screen.getByText("cookieConsent.managePreferences"),
            );

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.savePreferences"),
                ).toBeInTheDocument();
            });
        });

        it("should have toggleable checkboxes for optional categories", async () => {
            render(<CookieConsentBanner />);

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.managePreferences"),
                ).toBeInTheDocument();
            });

            fireEvent.click(
                screen.getByText("cookieConsent.managePreferences"),
            );

            await waitFor(() => {
                // Find checkboxes by their IDs
                const analyticsCheckbox = screen.getByRole("checkbox", {
                    name: "cookieConsent.categories.analytics.title",
                });
                expect(analyticsCheckbox).toBeInTheDocument();
            });
        });
    });

    describe("accessibility", () => {
        it("should have proper ARIA attributes on banner", async () => {
            render(<CookieConsentBanner />);

            await waitFor(() => {
                const banner = screen.getByRole("dialog");
                expect(banner).toHaveAttribute(
                    "aria-labelledby",
                    "cookie-banner-title",
                );
                expect(banner).toHaveAttribute(
                    "aria-describedby",
                    "cookie-banner-description",
                );
            });
        });

        it("should have accessible title and description", async () => {
            render(<CookieConsentBanner />);

            await waitFor(() => {
                expect(screen.getByText("cookieConsent.title")).toHaveAttribute(
                    "id",
                    "cookie-banner-title",
                );
                expect(
                    screen.getByText("cookieConsent.description"),
                ).toHaveAttribute("id", "cookie-banner-description");
            });
        });
    });
});
