import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CartLineQuantityAdjust } from "./cart-line-qty-adjust";

// Mock dependencies
const submitMock = vi.fn();
vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useSubmit: () => submitMock,
    };
});

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@shopify/hydrogen", () => ({
    CartForm: {
        ACTIONS: { LinesRemove: "LinesRemove", LinesUpdate: "LinesUpdate" },
    },
    useOptimisticData: vi.fn(),
}));

vi.mock("~/components/product/quantity", () => ({
    Quantity: ({ value, onChange, min }: any) => (
        <div data-testid="quantity">
            <span data-testid="qty-min">{min}</span>
            <button type="button" onClick={() => onChange(value + 1)}>
                Inc
            </button>
            <button type="button" onClick={() => onChange(value - 1)}>
                Dec
            </button>
            <button type="button" onClick={() => onChange(0)}>
                Zero
            </button>
        </div>
    ),
}));

describe("CartLineQuantityAdjust", () => {
    const mockLine: any = {
        id: "line1",
        quantity: 1,
        isOptimistic: false,
    };

    it("passes min={0} to Quantity", () => {
        render(<CartLineQuantityAdjust line={mockLine} />);
        expect(screen.getByTestId("qty-min")).toHaveTextContent("0");
    });

    it("submits update when quantity changes", () => {
        render(<CartLineQuantityAdjust line={mockLine} />);
        fireEvent.click(screen.getByText("Inc"));

        expect(submitMock).toHaveBeenCalledWith(
            expect.objectContaining({
                cartFormInput: expect.stringContaining("LinesUpdate"),
            }),
            expect.anything(),
        );
    });

    it("submits remove when quantity becomes 0", () => {
        render(<CartLineQuantityAdjust line={mockLine} />);
        fireEvent.click(screen.getByText("Zero"));

        expect(submitMock).toHaveBeenCalledWith(
            expect.objectContaining({
                cartFormInput: expect.stringContaining("LinesRemove"),
            }),
            expect.anything(),
        );
    });
});
