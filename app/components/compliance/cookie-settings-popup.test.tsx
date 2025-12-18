/**
 * Tests for CookieSettingsPopup component.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CookieSettingsPopup } from "./cookie-settings-popup";

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

describe("CookieSettingsPopup", () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
        window.dataLayer = [];
    });

    describe("rendering", () => {
        it("should render the default trigger button", async () => {
            render(<CookieSettingsPopup />);

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.settingsLink"),
                ).toBeInTheDocument();
            });
        });

        it("should render custom trigger when provided", async () => {
            render(
                <CookieSettingsPopup
                    trigger={<button type="button">Custom Trigger</button>}
                />,
            );

            await waitFor(() => {
                expect(
                    screen.getByRole("button", { name: /custom trigger/i }),
                ).toBeInTheDocument();
                expect(
                    screen.queryByText("cookieConsent.settingsLink"),
                ).not.toBeInTheDocument();
            });
        });

        it("should not render when disabled via theme settings", async () => {
            const { useThemeSettings } = await import("@weaverse/hydrogen");
            vi.mocked(useThemeSettings).mockReturnValue({
                cookieConsentEnabled: false,
            });

            const { container } = render(<CookieSettingsPopup />);

            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            });

            // Reset mock
            vi.mocked(useThemeSettings).mockReturnValue({
                cookieConsentEnabled: true,
            });
        });
    });

    describe("dialog interaction", () => {
        it("should open dialog when trigger is clicked", async () => {
            render(<CookieSettingsPopup />);

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.settingsLink"),
                ).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("cookieConsent.settingsLink"));

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.preferencesTitle"),
                ).toBeInTheDocument();
            });
        });

        it("should display cookie categories in dialog", async () => {
            render(<CookieSettingsPopup />);

            fireEvent.click(screen.getByText("cookieConsent.settingsLink"));

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

        it("should show essential cookies as required", async () => {
            render(<CookieSettingsPopup />);

            fireEvent.click(screen.getByText("cookieConsent.settingsLink"));

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.required"),
                ).toBeInTheDocument();
            });
        });

        it("should display checkboxes for optional cookie categories", async () => {
            render(<CookieSettingsPopup />);

            fireEvent.click(screen.getByText("cookieConsent.settingsLink"));

            await waitFor(() => {
                // Find checkboxes by their IDs
                const functionalCheckbox = screen.getByRole("checkbox", {
                    name: "cookieConsent.categories.functional.title",
                });
                const analyticsCheckbox = screen.getByRole("checkbox", {
                    name: "cookieConsent.categories.analytics.title",
                });
                const marketingCheckbox = screen.getByRole("checkbox", {
                    name: "cookieConsent.categories.marketing.title",
                });

                expect(functionalCheckbox).toBeInTheDocument();
                expect(analyticsCheckbox).toBeInTheDocument();
                expect(marketingCheckbox).toBeInTheDocument();
            });
        });
    });

    describe("consent actions", () => {
        it("should store preferences when Save Preferences is clicked", async () => {
            render(<CookieSettingsPopup />);

            fireEvent.click(screen.getByText("cookieConsent.settingsLink"));

            await waitFor(() => {
                expect(
                    screen.getByText("cookieConsent.savePreferences"),
                ).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("cookieConsent.savePreferences"));

            await waitFor(() => {
                expect(localStorageMock.setItem).toHaveBeenCalledWith(
                    "cookie-consent",
                    expect.any(String),
                );
            });
        });

        it("should store rejected preferences when Reject All is clicked", async () => {
            render(<CookieSettingsPopup />);

            fireEvent.click(screen.getByText("cookieConsent.settingsLink"));

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

        it("should have toggleable checkboxes", async () => {
            render(<CookieSettingsPopup />);

            fireEvent.click(screen.getByText("cookieConsent.settingsLink"));

            await waitFor(() => {
                expect(
                    screen.getByRole("checkbox", {
                        name: "cookieConsent.categories.analytics.title",
                    }),
                ).toBeInTheDocument();
            });

            const analyticsCheckbox = screen.getByRole("checkbox", {
                name: "cookieConsent.categories.analytics.title",
            });

            // Default state is checked (based on DEFAULT_CONSENT_STATE)
            expect(analyticsCheckbox).toBeChecked();

            // Click to toggle
            fireEvent.click(analyticsCheckbox);

            // Now it should be unchecked
            expect(analyticsCheckbox).not.toBeChecked();
        });
    });

    describe("accessibility", () => {
        it("should have accessible trigger button", async () => {
            render(<CookieSettingsPopup />);

            await waitFor(() => {
                const trigger = screen.getByRole("button");
                expect(trigger).toBeInTheDocument();
                expect(trigger).toHaveAttribute("type", "button");
            });
        });

        it("should have accessible close button in dialog", async () => {
            render(<CookieSettingsPopup />);

            fireEvent.click(screen.getByText("cookieConsent.settingsLink"));

            await waitFor(() => {
                const closeButton = screen.getByRole("button", {
                    name: "cookieConsent.close",
                });
                expect(closeButton).toBeInTheDocument();
            });
        });
    });
});
