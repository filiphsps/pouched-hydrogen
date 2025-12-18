import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { ProductCard } from "~/components/product/product-card";

// Mock dependencies
vi.mock("~/sections/main-product/judgeme-stars-rating", () => ({
    default: () => <div>Stars</div>,
}));

vi.mock("./variant-prices", () => ({
    VariantPrices: () => <div>10.00 USD</div>,
}));

vi.mock("~/hooks/use-prefix-path-with-locale", () => ({
    usePrefixPathWithLocale: (path: string) => path,
}));

vi.mock("@shopify/hydrogen", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@shopify/hydrogen")>();
    return {
        ...actual,
        useMoney: vi.fn((data) => ({
            amount: data.amount,
            currencyCode: data.currencyCode,
            currencyNarrowSymbol: "$",
        })),
        Money: ({ data }: { data: any }) => (
            <span>
                {data.amount} {data.currencyCode}
            </span>
        ),

        Image: () => (
            // biome-ignore lint/performance/noImgElement: test helper
            <img
                alt="Test"
                src="https://example.com/image.jpg"
                width={100}
                height={100}
            />
        ),
        useOptimisticVariant: vi.fn((variant) => variant),
    };
});

vi.mock("./card-parts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./card-parts")>();
    return {
        ...actual,
        CardActions: () => <div data-testid="card-actions">Actions</div>,
    };
});

const mockProduct: any = {
    id: "gid://shopify/Product/1",
    title: "Test Product",
    handle: "test-product",
    vendor: "Test Vendor",
    publishedAt: "2023-01-01",
    priceRange: {
        minVariantPrice: { amount: "10.00", currencyCode: "USD" },
        maxVariantPrice: { amount: "20.00", currencyCode: "USD" },
    },
    images: {
        nodes: [
            {
                url: "https://example.com/image.jpg",
                altText: "Test Image",
                width: 100,
                height: 100,
            },
        ],
    },
    variants: {
        nodes: [],
    },
    options: [],
    badges: [],
};

/**
 * Creates a mock product with a variant that has specific quantity available.
 */
function createMockProductWithStock(quantityAvailable: number | null): any {
    return {
        ...mockProduct,
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/1",
            availableForSale:
                quantityAvailable !== null && quantityAvailable > 0,
            quantityAvailable,
            selectedOptions: [],
            price: { amount: "10.00", currencyCode: "USD" },
            compareAtPrice: null,
        },
    };
}

describe("ProductCard", () => {
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

    it("renders product title and vendor", async () => {
        render(
            <Wrapper>
                <ProductCard product={mockProduct} />
            </Wrapper>,
        );
        expect(screen.getByText("Test Product")).toBeInTheDocument();
        expect(screen.getByText("Test Vendor")).toBeInTheDocument();
    });

    it("renders price", async () => {
        const router = createMemoryRouter([
            {
                path: "/",
                id: "root",
                element: <ProductCard product={mockProduct} />,
            },
        ]);
        render(<RouterProvider router={router} />);
        expect(screen.getByText("10.00 USD")).toBeInTheDocument();
    });

    it("renders image", async () => {
        const router = createMemoryRouter([
            {
                path: "/",
                id: "root",
                element: <ProductCard product={mockProduct} />,
            },
        ]);
        render(<RouterProvider router={router} />);
        const img = screen.getByRole("img", { name: "Test" });
        expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
    });
});
