import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
    getOptionDisplayType,
    type NormalizedOptionValue,
    OPTIONS_AS_BUTTON,
    OPTIONS_AS_SWATCH,
    OptionButton,
    OptionSwatch,
    OptionValue,
    OptionValueList,
} from "./option-value";

// Mock the misc utilities
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

/** No-op click handler for tests that don't need to verify clicks */
const noop = () => undefined;

describe("getOptionDisplayType", () => {
    it("returns 'swatch' for color options", () => {
        expect(getOptionDisplayType("Color")).toBe("swatch");
        expect(getOptionDisplayType("Colors")).toBe("swatch");
        expect(getOptionDisplayType("Colour")).toBe("swatch");
        expect(getOptionDisplayType("Colours")).toBe("swatch");
    });

    it("returns 'button' for size options", () => {
        expect(getOptionDisplayType("Size")).toBe("button");
    });

    it("returns 'default' for unknown options", () => {
        expect(getOptionDisplayType("Material")).toBe("default");
        expect(getOptionDisplayType("Style")).toBe("default");
    });
});

describe("OptionSwatch", () => {
    it("renders a color swatch with background color", () => {
        render(<OptionSwatch name="Red" color="#ff0000" onClick={noop} />);

        const swatch = screen.getByRole("button");
        const colorSpan = swatch.querySelector("span");
        expect(colorSpan).toHaveStyle({ backgroundColor: "#ff0000" });
    });

    it("renders with swatch image when provided", () => {
        const swatchImage = {
            url: "https://example.com/swatch.jpg",
            altText: "Red swatch",
        };
        render(
            <OptionSwatch
                name="Red"
                swatchImage={swatchImage}
                onClick={noop}
            />,
        );

        expect(screen.getByTestId("swatch-image")).toBeInTheDocument();
    });

    it("applies selected styles when selected", () => {
        render(
            <OptionSwatch name="Red" color="#ff0000" selected onClick={noop} />,
        );

        const swatch = screen.getByRole("button");
        expect(swatch.className).toContain("outline-line");
    });

    it("applies unavailable styles when not available", () => {
        render(
            <OptionSwatch
                name="Red"
                color="#ff0000"
                available={false}
                onClick={noop}
            />,
        );

        const swatch = screen.getByRole("button");
        expect(swatch.className).toContain("diagonal");
    });

    it("calls onClick when clicked", () => {
        const handleClick = vi.fn();
        render(
            <OptionSwatch name="Red" color="#ff0000" onClick={handleClick} />,
        );

        fireEvent.click(screen.getByRole("button"));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("is disabled when disabled prop is true", () => {
        const handleClick = vi.fn();
        render(
            <OptionSwatch
                name="Red"
                color="#ff0000"
                disabled
                onClick={handleClick}
            />,
        );

        const swatch = screen.getByRole("button");
        expect(swatch).toBeDisabled();
        expect(swatch.className).toContain("cursor-not-allowed");
    });

    it("adds border for light colors", () => {
        render(<OptionSwatch name="White" color="#ffffff" onClick={noop} />);

        const swatch = screen.getByRole("button");
        const colorSpan = swatch.querySelector("span");
        expect(colorSpan?.className).toContain("border");
    });

    it("supports custom size variant", () => {
        render(
            <OptionSwatch
                name="Red"
                color="#ff0000"
                size="sm"
                onClick={noop}
            />,
        );

        const swatch = screen.getByRole("button");
        expect(swatch.className).toContain("h-6");
        expect(swatch.className).toContain("w-6");
    });
});

describe("OptionButton", () => {
    it("renders button with name", () => {
        render(<OptionButton name="Large" onClick={noop} />);

        expect(screen.getByRole("button")).toHaveTextContent("Large");
    });

    it("applies selected styles when selected", () => {
        render(<OptionButton name="Large" selected onClick={noop} />);

        const button = screen.getByRole("button");
        expect(button.className).toContain("bg-body");
        expect(button.className).toContain("text-body-inverse");
    });

    it("applies unavailable styles when not available", () => {
        render(<OptionButton name="Large" available={false} onClick={noop} />);

        const button = screen.getByRole("button");
        expect(button.className).toContain("diagonal");
        expect(button.className).toContain("text-body-subtle");
    });

    it("calls onClick when clicked", () => {
        const handleClick = vi.fn();
        render(<OptionButton name="Large" onClick={handleClick} />);

        fireEvent.click(screen.getByRole("button"));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("is disabled when disabled prop is true", () => {
        render(<OptionButton name="Large" disabled onClick={noop} />);

        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("supports compact size variant", () => {
        render(<OptionButton name="Large" size="sm" onClick={noop} />);

        const button = screen.getByRole("button");
        expect(button.className).toContain("text-[11px]");
    });
});

describe("OptionValue", () => {
    it("renders as swatch when option type is swatch", () => {
        render(
            <OptionValue
                optionName="Color"
                name="Red"
                color="#ff0000"
                onClick={noop}
            />,
        );

        const button = screen.getByRole("button");
        // Swatch has aspect-square class
        expect(button.className).toContain("aspect-square");
    });

    it("renders as button when option type is button", () => {
        render(<OptionValue optionName="Size" name="Large" onClick={noop} />);

        const button = screen.getByRole("button");
        expect(button).toHaveTextContent("Large");
        // Button has px-4 padding
        expect(button.className).toContain("px-4");
    });

    it("renders default style for unknown option types", () => {
        render(
            <OptionValue optionName="Material" name="Cotton" onClick={noop} />,
        );

        const button = screen.getByRole("button");
        expect(button).toHaveTextContent("Cotton");
        // Default style has border-b
        expect(button.className).toContain("border-b");
    });

    it("passes through selected, available, and disabled props", () => {
        render(
            <OptionValue
                optionName="Size"
                name="Large"
                selected
                available={false}
                onClick={noop}
            />,
        );

        const button = screen.getByRole("button");
        expect(button.className).toContain("diagonal");
    });
});

describe("Option configuration arrays", () => {
    it("OPTIONS_AS_SWATCH contains color-related names", () => {
        expect(OPTIONS_AS_SWATCH).toContain("Color");
        expect(OPTIONS_AS_SWATCH).toContain("Colors");
        expect(OPTIONS_AS_SWATCH).toContain("Colour");
        expect(OPTIONS_AS_SWATCH).toContain("Colours");
    });

    it("OPTIONS_AS_BUTTON contains Size", () => {
        expect(OPTIONS_AS_BUTTON).toContain("Size");
    });
});

/**
 * Creates mock normalized option values for testing.
 * Uses unique names to avoid React key warnings.
 */
function createMockValues(
    count: number,
    optionName = "Color",
): NormalizedOptionValue[] {
    const baseColors = ["Red", "Blue", "Green", "Yellow", "Purple"];
    const hexColors = ["#ff0000", "#0000ff", "#00ff00", "#ffff00", "#800080"];

    return Array.from({ length: count }, (_, i) => {
        const baseIndex = i % baseColors.length;
        const suffix =
            i >= baseColors.length
                ? ` ${Math.floor(i / baseColors.length) + 1}`
                : "";
        return {
            name: `${baseColors[baseIndex]}${suffix}`,
            selected: i === 0,
            available: true,
            exists: true,
            color: optionName.toLowerCase().includes("color")
                ? hexColors[baseIndex]
                : undefined,
            swatchImage: null,
        };
    });
}

describe("OptionValueList", () => {
    describe("rendering", () => {
        it("renders all option values", () => {
            const values = createMockValues(3);
            const handleSelect = vi.fn();

            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={handleSelect}
                />,
            );

            expect(screen.getAllByRole("button")).toHaveLength(3);
        });

        it("renders as swatches for color options", () => {
            const values = createMockValues(2, "Color");
            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                />,
            );

            const buttons = screen.getAllByRole("button");
            for (const button of buttons) {
                expect(button.className).toContain("aspect-square");
            }
        });

        it("renders as buttons for size options", () => {
            const values: NormalizedOptionValue[] = [
                { name: "S", selected: true, available: true, exists: true },
                { name: "M", selected: false, available: true, exists: true },
                { name: "L", selected: false, available: true, exists: true },
            ];
            render(
                <OptionValueList
                    optionName="Size"
                    values={values}
                    onSelect={noop}
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

        it("renders as default style for unknown option types", () => {
            const values: NormalizedOptionValue[] = [
                {
                    name: "Cotton",
                    selected: false,
                    available: true,
                    exists: true,
                },
                {
                    name: "Polyester",
                    selected: true,
                    available: true,
                    exists: true,
                },
            ];
            render(
                <OptionValueList
                    optionName="Material"
                    values={values}
                    onSelect={noop}
                />,
            );

            const buttons = screen.getAllByRole("button");
            for (const button of buttons) {
                expect(button.className).toContain("border-b");
            }
        });

        it("applies container className", () => {
            const values = createMockValues(2);
            const { container } = render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                    className="custom-class"
                />,
            );

            expect(container.firstChild).toHaveClass("custom-class");
        });
    });

    describe("selection states", () => {
        it("applies selected styles to selected values", () => {
            const values: NormalizedOptionValue[] = [
                { name: "S", selected: true, available: true, exists: true },
                { name: "M", selected: false, available: true, exists: true },
            ];
            render(
                <OptionValueList
                    optionName="Size"
                    values={values}
                    onSelect={noop}
                />,
            );

            const selectedButton = screen.getByRole("button", { name: "S" });
            expect(selectedButton.className).toContain("bg-body");
        });

        it("applies unavailable styles to unavailable values", () => {
            const values: NormalizedOptionValue[] = [
                { name: "S", selected: false, available: false, exists: true },
                { name: "M", selected: false, available: true, exists: true },
            ];
            render(
                <OptionValueList
                    optionName="Size"
                    values={values}
                    onSelect={noop}
                />,
            );

            const unavailableButton = screen.getByRole("button", { name: "S" });
            expect(unavailableButton.className).toContain("diagonal");
        });

        it("disables buttons for non-existent values", () => {
            const values: NormalizedOptionValue[] = [
                { name: "S", selected: false, available: true, exists: true },
                {
                    name: "XXL",
                    selected: false,
                    available: false,
                    exists: false,
                },
            ];
            render(
                <OptionValueList
                    optionName="Size"
                    values={values}
                    onSelect={noop}
                />,
            );

            const nonExistentButton = screen.getByRole("button", {
                name: "XXL",
            });
            expect(nonExistentButton).toBeDisabled();
        });
    });

    describe("click handling", () => {
        it("calls onSelect with value name when clicked", () => {
            const handleSelect = vi.fn();
            const values: NormalizedOptionValue[] = [
                { name: "Red", selected: true, available: true, exists: true },
                {
                    name: "Blue",
                    selected: false,
                    available: true,
                    exists: true,
                },
            ];
            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={handleSelect}
                />,
            );

            fireEvent.click(screen.getByRole("button", { name: "Blue" }));
            expect(handleSelect).toHaveBeenCalledWith("Blue");
        });

        it("does not call onSelect for disabled buttons", () => {
            const handleSelect = vi.fn();
            const values: NormalizedOptionValue[] = [
                { name: "S", selected: true, available: true, exists: true },
                {
                    name: "XXL",
                    selected: false,
                    available: false,
                    exists: false,
                },
            ];
            render(
                <OptionValueList
                    optionName="Size"
                    values={values}
                    onSelect={handleSelect}
                />,
            );

            const disabledButton = screen.getByRole("button", { name: "XXL" });
            fireEvent.click(disabledButton);
            expect(handleSelect).not.toHaveBeenCalled();
        });

        it("handles rapid clicks on different options", () => {
            const handleSelect = vi.fn();
            const values: NormalizedOptionValue[] = [
                { name: "S", selected: false, available: true, exists: true },
                { name: "M", selected: false, available: true, exists: true },
                { name: "L", selected: true, available: true, exists: true },
            ];
            render(
                <OptionValueList
                    optionName="Size"
                    values={values}
                    onSelect={handleSelect}
                />,
            );

            fireEvent.click(screen.getByRole("button", { name: "S" }));
            fireEvent.click(screen.getByRole("button", { name: "M" }));

            expect(handleSelect).toHaveBeenCalledTimes(2);
            expect(handleSelect).toHaveBeenNthCalledWith(1, "S");
            expect(handleSelect).toHaveBeenNthCalledWith(2, "M");
        });
    });

    describe("tooltips", () => {
        it("renders tooltips by default", () => {
            const values = createMockValues(2);
            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                />,
            );

            expect(screen.getAllByTestId("tooltip-root")).toHaveLength(2);
        });

        it("hides tooltips when showTooltips is false", () => {
            const values = createMockValues(2);
            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                    showTooltips={false}
                />,
            );

            expect(screen.queryAllByTestId("tooltip-root")).toHaveLength(0);
        });

        it("shows value name in tooltip content", () => {
            const values: NormalizedOptionValue[] = [
                {
                    name: "Red",
                    selected: true,
                    available: true,
                    exists: true,
                    color: "#ff0000",
                },
            ];
            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                />,
            );

            expect(screen.getByTestId("tooltip-content")).toHaveTextContent(
                "Red",
            );
        });

        it("shows 'Not available' text for non-existent values", () => {
            const values: NormalizedOptionValue[] = [
                {
                    name: "XXL",
                    selected: false,
                    available: false,
                    exists: false,
                },
            ];
            render(
                <OptionValueList
                    optionName="Size"
                    values={values}
                    onSelect={noop}
                />,
            );

            expect(screen.getByTestId("tooltip-content")).toHaveTextContent(
                "XXL (Not available)",
            );
        });

        it("uses custom tooltipText when provided", () => {
            const values: NormalizedOptionValue[] = [
                {
                    name: "Red",
                    selected: true,
                    available: true,
                    exists: true,
                    tooltipText: "Crimson Red - Our most popular color",
                },
            ];
            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                />,
            );

            expect(screen.getByTestId("tooltip-content")).toHaveTextContent(
                "Crimson Red - Our most popular color",
            );
        });

        it("uses smaller sideOffset for sm size", () => {
            const values = createMockValues(1);
            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                    size="sm"
                />,
            );

            expect(screen.getByTestId("tooltip-content")).toHaveAttribute(
                "data-side-offset",
                "8",
            );
        });

        it("uses larger sideOffset for md size", () => {
            const values = createMockValues(1);
            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                    size="md"
                />,
            );

            expect(screen.getByTestId("tooltip-content")).toHaveAttribute(
                "data-side-offset",
                "6",
            );
        });
    });

    describe("size variants", () => {
        it("applies sm size to option values", () => {
            const values: NormalizedOptionValue[] = [
                { name: "S", selected: false, available: true, exists: true },
            ];
            render(
                <OptionValueList
                    optionName="Size"
                    values={values}
                    onSelect={noop}
                    size="sm"
                />,
            );

            const button = screen.getByRole("button");
            expect(button.className).toContain("text-[11px]");
        });

        it("applies md size by default", () => {
            const values: NormalizedOptionValue[] = [
                { name: "S", selected: false, available: true, exists: true },
            ];
            render(
                <OptionValueList
                    optionName="Size"
                    values={values}
                    onSelect={noop}
                />,
            );

            const button = screen.getByRole("button");
            expect(button.className).toContain("px-4");
        });

        it("applies smaller gap for sm size", () => {
            const values = createMockValues(2);
            const { container } = render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                    size="sm"
                />,
            );

            expect(container.firstChild).toHaveClass("gap-2");
        });
    });

    describe("swatch rendering", () => {
        it("renders color swatches with correct background color", () => {
            const values: NormalizedOptionValue[] = [
                {
                    name: "Red",
                    selected: false,
                    available: true,
                    exists: true,
                    color: "#ff0000",
                },
            ];
            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                />,
            );

            const swatch = screen.getByRole("button");
            const colorSpan = swatch.querySelector("span");
            expect(colorSpan).toHaveStyle({ backgroundColor: "#ff0000" });
        });

        it("renders swatch image when provided", () => {
            const values: NormalizedOptionValue[] = [
                {
                    name: "Pattern",
                    selected: false,
                    available: true,
                    exists: true,
                    swatchImage: {
                        url: "https://example.com/pattern.jpg",
                        altText: "Pattern swatch",
                    },
                },
            ];
            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                />,
            );

            expect(screen.getByTestId("swatch-image")).toBeInTheDocument();
        });

        it("adds padding top for md size swatches", () => {
            const values = createMockValues(1, "Color");
            const { container } = render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                    size="md"
                />,
            );

            expect(container.firstChild).toHaveClass("pt-0.5");
        });
    });

    describe("edge cases", () => {
        it("renders empty list without errors", () => {
            const { container } = render(
                <OptionValueList
                    optionName="Color"
                    values={[]}
                    onSelect={noop}
                />,
            );

            expect(container.firstChild).toBeInTheDocument();
            expect(screen.queryAllByRole("button")).toHaveLength(0);
        });

        it("handles single value", () => {
            const values = createMockValues(1);
            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                />,
            );

            expect(screen.getAllByRole("button")).toHaveLength(1);
        });

        it("handles many values", () => {
            const values = createMockValues(10);
            render(
                <OptionValueList
                    optionName="Color"
                    values={values}
                    onSelect={noop}
                />,
            );

            expect(screen.getAllByRole("button")).toHaveLength(10);
        });

        it("handles values with special characters in names", () => {
            const values: NormalizedOptionValue[] = [
                {
                    name: "Red & Orange",
                    selected: false,
                    available: true,
                    exists: true,
                },
                {
                    name: "Blue/Green",
                    selected: false,
                    available: true,
                    exists: true,
                },
            ];
            render(
                <OptionValueList
                    optionName="Size"
                    values={values}
                    onSelect={noop}
                />,
            );

            expect(
                screen.getByRole("button", { name: "Red & Orange" }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "Blue/Green" }),
            ).toBeInTheDocument();
        });
    });
});
