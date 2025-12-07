import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductsPagination } from "./products-pagination";

// Mock hooks
vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useSearchParams: vi.fn(() => [new URLSearchParams()]),
        useLocation: vi.fn(() => ({ pathname: "/products", search: "" })),
        useNavigate: vi.fn(() => vi.fn()),
    };
});

// Mock custom Link component
vi.mock("~/components/link", () => ({
    default: ({ to, children, className }: any) => (
        <a href={to} className={className}>
            {children}
        </a>
    ),
    variants: () => "",
}));

// Mock Hydrogen Pagination
vi.mock("@shopify/hydrogen", () => ({
    Pagination: ({ children, connection }: any) =>
        children({
            nodes: connection.nodes,
            isLoading: false,
            nextPageUrl: "/next",
            hasNextPage: false,
            hasPreviousPage: false,
            PreviousLink: (props: any) => <button {...props} />,
            NextLink: (props: any) => <button {...props} />,
            state: "idle",
        }),
}));

// Mock intersection observer
vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));

// Mock ProductCard
vi.mock("~/components/product/product-card", () => ({
    ProductCard: ({ product }: any) => (
        <div data-testid="product-card">{product.title}</div>
    ),
}));

describe("ProductsPagination", () => {
    const mockProducts = {
        nodes: [
            { id: "1", title: "Product 1" },
            { id: "2", title: "Product 2" },
        ],
        pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
        },
    };

    it("renders products correctly", () => {
        render(
            <ProductsPagination
                gridSizeDesktop={3}
                gridSizeMobile={1}
                loadPrevText="Load previous"
                loadMoreText="Load more"
                products={mockProducts}
                appliedFilters={[]}
            />,
        );

        expect(screen.getAllByTestId("product-card")).toHaveLength(2);
        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("renders no products message when empty", () => {
        render(
            <ProductsPagination
                gridSizeDesktop={3}
                gridSizeMobile={1}
                loadPrevText="Load previous"
                loadMoreText="Load more"
                products={{ nodes: [] }}
                appliedFilters={[]}
            />,
        );

        expect(
            screen.getByText("No products matched your filters."),
        ).toBeInTheDocument();
    });

    it("renders applied filters", () => {
        const appliedFilters = [{ label: "Price: $10 - $20", filter: {} }];

        render(
            <ProductsPagination
                gridSizeDesktop={3}
                gridSizeMobile={1}
                loadPrevText="Load previous"
                loadMoreText="Load more"
                products={mockProducts}
                appliedFilters={appliedFilters}
            />,
        );

        expect(screen.getByText("Price: $10 - $20")).toBeInTheDocument();
        expect(screen.queryByText("Clear all filters")).toBeNull(); // Only 1 filter, so clear all shouldn't show (logic check)
    });

    it("renders clear all filters link when multiple filters applied", () => {
        const appliedFilters = [
            { label: "Price: $10 - $20", filter: {} },
            { label: "Color: Red", filter: {} },
        ];

        render(
            <ProductsPagination
                gridSizeDesktop={3}
                gridSizeMobile={1}
                loadPrevText="Load previous"
                loadMoreText="Load more"
                products={mockProducts}
                appliedFilters={appliedFilters}
            />,
        );

        expect(screen.getByText("Clear all filters")).toBeInTheDocument();
    });
});
