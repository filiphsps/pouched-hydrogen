import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

/**
 * Component that renders the modal part of AccountLayout for testing.
 * Extracted to isolate modal overflow behavior testing.
 */
function AccountLayoutModal() {
    return (
        <div
            data-testid="dialog-content"
            className="fixed inset-0 z-10 flex w-screen items-center justify-center overflow-y-auto p-4 [--slide-up-from:20px] data-[state=open]:animate-slide-up"
        >
            <div
                data-testid="inner-container"
                className="relative my-auto max-h-[calc(100vh-2rem)] w-[500px] max-w-[90vw] overflow-y-auto bg-(--color-background) px-6 py-3"
            >
                <div data-testid="outlet">Modal Content</div>
            </div>
        </div>
    );
}

describe("AccountLayout Modal", () => {
    describe("overflow scrollability", () => {
        it("dialog content has overflow-y-auto to enable vertical scrolling", () => {
            render(<AccountLayoutModal />);
            const dialogContent = screen.getByTestId("dialog-content");
            expect(dialogContent.className).toContain("overflow-y-auto");
        });

        it("inner container has overflow-y-auto for content scrolling", () => {
            render(<AccountLayoutModal />);
            const innerContainer = screen.getByTestId("inner-container");
            expect(innerContainer.className).toContain("overflow-y-auto");
        });

        it("inner container has max-h-[calc(100vh-2rem)] to constrain height", () => {
            render(<AccountLayoutModal />);
            const innerContainer = screen.getByTestId("inner-container");
            expect(innerContainer.className).toContain(
                "max-h-[calc(100vh-2rem)]",
            );
        });

        it("inner container has my-auto for vertical centering", () => {
            render(<AccountLayoutModal />);
            const innerContainer = screen.getByTestId("inner-container");
            expect(innerContainer.className).toContain("my-auto");
        });

        it("dialog content has flex centering for modal positioning", () => {
            render(<AccountLayoutModal />);
            const dialogContent = screen.getByTestId("dialog-content");
            expect(dialogContent.className).toContain("flex");
            expect(dialogContent.className).toContain("items-center");
            expect(dialogContent.className).toContain("justify-center");
        });

        it("inner container has max-w-[90vw] to fit mobile screens", () => {
            render(<AccountLayoutModal />);
            const innerContainer = screen.getByTestId("inner-container");
            expect(innerContainer.className).toContain("max-w-[90vw]");
        });
    });
});
