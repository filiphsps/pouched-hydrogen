import { render, screen } from "@testing-library/react";
import type { ProductCardFragment } from "storefront-api.generated";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpsellProductCard } from "./upsell-product-card";

// Mock dependencies
vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: () => ({}),
    createSchema: (schema: unknown) => schema,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "product.add": "Add",
                "product.outOfStock": "Out of stock",
                "cart.added": "Added",
            };
            return translations[key] || key;
        },
    }),
}));

vi.mock("~/hooks/use-prefix-path-with-locale", () => ({
    usePrefixPathWithLocale: (path: string) => path,
}));

// Mock Hydrogen components
vi.mock("@shopify/hydrogen", () => ({
    Image: ({
        data,
        className,
    }: {
        data: { url: string; altText?: string };
        className?: string;
    }) => (
        // biome-ignore lint/correctness/useImageSize: tests.
        // biome-ignore lint/performance/noImgElement: tests.
        <img
            src={data.url}
            alt={data.altText || ""}
            className={className}
            data-testid="product-image"
        />
    ),
    Money: ({
        data,
        className,
    }: {
        data: { amount: string; currencyCode: string };
        className?: string;
    }) => (
        <span className={className} data-testid="price">
            {data.currencyCode} {data.amount}
        </span>
    ),
    CartForm: Object.assign(
        ({
            children,
            inputs,
        }: {
            children: (fetcher: any) => React.ReactNode;
            inputs: any;
        }) => {
            const mockFetcher = {
                state: "idle",
                Form: ({ children: formChildren, ...props }: any) => (
                    <form {...props}>{formChildren}</form>
                ),
            };
            return (
                <form data-inputs={JSON.stringify(inputs)}>
                    {children(mockFetcher)}
                </form>
            );
        },
        { ACTIONS: { LinesAdd: "LinesAdd" } },
    ),
}));

vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useRouteLoaderData: () => ({ selectedLocale: { pathPrefix: "" } }),
        useViewTransitionState: () => false,
    };
});

// Mock Link component to avoid router context issues
vi.mock("~/components/link", () => ({
    Link: ({
        to,
        children,
        className,
    }: {
        to: string;
        children: React.ReactNode;
        className?: string;
    }) => (
        <a href={to} className={className}>
            {children}
        </a>
    ),
}));

const createMockProduct = (
    overrides: Partial<ProductCardFragment> = {},
): ProductCardFragment => ({
    id: "gid://shopify/Product/123",
    title: "Test Product",
    handle: "test-product",
    vendor: "Test Vendor",
    publishedAt: "2024-01-01",
    tags: [],
    priceRange: {
        minVariantPrice: { amount: "10.00", currencyCode: "EUR" },
        maxVariantPrice: { amount: "10.00", currencyCode: "EUR" },
    },
    selectedOrFirstAvailableVariant: {
        id: "gid://shopify/ProductVariant/456",
        availableForSale: true,
        quantityAvailable: 10,
        requiresComponents: false,
        price: { amount: "10.00", currencyCode: "EUR" },
        compareAtPrice: null,
        selectedOptions: [],
        image: null,
        sku: "TEST-SKU",
        title: "Default",
        product: { title: "Test Product", handle: "test-product" },
        components: { nodes: [] },
        groupedBy: { nodes: [] },
    },
    images: {
        nodes: [
            {
                id: "img1",
                url: "https://example.com/image.jpg",
                altText: "Product image",
                width: 100,
                height: 100,
            },
        ],
    },
    options: [],
    badges: [],
    isBundle: null,
    ...overrides,
});

