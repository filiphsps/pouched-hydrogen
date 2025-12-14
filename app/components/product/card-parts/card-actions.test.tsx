import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CardActions } from "./card-actions";

// Mock dependencies
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("../quick-shop", () => ({
    QuickShopTrigger: () => <button type="button">Quick Add</button>,
}));
vi.mock("../wishlist-button", () => ({
    WishlistButton: () => <button type="button">Wishlist</button>,
}));
vi.mock("~/components/button", () => ({
    Button: ({ children, className }: any) => (
        <button type="button" className={className}>
            {children}
        </button>
    ),
}));

describe("CardActions", () => {
    const defaultProps = {
        productHandle: "test-product",
        productId: "p1",
    };

    it("renders quick add and wishlist by default", () => {
        render(<CardActions {...defaultProps} />);
        expect(screen.getByText("Quick Add")).toBeInTheDocument();
        expect(screen.getByText("Wishlist")).toBeInTheDocument();
        expect(screen.queryByText("cart.addToCart")).not.toBeInTheDocument(); // showAddToCart default false
    });

    it("shows add to cart when enabled", () => {
        render(<CardActions {...defaultProps} showAddToCart={true} />);
        expect(screen.getByText("cart.addToCart")).toBeInTheDocument();
    });

    it("applies layout classes", () => {
        const { container } = render(
            <CardActions {...defaultProps} layout="inline" />,
        );
        expect(container.firstChild).toHaveClass("flex items-center gap-2");

        const { container: container2 } = render(
            <CardActions {...defaultProps} layout="stacked" />,
        );
        expect(container2.firstChild).toHaveClass("flex w-full flex-col gap-2");
    });

    it("hides elements based on props", () => {
        render(
            <CardActions
                {...defaultProps}
                showQuickAdd={false}
                showWishlist={false}
            />,
        );
        expect(screen.queryByText("Quick Add")).not.toBeInTheDocument();
        expect(screen.queryByText("Wishlist")).not.toBeInTheDocument();
    });
});
