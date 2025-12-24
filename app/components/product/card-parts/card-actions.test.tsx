import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CardActions } from "./card-actions";

// Mock dependencies
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@phosphor-icons/react", () => ({
    ShoppingBagIcon: () => <span data-testid="shopping-bag-icon">🛒</span>,
}));

vi.mock("~/components/product/add-to-cart-button", () => ({
    AddToCartButton: ({
        children,
        disabled,
        className,
    }: {
        children: React.ReactNode;
        disabled?: boolean;
        className?: string;
    }) => (
        <button
            type="button"
            data-testid="add-to-cart-btn"
            disabled={disabled}
            className={className}
        >
            {children}
        </button>
    ),
}));

vi.mock("../wishlist-button", () => ({
    WishlistButton: () => (
        <button type="button" data-testid="wishlist-btn">
            Wishlist
        </button>
    ),
}));

const mockVariant = {
    id: "variant-1",
    title: "Default Title",
    availableForSale: true,
    quantityAvailable: 10,
    sku: "SKU-001",
    requiresComponents: false,
    selectedOptions: [{ name: "Size", value: "Default" }],
    price: { amount: "10.00", currencyCode: "EUR" as const },
    product: { title: "Test Product", handle: "test-product" },
    components: { nodes: [] },
    groupedBy: { nodes: [] },
};

describe("CardActions", () => {
    const defaultProps = {
        productId: "p1",
        variant: mockVariant,
    };

    describe("Rendering", () => {
        it("renders add to cart and wishlist by default", () => {
            render(<CardActions {...defaultProps} />);
            expect(screen.getByTestId("add-to-cart-btn")).toBeInTheDocument();
            expect(screen.getByTestId("wishlist-btn")).toBeInTheDocument();
        });

        it("renders icon button by default", () => {
            render(<CardActions {...defaultProps} />);
            expect(screen.getByTestId("shopping-bag-icon")).toBeInTheDocument();
        });

        it("renders icon button when buttonType is text (both variants use icon)", () => {
            render(<CardActions {...defaultProps} buttonType="text" />);
            expect(screen.getByTestId("shopping-bag-icon")).toBeInTheDocument();
        });
    });

    describe("Layout variants", () => {
        it("applies inline layout classes", () => {
            const { container } = render(
                <CardActions {...defaultProps} layout="inline" />,
            );
            expect(container.firstChild).toHaveClass("flex items-center gap-2");
        });

        it("applies stacked layout classes", () => {
            const { container } = render(
                <CardActions {...defaultProps} layout="stacked" />,
            );
            expect(container.firstChild).toHaveClass(
                "flex w-full items-center gap-3",
            );
        });

        it("applies overlay layout classes", () => {
            const { container } = render(
                <CardActions {...defaultProps} layout="overlay" />,
            );
            expect(container.firstChild).toHaveClass("flex flex-col gap-2");
        });
    });

    describe("Visibility controls", () => {
        it("hides add to cart when showQuickAdd is false", () => {
            render(<CardActions {...defaultProps} showQuickAdd={false} />);
            expect(
                screen.queryByTestId("add-to-cart-btn"),
            ).not.toBeInTheDocument();
            expect(screen.getByTestId("wishlist-btn")).toBeInTheDocument();
        });

        it("hides wishlist when showWishlist is false", () => {
            render(<CardActions {...defaultProps} showWishlist={false} />);
            expect(screen.getByTestId("add-to-cart-btn")).toBeInTheDocument();
            expect(
                screen.queryByTestId("wishlist-btn"),
            ).not.toBeInTheDocument();
        });

        it("hides both when both are false", () => {
            render(
                <CardActions
                    {...defaultProps}
                    showQuickAdd={false}
                    showWishlist={false}
                />,
            );
            expect(
                screen.queryByTestId("add-to-cart-btn"),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId("wishlist-btn"),
            ).not.toBeInTheDocument();
        });
    });

    describe("Hover animation", () => {
        it("applies hover animation classes when showOnHover is true", () => {
            const { container } = render(
                <CardActions {...defaultProps} showOnHover={true} />,
            );
            expect(container.firstChild).toHaveClass("opacity-0");
            expect(container.firstChild).toHaveClass("translate-y-2");
        });

        it("does not apply hover animation classes when showOnHover is false", () => {
            const { container } = render(
                <CardActions {...defaultProps} showOnHover={false} />,
            );
            expect(container.firstChild).not.toHaveClass("opacity-0");
        });
    });

    describe("Disabled state", () => {
        it("disables button when variant is not available", () => {
            const unavailableVariant = {
                ...mockVariant,
                availableForSale: false,
            };
            render(
                <CardActions {...defaultProps} variant={unavailableVariant} />,
            );
            expect(screen.getByTestId("add-to-cart-btn")).toBeDisabled();
        });

        it("disables button when no variant is provided", () => {
            render(<CardActions productId="p1" variant={null} />);
            expect(screen.getByTestId("add-to-cart-btn")).toBeDisabled();
        });

        it("enables button when variant is available", () => {
            render(<CardActions {...defaultProps} />);
            expect(screen.getByTestId("add-to-cart-btn")).not.toBeDisabled();
        });
    });

    describe("Custom classes", () => {
        it("applies custom className", () => {
            const { container } = render(
                <CardActions {...defaultProps} className="custom-class" />,
            );
            expect(container.firstChild).toHaveClass("custom-class");
        });
    });
});
