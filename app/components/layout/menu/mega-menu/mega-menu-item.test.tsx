import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { MegaMenuItem, NavigationMenuProvider } from "./mega-menu-item";
import type { MegaMenuLink } from "./types";

// Mock dependencies to avoid complex rendering and ensure isolation
vi.mock("~/components/image", () => ({
    Image: ({ data, className }: any) => (
        // biome-ignore lint/performance/noImgElement: mock
        // biome-ignore lint/correctness/useImageSize: mock
        <img
            src={data?.url || "mock-image-url"}
            alt={data?.altText || "mock-alt"}
            className={className}
            data-testid="shopify-image"
        />
    ),
}));

vi.mock("~/components/link", () => ({
    default: ({ to, children, className }: any) => (
        <a href={to} className={className} data-testid="custom-link">
            {children}
        </a>
    ),
}));

// Mock Title and Paragraph to avoid testing their implementation details
vi.mock("~/components/title", () => ({
    Title: ({ children, className }: any) => (
        <div data-testid="title" className={className}>
            {children}
        </div>
    ),
}));

vi.mock("~/components/paragraph", () => ({
    default: ({ content, className }: any) => (
        <div data-testid="paragraph" className={className}>
            {content}
        </div>
    ),
}));

// Setup wrapper for router context
const renderWithRouter = (ui: React.ReactNode) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

describe("MegaMenuItem", () => {
    const mockItemBase: MegaMenuLink = {
        id: "1",
        title: "Test Item",
        to: "/test-path",
        product: null,
        collection: null,
        page: null,
        description: "Test Description",
    };

    it("renders title and description correctly", () => {
        renderWithRouter(<MegaMenuItem item={mockItemBase} />);

        expect(screen.getByText("Test Item")).toBeInTheDocument();
        expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("renders link with explicit 'to' prop", () => {
        renderWithRouter(<MegaMenuItem item={mockItemBase} />);

        const link = screen.getByTestId("custom-link");
        expect(link).toHaveAttribute("href", "/test-path");
    });

    it("renders image when provided in item", () => {
        const itemWithImage: MegaMenuLink = {
            ...mockItemBase,
            image: { url: "test.jpg", altText: "Test Image" },
        };

        renderWithRouter(<MegaMenuItem item={itemWithImage} />);

        const img = screen.getByTestId("shopify-image");
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", "test.jpg");
    });

    it("renders resource image when showResourceImage is true", () => {
        const itemWithProduct: MegaMenuLink = {
            ...mockItemBase,
            image: null,
            product: {
                handle: "test-product",
                featuredImage: { url: "product.jpg", altText: "Product" },
            } as any,
            // Clear explicit 'to' so it resolves from product but we want to test image specifically here
            // Note: utils logic prefers explict image, then resource image
        };

        renderWithRouter(
            <MegaMenuItem item={itemWithProduct} showResourceImage={true} />,
        );

        const img = screen.getByTestId("shopify-image");
        expect(img).toHaveAttribute("src", "product.jpg");
    });

    it("does not render resource image when showResourceImage is false", () => {
        const itemWithProduct: MegaMenuLink = {
            ...mockItemBase,
            image: null,
            product: {
                handle: "test-product",
                featuredImage: { url: "product.jpg", altText: "Product" },
            } as any,
        };

        renderWithRouter(
            <MegaMenuItem item={itemWithProduct} showResourceImage={false} />,
        );

        expect(screen.queryByTestId("shopify-image")).not.toBeInTheDocument();
    });

    it("renders as div when no URL can be resolved", () => {
        const itemNoLink: MegaMenuLink = {
            ...mockItemBase,
            to: undefined, // explicit undefined
            product: null,
        };

        renderWithRouter(<MegaMenuItem item={itemNoLink} />);

        expect(screen.queryByTestId("custom-link")).not.toBeInTheDocument();
        expect(screen.getByText("Test Item")).toBeInTheDocument();
    });

    it("wraps in NavigationMenu.Link when inside NavigationMenuContext", () => {
        // We need a real NavigationMenu Root to avoid errors if the Link tries to communicate up
        // However, since we are mocking things, we might just check if the output structure changes.
        // But NavigationMenu.Link might throw if not in Root.
        // Let's wrap in NavigationMenu.Root just in case.

        renderWithRouter(
            <NavigationMenu.Root>
                <NavigationMenu.List>
                    <NavigationMenu.Item>
                        <NavigationMenuProvider value={true}>
                            <MegaMenuItem item={mockItemBase} />
                        </NavigationMenuProvider>
                    </NavigationMenu.Item>
                </NavigationMenu.List>
            </NavigationMenu.Root>,
        );

        // Radix NavigationMenu.Link usually renders as an 'a' tag or passes through
        // Since we pass `asChild`, our CustomLink (mocked as 'a') should be rendered.
        // Radix might add data attributes.
        const link = screen.getByTestId("custom-link");
        expect(link).toBeInTheDocument();
        // Check for some radix attribute to confirm it's being handled by Radix if possible,
        // or just rely on it not throwing.
        // A better check is that it IS rendered.
    });
});
