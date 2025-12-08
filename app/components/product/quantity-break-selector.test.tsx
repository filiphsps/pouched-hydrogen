import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
    type QuantityBreak,
    QuantityBreakSelector,
} from "./quantity-break-selector";

const mockBreaks: QuantityBreak[] = [
    { quantity: 1, discountPercentage: 10 },
    { quantity: 10, discountPercentage: 17 },
    { quantity: 30, discountPercentage: 19 },
    { quantity: 50, discountPercentage: 27 },
];

describe("QuantityBreakSelector component", () => {
    it("renders all quantity break buttons", () => {
        render(
            <QuantityBreakSelector
                breaks={mockBreaks}
                selectedQuantity={1}
                onQuantityChange={vi.fn()}
            />,
        );

        expect(screen.getByText("1x")).toBeInTheDocument();
        expect(screen.getByText("10x")).toBeInTheDocument();
        expect(screen.getByText("30x")).toBeInTheDocument();
        expect(screen.getByText("50x")).toBeInTheDocument();
    });

    it("renders the label correctly", () => {
        render(
            <QuantityBreakSelector
                breaks={mockBreaks}
                selectedQuantity={1}
                onQuantityChange={vi.fn()}
                label="Select Quantity"
            />,
        );

        expect(screen.getByText("Select Quantity")).toBeInTheDocument();
    });

    it("renders discount badges for all breaks", () => {
        render(
            <QuantityBreakSelector
                breaks={mockBreaks}
                selectedQuantity={1}
                onQuantityChange={vi.fn()}
            />,
        );

        expect(screen.getByText("-10%")).toBeInTheDocument();
        expect(screen.getByText("-17%")).toBeInTheDocument();
        expect(screen.getByText("-19%")).toBeInTheDocument();
        expect(screen.getByText("-27%")).toBeInTheDocument();
    });

    it("calls onQuantityChange when a break is selected", () => {
        const handleChange = vi.fn();
        render(
            <QuantityBreakSelector
                breaks={mockBreaks}
                selectedQuantity={1}
                onQuantityChange={handleChange}
            />,
        );

        fireEvent.click(screen.getByText("10x"));
        expect(handleChange).toHaveBeenCalledWith(10);
    });

    it("shows custom input button when showCustomInput is true", () => {
        render(
            <QuantityBreakSelector
                breaks={mockBreaks}
                selectedQuantity={1}
                onQuantityChange={vi.fn()}
                showCustomInput={true}
            />,
        );

        expect(screen.getByTestId("quantity-break-custom")).toBeInTheDocument();
    });

    it("hides custom input button when showCustomInput is false", () => {
        render(
            <QuantityBreakSelector
                breaks={mockBreaks}
                selectedQuantity={1}
                onQuantityChange={vi.fn()}
                showCustomInput={false}
            />,
        );

        expect(
            screen.queryByTestId("quantity-break-custom"),
        ).not.toBeInTheDocument();
    });

    it("has correct test id for accessibility testing", () => {
        render(
            <QuantityBreakSelector
                breaks={mockBreaks}
                selectedQuantity={1}
                onQuantityChange={vi.fn()}
            />,
        );

        expect(
            screen.getByTestId("quantity-break-selector"),
        ).toBeInTheDocument();
    });

    it("renders with empty breaks array without crashing", () => {
        render(
            <QuantityBreakSelector
                breaks={[]}
                selectedQuantity={1}
                onQuantityChange={vi.fn()}
            />,
        );

        expect(
            screen.getByTestId("quantity-break-selector"),
        ).toBeInTheDocument();
    });
});
