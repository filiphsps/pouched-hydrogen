import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CardImage } from "./card-image";

// Mock dependencies
vi.mock("~/components/image", () => ({
    Image: ({ data, className, alt }: any) => (
        // biome-ignore lint/performance/noImgElement: test helper
        <img
            src={data?.url}
            alt={alt || data?.altText}
            className={className}
            width={100}
            height={100}
        />
    ),
}));

describe("CardImage", () => {
    const mockImage: any = {
        url: "primary.jpg",
        altText: "Primary",
        width: 100,
        height: 100,
    };

    const mockSecondaryImage: any = {
        url: "secondary.jpg",
        altText: "Secondary",
        width: 100,
        height: 100,
    };

    it("renders primary image", () => {
        render(<CardImage image={mockImage} />);
        expect(screen.getByRole("img", { name: "Primary" })).toHaveAttribute(
            "src",
            "primary.jpg",
        );
    });

    it("applies zoom effect by default", () => {
        render(<CardImage image={mockImage} />);
        const img = screen.getByRole("img", { name: "Primary" });
        expect(img).toHaveClass("group-hover:scale-105");
    });

    it("does not apply zoom effect when disabled", () => {
        render(<CardImage image={mockImage} hoverEffect="none" />);
        const img = screen.getByRole("img", { name: "Primary" });
        expect(img).not.toHaveClass("group-hover:scale-105");
    });

    it("renders loading spinner when isLoading is true", () => {
        const { container } = render(
            <CardImage image={mockImage} isLoading={true} />,
        );
        // Check for the spinner element by its class
        expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("renders secondary image when provided", () => {
        render(
            <CardImage
                image={mockImage}
                secondaryImage={mockSecondaryImage}
                hoverEffect="fade"
            />,
        );
        expect(screen.getAllByRole("img")).toHaveLength(2);
        expect(
            screen.getByRole("img", { name: "Primary - alternate view" }),
        ).toBeInTheDocument();
    });

    it("applies fade effect classes when hoverEffect is fade", () => {
        render(
            <CardImage
                image={mockImage}
                secondaryImage={mockSecondaryImage}
                hoverEffect="fade"
            />,
        );
        const primaryImg = screen.getByRole("img", { name: "Primary" });
        expect(primaryImg).toHaveClass("group-hover:opacity-0");
    });

    it("applies slide effect classes when hoverEffect is slide", () => {
        render(
            <CardImage
                image={mockImage}
                secondaryImage={mockSecondaryImage}
                hoverEffect="slide"
            />,
        );
        const primaryImg = screen.getByRole("img", { name: "Primary" });
        expect(primaryImg).toHaveClass("group-hover:-translate-x-full");
    });

    it("returns null when no image provided", () => {
        const { container } = render(<CardImage image={null} />);
        expect(container.firstChild).toBeNull();
    });
});
