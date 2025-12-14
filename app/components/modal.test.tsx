import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModalContainer } from "./modal";

// Mock dependencies
vi.mock("@radix-ui/react-dialog", () => ({
    Root: ({ children, open }: any) => (open ? children : null),
    Portal: ({ children }: any) => <div data-testid="portal">{children}</div>,
    Overlay: () => <div data-testid="overlay" />,
    Content: ({ children, className }: any) => (
        <div data-testid="content" className={className}>
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
});
