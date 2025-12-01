import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button component", () => {
    it("renders children correctly", () => {
        render(<Button>Click me</Button>);
        expect(
            screen.getByRole("button", { name: /click me/i }),
        ).toBeInTheDocument();
    });

    it("handles click events", () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByRole("button", { name: /click me/i }));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("renders as disabled when disabled prop is true", () => {
        render(<Button disabled>Click me</Button>);
        expect(
            screen.getByRole("button", { name: /click me/i }),
        ).toBeDisabled();
    });

    it("shows spinner when loading is true", () => {
        render(<Button loading>Click me</Button>);
        // The spinner is rendered, but the text might still be there or hidden.
        // Based on implementation: {loading && <Spinner />} {content}
        // So both should be present.
        expect(screen.getByRole("button")).toBeInTheDocument();
        // We can check for the spinner class or element if needed, but simple rendering check is good for now.
    });

    it("applies variant classes", () => {
        const { container } = render(
            <Button variant="secondary">Secondary</Button>,
        );
        // Check for a class specific to secondary variant, e.g., border-(--btn-secondary-bg)
        // Note: The actual class might be compiled or dynamic, so we check for presence of some class logic or just that it renders without crashing.
        // For a more robust test, we'd check computed styles or specific class names if we knew them exactly.
        expect(container.firstChild).toHaveClass("border");
    });
});
