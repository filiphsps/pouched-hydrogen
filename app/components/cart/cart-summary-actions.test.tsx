/**
 * Tests for CartSummaryActions dialogs (NoteDialog, DiscountDialog, GiftCardDialog).
 * Tests success/error derivation from fetcher.data.
 */
import * as Dialog from "@radix-ui/react-dialog";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock fetcher
const submitMock = vi.fn();
let mockFetcherData: Record<string, unknown> | null = null;
let mockFetcherState: "idle" | "submitting" | "loading" = "idle";

vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useFetcher: () => ({
            state: mockFetcherState,
            submit: submitMock,
            data: mockFetcherData,
            formData: undefined,
        }),
    };
});

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@shopify/hydrogen", () => ({
    CartForm: {
        ACTIONS: {
            NoteUpdate: "NoteUpdate",
            DiscountCodesUpdate: "DiscountCodesUpdate",
            GiftCardCodesUpdate: "GiftCardCodesUpdate",
        },
        INPUT_NAME: "cartFormInput",
    },
}));

vi.mock("~/hooks/use-prefix-path-with-locale", () => ({
    usePrefixPathWithLocale: (path: string) => path,
}));

vi.mock("~/components/banner", () => ({
    Banner: ({
        children,
        variant,
    }: {
        children: React.ReactNode;
        variant: string;
    }) => <div data-testid={`banner-${variant}`}>{children}</div>,
}));

vi.mock("~/components/button", () => ({
    Button: ({
        children,
        ...props
    }: {
        children: React.ReactNode;
        [key: string]: unknown;
    }) => (
        <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
            {children}
        </button>
    ),
}));

vi.mock("~/components/icon-button", () => ({
    IconButton: ({
        children,
        ...props
    }: {
        children: React.ReactNode;
        [key: string]: unknown;
    }) => (
        <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
            {children}
        </button>
    ),
}));

vi.mock("~/components/input", () => ({
    Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input data-testid="dialog-input" {...props} />
    ),
}));

vi.mock("~/components/textarea", () => ({
    Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
        <textarea data-testid="dialog-textarea" {...props} />
    ),
}));

import {
    DiscountDialog,
    GiftCardDialog,
    NoteDialog,
} from "./cart-summary-actions";

/**
 * Wraps a dialog portal component in Dialog.Root with open=true
 * so Dialog.Portal can find its context.
 */
function DialogWrapper({ children }: { children: React.ReactNode }) {
    return <Dialog.Root open={true}>{children}</Dialog.Root>;
}

describe("NoteDialog", () => {
    beforeEach(() => {
        submitMock.mockClear();
        mockFetcherData = null;
        mockFetcherState = "idle";
    });

    it("renders textarea with current note", () => {
        render(
            <DialogWrapper>
                <NoteDialog cartNote="Test note" />
            </DialogWrapper>,
        );
        expect(screen.getByTestId("dialog-textarea")).toHaveValue("Test note");
    });

    it("shows success banner when no userErrors in response", () => {
        mockFetcherData = { userErrors: [] };
        render(
            <DialogWrapper>
                <NoteDialog cartNote="Test" />
            </DialogWrapper>,
        );
        expect(screen.getByTestId("banner-success")).toHaveTextContent(
            "cart.noteSaved",
        );
    });

    it("shows error banner when userErrors exist in response", () => {
        mockFetcherData = {
            userErrors: [{ message: "Note too long" }],
        };
        render(
            <DialogWrapper>
                <NoteDialog cartNote="Test" />
            </DialogWrapper>,
        );
        expect(screen.getByTestId("banner-error")).toHaveTextContent(
            "Note too long",
        );
    });
});

describe("DiscountDialog", () => {
    beforeEach(() => {
        submitMock.mockClear();
        mockFetcherData = null;
        mockFetcherState = "idle";
    });

    it("renders input for discount code", () => {
        render(
            <DialogWrapper>
                <DiscountDialog discountCodes={[]} />
            </DialogWrapper>,
        );
        expect(screen.getByTestId("dialog-input")).toBeInTheDocument();
    });

    it("does not show banner without entering a code", () => {
        mockFetcherData = {
            userErrors: [],
            cart: {
                discountCodes: [{ code: "SAVE10", applicable: true }],
            },
        };
        render(
            <DialogWrapper>
                <DiscountDialog discountCodes={[]} />
            </DialogWrapper>,
        );
        // Without entering a code, hasResponse is false (code === "")
        expect(screen.queryByTestId("banner-success")).not.toBeInTheDocument();
        expect(screen.queryByTestId("banner-error")).not.toBeInTheDocument();
    });
});

describe("GiftCardDialog", () => {
    beforeEach(() => {
        submitMock.mockClear();
        mockFetcherData = null;
        mockFetcherState = "idle";
    });

    it("renders input for gift card code", () => {
        render(
            <DialogWrapper>
                <GiftCardDialog appliedGiftCards={[]} />
            </DialogWrapper>,
        );
        expect(screen.getByTestId("dialog-input")).toBeInTheDocument();
    });

    it("does not show banner without entering a code", () => {
        mockFetcherData = {
            userErrors: [{ message: "Invalid gift card" }],
        };
        render(
            <DialogWrapper>
                <GiftCardDialog appliedGiftCards={[]} />
            </DialogWrapper>,
        );
        // Without code entry, hasResponse is false
        expect(screen.queryByTestId("banner-error")).not.toBeInTheDocument();
    });
});
