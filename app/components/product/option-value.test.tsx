import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
    getOptionDisplayType,
    OPTIONS_AS_BUTTON,
    OPTIONS_AS_SWATCH,
    OptionButton,
    OptionSwatch,
    OptionValue,
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
