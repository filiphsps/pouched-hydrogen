/**
 * Tests for PredictiveSearchButton and PredictiveSearchResults components.
 * Tests search dialog, form behavior, results display, and keyboard navigation.
 */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock phosphor icons
vi.mock("@phosphor-icons/react", () => ({
    ArrowRightIcon: ({ className }: { className?: string }) => (
        <span data-testid="arrow-icon" className={className}>
            →
        </span>
    ),
    MagnifyingGlassIcon: ({ className }: { className?: string }) => (
        <span data-testid="search-icon" className={className}>
            Search
        </span>
    ),
    XIcon: ({ className }: { className?: string }) => (
        <span data-testid="x-icon" className={className}>
            X
        </span>
    ),
}));

// Mock Radix Dialog
vi.mock("@radix-ui/react-dialog", () => ({
    Root: ({
        children,
        open,
        onOpenChange,
    }: {
        children: React.ReactNode;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }) => (
        <div data-testid="dialog-root" data-open={open}>
            {children}
        </div>
    ),
    Trigger: ({
        children,
        asChild,
        className,
    }: {
        children: React.ReactNode;
        asChild?: boolean;
        className?: string;
    }) => (
        <div data-testid="dialog-trigger" className={className}>
            {children}
        </div>
    ),
    Portal: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dialog-portal">{children}</div>
    ),
    Overlay: ({ className }: { className?: string }) => (
        <div data-testid="dialog-overlay" className={className} />
    ),
    Content: ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) => (
        <div data-testid="dialog-content" className={className}>
            {children}
        </div>
    ),
    Title: ({ children }: { children: React.ReactNode }) => (
        <span data-testid="dialog-title">{children}</span>
    ),
}));

// Mock Radix VisuallyHidden
vi.mock("@radix-ui/react-visually-hidden", () => ({
    Root: ({
        children,
        asChild,
    }: {
        children: React.ReactNode;
        asChild?: boolean;
    }) => <span data-testid="visually-hidden">{children}</span>,
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "search.title": "Search",
                "search.placeholder": "Search products...",
                "search.viewAllResults": "View all results",
                "search.noResults": "No results found for",
            };
            return translations[key] || key;
        },
    }),
}));

// Mock react-router
vi.mock("react-router", () => ({
    useLocation: () => ({ pathname: "/" }),
    useParams: () => ({}),
}));

// Mock hooks
const mockAddSearch = vi.fn();
vi.mock("~/hooks/use-recent-searches", () => ({
    useRecentSearches: () => ({
        addSearch: mockAddSearch,
        recentSearches: [],
        removeSearch: vi.fn(),
        clearSearches: vi.fn(),
    }),
}));

let mockSearchResults: any[] = [];
let mockTotalResults = 0;
let mockSearchTerm = { current: "" };

vi.mock("~/hooks/use-predictive-search", () => ({
    usePredictiveSearch: () => ({
        results: mockSearchResults,
        totalResults: mockTotalResults,
        searchTerm: mockSearchTerm,
    }),
}));

// Mock components
vi.mock("~/components/icon-button", () => ({
    IconButton: ({
        children,
        onClick,
        className,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        className?: string;
    }) => (
        <button
            type="button"
            data-testid="icon-button"
            onClick={onClick}
            className={className}
        >
            {children}
        </button>
    ),
}));

vi.mock("~/components/input", () => ({
    Input: ({
        name,
        type,
        placeholder,
        onChange,
        onFocus,
        onKeyDown,
        className,
    }: {
        name: string;
        type: string;
        placeholder: string;
        onChange?: (e: any) => void;
        onFocus?: (e: any) => void;
        onKeyDown?: (e: any) => void;
        className?: string;
    }) => (
        <input
            data-testid="search-input"
            name={name}
            type={type}
            placeholder={placeholder}
            onChange={onChange}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            className={className}
        />
    ),
}));

vi.mock("~/components/link", () => ({
    default: ({
        children,
        to,
        onClick,
        className,
    }: {
        children: React.ReactNode;
        to: string;
        onClick?: () => void;
        className?: string;
    }) => (
        <a href={to} onClick={onClick} className={className}>
            {children}
        </a>
    ),
}));

vi.mock("./popular-keywords", () => ({
    PopularKeywords: ({
        onKeywordClick,
    }: {
        onKeywordClick?: (k: string) => void;
    }) => (
        <div data-testid="popular-keywords">
            <button
                type="button"
                onClick={() => onKeywordClick?.("Mint")}
                data-testid="keyword-mint"
            >
                Mint
            </button>
        </div>
    ),
}));

