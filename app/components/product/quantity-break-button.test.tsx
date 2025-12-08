import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuantityBreakButton } from "./quantity-break-button";

/**
 * Wrapper component to provide Radix ToggleGroup context for testing.
 */
function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ToggleGroup.Root type="single" defaultValue="1">
            {children}
        </ToggleGroup.Root>
    );
}

describe("QuantityBreakButton component", () => {
    it("renders quantity correctly", () => {
        render(
            <TestWrapper>
                <QuantityBreakButton quantity={10} value="10" />
            </TestWrapper>,
        );
        expect(screen.getByText("10x")).toBeInTheDocument();
    });

    it("shows discount badge when discountPercentage > 0", () => {
        render(
            <TestWrapper>
                <QuantityBreakButton
                    quantity={10}
                    discountPercentage={17}
                    value="10"
                />
            </TestWrapper>,
        );
        expect(screen.getByText("-17%")).toBeInTheDocument();
        expect(screen.getByTestId("discount-badge-10")).toBeInTheDocument();
    });

    it("hides discount badge when discountPercentage is 0", () => {
        render(
            <TestWrapper>
                <QuantityBreakButton
                    quantity={10}
                    discountPercentage={0}
                    value="10"
                />
            </TestWrapper>,
        );
        expect(
            screen.queryByTestId("discount-badge-10"),
        ).not.toBeInTheDocument();
    });

    it("hides discount badge when discountPercentage is undefined", () => {
        render(
            <TestWrapper>
                <QuantityBreakButton quantity={10} value="10" />
            </TestWrapper>,
        );
        expect(
            screen.queryByTestId("discount-badge-10"),
        ).not.toBeInTheDocument();
    });

    it("applies selected styling when selected={true}", () => {
        render(
            <TestWrapper>
                <QuantityBreakButton quantity={1} selected={true} value="1" />
            </TestWrapper>,
        );
        const button = screen.getByTestId("quantity-break-1");
        expect(button).toHaveClass("bg-body");
        expect(button).toHaveClass("text-background");
    });

    it("applies unselected styling when selected={false}", () => {
        render(
            <TestWrapper>
                <QuantityBreakButton quantity={1} selected={false} value="1" />
            </TestWrapper>,
        );
        const button = screen.getByTestId("quantity-break-1");
        expect(button).toHaveClass("bg-transparent");
        expect(button).toHaveClass("text-body");
    });

    it("has correct test id for accessibility testing", () => {
        render(
            <TestWrapper>
                <QuantityBreakButton quantity={50} value="50" />
            </TestWrapper>,
        );
        expect(screen.getByTestId("quantity-break-50")).toBeInTheDocument();
    });
});
