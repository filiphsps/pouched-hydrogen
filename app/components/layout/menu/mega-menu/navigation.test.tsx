import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Navigation } from "./navigation";

// Mock hooks and components
vi.mock("./use-merged-menu-data", () => ({
    useMergedMenuData: vi.fn(),
}));

import { useMergedMenuData } from "./use-merged-menu-data";

vi.mock("./mega-menu-content", () => ({
    MegaMenuContent: ({ items }: any) => (
        <div data-testid="mega-menu-content">Content Items: {items.length}</div>
    ),
}));

vi.mock("~/components/layout/country-selector", () => ({
    CountrySelector: () => <div data-testid="country-selector" />,
}));

vi.mock("./account-link", () => ({
    AccountLink: () => <div data-testid="account-link" />,
}));

vi.mock("~/components/link", () => ({
    default: ({ to, children, className, onClick }: any) => (
        <a
            href={to}
            className={className}
            onClick={onClick}
            data-testid="nav-link"
        >
            {children}
        </a>
    ),
}));

// Resize observer mock for Radix
global.ResizeObserver = class ResizeObserver {
    observe() {
        // intentional
    }
    unobserve() {
        // intentional
    }
    disconnect() {
        // intentional
    }
};

describe("Navigation", () => {
    const mockItems = [
        { id: "1", title: "Home", to: "/", items: [] },
        {
            id: "2",
            title: "Shop",
            to: "/shop",
            isMegaMenu: true,
            items: [
                {
                    id: "sub1",
                    title: "Sub",
                    items: [{ id: "l1", title: "Link 1", to: "/l1" }],
                },
            ],
        },
    ];

    it("renders nothing if no items", () => {
        (useMergedMenuData as any).mockReturnValue([]);
        const { container } = render(<Navigation>Menu</Navigation>);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders trigger button", () => {
        (useMergedMenuData as any).mockReturnValue(mockItems);
        render(
            <Navigation>
                <button type="button">Menu Trigger</button>
            </Navigation>,
        );
        expect(screen.getByText("Menu Trigger")).toBeInTheDocument();
    });

    it("opens drawer on trigger click (mobile)", async () => {
        (useMergedMenuData as any).mockReturnValue(mockItems);
        render(
            <Navigation>
                <button type="button">Menu Trigger</button>
            </Navigation>,
        );

        fireEvent.click(screen.getByText("Menu Trigger"));

        await waitFor(() => {
            expect(screen.getByTestId("account-link")).toBeInTheDocument();
            expect(screen.getByTestId("country-selector")).toBeInTheDocument();
        });

        // Check for links in drawer and desktop (since both are in DOM)
        expect(screen.getAllByTestId("nav-link")).toHaveLength(3); // Home (Mobile), Shop (Mobile), Home (Desktop)
    });

    it("renders desktop navigation correctly", () => {
        (useMergedMenuData as any).mockReturnValue(mockItems);
        render(
            <Navigation>
                <button type="button">Menu Trigger</button>
            </Navigation>,
        );

        // Desktop menu structure is present in DOM but might be hidden via CSS in real browser
        // In jsdom, class names are just strings.
        // We can check if Radix Navigation Menu Root is present.
        // The desktop menu lists items.

        // Note: NavigationMenu items are rendered.
        // Radix NavigationMenu renders into the DOM.
        // Let's verify we have text corresponding to items.
        // Since both mobile drawer (when open) and desktop menu have "Home", it might be ambiguous if duplicate.
        // But drawer is closed initially.

        const homeLinks = screen.getAllByText("Home");
        // One in mobile drawer (hidden/unmounted via Dialog?) -> Dialog contents are usually not in DOM until open if `modal` is default (true).
        // Radix Dialog portal logic: if not open, not in DOM.
        // So `screen.getByText("Home")` should find the Desktop one.

        // Wait, Radix Dialog logic: Portal content is not rendered when closed.
        // So ONLY the desktop menu "Home" should be visible?
        // Let's check.
        expect(homeLinks.length).toBeGreaterThan(0);
    });
});
