import { CaretRightIcon } from "@phosphor-icons/react";
import * as Accordion from "@radix-ui/react-accordion";
import type { Filter } from "@shopify/hydrogen/storefront-api-types";
import { useRef } from "react";
import { OPTIONS_AS_SWATCH } from "~/components/product/product-option-values";
import { ScrollArea } from "~/components/scroll-area";
import type { AppliedFilter } from "~/types/others";
import { cn } from "~/utils/cn";
import { FilterItem } from "./filter-item";
import { PriceRangeFilter } from "./price-range-filter";

export interface FiltersProps {
    className?: string;
    filters: Filter[];
    appliedFilters: AppliedFilter[];
    expandFilters: boolean;
    showFiltersCount: boolean;
    enableSwatches: boolean;
    displayAsButtonFor: string;
    collectionId?: string;
    minVariantPrice?: number;
    maxVariantPrice?: number;
}

export function Filters({
    className,
    filters,
    appliedFilters,
    expandFilters,
    showFiltersCount,
    enableSwatches,
    displayAsButtonFor,
    collectionId,
    minVariantPrice = 0,
    maxVariantPrice = 1000,
}: FiltersProps) {
    const ref = useRef<HTMLDivElement>(null);
    const appliedFiltersKeys = appliedFilters
        .map((filter) => filter.label)
        .join("-");

    return (
        <ScrollArea className="h-[calc(100vh-var(--height-nav)-100px)]">
            <Accordion.Root
                type="multiple"
                className={cn("divide-y divide-line-subtle pr-3", className)}
                key={
                    (collectionId ?? "") +
                    appliedFiltersKeys +
                    expandFilters +
                    showFiltersCount
                }
                defaultValue={
                    expandFilters ? filters.map((filter) => filter.id) : []
                }
            >
                {filters.map((filter: Filter) => {
                    const asSwatch =
                        enableSwatches &&
                        OPTIONS_AS_SWATCH.includes(filter.label);
                    const asButton = displayAsButtonFor.includes(filter.label);

                    return (
                        <Accordion.Item
                            key={filter.id}
                            ref={ref}
                            value={filter.id}
                            className="w-full pt-7 pb-6"
                        >
                            <Accordion.Trigger className="flex w-full items-center justify-between data-[state=open]:[&>svg]:rotate-90">
                                <span>{filter.label}</span>
                                <CaretRightIcon className="h-4 w-4 rotate-0 transition-transform" />
                            </Accordion.Trigger>
                            <Accordion.Content
                                className={cn([
                                    "overflow-hidden",
                                    "[--expand-to:var(--radix-accordion-content-height)]",
                                    "[--collapse-from:var(--radix-accordion-content-height)]",
                                    "data-[state=closed]:animate-collapse",
                                    "data-[state=open]:animate-expand",
                                ])}
                            >
                                <div
                                    className={cn(
                                        "flex pt-8",
                                        asSwatch || asButton
                                            ? "flex-wrap gap-1.5"
                                            : "flex-col gap-5",
                                    )}
                                >
                                    {filter.type === "PRICE_RANGE" ? (
                                        <PriceRangeFilter
                                            minVariantPrice={minVariantPrice}
                                            maxVariantPrice={maxVariantPrice}
                                        />
                                    ) : (
                                        filter.values?.map((option) => (
                                            <FilterItem
                                                key={option.id}
                                                displayAs={
                                                    asSwatch
                                                        ? "swatch"
                                                        : asButton
                                                          ? "button"
                                                          : "list-item"
                                                }
                                                appliedFilters={
                                                    appliedFilters as AppliedFilter[]
                                                }
                                                option={option}
                                                showFiltersCount={
                                                    showFiltersCount
                                                }
                                            />
                                        ))
                                    )}
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    );
                })}
            </Accordion.Root>
        </ScrollArea>
    );
}
