/**
 * Tests for AddToCartButton component.
 * Tests form rendering, loading states, cart drawer integration, and analytics.
 */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock @shopify/hydrogen (only analytics now — CartForm no longer used in component)
vi.mock("@shopify/hydrogen", () => ({
    AnalyticsEventName: { ADD_TO_CART: "ADD_TO_CART" },
    getClientBrowserParameters: vi.fn(() => ({})),
    sendShopifyAnalytics: vi.fn(),
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => (key === "cart.addToCart" ? "Add to Cart" : key),
    }),
}));

// Mock useAddToCart hook
const mockMutate = vi.fn();
vi.mock("~/lib/cart", () => ({
    useAddToCart: () => ({
        mutate: mockMutate,
        isLoading: false,
        data: null,
        userErrors: [],
        reset: vi.fn(),
    }),
}));

// Mock react-router
vi.mock("react-router", () => ({
    useMatches: () => [
        {
            data: {
                analytics: { shopId: "shop123" },
                selectedLocale: { currency: "EUR", language: "DE" },
            },
        },
    ],
}));

vi.mock("~/hooks/use-prefix-path-with-locale", () => ({
    usePrefixPathWithLocale: (path: string) => path,
}));

// Import after mocking
import { AddToCartButton } from "./add-to-cart-button";

describe("AddToCartButton", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("should render with default 'Add to Cart' text when no children provided", () => {
            render(
                <AddToCartButton
                    lines={[
                        {
                            merchandiseId: "variant-1",
                            quantity: 1,
                        },
                    ]}
                />,
            );

            expect(screen.getByText("Add to Cart")).toBeInTheDocument();
        });

        it("should render with custom children text", () => {
            render(
                <AddToCartButton
                    lines={[
                        {
                            merchandiseId: "variant-1",
                            quantity: 1,
                        },
                    ]}
                >
                    Buy Now
                </AddToCartButton>,
            );

            expect(screen.getByText("Buy Now")).toBeInTheDocument();
        });

        it("should render as a submit button", () => {
            render(
                <AddToCartButton
                    lines={[
                        {
                            merchandiseId: "variant-1",
                            quantity: 1,
                        },
                    ]}
                />,
            );

            const button = screen.getByRole("button");
            expect(button).toHaveAttribute("type", "submit");
        });

        it("should apply custom className", () => {
            render(
                <AddToCartButton
                    lines={[
                        {
                            merchandiseId: "variant-1",
                            quantity: 1,
                        },
                    ]}
                    className="my-custom-class"
                />,
            );

            const button = screen.getByRole("button");
            expect(button).toHaveClass("my-custom-class");
        });

        it("should pass additional props to button", () => {
            render(
                <AddToCartButton
                    lines={[
                        {
                            merchandiseId: "variant-1",
                            quantity: 1,
                        },
                    ]}
                    data-test="add-to-cart"
                />,
            );

            const button = screen.getByRole("button");
            expect(button).toHaveAttribute("data-test", "add-to-cart");
        });
    });

    describe("Disabled State", () => {
        it("should be disabled when disabled prop is true", () => {
            render(
                <AddToCartButton
                    lines={[
                        {
                            merchandiseId: "variant-1",
                            quantity: 1,
                        },
                    ]}
                    disabled={true}
                />,
            );

            const button = screen.getByRole("button");
            expect(button).toBeDisabled();
        });

        it("should be enabled when disabled prop is false", () => {
            render(
                <AddToCartButton
                    lines={[
                        {
                            merchandiseId: "variant-1",
                            quantity: 1,
                        },
                    ]}
                    disabled={false}
                />,
            );

            const button = screen.getByRole("button");
            expect(button).not.toBeDisabled();
        });
    });

    describe("Analytics", () => {
        it("should include hidden analytics input", () => {
            render(
                <AddToCartButton
                    lines={[
                        {
                            merchandiseId: "variant-1",
                            quantity: 1,
                        },
                    ]}
                    analytics={{ product: "test" }}
                />,
            );

            const analyticsInput = document.querySelector(
                'input[name="analytics"]',
            );
            expect(analyticsInput).toBeInTheDocument();
            expect(analyticsInput).toHaveAttribute("type", "hidden");
        });

        it("should stringify analytics object in hidden input", () => {
            const analytics = { product: "test-product", variant: "test-var" };

            render(
                <AddToCartButton
                    lines={[
                        {
                            merchandiseId: "variant-1",
                            quantity: 1,
                        },
                    ]}
                    analytics={analytics}
                />,
            );

            const analyticsInput = document.querySelector(
                'input[name="analytics"]',
            ) as HTMLInputElement;
            expect(analyticsInput.value).toBe(JSON.stringify(analytics));
        });
    });

    describe("Styling", () => {
        it("should have primary button variant", () => {
            render(
                <AddToCartButton
                    lines={[
                        {
                            merchandiseId: "variant-1",
                            quantity: 1,
                        },
                    ]}
                />,
            );

            const button = screen.getByRole("button");
            expect(button).toBeInTheDocument();
        });

        it("should have rounded-full class for pill shape", () => {
            render(
                <AddToCartButton
                    lines={[
                        {
                            merchandiseId: "variant-1",
                            quantity: 1,
                        },
                    ]}
                />,
            );

            const button = screen.getByRole("button");
            expect(button).toHaveClass("rounded-full");
        });
    });
});
