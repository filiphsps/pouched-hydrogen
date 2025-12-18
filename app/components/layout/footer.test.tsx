/**
 * Tests for Footer component.
 * Tests rendering, theme settings integration, social links, newsletter form, and cookie settings.
 */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock phosphor icons
vi.mock("@phosphor-icons/react", () => ({
    FacebookLogoIcon: ({ className }: { className?: string }) => (
        <span data-testid="facebook-icon" className={className}>
            FB
        </span>
    ),
    InstagramLogoIcon: ({ className }: { className?: string }) => (
        <span data-testid="instagram-icon" className={className}>
            IG
        </span>
    ),
    LinkedinLogoIcon: ({ className }: { className?: string }) => (
        <span data-testid="linkedin-icon" className={className}>
            LI
        </span>
    ),
    XLogoIcon: ({ className }: { className?: string }) => (
        <span data-testid="x-icon" className={className}>
            X
        </span>
    ),
}));

// Mock @shopify/hydrogen
vi.mock("@shopify/hydrogen", () => ({
    Image: ({ data, className }: { data: any; className?: string }) => (
        <div
            data-testid="footer-logo"
            className={className}
            data-src={data?.url}
            data-alt={data?.altText || ""}
        />
    ),
}));

// Mock theme settings
let mockThemeSettings = {
    footerWidth: "fixed",
    socialFacebook: "https://facebook.com/test",
    socialInstagram: "https://instagram.com/test",
    socialLinkedIn: "https://linkedin.com/test",
    socialX: "https://x.com/test",
    footerLogoData: null as { url: string; altText: string } | null,
    footerLogoWidth: 120,
    bio: "<p>Test bio content</p>",
    copyright: "© 2025 Test Store",
    addressTitle: "Contact Us",
    storeAddress: "123 Test Street",
    storeEmail: "test@example.com",
    newsletterTitle: "Newsletter",
    newsletterDescription: "Subscribe to our newsletter",
    newsletterPlaceholder: "Enter your email",
    newsletterButtonText: "Subscribe",
    cookieConsentEnabled: true,
    footerShowCookieSettings: true,
};

vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: () => mockThemeSettings,
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "footer.email": "Email",
                "footer.signUpSuccess": "Successfully subscribed!",
                "footer.signUpError": "Something went wrong",
            };
            return translations[key] || key;
        },
    }),
}));

// Mock react-router
vi.mock("react-router", () => ({
    useFetcher: () => ({
        Form: ({
            children,
            action,
            method,
        }: {
            children: React.ReactNode;
            action: string;
            method: string;
        }) => (
            <form action={action} method={method} data-testid="newsletter-form">
                {children}
            </form>
        ),
        data: null,
        state: "idle",
    }),
    useRouteLoaderData: () => ({
        selectedLocale: { pathPrefix: "" },
    }),
}));

// Mock hooks
vi.mock("~/hooks/use-shop-menu", () => ({
    useShopMenu: () => ({
        shopName: "Test Shop",
        menus: [],
    }),
}));

// Mock utils
vi.mock("~/utils/weaverse", () => ({
    resolveWeaverseString: (str: string) => str,
}));

// Mock components
vi.mock("~/components/banner", () => ({
    Banner: ({
        children,
        variant,
    }: {
        children: React.ReactNode;
        variant: string;
    }) => <div data-testid={`banner-${variant}`}>{children}</div>,
}));

vi.mock("~/components/button", () => ({
    Button: ({
        children,
        type,
        className,
    }: {
        children: React.ReactNode;
        type?: string;
        className?: string;
    }) => (
        <button
            type={type as "submit" | "button" | "reset"}
            className={className}
        >
            {children}
        </button>
    ),
}));

vi.mock("~/components/compliance/cookie-settings-popup", () => ({
    CookieSettingsPopup: () => (
        <div data-testid="cookie-settings-popup">Cookie Settings</div>
    ),
}));

vi.mock("~/components/link", () => ({
    default: ({
        children,
        to,
        target,
        className,
    }: {
        children: React.ReactNode;
        to: string;
        target?: string;
        className?: string;
    }) => (
        <a href={to} target={target} className={className}>
            {children}
        </a>
    ),
}));

vi.mock("./country-selector", () => ({
    CountrySelector: () => (
        <div data-testid="country-selector">Country Selector</div>
    ),
}));

vi.mock("./menu/footer-menu", () => ({
    FooterMenu: () => <div data-testid="footer-menu">Footer Menu</div>,
}));

// Import after mocking
import { Footer } from "./footer";

function resetMocks() {
    vi.clearAllMocks();
    mockThemeSettings = {
        footerWidth: "fixed",
        socialFacebook: "https://facebook.com/test",
        socialInstagram: "https://instagram.com/test",
        socialLinkedIn: "https://linkedin.com/test",
        socialX: "https://x.com/test",
        footerLogoData: null,
        footerLogoWidth: 120,
        bio: "<p>Test bio content</p>",
        copyright: "© 2025 Test Store",
        addressTitle: "Contact Us",
        storeAddress: "123 Test Street",
        storeEmail: "test@example.com",
        newsletterTitle: "Newsletter",
        newsletterDescription: "Subscribe to our newsletter",
        newsletterPlaceholder: "Enter your email",
        newsletterButtonText: "Subscribe",
        cookieConsentEnabled: true,
        footerShowCookieSettings: true,
    };
}

