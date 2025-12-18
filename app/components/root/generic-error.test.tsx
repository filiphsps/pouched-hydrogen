/**
 * Tests for GenericError component.
 * Tests error display, stack trace formatting, and home navigation.
 */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-i18next
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "error.generic.heading": "Something went wrong",
                "error.generic.description": "An unexpected error occurred.",
                "error.generic.homeButton": "Go to Home",
            };
            return translations[key] || key;
        },
    }),
}));

// Mock components
vi.mock("~/components/link", () => ({
    Link: ({
        children,
        to,
        variant,
        className,
    }: {
        children: React.ReactNode;
        to: string;
        variant?: string;
        className?: string;
    }) => (
        <a href={to} data-variant={variant} className={className}>
            {children}
        </a>
    ),
}));

vi.mock("~/components/section", () => ({
    Section: ({
        children,
        width,
        verticalPadding,
        containerClassName,
    }: {
        children: React.ReactNode;
        width?: string;
        verticalPadding?: string;
        containerClassName?: string;
    }) => (
        <section
            data-width={width}
            data-vertical-padding={verticalPadding}
            className={containerClassName}
            data-testid="error-section"
        >
            {children}
        </section>
    ),
}));

vi.mock("~/components/title", () => ({
    Title: ({
        children,
        size,
        className,
    }: {
        children: React.ReactNode;
        as?: string;
        size?: string;
        className?: string;
    }) => (
        <h1 data-size={size} className={className}>
            {children}
        </h1>
    ),
}));

// Import after mocking
import { GenericError } from "./generic-error";

describe("GenericError", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Suppress console.error output during tests
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    describe("Rendering", () => {
        it("should render the error section", () => {
            render(<GenericError />);

            expect(screen.getByTestId("error-section")).toBeInTheDocument();
        });

        it("should render error heading", () => {
            render(<GenericError />);

            expect(
                screen.getByText("Something went wrong"),
            ).toBeInTheDocument();
        });

        it("should render error description", () => {
            render(<GenericError />);

            expect(
                screen.getByText(/An unexpected error occurred/),
            ).toBeInTheDocument();
        });

        it("should render home button link", () => {
            render(<GenericError />);

            const link = screen.getByText("Go to Home");
            expect(link).toBeInTheDocument();
            expect(link.closest("a")).toHaveAttribute("href", "/");
        });

        it("should have outline variant on home button", () => {
            render(<GenericError />);

            const link = screen.getByText("Go to Home").closest("a");
            expect(link).toHaveAttribute("data-variant", "outline");
        });
    });

    describe("Error Message Display", () => {
        it("should append error message to description", () => {
            const error = { message: "Custom error message" };
            render(<GenericError error={error} />);

            expect(
                screen.getByText(/Custom error message/),
            ).toBeInTheDocument();
        });

        it("should log error to console", () => {
            const error = { message: "Test error" };
            render(<GenericError error={error} />);

            expect(console.error).toHaveBeenCalledWith(error);
        });

        it("should not log to console when no error provided", () => {
            render(<GenericError />);

            expect(console.error).not.toHaveBeenCalled();
        });
    });

    describe("Stack Trace Display", () => {
        it("should render stack trace when provided", () => {
            const error = {
                message: "Test error",
                stack: "Error: Test error\n    at testFunction (/path/to/file.ts:10:5)",
            };
            render(<GenericError error={error} />);

            const stackTrace = document.querySelector("pre");
            expect(stackTrace).toBeInTheDocument();
        });

        it("should not render stack trace when not provided", () => {
            const error = { message: "Test error" };
            render(<GenericError error={error} />);

            const stackTrace = document.querySelector("pre");
            expect(stackTrace).not.toBeInTheDocument();
        });

        it("should style stack trace with red color", () => {
            const error = {
                message: "Test error",
                stack: "Error: Test error",
            };
            render(<GenericError error={error} />);

            const stackTrace = document.querySelector("pre");
            expect(stackTrace).toHaveStyle({ color: "rgb(255, 0, 0)" });
        });

        it("should add VS Code links to stack trace file paths", () => {
            const error = {
                message: "Test error",
                stack: "Error: Test error\n    at testFunction (/path/to/file.ts:10:5)\n",
            };
            render(<GenericError error={error} />);

            const stackTrace = document.querySelector("pre");
            expect(stackTrace?.innerHTML).toContain(
                "vscode://file/path/to/file.ts:10:5",
            );
        });
    });

    describe("Layout", () => {
        it("should use fixed width section", () => {
            render(<GenericError />);

            const section = screen.getByTestId("error-section");
            expect(section).toHaveAttribute("data-width", "fixed");
        });

        it("should use large vertical padding", () => {
            render(<GenericError />);

            const section = screen.getByTestId("error-section");
            expect(section).toHaveAttribute("data-vertical-padding", "large");
        });

        it("should center content with flexbox", () => {
            render(<GenericError />);

            const section = screen.getByTestId("error-section");
            expect(section).toHaveClass("flex");
            expect(section).toHaveClass("justify-center");
            expect(section).toHaveClass("items-center");
        });
    });

    describe("Edge Cases", () => {
        it("should handle undefined error gracefully", () => {
            expect(() =>
                render(<GenericError error={undefined} />),
            ).not.toThrow();
        });

        it("should handle error with empty message", () => {
            const error = { message: "" };
            render(<GenericError error={error} />);

            expect(
                screen.getByText(/An unexpected error occurred/),
            ).toBeInTheDocument();
        });

        it("should handle error with empty stack", () => {
            const error = { message: "Test", stack: "" };
            render(<GenericError error={error} />);

            const stackTrace = document.querySelector("pre");
            expect(stackTrace).not.toBeInTheDocument();
        });
    });
});