vi.mock("./predictive-search-result", () => ({
    PredictiveSearchResult: ({
        type,
        items,
    }: {
        type: string;
        items?: any[];
    }) => (
        <div data-testid={`search-result-${type}`}>
            {items?.length || 0} {type}
        </div>
    ),
}));

vi.mock("./search-form", () => ({
    PredictiveSearchForm: ({
        children,
    }: {
        children: (props: {
            fetchResults: (q: string) => void;
            inputRef: any;
        }) => React.ReactNode;
    }) => {
        const inputRef = { current: null };
        const fetchResults = vi.fn();
        return (
            <div data-testid="search-form">
                {children({ fetchResults, inputRef })}
            </div>
        );
    },
}));

// Import after mocking
import { PredictiveSearchButton } from "./index";

describe("PredictiveSearchButton", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchResults = [];
        mockTotalResults = 0;
        mockSearchTerm = { current: "" };
    });

    describe("Trigger Button", () => {
        it("should render search icon trigger", () => {
            render(<PredictiveSearchButton />);

            // There are multiple search icons - one in trigger, one in input
            const searchIcons = screen.getAllByTestId("search-icon");
            expect(searchIcons.length).toBeGreaterThan(0);
        });

        it("should have hidden trigger on mobile (lg:flex)", () => {
            render(<PredictiveSearchButton />);

            const trigger = screen.getByTestId("dialog-trigger");
            expect(trigger).toHaveClass("lg:flex");
            expect(trigger).toHaveClass("hidden");
        });
    });

    describe("Dialog Content", () => {
        it("should render search form", () => {
            render(<PredictiveSearchButton />);

            expect(screen.getByTestId("search-form")).toBeInTheDocument();
        });

        it("should render search input with placeholder", () => {
            render(<PredictiveSearchButton />);

            const input = screen.getByTestId("search-input");
            expect(input).toHaveAttribute("placeholder", "Search products...");
        });

        it("should render popular keywords", () => {
            render(<PredictiveSearchButton />);

            expect(screen.getByTestId("popular-keywords")).toBeInTheDocument();
        });

        it("should render visually hidden title for accessibility", () => {
            render(<PredictiveSearchButton />);

            expect(screen.getByTestId("visually-hidden")).toBeInTheDocument();
            expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
            expect(screen.getByTestId("dialog-title")).toHaveTextContent(
                "Search",
            );
        });
    });

    describe("Search Input Behavior", () => {
        it("should render clear button", () => {
            render(<PredictiveSearchButton />);

            expect(screen.getByTestId("icon-button")).toBeInTheDocument();
            expect(screen.getByTestId("x-icon")).toBeInTheDocument();
        });

        it("should have search input with type search", () => {
            render(<PredictiveSearchButton />);

            const input = screen.getByTestId("search-input");
            expect(input).toHaveAttribute("type", "search");
        });

        it("should have search input with name q", () => {
            render(<PredictiveSearchButton />);

            const input = screen.getByTestId("search-input");
            expect(input).toHaveAttribute("name", "q");
        });
    });

    describe("Search Results", () => {
        it("should show no results message when search term exists but no results", () => {
            mockSearchTerm = { current: "nonexistent" };
            mockTotalResults = 0;

            render(<PredictiveSearchButton />);

            expect(
                screen.getByText(/No results found for/),
            ).toBeInTheDocument();
        });

        it("should show search results when results exist", () => {
            mockSearchResults = [
                { type: "products", items: [{ id: "1" }, { id: "2" }] },
                { type: "queries", items: [{ id: "q1" }] },
                { type: "articles", items: [] },
            ];
            mockTotalResults = 3;
            mockSearchTerm = { current: "test" };

            render(<PredictiveSearchButton />);

            expect(
                screen.getByTestId("search-result-products"),
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("search-result-queries"),
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("search-result-articles"),
            ).toBeInTheDocument();
        });

        it("should show View all results link when search term exists", () => {
            mockSearchResults = [{ type: "products", items: [{ id: "1" }] }];
            mockTotalResults = 1;
            mockSearchTerm = { current: "snus" };

            render(<PredictiveSearchButton />);

            const viewAllLink = screen.getByText("View all results");
            expect(viewAllLink).toBeInTheDocument();
            expect(viewAllLink.closest("a")).toHaveAttribute(
                "href",
                "/search?q=snus",
            );
        });
    });

    describe("Styling", () => {
        it("should have overlay with backdrop", () => {
            render(<PredictiveSearchButton />);

            const overlay = screen.getByTestId("dialog-overlay");
            expect(overlay).toHaveClass("bg-black/50");
        });

        it("should have content with header background", () => {
            render(<PredictiveSearchButton />);

            const content = screen.getByTestId("dialog-content");
            expect(content).toHaveClass("bg-(--color-header-bg)");
        });
    });
});
