/**
 * Tests for PopularKeywords component.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        _getStore: () => store,
    };
})();

Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
});

// Mock useThemeSettings to control popularSearchKeywords
const mockThemeSettings = {
    popularSearchKeywords: "Snus, Nicotine Pouches, Mint",
};

vi.mock("@weaverse/hydrogen", () => ({
    useThemeSettings: () => mockThemeSettings,
}));

// Import after mocking
import { PopularKeywords } from "./popular-keywords";

describe("PopularKeywords", () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
        // Reset mock theme settings
        mockThemeSettings.popularSearchKeywords =
            "Snus, Nicotine Pouches, Mint";
    });

    describe("rendering", () => {
        it("should render popular keywords from theme settings", () => {
            const onKeywordClick = vi.fn();
            render(<PopularKeywords onKeywordClick={onKeywordClick} />);

            expect(
                screen.getByText("search.popularSearches"),
            ).toBeInTheDocument();
            expect(screen.getByText("Snus")).toBeInTheDocument();
            expect(screen.getByText("Nicotine Pouches")).toBeInTheDocument();
            expect(screen.getByText("Mint")).toBeInTheDocument();
        });

        it("should render recent searches when available", () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["pouches", "velo"]),
            );

            const onKeywordClick = vi.fn();
            render(<PopularKeywords onKeywordClick={onKeywordClick} />);

            expect(
                screen.getByText("search.recentSearches"),
            ).toBeInTheDocument();
            expect(screen.getByText("pouches")).toBeInTheDocument();
            expect(screen.getByText("velo")).toBeInTheDocument();
        });

        it("should render both recent and popular searches", () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["recent term"]),
            );

            const onKeywordClick = vi.fn();
            render(<PopularKeywords onKeywordClick={onKeywordClick} />);

            // Both sections should be visible
            expect(
                screen.getByText("search.recentSearches"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("search.popularSearches"),
            ).toBeInTheDocument();
            expect(screen.getByText("recent term")).toBeInTheDocument();
            expect(screen.getByText("Snus")).toBeInTheDocument();
        });

        it("should not render anything if no popular keywords and no recent searches", () => {
            mockThemeSettings.popularSearchKeywords = "";

            const onKeywordClick = vi.fn();
            const { container } = render(
                <PopularKeywords onKeywordClick={onKeywordClick} />,
            );

            expect(container.firstChild).toBeNull();
        });

        it("should hide recent searches when showRecentSearches is false", () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["recent term"]),
            );

            const onKeywordClick = vi.fn();
            render(
                <PopularKeywords
                    onKeywordClick={onKeywordClick}
                    showRecentSearches={false}
                />,
            );

            expect(
                screen.queryByText("search.recentSearches"),
            ).not.toBeInTheDocument();
            expect(screen.queryByText("recent term")).not.toBeInTheDocument();
            // Popular should still be visible
            expect(
                screen.getByText("search.popularSearches"),
            ).toBeInTheDocument();
        });

        it("should limit recent searches to maxRecentSearches", () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["one", "two", "three", "four", "five"]),
            );

            const onKeywordClick = vi.fn();
            render(
                <PopularKeywords
                    onKeywordClick={onKeywordClick}
                    maxRecentSearches={3}
                />,
            );

            expect(screen.getByText("one")).toBeInTheDocument();
            expect(screen.getByText("two")).toBeInTheDocument();
            expect(screen.getByText("three")).toBeInTheDocument();
            expect(screen.queryByText("four")).not.toBeInTheDocument();
            expect(screen.queryByText("five")).not.toBeInTheDocument();
        });
    });

    describe("interactions", () => {
        it("should call onKeywordClick when popular keyword is clicked", () => {
            const onKeywordClick = vi.fn();
            render(<PopularKeywords onKeywordClick={onKeywordClick} />);

            fireEvent.click(screen.getByText("Snus"));

            expect(onKeywordClick).toHaveBeenCalledWith("Snus");
        });

        it("should call onKeywordClick when recent search is clicked", () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["my search"]),
            );

            const onKeywordClick = vi.fn();
            render(<PopularKeywords onKeywordClick={onKeywordClick} />);

            fireEvent.click(screen.getByText("my search"));

            expect(onKeywordClick).toHaveBeenCalledWith("my search");
        });

        it("should remove recent search when remove button is clicked", () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["remove me", "keep me"]),
            );

            const onKeywordClick = vi.fn();
            render(<PopularKeywords onKeywordClick={onKeywordClick} />);

            // Find the remove button for "remove me" - it should have the aria-label
            const removeButtons = screen.getAllByRole("button", {
                name: /search\.removeSearch/i,
            });

            // Click the first remove button (for "remove me")
            fireEvent.click(removeButtons[0]);

            // Should have updated localStorage
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "recent-searches",
                JSON.stringify(["keep me"]),
            );
        });

        it("should clear all recent searches when clear button is clicked", () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["one", "two", "three"]),
            );

            const onKeywordClick = vi.fn();
            render(<PopularKeywords onKeywordClick={onKeywordClick} />);

            // Find and click the "Clear" button
            const clearButton = screen.getByText("search.clearRecent");
            fireEvent.click(clearButton);

            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                "recent-searches",
            );
        });

        it("should not call onKeywordClick when remove button is clicked", () => {
            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["test search"]),
            );

            const onKeywordClick = vi.fn();
            render(<PopularKeywords onKeywordClick={onKeywordClick} />);

            const removeButton = screen.getByRole("button", {
                name: /search\.removeSearch/i,
            });
            fireEvent.click(removeButton);

            // onKeywordClick should NOT have been called
            expect(onKeywordClick).not.toHaveBeenCalled();
        });
    });

    describe("edge cases", () => {
        it("should handle empty popularSearchKeywords string", () => {
            mockThemeSettings.popularSearchKeywords = "";

            localStorageMock.setItem(
                "recent-searches",
                JSON.stringify(["recent"]),
            );

            const onKeywordClick = vi.fn();
            render(<PopularKeywords onKeywordClick={onKeywordClick} />);

            // Should still show recent searches
            expect(
                screen.getByText("search.recentSearches"),
            ).toBeInTheDocument();
            expect(screen.getByText("recent")).toBeInTheDocument();
            // Should not show popular searches section
            expect(
                screen.queryByText("search.popularSearches"),
            ).not.toBeInTheDocument();
        });

        it("should trim whitespace from popular keywords", () => {
            mockThemeSettings.popularSearchKeywords = "  Snus  ,  Mint  ";

            const onKeywordClick = vi.fn();
            render(<PopularKeywords onKeywordClick={onKeywordClick} />);

            expect(screen.getByText("Snus")).toBeInTheDocument();
            expect(screen.getByText("Mint")).toBeInTheDocument();
        });

        it("should filter out empty popular keywords", () => {
            mockThemeSettings.popularSearchKeywords = "Snus,,Mint,,,Strong";

            const onKeywordClick = vi.fn();
            render(<PopularKeywords onKeywordClick={onKeywordClick} />);

            // Should have 3 keyword buttons (Snus, Mint, Strong)
            const buttons = screen.getAllByRole("button");
            // Filter to only keyword buttons in the popular section
            const keywordButtons = buttons.filter(
                (btn) =>
                    btn.textContent === "Snus" ||
                    btn.textContent === "Mint" ||
                    btn.textContent === "Strong",
            );
            expect(keywordButtons).toHaveLength(3);
        });

        it("should handle undefined popularSearchKeywords", () => {
            mockThemeSettings.popularSearchKeywords = undefined;

            const onKeywordClick = vi.fn();
            const { container } = render(
                <PopularKeywords onKeywordClick={onKeywordClick} />,
            );

            // Should render nothing since no recent searches either
            expect(container.firstChild).toBeNull();
        });
    });
});
