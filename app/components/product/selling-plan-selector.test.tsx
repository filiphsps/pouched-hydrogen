import { fireEvent, render, screen } from "@testing-library/react";
import {
    createMemoryRouter,
    RouterProvider,
    useLoaderData,
} from "react-router";
import { describe, expect, it, vi } from "vitest";
import SellingPlanSelector from "./selling-plan-selector";

// Mock dependencies
vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react-router")>();
    return {
        ...actual,
        useLoaderData: vi.fn(),
    };
});

// Mock hooks
const mockSetSellingPlanId = vi.fn();
vi.mock("~/sections/main-product/product-quantity-selector", () => ({
    useProductQtyStore: () => ({
        sellingPlanId: undefined,
        setSellingPlanId: mockSetSellingPlanId,
    }),
}));

vi.mock("@shopify/hydrogen", () => ({
    Money: ({ data }: { data: any }) => (
        <span>
            {data.amount} {data.currencyCode}
        </span>
    ),
    getAdjacentAndFirstAvailableVariants: vi.fn(),
    useOptimisticVariant: vi.fn((v) => v),
}));

vi.mock("@weaverse/hydrogen", () => ({
    createSchema: vi.fn(),
}));

describe("SellingPlanSelector", () => {
    const mockProduct = {
        selectedOrFirstAvailableVariant: {
            id: "variant-1",
            price: { amount: "10.00", currencyCode: "USD" },
        },
        sellingPlanGroups: {
            nodes: [
                {
                    name: "Subscribe & Save",
                    sellingPlans: {
                        nodes: [
                            {
                                id: "plan-1",
                                name: "Monthly",
                            },
                        ],
                    },
                },
            ],
        },
    };

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        const router = createMemoryRouter([
            {
                path: "/",
                element: children,
            },
        ]);
        return <RouterProvider router={router} />;
    };

    it("renders selling plan options", () => {
        vi.mocked(useLoaderData).mockReturnValue({ product: mockProduct });

        render(
            <Wrapper>
                <SellingPlanSelector />
            </Wrapper>,
        );

        expect(screen.getByText("Purchase Option")).toBeInTheDocument();
        expect(screen.getByText("One-time purchase")).toBeInTheDocument();
        expect(screen.getByText("Subscribe & Save")).toBeInTheDocument();
        expect(
            screen.getByText("Subscribe & Save - Monthly"),
        ).toBeInTheDocument();
    });

    it("calls setSellingPlanId when plan is selected", () => {
        vi.mocked(useLoaderData).mockReturnValue({ product: mockProduct });

        render(
            <Wrapper>
                <SellingPlanSelector />
            </Wrapper>,
        );

        const radios = screen.getAllByRole("radio");
        const subscriptionInput = radios.find(
            (r) => (r as HTMLInputElement).value === "plan-1",
        );

        if (!subscriptionInput) throw new Error("Subscription input not found");
        fireEvent.click(subscriptionInput);
        expect(mockSetSellingPlanId).toHaveBeenCalledWith("plan-1");
    });
});
