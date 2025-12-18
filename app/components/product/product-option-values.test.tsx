import type { MappedProductOptions } from "@shopify/hydrogen";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ProductVariantFragment } from "storefront-api.generated";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-router
const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
    useNavigate: () => mockNavigate,
}));

// Mock misc utilities
vi.mock("~/utils/misc", () => ({
    isValidColor: () => true,
    isLightColor: () => false,
}));

// Mock @shopify/hydrogen Image
vi.mock("@shopify/hydrogen", async () => {
    const actual = await vi.importActual("@shopify/hydrogen");
    return {
        ...actual,
        Image: ({ data }: { data: any }) => (
            // biome-ignore lint/correctness/useImageSize: test mock
            // biome-ignore lint/performance/noImgElement: test mock
            <img src={data?.url} alt={data?.altText || "image"} />
        ),
    };
});

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
import { ProductOptionValues } from "./product-option-values";

/** Creates a mock mapped product option for testing */
function createMockOption(
    overrides: Partial<MappedProductOptions> = {},
): MappedProductOptions {
    return {
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
                firstSelectableVariant: {
                    id: "variant-red",
                    selectedOptions: [{ name: "Color", value: "Red" }],
                } as ProductVariantFragment,
            },
            {
                name: "Blue",
                handle: "test-product",
                variantUriQuery: "Color=Blue",
                selected: false,
                available: true,
                exists: true,
                isDifferentProduct: false,
                swatch: null,
                firstSelectableVariant: {
                    id: "variant-blue",
                    selectedOptions: [{ name: "Color", value: "Blue" }],
                } as ProductVariantFragment,
            },
        ],
        ...overrides,
    } as MappedProductOptions;
}

