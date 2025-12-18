/**
 * Tests for QuickShop and QuickShopTrigger components.
 * Tests modal rendering, product data loading, variant selection, and user interactions.
 */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock phosphor icons
vi.mock("@phosphor-icons/react", () => ({
    HandbagSimpleIcon: ({ className }: { className?: string }) => (
        <span data-testid="handbag-icon" className={className}>
            Bag
        </span>
    ),
    ImageIcon: ({ className }: { className?: string }) => (
        <span data-testid="image-icon" className={className}>
            Image
        </span>
    ),
}));

// Mock Radix Dialog - always render children to enable trigger testing
vi.mock("@radix-ui/react-dialog", () => ({
    Root: ({ children }: { children: React.ReactNode; open?: boolean }) => (
        <div data-testid="dialog-root">{children}</div>
    ),
    Trigger: ({
        children,
    }: {
        children: React.ReactNode;
        asChild?: boolean;
    }) => <div data-testid="dialog-trigger">{children}</div>,
    Portal: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dialog-portal">{children}</div>
    ),
    Overlay: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dialog-overlay">{children}</div>
    ),
    Content: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dialog-content" role="dialog">
            {children}
        </div>
    ),
    Close: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
        <div data-testid="dialog-close">{children}</div>
    ),
    Title: ({ children }: { children: React.ReactNode }) => (
        <h2 data-testid="dialog-title">{children}</h2>
    ),
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "cart.addToCart": "Add to Cart",
            };
            return translations[key] || key;
        },
    }),
}));

// Mock react-router useFetcher
const mockLoad = vi.fn();
let mockFetcherData: any = null;

vi.mock("react-router", () => ({
    useFetcher: () => ({
        load: mockLoad,
        data: mockFetcherData,
    }),
}));

// Mock product components
vi.mock("~/components/button", () => ({
    Button: ({
        children,
        className,
        title,
        ...props
    }: {
        children: React.ReactNode;
        className?: string;
        title?: string;
        [key: string]: any;
    }) => (
        <button className={className} title={title} {...props}>
            {children}
        </button>
    ),
}));

