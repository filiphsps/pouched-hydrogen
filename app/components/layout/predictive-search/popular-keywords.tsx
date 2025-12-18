import { ClockIcon, TrendUp, XIcon } from "@phosphor-icons/react";
import { useThemeSettings } from "@weaverse/hydrogen";
import { useTranslation } from "react-i18next";
import { IconButton } from "~/components/icon-button";
import { useRecentSearches } from "~/hooks/use-recent-searches";
import { cn } from "~/utils/cn";

interface SearchSuggestionsProps {
    /** Callback when a keyword is clicked */
    onKeywordClick: (keyword: string) => void;
    /** Whether recent searches should be shown (defaults to true) */
    showRecentSearches?: boolean;
    /** Maximum number of recent searches to display (defaults to 5) */
    maxRecentSearches?: number;
}

/**
 * Displays popular search keywords and recent search history.
 * Popular keywords are configured via Weaverse theme settings.
 * Recent searches are persisted in localStorage.
 */
export function PopularKeywords({
    onKeywordClick,
    showRecentSearches = true,
    maxRecentSearches = 5,
}: SearchSuggestionsProps) {
    const { t } = useTranslation();
    const { popularSearchKeywords } = useThemeSettings<{
        popularSearchKeywords: string;
    }>();

    const { recentSearches, removeSearch, clearSearches, isLoading } =
        useRecentSearches();

    const popularKeywords: string[] = popularSearchKeywords
        ? popularSearchKeywords
              .split(",")
              .map((k) => k.trim())
              .filter((k) => k.length > 0)
        : [];

    const displayedRecentSearches = showRecentSearches
        ? recentSearches.slice(0, maxRecentSearches)
        : [];

    const hasPopularKeywords = popularKeywords.length > 0;
    const hasRecentSearches = displayedRecentSearches.length > 0;

    // Don't render anything if there's nothing to show
    if (!hasPopularKeywords && !hasRecentSearches) {
        return null;
    }

    return (
        <div className="space-y-3">
            {/* Recent Searches */}
            {hasRecentSearches && !isLoading && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-body-subtle text-sm">
                            <ClockIcon className="h-4 w-4" />
                            <span>{t("search.recentSearches")}</span>
                        </div>
                        <button
                            type="button"
                            onClick={clearSearches}
                            className="text-body-subtle text-xs underline-offset-4 transition-colors hover:text-body hover:underline focus-visible:outline-hidden"
                        >
                            {t("search.clearRecent")}
                        </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {displayedRecentSearches.map((keyword) => (
                            <RecentSearchPill
                                key={keyword}
                                keyword={keyword}
                                onClick={() => onKeywordClick(keyword)}
                                onRemove={() => removeSearch(keyword)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Popular Searches */}
            {hasPopularKeywords && (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-body-subtle text-sm">
                        <TrendUp className="h-4 w-4" />
                        <span>{t("search.popularSearches")}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {popularKeywords.map((keyword) => (
                            <button
                                key={keyword}
                                type="button"
                                onClick={() => onKeywordClick(keyword)}
                                className={cn(
                                    "rounded-full border border-line-subtle px-3 py-1",
                                    "text-body text-sm transition-colors",
                                    "hover:border-line hover:bg-background-subtle",
                                    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
                                )}
                            >
                                {keyword}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface RecentSearchPillProps {
    /** The search keyword */
    keyword: string;
    /** Callback when the pill is clicked */
    onClick: () => void;
    /** Callback when the remove button is clicked */
    onRemove: () => void;
}

/**
 * Individual recent search pill with remove button.
 */
function RecentSearchPill({
    keyword,
    onClick,
    onRemove,
}: RecentSearchPillProps) {
    const { t } = useTranslation();

    return (
        <div
            className={cn(
                "group flex items-center gap-1 rounded-full border border-line-subtle",
                "bg-background-subtle/50 pr-1 pl-3",
                "transition-colors hover:border-line hover:bg-background-subtle",
            )}
        >
            <button
                type="button"
                onClick={onClick}
                className="py-1 text-body text-sm focus-visible:outline-hidden"
            >
                {keyword}
            </button>
            <IconButton
                variant="ghost"
                size="xs"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                aria-label={t("search.removeSearch", { term: keyword })}
                className="h-5 w-5 opacity-60 transition-opacity hover:opacity-100"
            >
                <XIcon className="h-3 w-3" />
            </IconButton>
        </div>
    );
}

/**
 * Hook to add a search to recent searches history.
 * Re-exported for convenience.
 */
export { useRecentSearches } from "~/hooks/use-recent-searches";
