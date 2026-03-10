import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CartContent } from "./cart-content";

// Mock dependencies
vi.mock("./cart-header", () => ({
    CartHeader: ({ totalQuantity }: { totalQuantity: number }) => (
        <div>Header: {totalQuantity}</div>
    ),
}));
vi.mock("~/components/cart/cart-main", () => ({
    CartMain: () => <div>CartMain</div>,
}));

describe("CartContent", () => {
    const mockCart: any = {
        totalQuantity: 5,
        lines: { nodes: [] },
    };

    it("renders header and main for drawer", () => {
        const { container } = render(<CartContent cart={mockCart} />);
        expect(screen.getByText("Header: 5")).toBeInTheDocument();
        expect(screen.getByText("CartMain")).toBeInTheDocument();

        // Check layout classes
        expect(container.firstChild).toHaveClass(
            "flex flex-col h-full space-y-3",
        );
    });

    it("renders header with zero quantity when cart has no items", () => {
        const emptyCart: any = {
            totalQuantity: 0,
            lines: { nodes: [] },
        };
        render(<CartContent cart={emptyCart} />);
        expect(screen.getByText("Header: 0")).toBeInTheDocument();
    });

    it("handles null totalQuantity gracefully", () => {
        const nullCart: any = {
            totalQuantity: null,
            lines: { nodes: [] },
        };
        render(<CartContent cart={nullCart} />);
        expect(screen.getByText("Header: 0")).toBeInTheDocument();
    });
});
