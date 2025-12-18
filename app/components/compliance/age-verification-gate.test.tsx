/**
 * Tests for AgeVerificationGate component.
 * Tests modal rendering, user interactions, and accessibility.
 */
import { fireEvent, render, screen } from "@testing-library/react";
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
    };
})();

Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
});

// Mock window.location
const mockLocationHref = vi.fn();
const locationMock = {
    _href: "",
    get href() {
        return this._href;
    },
    set href(url: string) {
        this._href = url;
        mockLocationHref(url);
    },
};
Object.defineProperty(window, "location", {
    value: locationMock,
    writable: true,
});

// Mock useThemeSettings with configurable values
let mockThemeSettings = {
    ageVerificationEnabled: true,
    ageVerificationImage: null,
    ageVerificationHeading: "",
    ageVerificationDescription: "",
    ageVerificationConfirmText: "",
    ageVerificationDenyText: "",
    ageVerificationDenyUrl: "",
};

vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: () => mockThemeSettings,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "ageVerification.overlay": "Age verification overlay",
                "ageVerification.accessibleTitle": "Age Verification Required",
                "ageVerification.heading": "Are you 18 or older?",
                "ageVerification.description":
                    "You must be 18 years or older to access this site.",
                "ageVerification.confirm": "Yes, I am 18+",
                "ageVerification.deny": "No, I am under 18",
                "ageVerification.disclaimer":
                    "By entering this site, you confirm you are of legal age.",
            };
            return translations[key] || key;
        },
    }),
}));

// Mock react-router
vi.mock("react-router", () => ({
    useRouteLoaderData: () => ({
        isBot: false,
    }),
}));

// Mock useAgeVerification hook
const mockVerifyAge = vi.fn();
let mockIsVerified = false;
let mockIsLoading = false;

vi.mock("~/hooks/use-age-verification", () => ({
    useAgeVerification: () => ({
        isVerified: mockIsVerified,
        isLoading: mockIsLoading,
        verifyAge: mockVerifyAge,
    }),
}));

// Import component after mocking
import { AgeVerificationGate } from "./age-verification-gate";

