import * as Checkbox from "@radix-ui/react-checkbox";
import type { Filter } from "@shopify/hydrogen/storefront-api-types";
import {
    useLocation,
    useNavigate,
    useRouteLoaderData,
    useSearchParams,
} from "react-router";
import Link from "~/components/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import type { RootLoader } from "~/root";
import type { AppliedFilter } from "~/types/others";
import { cn } from "~/utils/cn";
import { getAppliedFilterLink, getFilterLink } from "./filter-utils";

type FilterDisplayAs = "swatch" | "button" | "list-item";

export function FilterItem({
    displayAs,
    option,
    appliedFilters,
    showFiltersCount,
}: {
    displayAs: FilterDisplayAs;
    option: Filter["values"][0];
    appliedFilters: AppliedFilter[];
    showFiltersCount: boolean;
}) {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const location = useLocation();
    const data = useRouteLoaderData<RootLoader>("root");
    const swatchesConfigs = data?.swatchesConfigs || { colors: [], images: [] };

    const filter = appliedFilters.find(
        (flt) => JSON.stringify(flt.filter) === option.input,
    );

    const checked = Boolean(filter);
    const link = filter
        ? getAppliedFilterLink(filter, params, location)
        : getFilterLink(option.input as string, params, location);

    if (displayAs === "swatch") {
        const { colors, images } = swatchesConfigs;
        const swatchImage = images.find(({ name }) => name === option.label);
        const swatchColor = colors.find(({ name }) => name === option.label);

        return (
            <Tooltip>
                <TooltipTrigger>
                    <Link
                        to={link}
                        className={cn(
                            "block h-10 w-10 disabled:cursor-not-allowed",
                            "border hover:border-body",
                            checked ? "border-line p-1" : "border-line-subtle",
                            option.count === 0 && "diagonal",
                        )}
                        preventScrollReset
                    >
                        <span
                            className="inline-block h-full w-full"
                            style={{
                                backgroundImage: swatchImage?.value
                                    ? `url(${swatchImage?.value})`
                                    : undefined,
                                backgroundSize: "cover",
                                backgroundColor:
                                    swatchColor?.value ||
                                    option.label.toLowerCase(),
                            }}
                        />
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                    <FilterLabel
                        option={option}
                        showFiltersCount={showFiltersCount}
                    />
                </TooltipContent>
            </Tooltip>
        );
    }

    if (displayAs === "button") {
        return (
            <Link
                to={link}
                className={cn(
                    "block border px-3 py-1.5 text-center disabled:cursor-not-allowed",
                    option.count === 0 && "diagonal text-body-subtle",
                    checked
                        ? "border-line bg-body text-background"
                        : "border-line-subtle hover:border-line",
                )}
                preventScrollReset
            >
                <FilterLabel
                    option={option}
                    showFiltersCount={showFiltersCount}
                />
            </Link>
        );
    }

    return (
        <Link
            to={link}
            className={cn(
                "flex items-center gap-2.5",
                option.count === 0 && "text-body-subtle",
            )}
            preventScrollReset
        >
            <Checkbox.Root
                checked={checked}
                disabled={option.count === 0}
                className={cn(
                    "h-5 w-5 shrink-0 border border-line focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
                )}
            >
                <Checkbox.Indicator className="flex items-center justify-center text-current">
                    <span className="inline-block h-3 w-3 bg-body" />
                </Checkbox.Indicator>
            </Checkbox.Root>
            <FilterLabel option={option} showFiltersCount={showFiltersCount} />
        </Link>
    );
}
function FilterLabel({
    option,
    showFiltersCount,
}: {
    option: Filter["values"][0];
    showFiltersCount: boolean;
}) {
    if (showFiltersCount) {
        return (
            <span>
                {option.label} <span>({option.count})</span>
            </span>
        );
    }
    return option.label;
}
