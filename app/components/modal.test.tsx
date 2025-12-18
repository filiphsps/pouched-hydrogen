import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModalContainer } from "./modal";

// Mock dependencies - capture className props for testing
vi.mock("@radix-ui/react-dialog", () => ({
    Root: ({ children, open }: any) => (open ? children : null),
    Portal: ({ children }: any) => <div data-testid="portal">{children}</div>,
    Overlay: ({ className }: any) => (
        <div data-testid="overlay" className={className} />
    ),
    Content: ({ children, className }: any) => (
        <div data-testid="dialog-content" className={className}>
            {children}
        </div>
    ),
    Close: ({ children }: any) => <>{children}</>,
    Title: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@radix-ui/react-visually-hidden", () => ({
    Root: ({ children }: any) => <>{children}</>,
}));

vi.mock("./button", () => ({
    Button: (props: any) => <button {...props} />,
}));

describe("ModalContainer", () => {
    it("renders children when open", () => {
        render(
            <ModalContainer open={true} onOpenChange={vi.fn()} title="Test">
                <div>Content</div>
            </ModalContainer>,
        );
        expect(screen.getByText("Content")).toBeInTheDocument();
        expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("does not render when closed", () => {
        render(
            <ModalContainer open={false} onOpenChange={vi.fn()} title="Test">
                <div>Content</div>
            </ModalContainer>,
        );
        expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    describe("overflow scrollability", () => {
        it("has overflow-x-hidden on dialog content to prevent horizontal scroll", () => {
            render(
                <ModalContainer open={true} onOpenChange={vi.fn()} title="Test">
                    <div>Content</div>
                </ModalContainer>,
            );
            const dialogContent = screen.getByTestId("dialog-content");
            expect(dialogContent.className).toContain("overflow-x-hidden");
        });

        it("inner container has overflow-hidden for proper content containment", () => {
            render(
                <ModalContainer open={true} onOpenChange={vi.fn()} title="Test">
                    <div data-testid="test-content">Content</div>
                </ModalContainer>,
            );
            const content = screen.getByTestId("test-content");
            const innerContainer = content.parentElement;
            expect(innerContainer?.className).toContain("overflow-hidden");
        });

        it("respects custom maxHeight prop for scroll containment", () => {
            render(
                <ModalContainer
                    open={true}
                    onOpenChange={vi.fn()}
                    title="Test"
                    maxHeight="80vh"
                >
                    <div data-testid="test-content">Content</div>
                </ModalContainer>,
            );
            const content = screen.getByTestId("test-content");
            const innerContainer = content.parentElement;
            expect(innerContainer?.style.maxHeight).toBe("80vh");
        });

        it("uses default maxHeight of 90vh when not specified", () => {
            render(
                <ModalContainer open={true} onOpenChange={vi.fn()} title="Test">
                    <div data-testid="test-content">Content</div>
                </ModalContainer>,
            );
            const content = screen.getByTestId("test-content");
            const innerContainer = content.parentElement;
            expect(innerContainer?.style.maxHeight).toBe("90vh");
        });
    });
});