describe("AgeVerificationGate", () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
        mockIsVerified = false;
        mockIsLoading = false;
        mockThemeSettings = {
            ageVerificationEnabled: true,
            ageVerificationImage: null,
            ageVerificationHeading: "",
            ageVerificationDescription: "",
            ageVerificationConfirmText: "",
            ageVerificationDenyText: "",
            ageVerificationDenyUrl: "",
        };
    });

    describe("Rendering", () => {
        it("should render the modal when age verification is enabled and user is not verified", () => {
            render(<AgeVerificationGate />);

            expect(
                screen.getByText("Are you 18 or older?"),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "You must be 18 years or older to access this site.",
                ),
            ).toBeInTheDocument();
            expect(screen.getByText("Yes, I am 18+")).toBeInTheDocument();
            expect(screen.getByText("No, I am under 18")).toBeInTheDocument();
        });

        it("should display the 18+ badge", () => {
            render(<AgeVerificationGate />);

            expect(screen.getByText("18+")).toBeInTheDocument();
        });

        it("should display legal disclaimer", () => {
            render(<AgeVerificationGate />);

            expect(
                screen.getByText(
                    "By entering this site, you confirm you are of legal age.",
                ),
            ).toBeInTheDocument();
        });

        it("should not render when age verification is disabled", () => {
            mockThemeSettings.ageVerificationEnabled = false;
            render(<AgeVerificationGate />);

            expect(
                screen.queryByText("Are you 18 or older?"),
            ).not.toBeInTheDocument();
        });

        it("should not render when user is already verified", () => {
            mockIsVerified = true;
            render(<AgeVerificationGate />);

            expect(
                screen.queryByText("Are you 18 or older?"),
            ).not.toBeInTheDocument();
        });

        it("should not render during loading to prevent flash", () => {
            mockIsLoading = true;
            render(<AgeVerificationGate />);

            expect(
                screen.queryByText("Are you 18 or older?"),
            ).not.toBeInTheDocument();
        });

        it("should use custom heading from theme settings", () => {
            mockThemeSettings.ageVerificationHeading = "Bist du 18 oder älter?";
            render(<AgeVerificationGate />);

            expect(
                screen.getByText("Bist du 18 oder älter?"),
            ).toBeInTheDocument();
        });

        it("should use custom description from theme settings", () => {
            mockThemeSettings.ageVerificationDescription =
                "Du musst 18 Jahre oder älter sein.";
            render(<AgeVerificationGate />);

            expect(
                screen.getByText("Du musst 18 Jahre oder älter sein."),
            ).toBeInTheDocument();
        });

        it("should use custom button text from theme settings", () => {
            mockThemeSettings.ageVerificationConfirmText = "Ja, ich bin 18+";
            mockThemeSettings.ageVerificationDenyText =
                "Nein, ich bin unter 18";
            render(<AgeVerificationGate />);

            expect(screen.getByText("Ja, ich bin 18+")).toBeInTheDocument();
            expect(
                screen.getByText("Nein, ich bin unter 18"),
            ).toBeInTheDocument();
        });
    });

    describe("User Interactions", () => {
        it("should call verifyAge when confirm button is clicked", () => {
            render(<AgeVerificationGate />);

            const confirmButton = screen.getByText("Yes, I am 18+");
            fireEvent.click(confirmButton);

            expect(mockVerifyAge).toHaveBeenCalledTimes(1);
        });

        it("should redirect to Google when deny button is clicked with no custom URL", () => {
            render(<AgeVerificationGate />);

            const denyButton = screen.getByText("No, I am under 18");
            fireEvent.click(denyButton);

            expect(mockLocationHref).toHaveBeenCalledWith(
                "https://www.google.com",
            );
        });

        it("should redirect to custom URL when deny button is clicked", () => {
            mockThemeSettings.ageVerificationDenyUrl = "https://example.com";
            render(<AgeVerificationGate />);

            const denyButton = screen.getByText("No, I am under 18");
            fireEvent.click(denyButton);

            expect(mockLocationHref).toHaveBeenCalledWith(
                "https://example.com",
            );
        });

        it("should have correct button IDs for targeting", () => {
            render(<AgeVerificationGate />);

            expect(
                document.getElementById("age-verify-confirm"),
            ).toBeInTheDocument();
            expect(
                document.getElementById("age-verify-deny"),
            ).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("should have accessible title for screen readers", () => {
            render(<AgeVerificationGate />);

            // The title is visually hidden but accessible
            expect(
                screen.getByText("Age Verification Required"),
            ).toBeInTheDocument();
        });

        it("should have aria-describedby linking to description", () => {
            render(<AgeVerificationGate />);

            expect(
                document.getElementById("age-verification-description"),
            ).toBeInTheDocument();
        });

        it("should have aria-label on overlay", () => {
            render(<AgeVerificationGate />);

            expect(
                screen.getByLabelText("Age verification overlay"),
            ).toBeInTheDocument();
        });

        it("should render confirm and deny buttons", () => {
            render(<AgeVerificationGate />);

            const confirmButton = screen.getByText("Yes, I am 18+");
            const denyButton = screen.getByText("No, I am under 18");

            // Verify buttons are clickable elements
            expect(confirmButton.closest("button")).toBeInTheDocument();
            expect(denyButton.closest("button")).toBeInTheDocument();
        });
    });

    describe("Modal Behavior", () => {
        it("should render as a modal dialog", () => {
            render(<AgeVerificationGate />);

            // The dialog should be present
            const dialog = screen.getByRole("dialog");
            expect(dialog).toBeInTheDocument();
        });

        it("should have overlay with backdrop blur", () => {
            render(<AgeVerificationGate />);

            // Check for overlay element with backdrop-blur class
            const overlay = screen.getByLabelText("Age verification overlay");
            expect(overlay).toHaveClass("backdrop-blur-sm");
        });
    });

    describe("Image Support", () => {
        it("should not render image when not provided", () => {
            render(<AgeVerificationGate />);

            const images = document.querySelectorAll("img");
            expect(images.length).toBe(0);
        });

        it("should render image when provided in theme settings", () => {
            mockThemeSettings.ageVerificationImage = {
                url: "https://example.com/image.jpg",
                altText: "Age verification image",
            };
            render(<AgeVerificationGate />);

            const image = screen.getByRole("img");
            expect(image).toBeInTheDocument();
        });
    });
});
