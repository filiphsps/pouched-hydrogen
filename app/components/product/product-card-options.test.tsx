import { fireEvent, render, screen } from "@testing-library/react";
import type {
    ProductCardFragment,
    ProductVariantFragment,
} from "storefront-api.generated";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductCardOptions } from "./product-card-options";

// Mock Weaverse theme settings
const mockThemeSettings = {
    pcardShowOptionValues: true,
    pcardOptionToShow: "Color",
    pcardMaxOptionValues: 5,
};

vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: () => mockThemeSettings,
}));

// Mock misc utilities
vi.mock("~/utils/misc", () => ({
    isValidColor: (color: string) => /^#[0-9A-Fa-f]{3,6}$/.test(color),
    isLightColor: (color: string) => color === "#fff" || color === "#ffffff",
}));

// Mock @shopify/hydrogen Image
vi.mock("@shopify/hydrogen", () => ({
    Image: ({ data, className }: { data: any; className?: string }) => (
        // biome-ignore lint/performance/noImgElement: test mock
        // biome-ignore lint/correctness/useImageSize: test mock
        <img
            src={data.url || "test-url"}
            alt={data.altText || "swatch"}
            className={className}
            data-testid="swatch-image"
        />
    ),
}));

// Mock tooltip components
vi.mock("~/components/tooltip", () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="tooltip-root">{children}</div>
    ),
    TooltipTrigger: ({
        children,
    }: {
        children: React.ReactNode;
        asChild?: boolean;
    }) => <div data-testid="tooltip-trigger">{children}</div>,
    TooltipContent: ({
        children,
        sideOffset,
    }: {
        children: React.ReactNode;
        sideOffset?: number;
    }) => (
        <div data-testid="tooltip-content" data-side-offset={sideOffset}>
            {children}
        </div>
    ),
}));

// Mock Link component
vi.mock("~/components/link", () => ({
    Link: ({
        children,
        to,
        className,
    }: {
        children: React.ReactNode;
        to: string;
        className?: string;
    }) => (
        <a href={to} className={className} data-testid="overflow-link">
            {children}
        </a>
    ),
}));

/**
 * Creates a mock product with options for testing.
 */
function createMockProduct(
    optionValues: Array<{
        name: string;
        swatch?: {
            color?: string;
            image?: { previewImage?: { url: string; altText?: string } };
        };
        firstSelectableVariant?: ProductVariantFragment | null;
    }>,
    optionName = "Color",
): ProductCardFragment {
    return {
        id: "gid://shopify/Product/123",
        handle: "test-product",
        title: "Test Product",
        publishedAt: "2024-01-01",
        vendor: "Test Vendor",
        images: { nodes: [] },
        badges: [],
        options: [
            {
                name: optionName,
                optionValues: optionValues.map((v) => ({
                    name: v.name,
                    swatch: v.swatch || null,
                    // Use nullish coalescing to preserve explicit null values
                    firstSelectableVariant:
                        v.firstSelectableVariant !== undefined
                            ? v.firstSelectableVariant
                            : {
                                  id: `variant-${v.name}`,
                                  selectedOptions: [
                                      { name: optionName, value: v.name },
                                  ],
                              },
                })),
            },
        ],
        priceRange: {
            minVariantPrice: { amount: "10.00", currencyCode: "EUR" },
            maxVariantPrice: { amount: "20.00", currencyCode: "EUR" },
        },
        selectedOrFirstAvailableVariant: null,
        isBundle: null,
    } as unknown as ProductCardFragment;
}

