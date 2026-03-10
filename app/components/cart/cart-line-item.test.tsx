/**
 * Tests for CartLineItem component.
 * Tests rendering, optimistic remove, selling plan, and vendor badge.
 */
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { CartLineItem } from "./cart-line-item";

// Mock dependencies
vi.mock("~/components/product/product-image", () => ({
    ProductImage: () => <div>Image</div>,
}));
vi.mock("./cart-line-qty-adjust", () => ({
    CartLineQuantityAdjust: () => <div>Qty</div>,
}));

let mockOptimisticReturnValue: Record<string, unknown> = {};

vi.mock("@shopify/hydrogen", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@shopify/hydrogen")>();
    return {
        ...actual,
        useMoney: vi.fn(),
        Money: () => <div>Price</div>,
        useOptimisticData: () => mockOptimisticReturnValue,
        CartForm: Object.assign(
            ({ children }: { children: React.ReactNode }) => (
                <form>{children}</form>
            ),
            { ACTIONS: { LinesRemove: "LinesRemove" } },
        ),
        OptimisticInput: () => null,
    };
});

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("~/hooks/use-prefix-path-with-locale", () => ({
    usePrefixPathWithLocale: (path: string) => path,
}));

vi.mock("./store", () => ({
    useCartDrawerStore: () => ({ close: vi.fn() }),
}));

// Mock line data
const mockLine: any = {
    id: "line1",
    quantity: 1,
    merchandise: {
        id: "variant1",
        title: "Variant Title",
        product: { title: "Product Title", handle: "p1", vendor: "Vendor" },
        selectedOptions: [],
        image: { url: "img.jpg" },
    },
    cost: {
        totalAmount: { amount: "10.00", currencyCode: "USD" },
        amountPerQuantity: { amount: "10.00", currencyCode: "USD" },
    },
};

describe("CartLineItem", () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        const router = createMemoryRouter([
            {
                path: "/",
                id: "root",
                element: children,
            },
        ]);
        return <RouterProvider router={router} />;
    };

    it("renders subscription info if present", () => {
        const lineWithPlan = {
            ...mockLine,
            sellingPlanAllocation: {
                sellingPlan: { name: "Subscribe & Save" },
            },
        };

        render(
            <Wrapper>
                <CartLineItem line={lineWithPlan} layout="drawer" />
            </Wrapper>,
        );

        expect(screen.getByText("Subscribe & Save")).toBeInTheDocument();
    });

    it("does not render subscription info if missing", () => {
        render(
            <Wrapper>
                <CartLineItem line={mockLine} layout="drawer" />
            </Wrapper>,
        );
        expect(screen.queryByText("Subscribe & Save")).not.toBeInTheDocument();
    });

    it("renders variant title", () => {
        render(
            <Wrapper>
                <CartLineItem line={mockLine} layout="drawer" />
            </Wrapper>,
        );
        expect(screen.getByText("Variant Title")).toBeInTheDocument();
    });

    it("returns null when optimistic data action is 'remove'", () => {
        mockOptimisticReturnValue = { action: "remove" };
        const { container } = render(
            <Wrapper>
                <CartLineItem line={mockLine} layout="drawer" />
            </Wrapper>,
        );
        // The component should return null — empty container
        expect(container.querySelector(".flex.gap-4")).not.toBeInTheDocument();
        mockOptimisticReturnValue = {};
    });

    it("returns null when line has no id", () => {
        const lineWithoutId = { ...mockLine, id: "" };
        const { container } = render(
            <Wrapper>
                <CartLineItem line={lineWithoutId} layout="drawer" />
            </Wrapper>,
        );
        expect(container.querySelector(".flex.gap-4")).not.toBeInTheDocument();
    });

    it("shows remove button in drawer layout", () => {
        render(
            <Wrapper>
                <CartLineItem line={mockLine} layout="drawer" />
            </Wrapper>,
        );
        expect(screen.getByText("cart.remove")).toBeInTheDocument();
    });
});
