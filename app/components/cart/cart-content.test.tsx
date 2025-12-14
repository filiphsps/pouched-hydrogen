import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CartContent } from "./cart-content";

// Mock dependencies
vi.mock("./cart-header", () => ({
    CartHeader: ({ totalQuantity }: any) => <div>Header: {totalQuantity}</div>,
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
        const { container } = render(
            <CartContent cart={mockCart} layout="drawer" />,
        );
        expect(screen.getByText("Header: 5")).toBeInTheDocument();
        expect(screen.getByText("CartMain")).toBeInTheDocument();

        // Check layout classes
        expect(container.firstChild).toHaveClass(
            "flex flex-col h-full space-y-3",
        );
    });

    it("renders header and main for modal", () => {
        const { container } = render(
            <CartContent cart={mockCart} layout="modal" />,
        );
        expect(container.firstChild).toHaveClass(
            "flex flex-col h-full max-h-full min-h-0 overflow-hidden",
        );
    });
});
