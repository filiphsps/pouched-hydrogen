import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CardImage } from "./card-image";

// Mock dependencies
vi.mock("~/components/image", () => ({
    Image: ({ data, className }: any) => (
        // biome-ignore lint/performance/noImgElement: test helper
        <img
            src={data?.url}
            alt={data?.altText}
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
});
