import type { MappedProductOptions } from "@shopify/hydrogen";
import { render, screen } from "@testing-library/react";
import type {
    ProductQuery,
    ProductVariantFragment,
} from "storefront-api.generated";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-router
const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
    useNavigate: () => mockNavigate,
}));

// Mock @shopify/hydrogen
const mockGetProductOptions = vi.fn();
vi.mock("@shopify/hydrogen", () => ({
    getProductOptions: (args: unknown) => mockGetProductOptions(args),
    Image: ({ data }: { data: any }) => (
        // biome-ignore lint/correctness/useImageSize: test mock
        // biome-ignore lint/performance/noImgElement: test mock
        <img src={data?.url} alt={data?.altText || "image"} />
    ),
}));

// Mock misc utilities
vi.mock("~/utils/misc", () => ({
    isValidColor: () => true,
    isLightColor: () => false,
}));

// Mock hasOnlyDefaultVariant
vi.mock("~/utils/product", () => ({
    hasOnlyDefaultVariant: (options: MappedProductOptions[]) => {
        // Default variant check: single option with value "Default Title"
        return (
            options.length === 1 &&
            options[0].optionValues.length === 1 &&
            options[0].optionValues[0].name === "Default Title"
        );
    },
}));

// Mock tooltip
vi.mock("~/components/tooltip", () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    TooltipContent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

// Mock Link component
vi.mock("~/components/link", () => ({
    default: ({
        children,
        to,
        ...props
    }: {
        children: React.ReactNode;
        to: string;
    }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
}));

// Import after mocks
import { VariantSelector } from "./variant-selector";

/** Creates a mock product for testing */
function createMockProduct(
    overrides: Partial<ProductQuery["product"]> = {},
): NonNullable<ProductQuery["product"]> {
    return {
        id: "gid://shopify/Product/123",
        title: "Test Product",
        handle: "test-product",
        vendor: "Test Vendor",
        descriptionHtml: "<p>Test description</p>",
        description: "Test description",
        options: [
            {
                name: "Color",
                optionValues: [{ name: "Red" }, { name: "Blue" }],
            },
            {
                name: "Size",
                optionValues: [{ name: "Small" }, { name: "Large" }],
            },
        ],
        selectedOrFirstAvailableVariant: {
            id: "gid://shopify/ProductVariant/1",
            selectedOptions: [
                { name: "Color", value: "Red" },
                { name: "Size", value: "Small" },
            ],
        },
        ...overrides,
    } as NonNullable<ProductQuery["product"]>;
}

/** Creates mock mapped product options */
function createMockMappedOptions(): MappedProductOptions[] {
    return [
        {
            name: "Color",
            optionValues: [
                {
                    name: "Red",
                    handle: "test-product",
                    variantUriQuery: "Color=Red&Size=Small",
                    selected: true,
                    available: true,
                    exists: true,
                    isDifferentProduct: false,
                    swatch: null,
                    firstSelectableVariant: { id: "variant-red-small" },
                },
                {
                    name: "Blue",
                    handle: "test-product",
                    variantUriQuery: "Color=Blue&Size=Small",
                    selected: false,
                    available: true,
                    exists: true,
                    isDifferentProduct: false,
                    swatch: null,
                    firstSelectableVariant: { id: "variant-blue-small" },
                },
            ],
        },
        {
            name: "Size",
            optionValues: [
                {
                    name: "Small",
                    handle: "test-product",
                    variantUriQuery: "Color=Red&Size=Small",
                    selected: true,
                    available: true,
                    exists: true,
                    isDifferentProduct: false,
                    swatch: null,
                    firstSelectableVariant: { id: "variant-red-small" },
                },
                {
                    name: "Large",
                    handle: "test-product",
                    variantUriQuery: "Color=Red&Size=Large",
                    selected: false,
                    available: true,
                    exists: true,
                    isDifferentProduct: false,
                    swatch: null,
                    firstSelectableVariant: { id: "variant-red-large" },
                },
            ],
        },
    ] as MappedProductOptions[];
}

describe("VariantSelector", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("rendering", () => {
        it("renders all product options", () => {
            const product = createMockProduct();
            const selectedVariant = product.selectedOrFirstAvailableVariant;
            const setSelectedVariant = vi.fn();

            mockGetProductOptions.mockReturnValue(createMockMappedOptions());

            render(
                <VariantSelector
                    product={product}
                    selectedVariant={selectedVariant as ProductVariantFragment}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            // Should render both option groups
            expect(screen.getByText("Color")).toBeInTheDocument();
            expect(screen.getByText("Size")).toBeInTheDocument();
        });

        it("displays selected value next to option name", () => {
            const product = createMockProduct();
            const selectedVariant = {
                id: "gid://shopify/ProductVariant/1",
                selectedOptions: [
                    { name: "Color", value: "Red" },
                    { name: "Size", value: "Small" },
                ],
            } as ProductVariantFragment;
            const setSelectedVariant = vi.fn();

            mockGetProductOptions.mockReturnValue(createMockMappedOptions());

            render(
                <VariantSelector
                    product={product}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            // Should show selected values
            expect(screen.getByText(": Red")).toBeInTheDocument();
            expect(screen.getByText(": Small")).toBeInTheDocument();
        });

        it("renders all option values as buttons", () => {
            const product = createMockProduct();
            const selectedVariant =
                product.selectedOrFirstAvailableVariant as ProductVariantFragment;
            const setSelectedVariant = vi.fn();

            mockGetProductOptions.mockReturnValue(createMockMappedOptions());

            render(
                <VariantSelector
                    product={product}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            // Should render buttons for all option values
            expect(
                screen.getByRole("button", { name: /red/i }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /blue/i }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /small/i }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /large/i }),
            ).toBeInTheDocument();
        });

        it("returns null when product has no options", () => {
            const product = createMockProduct();
            const selectedVariant =
                product.selectedOrFirstAvailableVariant as ProductVariantFragment;
            const setSelectedVariant = vi.fn();

            mockGetProductOptions.mockReturnValue([]);

            const { container } = render(
                <VariantSelector
                    product={product}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            expect(container.firstChild).toBeNull();
        });

        it("returns null when product has only default variant", () => {
            const product = createMockProduct();
            const selectedVariant =
                product.selectedOrFirstAvailableVariant as ProductVariantFragment;
            const setSelectedVariant = vi.fn();

            // Mock default variant options
            mockGetProductOptions.mockReturnValue([
                {
                    name: "Title",
                    optionValues: [
                        {
                            name: "Default Title",
                            selected: true,
                            available: true,
                            exists: true,
                        },
                    ],
                },
            ] as MappedProductOptions[]);

            const { container } = render(
                <VariantSelector
                    product={product}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            expect(container.firstChild).toBeNull();
        });
    });

    describe("getProductOptions integration", () => {
        it("passes product and selectedVariant to getProductOptions", () => {
            const product = createMockProduct();
            const selectedVariant = {
                id: "gid://shopify/ProductVariant/1",
                selectedOptions: [
                    { name: "Color", value: "Blue" },
                    { name: "Size", value: "Large" },
                ],
            } as ProductVariantFragment;
            const setSelectedVariant = vi.fn();

            mockGetProductOptions.mockReturnValue(createMockMappedOptions());

            render(
                <VariantSelector
                    product={product}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            // Verify getProductOptions was called with correct arguments
            expect(mockGetProductOptions).toHaveBeenCalledWith(
                expect.objectContaining({
                    selectedOrFirstAvailableVariant: selectedVariant,
                }),
            );
        });
    });

    describe("with unavailable variants", () => {
        it("renders unavailable option values with proper styling", () => {
            const product = createMockProduct();
            const selectedVariant =
                product.selectedOrFirstAvailableVariant as ProductVariantFragment;
            const setSelectedVariant = vi.fn();

            // Mock options with unavailable variant
            mockGetProductOptions.mockReturnValue([
                {
                    name: "Color",
                    optionValues: [
                        {
                            name: "Red",
                            handle: "test-product",
                            variantUriQuery: "Color=Red",
                            selected: true,
                            available: true,
                            exists: true,
                            isDifferentProduct: false,
                            swatch: null,
                            firstSelectableVariant: { id: "variant-red" },
                        },
                        {
                            name: "Blue",
                            handle: "test-product",
                            variantUriQuery: "Color=Blue",
                            selected: false,
                            available: false, // Out of stock
                            exists: true,
                            isDifferentProduct: false,
                            swatch: null,
                            firstSelectableVariant: { id: "variant-blue" },
                        },
                    ],
                },
            ] as MappedProductOptions[]);

            render(
                <VariantSelector
                    product={product}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            // Both options should be rendered
            expect(
                screen.getByRole("button", { name: /red/i }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /blue/i }),
            ).toBeInTheDocument();
        });

        it("disables non-existent option values", () => {
            const product = createMockProduct();
            const selectedVariant =
                product.selectedOrFirstAvailableVariant as ProductVariantFragment;
            const setSelectedVariant = vi.fn();

            // Mock options with non-existent variant
            mockGetProductOptions.mockReturnValue([
                {
                    name: "Color",
                    optionValues: [
                        {
                            name: "Red",
                            handle: "test-product",
                            variantUriQuery: "Color=Red",
                            selected: true,
                            available: true,
                            exists: true,
                            isDifferentProduct: false,
                            swatch: null,
                            firstSelectableVariant: { id: "variant-red" },
                        },
                        {
                            name: "Purple",
                            handle: "test-product",
                            variantUriQuery: "Color=Purple",
                            selected: false,
                            available: false,
                            exists: false, // Doesn't exist
                            isDifferentProduct: false,
                            swatch: null,
                            firstSelectableVariant: null,
                        },
                    ],
                },
            ] as MappedProductOptions[]);

            render(
                <VariantSelector
                    product={product}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            // Purple button should be disabled
            const purpleButton = screen.getByRole("button", {
                name: /purple/i,
            });
            expect(purpleButton).toBeDisabled();
        });
    });

    describe("with null selectedVariant", () => {
        it("renders without selected values when selectedVariant is null", () => {
            const product = createMockProduct();
            const setSelectedVariant = vi.fn();

            mockGetProductOptions.mockReturnValue(createMockMappedOptions());

            render(
                <VariantSelector
                    product={product}
                    selectedVariant={null}
                    setSelectedVariant={setSelectedVariant}
                />,
            );

            // Should still render option names
            expect(screen.getByText("Color")).toBeInTheDocument();
            expect(screen.getByText("Size")).toBeInTheDocument();

            // But should not show ": value" parts (they would not be rendered)
            expect(screen.queryByText(": Red")).not.toBeInTheDocument();
            expect(screen.queryByText(": Small")).not.toBeInTheDocument();
        });
    });
});
