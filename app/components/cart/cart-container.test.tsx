import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CartContainer } from "./cart-container";

// Mock dependencies
vi.mock("@shopify/hydrogen", () => ({
    useAnalytics: () => ({ publish: vi.fn() }),
    Await: ({ children, resolve }: any) => children(resolve),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: () => ({
        cartModalEnabled: true,
        cartModalMaxWidth: 768,
        cartModalAnimation: "slide-up",
        cartDrawerWidth: 480,
    }),
}));

vi.mock("~/components/cart/cart-main", () => ({
    CartMain: () => <div data-testid="cart-main">Cart Main Content</div>,
}));

vi.mock("~/components/link", () => ({
    default: ({ children, to, className }: any) => (
        <a href={to} className={className}>
            {children}
        </a>
    ),
}));

// Mock useRouteLoaderData to return cart data
const mockCart = {
    id: "cart-1",
    totalQuantity: 3,
    lines: { nodes: [] },
};

vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useRouteLoaderData: () => ({
            cart: mockCart,
        }),
    };
});

// Helper to set media query state
function setDesktopMode(isDesktop: boolean) {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn((query: string) => ({
            matches: isDesktop && query === "(min-width: 768px)",
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        })),
    });
}

function renderWithRouter(ui: React.ReactElement) {
    const router = createMemoryRouter(
        [
            {
                path: "/",
                element: ui,
            },
        ],
        {
            initialEntries: ["/"],
        },
    );

    return render(<RouterProvider router={router} />);
}

describe("CartContainer", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders modal on desktop when enabled", async () => {
        setDesktopMode(true);
        renderWithRouter(<CartContainer />);

        // Check for cart count
        expect(screen.getByText("3")).toBeInTheDocument();

        // Open cart
        const trigger = screen.getByRole("button");
        fireEvent.click(trigger);

        // Check modal content appears
        await waitFor(() => {
            expect(screen.getByText("cart.title")).toBeInTheDocument();
            expect(screen.getByTestId("cart-main")).toBeInTheDocument();
        });
    });

    it("renders drawer on mobile", async () => {
        setDesktopMode(false);
        renderWithRouter(<CartContainer />);

        // Check for cart count
        expect(screen.getByText("3")).toBeInTheDocument();

        // Open cart
        const trigger = screen.getByRole("button");
        fireEvent.click(trigger);

        // Check drawer content appears
        await waitFor(() => {
            expect(screen.getByText("cart.title")).toBeInTheDocument();
            expect(screen.getByTestId("cart-main")).toBeInTheDocument();
        });
    });
});