describe("Footer", () => {
    beforeEach(() => {
        resetMocks();
    });

    describe("Rendering", () => {
        it("should render the footer element", () => {
            render(<Footer />);

            const footer = document.querySelector("footer");
            expect(footer).toBeInTheDocument();
        });

        it("should render shop name when no logo is provided", () => {
            render(<Footer />);

            expect(screen.getByText("Test Shop")).toBeInTheDocument();
        });

        it("should render logo when footerLogoData is provided", () => {
            mockThemeSettings.footerLogoData = {
                url: "https://example.com/logo.png",
                altText: "Test Logo",
            };
            render(<Footer />);

            expect(screen.getByTestId("footer-logo")).toBeInTheDocument();
        });

        it("should render bio content", () => {
            render(<Footer />);

            expect(screen.getByText("Test bio content")).toBeInTheDocument();
        });

        it("should render footer menu", () => {
            render(<Footer />);

            expect(screen.getByTestId("footer-menu")).toBeInTheDocument();
        });

        it("should render copyright text", () => {
            render(<Footer />);

            expect(screen.getByText("© 2025 Test Store")).toBeInTheDocument();
        });
    });

    describe("Social Links", () => {
        it("should render all social icons when URLs are provided", () => {
            render(<Footer />);

            expect(screen.getByTestId("facebook-icon")).toBeInTheDocument();
            expect(screen.getByTestId("instagram-icon")).toBeInTheDocument();
            expect(screen.getByTestId("linkedin-icon")).toBeInTheDocument();
            expect(screen.getByTestId("x-icon")).toBeInTheDocument();
        });

        it("should not render social icon when URL is empty", () => {
            mockThemeSettings.socialFacebook = "";
            mockThemeSettings.socialInstagram = "";
            render(<Footer />);

            expect(
                screen.queryByTestId("facebook-icon"),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId("instagram-icon"),
            ).not.toBeInTheDocument();
        });

        it("should link social icons to external URLs", () => {
            render(<Footer />);

            const links = document.querySelectorAll('a[target="_blank"]');
            expect(links.length).toBeGreaterThan(0);
        });
    });

    describe("Contact Information", () => {
        it("should render address title", () => {
            render(<Footer />);

            expect(screen.getByText("Contact Us")).toBeInTheDocument();
        });

        it("should render store address", () => {
            render(<Footer />);

            expect(screen.getByText("123 Test Street")).toBeInTheDocument();
        });

        it("should render store email", () => {
            render(<Footer />);

            expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
        });
    });

    describe("Newsletter Form", () => {
        it("should render newsletter title", () => {
            render(<Footer />);

            expect(screen.getByText("Newsletter")).toBeInTheDocument();
        });

        it("should render newsletter description", () => {
            render(<Footer />);

            expect(
                screen.getByText("Subscribe to our newsletter"),
            ).toBeInTheDocument();
        });

        it("should render email input with placeholder", () => {
            render(<Footer />);

            const input = screen.getByPlaceholderText("Enter your email");
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("type", "email");
            expect(input).toHaveAttribute("required");
        });

        it("should render subscribe button", () => {
            render(<Footer />);

            expect(screen.getByText("Subscribe")).toBeInTheDocument();
        });

        it("should have form action pointing to klaviyo API", () => {
            render(<Footer />);

            const form = screen.getByTestId("newsletter-form");
            expect(form).toHaveAttribute("action", "/api/klaviyo");
        });
    });

    describe("Country Selector", () => {
        it("should render country selector", () => {
            render(<Footer />);

            expect(screen.getByTestId("country-selector")).toBeInTheDocument();
        });
    });

    describe("Cookie Settings", () => {
        it("should render cookie settings popup when enabled", () => {
            render(<Footer />);

            expect(
                screen.getByTestId("cookie-settings-popup"),
            ).toBeInTheDocument();
        });

        it("should not render cookie settings when cookieConsentEnabled is false", () => {
            mockThemeSettings.cookieConsentEnabled = false;
            render(<Footer />);

            expect(
                screen.queryByTestId("cookie-settings-popup"),
            ).not.toBeInTheDocument();
        });

        it("should not render cookie settings when footerShowCookieSettings is false", () => {
            mockThemeSettings.footerShowCookieSettings = false;
            render(<Footer />);

            expect(
                screen.queryByTestId("cookie-settings-popup"),
            ).not.toBeInTheDocument();
        });
    });

    describe("Layout Variants", () => {
        it("should apply fixed width variant", () => {
            mockThemeSettings.footerWidth = "fixed";
            render(<Footer />);

            const footer = document.querySelector("footer");
            expect(footer).toHaveClass("mx-auto");
        });

        it("should apply stretch padding variant", () => {
            mockThemeSettings.footerWidth = "stretch";
            render(<Footer />);

            const footer = document.querySelector("footer");
            expect(footer).toHaveClass("px-3");
        });
    });
});
