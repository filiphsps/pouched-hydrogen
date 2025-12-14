import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { WishlistButton } from "./wishlist-button";
import { useWishlistStore } from "./wishlist-store";

describe("WishlistButton", () => {
    beforeEach(() => {
        useWishlistStore.setState({ items: [] });
    });

    it("renders correctly", () => {
        render(<WishlistButton productId="123" />);
        expect(
            screen.getByRole("button", { name: /Add to wishlist/i }),
        ).toBeInTheDocument();
    });

    it("toggles wishlist state on click", () => {
        render(<WishlistButton productId="123" />);
        const button = screen.getByRole("button");

        // Click to add
        fireEvent.click(button);
        expect(useWishlistStore.getState().items).toContain("123");
        expect(
            screen.getByRole("button", { name: /Remove from wishlist/i }),
        ).toBeInTheDocument();

        // Click to remove
        fireEvent.click(button);
        expect(useWishlistStore.getState().items).not.toContain("123");
        expect(
            screen.getByRole("button", { name: /Add to wishlist/i }),
        ).toBeInTheDocument();
    });

    it("initializes from store state", () => {
        useWishlistStore.setState({ items: ["123"] });
        render(<WishlistButton productId="123" />);
        expect(
            screen.getByRole("button", { name: /Remove from wishlist/i }),
        ).toBeInTheDocument();
    });
});
