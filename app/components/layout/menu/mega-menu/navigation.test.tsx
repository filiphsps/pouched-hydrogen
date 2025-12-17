import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { Navigation } from "./navigation";
import { useMergedMenuData } from "./use-merged-menu-data";

// Mock the data hook - the component's core dependency
vi.mock("./use-merged-menu-data", () => ({
    useMergedMenuData: vi.fn(),
}));

// Mock child components - we test these separately
vi.mock("./mega-menu-content", () => ({
    MegaMenuContent: ({ items }: { items: unknown[] }) => (
        <div data-testid="mega-menu-content">
            {items.map((item: any) => (
                <div key={item.id} data-testid="menu-section">
                    {item.title}
                </div>
            ))}
        </div>
    ),
}));

vi.mock("~/components/layout/country-selector", () => ({
    CountrySelector: () => <div data-testid="country-selector" />,
}));

vi.mock("./account-link", () => ({
    AccountLink: () => <div data-testid="account-link" />,
}));

vi.mock("~/components/link", () => ({
    default: ({ to, children, onClick }: any) => (
        <a href={to} onClick={onClick} data-testid="menu-link">
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

/**
 * Renders component with React Router context
 */
function renderWithRouter(ui: React.ReactElement) {
    const router = createMemoryRouter([{ path: "/", element: ui }], {
        initialEntries: ["/"],
    });
    return render(<RouterProvider router={router} />);
}

describe("Navigation", () => {
    const mockMenuItems = [
        { id: "home", title: "Home", to: "/", items: [] },
        {
            id: "shop",
            title: "Shop",
            to: "/shop",
            isMegaMenu: true,
            items: [
                {
                    id: "category",
                    title: "Category",
                    items: [
                        { id: "product", title: "Product", to: "/product" },
                    ],
                },
            ],
        },
    ];

    it("renders nothing when menu has no items", () => {
        (useMergedMenuData as any).mockReturnValue([]);
        const { container } = renderWithRouter(
            <Navigation>Trigger</Navigation>,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("renders trigger button that opens mobile drawer", async () => {
        (useMergedMenuData as any).mockReturnValue(mockMenuItems);
        renderWithRouter(
            <Navigation>
                <button type="button">Open Menu</button>
            </Navigation>,
        );

        // Trigger should be visible
        const trigger = screen.getByRole("button", { name: "Open Menu" });
        expect(trigger).toBeInTheDocument();

        // Click opens drawer with account link and country selector
        fireEvent.click(trigger);

        await waitFor(() => {
            expect(screen.getByTestId("account-link")).toBeInTheDocument();
            expect(screen.getByTestId("country-selector")).toBeInTheDocument();
        });
    });

    it("shows menu items in drawer when opened", async () => {
        (useMergedMenuData as any).mockReturnValue(mockMenuItems);
        renderWithRouter(
            <Navigation>
                <button type="button">Open Menu</button>
            </Navigation>,
        );

        fireEvent.click(screen.getByRole("button", { name: "Open Menu" }));

        await waitFor(() => {
            // Menu items are visible (may appear in both mobile drawer and desktop nav)
            expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
            // Mega menu content is rendered
            expect(
                screen.getAllByTestId("mega-menu-content").length,
            ).toBeGreaterThan(0);
        });
    });

    it("closes drawer when close button is clicked", async () => {
        (useMergedMenuData as any).mockReturnValue(mockMenuItems);
        renderWithRouter(
            <Navigation>
                <button type="button">Open Menu</button>
            </Navigation>,
        );

        // Open drawer
        fireEvent.click(screen.getByRole("button", { name: "Open Menu" }));

        await waitFor(() => {
            expect(screen.getByTestId("account-link")).toBeInTheDocument();
        });

        // Find and click close button (the X button in header)
        const closeButton = screen.getByRole("button", { name: "" });
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(
                screen.queryByTestId("account-link"),
            ).not.toBeInTheDocument();
        });
    });
});