describe("ProductOptionValues", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("click handler", () => {
        it("navigates using variantUriQuery to preserve other selected options", () => {
            const onVariantChange = vi.fn();
            const option = createMockOption();

            render(
                <ProductOptionValues
                    option={option}
                    onVariantChange={onVariantChange}
                />,
            );

            // Click the unselected Blue option
            const blueButton = screen.getByRole("button", { name: /blue/i });
            fireEvent.click(blueButton);

            // Should navigate using variantUriQuery, NOT call onVariantChange
            // This ensures other selected options are preserved
            expect(onVariantChange).not.toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("?Color=Blue", {
                replace: true,
                preventScrollReset: true,
            });
        });

        it("navigates even when firstSelectableVariant is null", () => {
            const onVariantChange = vi.fn();
            const option = {
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
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        // No firstSelectableVariant - this is the key test case
                        firstSelectableVariant: null,
                    },
                ],
            } as MappedProductOptions;

            render(
                <ProductOptionValues
                    option={option}
                    onVariantChange={onVariantChange}
                />,
            );

            // Click the Blue option which has no firstSelectableVariant
            const blueButton = screen.getByRole("button", { name: /blue/i });
            fireEvent.click(blueButton);

            // Should still navigate using variantUriQuery
            expect(onVariantChange).not.toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("?Color=Blue", {
                replace: true,
                preventScrollReset: true,
            });
        });

        it("does nothing when clicking already selected option", () => {
            const onVariantChange = vi.fn();
            const option = createMockOption();

            render(
                <ProductOptionValues
                    option={option}
                    onVariantChange={onVariantChange}
                />,
            );

            // Click the already selected Red option
            const redButton = screen.getByRole("button", { name: /red/i });
            fireEvent.click(redButton);

            // Should do nothing
            expect(onVariantChange).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it("disables button when variant does not exist", () => {
            const onVariantChange = vi.fn();
            const option = {
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
                        exists: false, // This variant doesn't exist
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: null,
                    },
                ],
            } as MappedProductOptions;

            render(
                <ProductOptionValues
                    option={option}
                    onVariantChange={onVariantChange}
                />,
            );

            // The Purple button should be disabled
            const purpleButton = screen.getByRole("button", {
                name: /purple/i,
            });
            expect(purpleButton).toBeDisabled();

            // Clicking should do nothing (button is disabled)
            fireEvent.click(purpleButton);
            expect(onVariantChange).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it("navigates when onVariantChange is not provided", () => {
            const option = createMockOption();

            render(<ProductOptionValues option={option} />);

            // Click the unselected Blue option
            const blueButton = screen.getByRole("button", { name: /blue/i });
            fireEvent.click(blueButton);

            // Should navigate
            expect(mockNavigate).toHaveBeenCalledWith("?Color=Blue", {
                replace: true,
                preventScrollReset: true,
            });
        });

        it("preserves other option selections when changing one option", () => {
            // This test simulates a product with multiple options (Color and Size)
            // When user clicks a different size, Color should be preserved
            const onVariantChange = vi.fn();
            const option: MappedProductOptions = {
                name: "Size",
                optionValues: [
                    {
                        name: "Small",
                        handle: "test-product",
                        // This query preserves Color=Red
                        variantUriQuery: "Color=Red&Size=Small",
                        selected: true,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: {
                            id: "variant-red-small",
                            selectedOptions: [
                                { name: "Color", value: "Red" },
                                { name: "Size", value: "Small" },
                            ],
                        } as ProductVariantFragment,
                    },
                    {
                        name: "Large",
                        handle: "test-product",
                        // This query PRESERVES Color=Red (this is the key!)
                        variantUriQuery: "Color=Red&Size=Large",
                        selected: false,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        // firstSelectableVariant might have different Color!
                        // This is the bug we fixed - we should NOT use this
                        firstSelectableVariant: {
                            id: "variant-blue-large",
                            selectedOptions: [
                                { name: "Color", value: "Blue" }, // Wrong color!
                                { name: "Size", value: "Large" },
                            ],
                        } as ProductVariantFragment,
                    },
                ],
            } as MappedProductOptions;

            render(
                <ProductOptionValues
                    option={option}
                    onVariantChange={onVariantChange}
                />,
            );

            // Click the Large option
            const largeButton = screen.getByRole("button", { name: /large/i });
            fireEvent.click(largeButton);

            // Should navigate using variantUriQuery which preserves Color=Red
            // NOT using firstSelectableVariant which would change Color to Blue
            expect(mockNavigate).toHaveBeenCalledWith(
                "?Color=Red&Size=Large",
                expect.any(Object),
            );
            expect(onVariantChange).not.toHaveBeenCalled();
        });
    });

    describe("rendering", () => {
        it("returns null when option has no name", () => {
            const { container } = render(
                <ProductOptionValues
                    option={
                        { name: "", optionValues: [] } as MappedProductOptions
                    }
                />,
            );

            expect(container.firstChild).toBeNull();
        });

        it("renders all option values", () => {
            const option = createMockOption();

            render(<ProductOptionValues option={option} />);

            expect(
                screen.getByRole("button", { name: /red/i }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /blue/i }),
            ).toBeInTheDocument();
        });

        it("renders as button when onVariantChange is provided (for SEO)", () => {
            const onVariantChange = vi.fn();
            const option = createMockOption();

            render(
                <ProductOptionValues
                    option={option}
                    onVariantChange={onVariantChange}
                />,
            );

            // Should render as buttons, not links
            const buttons = screen.getAllByRole("button");
            expect(buttons.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe("multi-option products", () => {
        it("handles three option product correctly", () => {
            // Simulating a product with Color, Size, and Material options
            const option: MappedProductOptions = {
                name: "Material",
                optionValues: [
                    {
                        name: "Cotton",
                        handle: "test-product",
                        variantUriQuery: "Color=Red&Size=Small&Material=Cotton",
                        selected: true,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "variant-cotton" },
                    },
                    {
                        name: "Polyester",
                        handle: "test-product",
                        // variantUriQuery preserves Color=Red and Size=Small
                        variantUriQuery:
                            "Color=Red&Size=Small&Material=Polyester",
                        selected: false,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        // firstSelectableVariant might have different values
                        firstSelectableVariant: {
                            id: "variant-polyester-wrong",
                            selectedOptions: [
                                { name: "Color", value: "Blue" },
                                { name: "Size", value: "Large" },
                                { name: "Material", value: "Polyester" },
                            ],
                        } as ProductVariantFragment,
                    },
                ],
            } as MappedProductOptions;

            render(<ProductOptionValues option={option} />);

            const polyesterButton = screen.getByRole("button", {
                name: /polyester/i,
            });
            fireEvent.click(polyesterButton);

            // Should preserve all other selections
            expect(mockNavigate).toHaveBeenCalledWith(
                "?Color=Red&Size=Small&Material=Polyester",
                expect.any(Object),
            );
        });

        it("navigates correctly when multiple options are available", () => {
            const option: MappedProductOptions = {
                name: "Weight",
                optionValues: [
                    {
                        name: "10g",
                        handle: "test-product",
                        variantUriQuery: "Flavor=Mint&Weight=10g",
                        selected: true,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "v1" },
                    },
                    {
                        name: "20g",
                        handle: "test-product",
                        variantUriQuery: "Flavor=Mint&Weight=20g",
                        selected: false,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "v2" },
                    },
                    {
                        name: "30g",
                        handle: "test-product",
                        variantUriQuery: "Flavor=Mint&Weight=30g",
                        selected: false,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "v3" },
                    },
                ],
            } as MappedProductOptions;

            render(<ProductOptionValues option={option} />);

            // Click different weight options
            fireEvent.click(screen.getByRole("button", { name: /20g/i }));
            expect(mockNavigate).toHaveBeenLastCalledWith(
                "?Flavor=Mint&Weight=20g",
                expect.any(Object),
            );

            mockNavigate.mockClear();

            fireEvent.click(screen.getByRole("button", { name: /30g/i }));
            expect(mockNavigate).toHaveBeenLastCalledWith(
                "?Flavor=Mint&Weight=30g",
                expect.any(Object),
            );
        });
    });

    describe("availability states", () => {
        it("allows clicking unavailable but existing options", () => {
            const option: MappedProductOptions = {
                name: "Size",
                optionValues: [
                    {
                        name: "Small",
                        handle: "test-product",
                        variantUriQuery: "Size=Small",
                        selected: true,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "v1" },
                    },
                    {
                        name: "Medium",
                        handle: "test-product",
                        variantUriQuery: "Size=Medium",
                        selected: false,
                        available: false, // Out of stock but exists
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "v2" },
                    },
                ],
            } as MappedProductOptions;

            render(<ProductOptionValues option={option} />);

            const mediumButton = screen.getByRole("button", {
                name: /medium/i,
            });
            // Button should NOT be disabled (exists=true)
            expect(mediumButton).not.toBeDisabled();

            fireEvent.click(mediumButton);
            expect(mockNavigate).toHaveBeenCalledWith(
                "?Size=Medium",
                expect.any(Object),
            );
        });

        it("disables non-existent option combinations", () => {
            const option: MappedProductOptions = {
                name: "Size",
                optionValues: [
                    {
                        name: "Small",
                        handle: "test-product",
                        variantUriQuery: "Size=Small",
                        selected: true,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "v1" },
                    },
                    {
                        name: "XXL",
                        handle: "test-product",
                        variantUriQuery: "Size=XXL",
                        selected: false,
                        available: false,
                        exists: false, // This combination doesn't exist
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: null,
                    },
                ],
            } as MappedProductOptions;

            render(<ProductOptionValues option={option} />);

            const xxlButton = screen.getByRole("button", { name: /xxl/i });
            expect(xxlButton).toBeDisabled();
        });
    });

    describe("URL query generation", () => {
        it("uses correct query format for single option", () => {
            const option: MappedProductOptions = {
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
                        firstSelectableVariant: { id: "v1" },
                    },
                    {
                        name: "Green",
                        handle: "test-product",
                        variantUriQuery: "Color=Green",
                        selected: false,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "v2" },
                    },
                ],
            } as MappedProductOptions;

            render(<ProductOptionValues option={option} />);

            fireEvent.click(screen.getByRole("button", { name: /green/i }));
            expect(mockNavigate).toHaveBeenCalledWith("?Color=Green", {
                replace: true,
                preventScrollReset: true,
            });
        });

        it("handles URL-encoded option values", () => {
            const option: MappedProductOptions = {
                name: "Size",
                optionValues: [
                    {
                        name: "S",
                        handle: "test-product",
                        variantUriQuery: "Size=S",
                        selected: true,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "v1" },
                    },
                    {
                        name: "Extra Large",
                        handle: "test-product",
                        // URL-encoded space
                        variantUriQuery: "Size=Extra%20Large",
                        selected: false,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "v2" },
                    },
                ],
            } as MappedProductOptions;

            render(<ProductOptionValues option={option} />);

            fireEvent.click(
                screen.getByRole("button", { name: /extra large/i }),
            );
            expect(mockNavigate).toHaveBeenCalledWith("?Size=Extra%20Large", {
                replace: true,
                preventScrollReset: true,
            });
        });
    });

    describe("rapid selection changes", () => {
        it("handles rapid clicks on different options", () => {
            const option: MappedProductOptions = {
                name: "Color",
                optionValues: [
                    {
                        name: "Red",
                        handle: "test-product",
                        variantUriQuery: "Color=Red",
                        selected: false,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "v1" },
                    },
                    {
                        name: "Blue",
                        handle: "test-product",
                        variantUriQuery: "Color=Blue",
                        selected: false,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "v2" },
                    },
                    {
                        name: "Green",
                        handle: "test-product",
                        variantUriQuery: "Color=Green",
                        selected: true,
                        available: true,
                        exists: true,
                        isDifferentProduct: false,
                        swatch: null,
                        firstSelectableVariant: { id: "v3" },
                    },
                ],
            } as MappedProductOptions;

            render(<ProductOptionValues option={option} />);

            // Simulate rapid clicking
            fireEvent.click(screen.getByRole("button", { name: /red/i }));
            fireEvent.click(screen.getByRole("button", { name: /blue/i }));

            // Both navigations should have been called
            expect(mockNavigate).toHaveBeenCalledTimes(2);
            expect(mockNavigate).toHaveBeenNthCalledWith(
                1,
                "?Color=Red",
                expect.any(Object),
            );
            expect(mockNavigate).toHaveBeenNthCalledWith(
                2,
                "?Color=Blue",
                expect.any(Object),
            );
        });
    });
});
