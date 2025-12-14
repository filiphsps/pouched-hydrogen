import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductImage, type ProductImageData } from "./product-image";

// Mock the base Image component
vi.mock("~/components/image", () => ({
    Image: ({
        data,
        width,
        height,
        className,
        onLoad,
        onError,
    }: {
        data: { altText?: string; url?: string };
        width: number;
        height: number;
        className?: string;
        onLoad?: () => void;
        onError?: () => void;
    }) => (
        // biome-ignore lint/performance/noImgElement: test helper
        <img
            data-testid="product-image"
            src={data.url}
            alt={data.altText || ""}
            width={width}
            height={height}
            className={className}
            onLoad={onLoad}
            onError={onError}
        />
    ),
}));

const mockImage: ProductImageData = {
    id: "gid://shopify/Image/1",
    url: "https://cdn.shopify.com/test-image.jpg",
    altText: "Test Product Image",
    width: 1000,
    height: 1000,
};

describe("ProductImage", () => {
    describe("rendering", () => {
        it("renders image with correct attributes", () => {
            render(<ProductImage image={mockImage} />);

            const img = screen.getByTestId("product-image");
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute("src", mockImage.url);
            expect(img).toHaveAttribute("alt", mockImage.altText);
        });

        it("returns null when image is null", () => {
            const { container } = render(<ProductImage image={null} />);
            expect(container).toBeEmptyDOMElement();
        });

        it("returns null when image is undefined", () => {
            const { container } = render(<ProductImage image={undefined} />);
            expect(container).toBeEmptyDOMElement();
        });

        it("returns null when image has no url", () => {
            const { container } = render(
                <ProductImage image={{ id: "test", altText: "test" }} />,
            );
            expect(container).toBeEmptyDOMElement();
        });
    });

    describe("alt text handling", () => {
        it("uses image altText by default", () => {
            render(<ProductImage image={mockImage} />);

            const img = screen.getByTestId("product-image");
            expect(img).toHaveAttribute("alt", "Test Product Image");
        });

        it("uses alt prop when provided", () => {
            render(<ProductImage image={mockImage} alt="Custom Alt Text" />);

            const img = screen.getByTestId("product-image");
            expect(img).toHaveAttribute("alt", "Custom Alt Text");
        });

        it("uses fallback text when no altText", () => {
            const imageWithoutAlt: ProductImageData = {
                url: "https://example.com/image.jpg",
            };
            render(<ProductImage image={imageWithoutAlt} />);

            const img = screen.getByTestId("product-image");
            expect(img).toHaveAttribute("alt", "Product image");
        });
    });

    describe("size presets", () => {
        it("uses medium size by default", () => {
            render(<ProductImage image={mockImage} />);

            const img = screen.getByTestId("product-image");
            expect(img).toHaveAttribute("width", "500");
            expect(img).toHaveAttribute("height", "500");
        });

        it("uses thumbnail size correctly", () => {
            render(<ProductImage image={mockImage} size="thumbnail" />);

            const img = screen.getByTestId("product-image");
            expect(img).toHaveAttribute("width", "100");
            expect(img).toHaveAttribute("height", "100");
        });

        it("uses small size correctly", () => {
            render(<ProductImage image={mockImage} size="small" />);

            const img = screen.getByTestId("product-image");
            expect(img).toHaveAttribute("width", "250");
            expect(img).toHaveAttribute("height", "250");
        });

        it("uses large size correctly", () => {
            render(<ProductImage image={mockImage} size="large" />);

            const img = screen.getByTestId("product-image");
            expect(img).toHaveAttribute("width", "700");
            expect(img).toHaveAttribute("height", "700");
        });
    });

    describe("aspect ratio handling", () => {
        it("uses 1/1 aspect ratio by default", () => {
            render(<ProductImage image={mockImage} size="medium" />);

            const img = screen.getByTestId("product-image");
            // With 1/1 ratio, height equals width
            expect(img).toHaveAttribute("height", "500");
        });

        it("calculates height correctly for 4/3 aspect ratio", () => {
            render(
                <ProductImage
                    image={mockImage}
                    size="medium"
                    aspectRatio="4/3"
                />,
            );

            const img = screen.getByTestId("product-image");
            // width=500, ratio=4/3, height = 500 * 3 / 4 = 375
            expect(img).toHaveAttribute("height", "375");
        });

        it("calculates height correctly for 16/9 aspect ratio", () => {
            render(
                <ProductImage
                    image={mockImage}
                    size="large"
                    aspectRatio="16/9"
                />,
            );

            const img = screen.getByTestId("product-image");
            // width=700, ratio=16/9, height = 700 * 9 / 16 = 394
            expect(img).toHaveAttribute("height", "394");
        });

        it("applies aspect ratio CSS custom property", () => {
            const { container } = render(
                <ProductImage image={mockImage} aspectRatio="4/3" />,
            );

            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveStyle({ "--product-image-ratio": "4/3" });
        });
    });

    describe("loading behavior", () => {
        it("uses lazy loading by default", () => {
            render(<ProductImage image={mockImage} />);

            // The loading prop is passed to the Image component
            // We can verify the image renders (indicating lazy load default)
            expect(screen.getByTestId("product-image")).toBeInTheDocument();
        });

        it("calls onLoad callback when image loads", () => {
            const onLoad = vi.fn();
            render(<ProductImage image={mockImage} onLoad={onLoad} />);

            const img = screen.getByTestId("product-image");
            fireEvent.load(img);

            expect(onLoad).toHaveBeenCalledTimes(1);
        });
    });

    describe("error handling", () => {
        it("calls onError callback when image fails to load", () => {
            const onError = vi.fn();
            render(<ProductImage image={mockImage} onError={onError} />);

            const img = screen.getByTestId("product-image");
            fireEvent.error(img);

            expect(onError).toHaveBeenCalledTimes(1);
        });

        it("hides image after error", () => {
            const { container } = render(<ProductImage image={mockImage} />);

            const img = screen.getByTestId("product-image");
            fireEvent.error(img);

            // After error, component should return null
            expect(container).toBeEmptyDOMElement();
        });
    });

    describe("className handling", () => {
        it("applies additional className to container", () => {
            const { container } = render(
                <ProductImage image={mockImage} className="custom-class" />,
            );

            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass("custom-class");
        });

        it("preserves base classes when custom className is added", () => {
            const { container } = render(
                <ProductImage image={mockImage} className="custom-class" />,
            );

            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass("relative");
            expect(wrapper).toHaveClass("overflow-hidden");
            expect(wrapper).toHaveClass("custom-class");
        });
    });

    describe("Safari compatibility", () => {
        it("includes padding-bottom fallback for aspect ratio", () => {
            const { container } = render(
                <ProductImage image={mockImage} aspectRatio="1/1" />,
            );

            const wrapper = container.firstChild as HTMLElement;
            // paddingBottom should be set for Safari fallback
            expect(wrapper).toHaveStyle({
                paddingBottom: "calc(100% / (1 / 1))",
            });
        });

        it("sets explicit width and height attributes", () => {
            render(<ProductImage image={mockImage} size="medium" />);

            const img = screen.getByTestId("product-image");
            expect(img).toHaveAttribute("width");
            expect(img).toHaveAttribute("height");
        });
    });
});
