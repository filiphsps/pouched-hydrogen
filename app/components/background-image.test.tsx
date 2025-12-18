import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BackgroundImage } from "./background-image";

// Mock the Hydrogen Image component
vi.mock("@shopify/hydrogen", () => ({
    Image: vi.fn(
        ({ loading, fetchPriority, className, data, sizes, ...props }) => (
            // biome-ignore lint/correctness/useImageSize: test.
            // biome-ignore lint/performance/noImgElement: test.
            <img
                src={data?.url}
                alt={data?.altText || ""}
                loading={loading}
                fetchPriority={fetchPriority}
                className={className}
                data-sizes={sizes}
                {...props}
            />
        ),
    ),
}));

describe("BackgroundImage", () => {
    const mockImage = {
        id: "test",
        url: "https://example.com/image.jpg",
        previewSrc: "https://example.com/image.jpg",
        altText: "Test image",
        width: 800,
        height: 600,
    };

    describe("rendering", () => {
        it("should render nothing when no backgroundImage is provided", () => {
            const { container } = render(<BackgroundImage />);
            expect(container.firstChild).toBeNull();
        });

        it("should render image when backgroundImage is provided", () => {
            render(<BackgroundImage backgroundImage={mockImage} />);
            const img = screen.getByRole("img");
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute("src", mockImage.url);
        });

        it("should handle string backgroundImage", () => {
            render(
                <BackgroundImage backgroundImage="https://example.com/string-image.jpg" />,
            );
            const img = screen.getByRole("img");
            expect(img).toHaveAttribute(
                "src",
                "https://example.com/string-image.jpg",
            );
        });

        it("should set default altText for string images", () => {
            render(
                <BackgroundImage backgroundImage="https://example.com/image.jpg" />,
            );
            const img = screen.getByRole("img");
            expect(img).toHaveAttribute("alt", "Section background");
        });
    });

    describe("priority prop (LCP optimization)", () => {
        it("should set lazy loading by default", () => {
            render(<BackgroundImage backgroundImage={mockImage} />);
            const img = screen.getByRole("img");
            expect(img).toHaveAttribute("loading", "lazy");
        });

        it("should set eager loading when priority is true", () => {
            render(<BackgroundImage backgroundImage={mockImage} priority />);
            const img = screen.getByRole("img");
            expect(img).toHaveAttribute("loading", "eager");
        });

        it("should not set fetchPriority by default", () => {
            render(<BackgroundImage backgroundImage={mockImage} />);
            const img = screen.getByRole("img");
            expect(img).not.toHaveAttribute("fetchPriority");
        });

        it("should set fetchPriority to high when priority is true", () => {
            render(<BackgroundImage backgroundImage={mockImage} priority />);
            const img = screen.getByRole("img");
            expect(img).toHaveAttribute("fetchPriority", "high");
        });

        it("should explicitly set priority to false", () => {
            render(
                <BackgroundImage
                    backgroundImage={mockImage}
                    priority={false}
                />,
            );
            const img = screen.getByRole("img");
            expect(img).toHaveAttribute("loading", "lazy");
            expect(img).not.toHaveAttribute("fetchPriority");
        });
    });

    describe("backgroundFit variants", () => {
        it("should apply object-cover class by default", () => {
            render(<BackgroundImage backgroundImage={mockImage} />);
            const img = screen.getByRole("img");
            expect(img).toHaveClass("object-cover");
        });

        it("should apply object-fill class when backgroundFit is fill", () => {
            render(
                <BackgroundImage
                    backgroundImage={mockImage}
                    backgroundFit="fill"
                />,
            );
            const img = screen.getByRole("img");
            expect(img).toHaveClass("object-fill");
        });

        it("should apply object-contain class when backgroundFit is contain", () => {
            render(
                <BackgroundImage
                    backgroundImage={mockImage}
                    backgroundFit="contain"
                />,
            );
            const img = screen.getByRole("img");
            expect(img).toHaveClass("object-contain");
        });
    });

    describe("backgroundPosition variants", () => {
        it("should apply center center position by default", () => {
            render(<BackgroundImage backgroundImage={mockImage} />);
            const img = screen.getByRole("img");
            expect(img).toHaveClass("object-[center_center]");
        });

        it("should apply top left position when specified", () => {
            render(
                <BackgroundImage
                    backgroundImage={mockImage}
                    backgroundPosition="top left"
                />,
            );
            const img = screen.getByRole("img");
            expect(img).toHaveClass("object-[top_left]");
        });

        it("should apply bottom right position when specified", () => {
            render(
                <BackgroundImage
                    backgroundImage={mockImage}
                    backgroundPosition="bottom right"
                />,
            );
            const img = screen.getByRole("img");
            expect(img).toHaveClass("object-[bottom_right]");
        });
    });

    describe("sizes attribute", () => {
        it("should always use 100vw sizes for background images", () => {
            render(<BackgroundImage backgroundImage={mockImage} />);
            const img = screen.getByRole("img");
            expect(img).toHaveAttribute("data-sizes", "100vw");
        });
    });
});