vi.mock("~/components/link", () => ({
    Link: ({
        children,
        to,
        ...props
    }: {
        children: React.ReactNode;
        to: string;
        [key: string]: any;
    }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
}));

vi.mock("~/components/modal", () => ({
    ModalContainer: ({
        children,
        open,
        title,
    }: {
        children: React.ReactNode;
        open: boolean;
        title: string;
    }) =>
        open ? (
            <div data-testid="modal-container" role="dialog" aria-label={title}>
                {children}
            </div>
        ) : null,
}));

vi.mock("~/components/product/add-to-cart-button", () => ({
    AddToCartButton: ({
        children,
        disabled,
    }: {
        children: React.ReactNode;
        disabled?: boolean;
    }) => (
        <button type="button" data-testid="add-to-cart-btn" disabled={disabled}>
            {children}
        </button>
    ),
}));

vi.mock("~/components/product/product-media", () => ({
    ProductMedia: () => <div data-testid="product-media">Product Media</div>,
}));

vi.mock("~/components/product/quantity", () => ({
    Quantity: ({
        value,
        onChange,
    }: {
        value: number;
        onChange: (v: number) => void;
    }) => (
        <div data-testid="quantity">
            Qty: {value}
            <button type="button" onClick={() => onChange(value + 1)}>
                +
            </button>
        </div>
    ),
}));

vi.mock("~/components/skeleton", () => ({
    Skeleton: ({
        children,
        className,
    }: {
        children?: React.ReactNode;
        className?: string;
    }) => (
        <div data-testid="skeleton" className={className}>
            {children}
        </div>
    ),
}));

vi.mock("~/components/title", () => ({
    Title: ({ children }: { children: React.ReactNode; as?: string }) => (
        <h1 data-testid="title">{children}</h1>
    ),
}));

vi.mock("~/sections/main-product/judgeme-stars-rating", () => ({
    default: () => <div data-testid="stars-rating">Stars</div>,
}));

vi.mock("./badges", () => ({
    ProductBadges: () => <div data-testid="product-badges">Badges</div>,
}));

vi.mock("./styled-shop-pay-button", () => ({
    StyledShopPayButton: () => <div data-testid="shop-pay-button">ShopPay</div>,
}));

vi.mock("./variant-prices", () => ({
    VariantPrices: ({ variant }: { variant: any }) => (
        <div data-testid="variant-prices">
            {variant?.id ? "Has Price" : "No Price"}
        </div>
    ),
}));

vi.mock("./variant-selector", () => ({
    VariantSelector: () => <div data-testid="variant-selector">Variants</div>,
}));

// Import after mocking
import { QuickShop, QuickShopTrigger } from "./quick-shop";

// Helper to create mock product data
function createMockProductData() {
    return {
        product: {
            id: "product-1",
            title: "Test Product",
            handle: "test-product",
            summary: "A great product",
            selectedOrFirstAvailableVariant: {
                id: "variant-1",
                availableForSale: true,
            },
            media: {
                nodes: [{ id: "media-1" }],
            },
        },
        storeDomain: "test-store.myshopify.com",
    };
}

describe("QuickShop", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("should render product title", () => {
            const data = createMockProductData();
            render(<QuickShop data={data as any} />);

            expect(screen.getByText("Test Product")).toBeInTheDocument();
        });

        it("should render product summary when available", () => {
            const data = createMockProductData();
            render(<QuickShop data={data as any} />);

            expect(screen.getByText("A great product")).toBeInTheDocument();
        });

        it("should render product media", () => {
            const data = createMockProductData();
            render(<QuickShop data={data as any} />);

            expect(screen.getByTestId("product-media")).toBeInTheDocument();
        });

        it("should render variant selector", () => {
            const data = createMockProductData();
            render(<QuickShop data={data as any} />);

            expect(screen.getByTestId("variant-selector")).toBeInTheDocument();
        });

        it("should render quantity selector", () => {
            const data = createMockProductData();
            render(<QuickShop data={data as any} />);

            expect(screen.getByTestId("quantity")).toBeInTheDocument();
        });

        it("should render add to cart button", () => {
            const data = createMockProductData();
            render(<QuickShop data={data as any} />);

            expect(screen.getByTestId("add-to-cart-btn")).toBeInTheDocument();
        });

        it("should render product badges", () => {
            const data = createMockProductData();
            render(<QuickShop data={data as any} />);

            expect(screen.getByTestId("product-badges")).toBeInTheDocument();
        });

        it("should render variant prices", () => {
            const data = createMockProductData();
            render(<QuickShop data={data as any} />);

            expect(screen.getByTestId("variant-prices")).toBeInTheDocument();
        });

        it("should render stars rating", () => {
            const data = createMockProductData();
            render(<QuickShop data={data as any} />);

            expect(screen.getByTestId("stars-rating")).toBeInTheDocument();
        });

        it("should render shop pay button when variant is available", () => {
            const data = createMockProductData();
            render(<QuickShop data={data as any} />);

            expect(screen.getByTestId("shop-pay-button")).toBeInTheDocument();
        });

        it("should render view full details link", () => {
            const data = createMockProductData();
            render(<QuickShop data={data as any} />);

            const link = screen.getByText(/View full details/);
            expect(link).toBeInTheDocument();
            expect(link.closest("a")).toHaveAttribute(
                "href",
                "/products/test-product",
            );
        });
    });

    describe("Add to Cart Button State", () => {
        it("should show 'Add to cart' when variant is available", () => {
            const data = createMockProductData();
            render(<QuickShop data={data as any} />);

            const btn = screen.getByTestId("add-to-cart-btn");
            expect(btn).toHaveTextContent("Add to cart");
            expect(btn).not.toBeDisabled();
        });

        it("should show 'Sold out' when variant is not available", () => {
            const data = createMockProductData();
            data.product.selectedOrFirstAvailableVariant.availableForSale = false;
            render(<QuickShop data={data as any} />);

            const btn = screen.getByTestId("add-to-cart-btn");
            expect(btn).toHaveTextContent("Sold out");
            expect(btn).toBeDisabled();
        });
    });

    describe("Layout", () => {
        it("should use 2-column grid layout for modal", () => {
            const data = createMockProductData();
            const { container } = render(
                <QuickShop data={data as any} panelType="modal" />,
            );

            const grid = container.querySelector(".lg\\:grid-cols-2");
            expect(grid).toBeInTheDocument();
        });

        it("should use single column layout for drawer", () => {
            const data = createMockProductData();
            const { container } = render(
                <QuickShop data={data as any} panelType="drawer" />,
            );

            const grid = container.querySelector(".grid-cols-1");
            expect(grid).toBeInTheDocument();
        });
    });
});

describe("QuickShopTrigger", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFetcherData = null;
    });

    describe("Icon Button", () => {
        it("should render icon button by default", () => {
            render(<QuickShopTrigger productHandle="test-product" />);

            expect(screen.getByTestId("handbag-icon")).toBeInTheDocument();
        });

        it("should have add to cart title", () => {
            render(<QuickShopTrigger productHandle="test-product" />);

            const button = screen.getByTitle("Add to Cart");
            expect(button).toBeInTheDocument();
        });
    });

    describe("Text Button", () => {
        it("should render text button when buttonType is text", () => {
            render(
                <QuickShopTrigger
                    productHandle="test-product"
                    buttonType="text"
                    buttonText="Quick View"
                />,
            );

            expect(screen.getByText("Quick View")).toBeInTheDocument();
        });
    });

    describe("Hover Behavior", () => {
        it("should hide button on hover when showOnHover is true", () => {
            render(
                <QuickShopTrigger
                    productHandle="test-product"
                    showOnHover={true}
                />,
            );

            const button = screen.getByTitle("Add to Cart");
            expect(button).toHaveClass("opacity-0");
        });

        it("should show button always when showOnHover is false", () => {
            render(
                <QuickShopTrigger
                    productHandle="test-product"
                    showOnHover={false}
                />,
            );

            const button = screen.getByTitle("Add to Cart");
            expect(button).not.toHaveClass("opacity-0");
        });
    });
});