describe("UpsellProductCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders product information correctly", () => {
        const product = createMockProduct();

        render(<UpsellProductCard product={product} />);

        expect(screen.getByText("Test Product")).toBeInTheDocument();
        expect(screen.getByText("Test Vendor")).toBeInTheDocument();
        expect(screen.getByTestId("price")).toHaveTextContent("EUR 10.00");
    });

    it("renders product image when available", () => {
        const product = createMockProduct();

        render(<UpsellProductCard product={product} />);

        const image = screen.getByTestId("product-image");
        expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
    });

    it("renders placeholder when no image is available", () => {
        const product = createMockProduct({
            images: { nodes: [] },
        });

        render(<UpsellProductCard product={product} />);

        // Should not have a product image
        expect(screen.queryByTestId("product-image")).not.toBeInTheDocument();
    });

    it("shows quick add button when showQuickAdd is true", () => {
        const product = createMockProduct();

        render(<UpsellProductCard product={product} showQuickAdd={true} />);

        expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    });

    it("hides quick add button when showQuickAdd is false", () => {
        const product = createMockProduct();

        render(<UpsellProductCard product={product} showQuickAdd={false} />);

        expect(
            screen.queryByRole("button", { name: "Add" }),
        ).not.toBeInTheDocument();
    });

    it("shows out of stock text when variant is not available", () => {
        const product = createMockProduct({
            selectedOrFirstAvailableVariant: {
                id: "gid://shopify/ProductVariant/456",
                availableForSale: false,
                quantityAvailable: 0,
                requiresComponents: false,
                price: { amount: "10.00", currencyCode: "EUR" },
                compareAtPrice: null,
                selectedOptions: [],
                image: null,
                sku: "TEST-SKU",
                title: "Default",
                product: { title: "Test Product", handle: "test-product" },
                components: { nodes: [] },
                groupedBy: { nodes: [] },
            },
        });

        render(<UpsellProductCard product={product} showQuickAdd={true} />);

        expect(screen.getByText("Out of stock")).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Add" }),
        ).not.toBeInTheDocument();
    });

    it("displays compare at price when available", () => {
        const product = createMockProduct({
            selectedOrFirstAvailableVariant: {
                id: "gid://shopify/ProductVariant/456",
                availableForSale: true,
                quantityAvailable: 10,
                requiresComponents: false,
                price: { amount: "8.00", currencyCode: "EUR" },
                compareAtPrice: { amount: "10.00", currencyCode: "EUR" },
                selectedOptions: [],
                image: null,
                sku: "TEST-SKU",
                title: "Default",
                product: { title: "Test Product", handle: "test-product" },
                components: { nodes: [] },
                groupedBy: { nodes: [] },
            },
        });

        render(<UpsellProductCard product={product} />);

        const prices = screen.getAllByTestId("price");
        expect(prices).toHaveLength(2);
        expect(prices[0]).toHaveTextContent("EUR 8.00");
        expect(prices[1]).toHaveTextContent("EUR 10.00");
    });

    it("links to product page", () => {
        const product = createMockProduct();

        render(<UpsellProductCard product={product} />);

        const links = screen.getAllByRole("link");
        expect(links[0]).toHaveAttribute("href", "/products/test-product");
    });

    it("applies custom className", () => {
        const product = createMockProduct();

        const { container } = render(
            <UpsellProductCard product={product} className="custom-class" />,
        );

        expect(container.firstChild).toHaveClass("custom-class");
    });

    it("uses Schema.org product markup", () => {
        const product = createMockProduct();

        const { container } = render(<UpsellProductCard product={product} />);

        const article = container.querySelector("article");
        expect(article).toHaveAttribute("itemScope");
        expect(article).toHaveAttribute(
            "itemType",
            "https://schema.org/Product",
        );
    });

    it("truncates long vendor names", () => {
        const product = createMockProduct({
            vendor: "Very Long Vendor Name That Should Be Truncated",
        });

        render(<UpsellProductCard product={product} />);

        const vendorElement = screen.getByText(
            "Very Long Vendor Name That Should Be Truncated",
        );
        expect(vendorElement).toHaveClass("truncate");
    });

    it("does not show vendor when not available", () => {
        const product = createMockProduct({
            vendor: "",
        });

        render(<UpsellProductCard product={product} />);

        // Vendor span should not be rendered
        expect(screen.queryByText("Test Vendor")).not.toBeInTheDocument();
    });
});