describe("ProductCardOptions", () => {
    const setSelectedVariant = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset to default settings
        mockThemeSettings.pcardShowOptionValues = true;
        mockThemeSettings.pcardOptionToShow = "Color";
        mockThemeSettings.pcardMaxOptionValues = 5;
    });

    describe("rendering", () => {
        it("renders option values when enabled", () => {
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
                { name: "Blue", swatch: { color: "#0000ff" } },
            ]);

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            expect(screen.getAllByRole("button")).toHaveLength(2);
        });

        it("returns null when pcardShowOptionValues is false", () => {
            mockThemeSettings.pcardShowOptionValues = false;
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
            ]);

            const { container } = render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            expect(container.firstChild).toBeNull();
        });

        it("returns null when option has no values", () => {
            const product = createMockProduct([]);

            const { container } = render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            expect(container.firstChild).toBeNull();
        });

        it("returns null when specified option does not exist", () => {
            mockThemeSettings.pcardOptionToShow = "NonExistent";
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
            ]);

            const { container } = render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            expect(container.firstChild).toBeNull();
        });

        it("applies custom className", () => {
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
            ]);

            const { container } = render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                    className="custom-class"
                />,
            );

            expect(container.firstChild).toHaveClass("custom-class");
        });
    });

    describe("selection", () => {
        it("shows selected state for matching variant", () => {
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
                { name: "Blue", swatch: { color: "#0000ff" } },
            ]);

            const selectedVariant = {
                id: "variant-red",
                selectedOptions: [{ name: "Color", value: "Red" }],
            } as ProductVariantFragment;

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            const buttons = screen.getAllByRole("button");
            // First button (Red) should be selected
            expect(buttons[0].className).toContain("outline-line");
        });

        it("calls setSelectedVariant when option is clicked", () => {
            const blueVariant = {
                id: "variant-blue",
                selectedOptions: [{ name: "Color", value: "Blue" }],
            } as ProductVariantFragment;

            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
                {
                    name: "Blue",
                    swatch: { color: "#0000ff" },
                    firstSelectableVariant: blueVariant,
                },
            ]);

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            // Click Blue button
            fireEvent.click(screen.getAllByRole("button")[1]);

            expect(setSelectedVariant).toHaveBeenCalledWith(blueVariant);
        });

        it("does not call setSelectedVariant when variant is null", () => {
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
                {
                    name: "Blue",
                    swatch: { color: "#0000ff" },
                    firstSelectableVariant: null,
                },
            ]);

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            // Click Blue button (which has no variant)
            fireEvent.click(screen.getAllByRole("button")[1]);

            expect(setSelectedVariant).not.toHaveBeenCalled();
        });
    });

    describe("max values limit", () => {
        it("respects pcardMaxOptionValues limit", () => {
            mockThemeSettings.pcardMaxOptionValues = 2;
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
                { name: "Blue", swatch: { color: "#0000ff" } },
                { name: "Green", swatch: { color: "#00ff00" } },
                { name: "Yellow", swatch: { color: "#ffff00" } },
            ]);

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            // Only 2 buttons should be rendered
            expect(screen.getAllByRole("button")).toHaveLength(2);
        });

        it("shows overflow link when values exceed limit", () => {
            mockThemeSettings.pcardMaxOptionValues = 2;
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
                { name: "Blue", swatch: { color: "#0000ff" } },
                { name: "Green", swatch: { color: "#00ff00" } },
                { name: "Yellow", swatch: { color: "#ffff00" } },
            ]);

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            const overflowLink = screen.getByTestId("overflow-link");
            expect(overflowLink).toHaveTextContent("+2");
            expect(overflowLink).toHaveAttribute(
                "href",
                "/products/test-product",
            );
        });

        it("does not show overflow link when values equal limit", () => {
            mockThemeSettings.pcardMaxOptionValues = 3;
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
                { name: "Blue", swatch: { color: "#0000ff" } },
                { name: "Green", swatch: { color: "#00ff00" } },
            ]);

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            expect(
                screen.queryByTestId("overflow-link"),
            ).not.toBeInTheDocument();
        });
    });

    describe("display types", () => {
        it("renders swatches for Color option", () => {
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
            ]);

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            const button = screen.getByRole("button");
            // Swatches have aspect-square or h-6 w-6 for sm size
            expect(button.className).toContain("h-6");
        });

        it("renders buttons for Size option", () => {
            mockThemeSettings.pcardOptionToShow = "Size";
            const product = createMockProduct(
                [{ name: "S" }, { name: "M" }, { name: "L" }],
                "Size",
            );

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            expect(
                screen.getByRole("button", { name: "S" }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "M" }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "L" }),
            ).toBeInTheDocument();
        });

        it("renders swatch image when provided", () => {
            const product = createMockProduct([
                {
                    name: "Pattern",
                    swatch: {
                        image: {
                            previewImage: {
                                url: "https://example.com/pattern.jpg",
                                altText: "Pattern",
                            },
                        },
                    },
                },
            ]);

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            expect(screen.getByTestId("swatch-image")).toBeInTheDocument();
        });
    });

    describe("tooltips", () => {
        it("renders tooltips for option values", () => {
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
                { name: "Blue", swatch: { color: "#0000ff" } },
            ]);

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            expect(screen.getAllByTestId("tooltip-root")).toHaveLength(2);
        });

        it("shows value name in tooltip", () => {
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
            ]);

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            expect(screen.getByTestId("tooltip-content")).toHaveTextContent(
                "Red",
            );
        });
    });

    describe("integration with OptionValueList", () => {
        it("uses sm size for compact card display", () => {
            const product = createMockProduct(
                [{ name: "S" }, { name: "M" }],
                "Size",
            );
            mockThemeSettings.pcardOptionToShow = "Size";

            render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            const button = screen.getByRole("button", { name: "S" });
            // sm size has text-[11px]
            expect(button.className).toContain("text-[11px]");
        });

        it("applies gap-2 for compact spacing", () => {
            const product = createMockProduct([
                { name: "Red", swatch: { color: "#ff0000" } },
                { name: "Blue", swatch: { color: "#0000ff" } },
            ]);

            const { container } = render(
                <ProductCardOptions
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            // The OptionValueList should have gap-2
            const optionList = container.querySelector(".gap-2");
            expect(optionList).toBeInTheDocument();
        });
    });
});
