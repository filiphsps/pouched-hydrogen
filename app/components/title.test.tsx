import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Title } from "./title";

describe("Title component", () => {
    it("renders children correctly", () => {
        render(<Title>Hello World</Title>);
        expect(
            screen.getByRole("heading", { name: /hello world/i }),
        ).toBeInTheDocument();
    });

    it("renders with default tag (h2)", () => {
        const { container } = render(<Title>Heading 2</Title>);
        expect(container.querySelector("h2")).toBeInTheDocument();
    });

    it("renders with custom tag (as prop)", () => {
        const { container } = render(<Title as="h1">Heading 1</Title>);
        expect(container.querySelector("h1")).toBeInTheDocument();
    });

    it("applies variant classes", () => {
        const { container } = render(<Title variant="primary">Title</Title>);
        expect(container.firstChild).toHaveClass("text-primary");
    });

    it("applies size classes", () => {
        const { container } = render(<Title size="xl">Title</Title>);
        expect(container.firstChild).toHaveClass("text-xl");
    });

    it("merges custom className", () => {
        const { container } = render(
            <Title className="custom-class">Title</Title>,
        );
        expect(container.firstChild).toHaveClass("custom-class");
    });

    it("forwards ref", () => {
        const ref = createRef<HTMLHeadingElement>();
        render(<Title ref={ref}>Title</Title>);
        expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });
});
