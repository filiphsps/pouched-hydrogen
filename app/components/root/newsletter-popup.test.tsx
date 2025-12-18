/**
 * Tests for NewsletterPopup component.
 * Tests modal rendering, form submission, localStorage persistence, and user interactions.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

// Mock useThemeSettings with configurable values
let mockThemeSettings = {
    newsletterPopupEnabled: true,
    newsletterPopupHomeOnly: false,
    newsletterPopupDelay: 0,
    newsletterPopupAllowDismiss: true,
    newsletterPopupImage: null as { url: string; altText: string } | null,
    newsletterPopupImagePosition: "left",
    newsletterPopupHeading: "Subscribe to our newsletter",
    newsletterPopupDescription: "Get the latest updates and offers.",
    newsletterPopupButtonText: "Subscribe",
    newsletterPopupPosition: "center",
};

vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: () => mockThemeSettings,
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "newsletter.popup.title": "Newsletter Signup",
                "newsletter.popup.emailPlaceholder": "Enter your email",
                "newsletter.popup.close": "Close popup",
                "newsletter.popup.success": "Thanks for subscribing!",
                "newsletter.popup.error": "Something went wrong.",
                "newsletter.popup.dontShowAgain": "Don't show this again",
            };
            return translations[key] || key;
        },
    }),
}));

// Mock useWeaverseStudioCheck
let mockIsDesignMode = false;
vi.mock("~/hooks/use-weaverse-studio-check", () => ({
    useWeaverseStudioCheck: () => mockIsDesignMode,
}));

// Mock react-router hooks
vi.mock("react-router", () => ({
    useLocation: () => ({ pathname: "/" }),
    useRouteLoaderData: () => ({
        selectedLocale: { pathPrefix: "" },
    }),
    useFetcher: () => ({
        Form: ({
            children,
            ...props
        }: {
            children: React.ReactNode;
            [key: string]: any;
        }) => <form {...props}>{children}</form>,
        data: null,
        state: "idle",
    }),
}));

// Import after mocking
import { NewsletterPopup } from "./newsletter-popup";

function resetMocks() {
    localStorageMock.clear();
    vi.clearAllMocks();
    mockIsDesignMode = false;
    mockThemeSettings = {
        newsletterPopupEnabled: true,
        newsletterPopupHomeOnly: false,
        newsletterPopupDelay: 0,
        newsletterPopupAllowDismiss: true,
        newsletterPopupImage: null,
        newsletterPopupImagePosition: "left",
        newsletterPopupHeading: "Subscribe to our newsletter",
        newsletterPopupDescription: "Get the latest updates and offers.",
        newsletterPopupButtonText: "Subscribe",
        newsletterPopupPosition: "center",
    };
}

describe("NewsletterPopup", () => {
    beforeEach(() => {
        resetMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Rendering", () => {
        it("should render the popup after delay when enabled", () => {
            render(<NewsletterPopup />);

            // Advance timers to trigger popup (delay is 0 seconds)
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(
                screen.getByText("Subscribe to our newsletter"),
            ).toBeInTheDocument();
        });

        it("should display heading and description", () => {
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(
                screen.getByText("Subscribe to our newsletter"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Get the latest updates and offers."),
            ).toBeInTheDocument();
        });

        it("should render email input field", () => {
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(
                screen.getByPlaceholderText("Enter your email"),
            ).toBeInTheDocument();
        });

        it("should render submit button with custom text", () => {
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(screen.getByText("Subscribe")).toBeInTheDocument();
        });

        it("should render close button", () => {
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(screen.getByLabelText("Close popup")).toBeInTheDocument();
        });

        it("should render 'Don't show again' button when dismiss is allowed", () => {
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(
                screen.getByText("Don't show this again"),
            ).toBeInTheDocument();
        });

        it("should not render 'Don't show again' button when dismiss is not allowed", () => {
            mockThemeSettings.newsletterPopupAllowDismiss = false;
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(
                screen.getByText("Subscribe to our newsletter"),
            ).toBeInTheDocument();
            expect(
                screen.queryByText("Don't show this again"),
            ).not.toBeInTheDocument();
        });
    });

    describe("Delay Behavior", () => {
        it("should show popup after configured delay", () => {
            mockThemeSettings.newsletterPopupDelay = 3;
            render(<NewsletterPopup />);

            // Should not be visible immediately
            expect(
                screen.queryByText("Subscribe to our newsletter"),
            ).not.toBeInTheDocument();

            // Advance timers by 3 seconds
            act(() => {
                vi.advanceTimersByTime(3000);
            });

            expect(
                screen.getByText("Subscribe to our newsletter"),
            ).toBeInTheDocument();
        });

        it("should not show popup before delay completes", () => {
            mockThemeSettings.newsletterPopupDelay = 5;
            render(<NewsletterPopup />);

            // Advance timers by only 2 seconds
            act(() => {
                vi.advanceTimersByTime(2000);
            });

            expect(
                screen.queryByText("Subscribe to our newsletter"),
            ).not.toBeInTheDocument();
        });
    });

    describe("Dismissed State", () => {
        it("should not show popup if previously dismissed", () => {
            localStorageMock.setItem("newsletter-popup-dismissed", "true");
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(
                screen.queryByText("Subscribe to our newsletter"),
            ).not.toBeInTheDocument();
        });

        it("should persist dismissed state when user clicks 'Don't show again'", () => {
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(
                screen.getByText("Subscribe to our newsletter"),
            ).toBeInTheDocument();

            const dontShowButton = screen.getByText("Don't show this again");
            fireEvent.click(dontShowButton);

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "newsletter-popup-dismissed",
                "true",
            );
        });
    });

    describe("Design Mode", () => {
        it("should always show popup in design mode regardless of dismissed state", () => {
            localStorageMock.setItem("newsletter-popup-dismissed", "true");
            mockIsDesignMode = true;
            render(<NewsletterPopup />);

            // Design mode opens immediately without timer
            expect(
                screen.getByText("Subscribe to our newsletter"),
            ).toBeInTheDocument();
        });
    });

    describe("Positioning", () => {
        it("should apply center positioning class", () => {
            mockThemeSettings.newsletterPopupPosition = "center";
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            const content = screen.getByRole("dialog");
            expect(content).toHaveClass("items-center");
            expect(content).toHaveClass("justify-center");
        });

        it("should apply top-left positioning class", () => {
            mockThemeSettings.newsletterPopupPosition = "top-left";
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            const content = screen.getByRole("dialog");
            expect(content).toHaveClass("items-start");
            expect(content).toHaveClass("justify-start");
        });

        it("should apply bottom-right positioning class", () => {
            mockThemeSettings.newsletterPopupPosition = "bottom-right";
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            const content = screen.getByRole("dialog");
            expect(content).toHaveClass("items-end");
            expect(content).toHaveClass("justify-end");
        });
    });

    describe("Image Support", () => {
        it("should not render image container when no image is provided", () => {
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(
                screen.getByText("Subscribe to our newsletter"),
            ).toBeInTheDocument();
            const images = document.querySelectorAll("img");
            expect(images.length).toBe(0);
        });

        it("should render image when provided", () => {
            mockThemeSettings.newsletterPopupImage = {
                url: "https://example.com/newsletter-image.jpg",
                altText: "Newsletter promo",
            };
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            const image = screen.getByRole("img");
            expect(image).toBeInTheDocument();
        });
    });

    describe("Image Position", () => {
        it("should render with left image position by default", () => {
            mockThemeSettings.newsletterPopupImage = {
                url: "https://example.com/image.jpg",
                altText: "Image",
            };
            mockThemeSettings.newsletterPopupImagePosition = "left";
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(screen.getByRole("img")).toBeInTheDocument();
        });

        it("should handle top image position", () => {
            mockThemeSettings.newsletterPopupImage = {
                url: "https://example.com/image.jpg",
                altText: "Image",
            };
            mockThemeSettings.newsletterPopupImagePosition = "top";
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(screen.getByRole("img")).toBeInTheDocument();
        });

        it("should handle right image position", () => {
            mockThemeSettings.newsletterPopupImage = {
                url: "https://example.com/image.jpg",
                altText: "Image",
            };
            mockThemeSettings.newsletterPopupImagePosition = "right";
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(screen.getByRole("img")).toBeInTheDocument();
        });
    });

    describe("Form Submission", () => {
        it("should have email input with required attribute", () => {
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            const emailInput = screen.getByPlaceholderText("Enter your email");
            expect(emailInput).toHaveAttribute("required");
            expect(emailInput).toHaveAttribute("type", "email");
        });

        it("should have form action pointing to klaviyo API", () => {
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            const form = screen.getByText("Subscribe").closest("form");
            expect(form).toHaveAttribute("action", "/api/klaviyo");
        });
    });

    describe("Accessibility", () => {
        it("should have hidden accessible title", () => {
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(screen.getByText("Newsletter Signup")).toBeInTheDocument();
        });

        it("should render as a dialog", () => {
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            expect(screen.getByRole("dialog")).toBeInTheDocument();
        });

        it("should have close button with aria-label", () => {
            render(<NewsletterPopup />);
            act(() => {
                vi.advanceTimersByTime(0);
            });

            const closeButton = screen.getByLabelText("Close popup");
            expect(closeButton).toBeInTheDocument();
        });
    });
});
