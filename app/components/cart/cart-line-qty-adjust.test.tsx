import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartLineQuantityAdjust } from "./cart-line-qty-adjust";

// Mock dependencies
const submitMock = vi.fn();
const mockFetcher = {
    state: "idle" as const,
    submit: submitMock,
    data: undefined,
    formData: undefined,
    formAction: undefined,
    formMethod: undefined,
    formEncType: undefined,
    json: undefined,
    text: undefined,
    Form: vi.fn(),
    load: vi.fn(),
};

vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useFetcher: () => mockFetcher,
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

    beforeEach(() => {
        submitMock.mockClear();
    });

    it("passes min={0} to Quantity", () => {
        render(<CartLineQuantityAdjust line={mockLine} />);
        expect(screen.getByTestId("qty-min")).toHaveTextContent("0");
    });

    it("submits update when quantity changes", () => {
        render(<CartLineQuantityAdjust line={mockLine} />);
        fireEvent.click(screen.getByText("Inc"));

        expect(submitMock).toHaveBeenCalledTimes(1);
        const [formData, options] = submitMock.mock.calls[0];
        expect(formData).toBeInstanceOf(FormData);
        expect(formData.get("cartFormInput")).toContain("LinesUpdate");
        expect(formData.get("__hydrogenOptimisticData")).toContain(
            '"quantity":2',
        );
        expect(options).toEqual({ action: "/cart", method: "POST" });
    });

    it("submits remove when quantity becomes 0", () => {
        render(<CartLineQuantityAdjust line={mockLine} />);
        fireEvent.click(screen.getByText("Zero"));

        expect(submitMock).toHaveBeenCalledTimes(1);
        const [formData, options] = submitMock.mock.calls[0];
        expect(formData).toBeInstanceOf(FormData);
        expect(formData.get("cartFormInput")).toContain("LinesRemove");
        expect(formData.get("__hydrogenOptimisticData")).toContain(
            '"action":"remove"',
        );
        expect(options).toEqual({ action: "/cart", method: "POST" });
    });
});
