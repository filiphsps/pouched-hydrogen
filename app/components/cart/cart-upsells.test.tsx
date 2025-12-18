import { render, screen } from "@testing-library/react";
import type { ProductCardFragment } from "storefront-api.generated";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartUpsells } from "./cart-upsells";

// Mock dependencies
vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: () => ({
        cartUpsellsEnabled: true,
        cartUpsellsHeading: "Pairs well with",
        cartUpsellsAlgorithm: "hybrid",
        cartUpsellsQuickAdd: true,
    }),
    createSchema: (schema: unknown) => schema,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("~/hooks/use-prefix-path-with-locale", () => ({
    usePrefixPathWithLocale: (path: string) => path,
}));

const mockLoad = vi.fn();
const mockFetcherData = {
    products: [
        {
            id: "p1",
            title: "Upsell Product 1",
            handle: "upsell-1",
            vendor: "Test Vendor",
            priceRange: {
                minVariantPrice: { amount: "10.00", currencyCode: "EUR" },
                maxVariantPrice: { amount: "10.00", currencyCode: "EUR" },
            },
            selectedOrFirstAvailableVariant: {
                id: "v1",
                availableForSale: true,
                price: { amount: "10.00", currencyCode: "EUR" },
            },
            images: { nodes: [] },
        },
        {
            id: "p2",
            title: "Upsell Product 2",
            handle: "upsell-2",
            vendor: "Test Vendor",
            priceRange: {
                minVariantPrice: { amount: "15.00", currencyCode: "EUR" },
                maxVariantPrice: { amount: "15.00", currencyCode: "EUR" },
            },
            selectedOrFirstAvailableVariant: {
                id: "v2",
                availableForSale: true,
                price: { amount: "15.00", currencyCode: "EUR" },
            },
            images: { nodes: [] },
        },
    ] as ProductCardFragment[],
    algorithm: "hybrid" as const,
};

vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useFetcher: () => ({
            load: mockLoad,
            data: mockFetcherData,
            state: "idle",
        }),
    };
});

// Mock UpsellProductCard to simplify testing
vi.mock("./upsell-product-card", () => ({
    UpsellProductCard: ({
        product,
        showQuickAdd,
    }: {
        product: ProductCardFragment;
        showQuickAdd: boolean;
    }) => (
        <div
            data-testid="upsell-product-card"
            data-product-id={product.id}
            data-show-quick-add={showQuickAdd}
        >
            {product.title}
        </div>
    ),
}));

describe("CartUpsells", () => {
    beforeEach(() => {
        mockLoad.mockClear();
    });

    it("renders upsell products with UpsellProductCard", () => {
        const cartLineItems = [{ merchandise: { product: { id: "p0" } } }];

        render(<CartUpsells cartLineItems={cartLineItems as any} />);

        expect(screen.getByText("Pairs well with")).toBeInTheDocument();
        const cards = screen.getAllByTestId("upsell-product-card");
        expect(cards).toHaveLength(2);
    });

    it("passes showQuickAdd prop to UpsellProductCard", () => {
        const cartLineItems = [{ merchandise: { product: { id: "p0" } } }];

        render(<CartUpsells cartLineItems={cartLineItems as any} />);

        const cards = screen.getAllByTestId("upsell-product-card");
        expect(cards[0]).toHaveAttribute("data-show-quick-add", "true");
    });

    it("includes algorithm in data attribute for A/B testing", () => {
        const cartLineItems = [{ merchandise: { product: { id: "p0" } } }];

        const { container } = render(
            <CartUpsells cartLineItems={cartLineItems as any} />,
        );

        const upsellsContainer = container.firstChild as HTMLElement;
        expect(upsellsContainer).toHaveAttribute(
            "data-upsell-algorithm",
            "hybrid",
        );
    });

    it("calls load with algorithm parameter", () => {
        const cartLineItems = [{ merchandise: { product: { id: "p0" } } }];

        render(<CartUpsells cartLineItems={cartLineItems as any} />);

        expect(mockLoad).toHaveBeenCalled();
        const loadUrl = mockLoad.mock.calls[0][0];
        expect(loadUrl).toContain("algorithm=hybrid");
    });

    it("does not render when cart is empty", () => {
        const cartLineItems: any[] = [];

        const { container } = render(
            <CartUpsells cartLineItems={cartLineItems} />,
        );

        expect(container.firstChild).toBeNull();
    });

    it("limits display count based on layout", () => {
        const cartLineItems = [{ merchandise: { product: { id: "p0" } } }];

        render(
            <CartUpsells
                cartLineItems={cartLineItems as any}
                layout="drawer"
                count={4}
            />,
        );

        // Drawer layout limits to 2 products
        const cards = screen.getAllByTestId("upsell-product-card");
        expect(cards).toHaveLength(2);
    });

    it("calls onAlgorithmTrack callback when algorithm is received", () => {
        const mockOnAlgorithmTrack = vi.fn();
        const cartLineItems = [{ merchandise: { product: { id: "p0" } } }];

        render(
            <CartUpsells
                cartLineItems={cartLineItems as any}
                onAlgorithmTrack={mockOnAlgorithmTrack}
            />,
        );

        expect(mockOnAlgorithmTrack).toHaveBeenCalledWith("hybrid");
    });
});
