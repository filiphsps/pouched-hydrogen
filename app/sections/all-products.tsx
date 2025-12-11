import { createSchema } from "@weaverse/hydrogen";
import { useEffect, useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { BreadCrumb } from "~/components/breadcrumb";
import { Filters, type FiltersProps } from "~/components/filters/filters";
import { ProductsPagination } from "~/components/filters/products-pagination";
import { ToolsBar } from "~/components/filters/tools-bar";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { Title } from "~/components/title";
import type { loader } from "~/routes/products/list";

interface AllProductsProps extends SectionProps {
    ref: React.Ref<HTMLElement>;
    heading: string;
    showHeading: boolean;
    showBreadcrumb: boolean;
    prevPageText: string;
    nextPageText: string;
    productsPerRowDesktop: number;
    productsPerRowMobile: number;
    enableFilter: boolean;
    filtersPosition: "sidebar" | "drawer";
    expandFilters: boolean;
    showFiltersCount: boolean;
    enableSwatches: boolean;
    displayAsButtonFor: string;
    enableSort: boolean;
    showProductsCount: boolean;
    showToolbar: boolean;
}

export default function AllProducts(props: AllProductsProps) {
    const {
        ref,
        heading,
        prevPageText,
        nextPageText,
        productsPerRowDesktop,
        productsPerRowMobile,
        enableFilter,
        filtersPosition,
        expandFilters,
        showFiltersCount,
        enableSwatches,
        displayAsButtonFor,
        enableSort,
        showProductsCount,
        showHeading,
        showBreadcrumb,
        showToolbar,
        ...rest
    } = props;
    const { products, appliedFilters } = useLoaderData<typeof loader>();
    const [searchParams, setSearchParams] = useSearchParams();

    const [gridSizeDesktop, setGridSizeDesktop] = useState(
        Number(searchParams.get("columns")) ||
            Number(productsPerRowDesktop) ||
            4,
    );
    const [gridSizeMobile, setGridSizeMobile] = useState(
        Number(searchParams.get("columnsMobile")) ||
            Number(productsPerRowMobile) ||
            1,
    );

    useEffect(() => {
        const cols = searchParams.get("columns");
        const colsMobile = searchParams.get("columnsMobile");
        if (cols) setGridSizeDesktop(Number(cols));
        if (colsMobile) setGridSizeMobile(Number(colsMobile));
    }, [searchParams]);

    useEffect(() => {
        setGridSizeDesktop(Number(productsPerRowDesktop) || 4);
        setGridSizeMobile(Number(productsPerRowMobile) || 1);
    }, [productsPerRowDesktop, productsPerRowMobile]);

    const handleGridSizeChange = (v: number) => {
        const newParams = new URLSearchParams(searchParams);
        if (v > 2) {
            setGridSizeDesktop(v);
            newParams.set("columns", String(v));
        } else {
            setGridSizeMobile(v);
            newParams.set("columnsMobile", String(v));
        }
        setSearchParams(newParams, {
            preventScrollReset: true,
            replace: true,
        });
    };

    const filtersProps: FiltersProps = {
        filters: products.filters || [],
        appliedFilters: appliedFilters as any[],
        expandFilters,
        showFiltersCount,
        enableSwatches,
        displayAsButtonFor,
    };

    return (
        <Section ref={ref} {...rest} overflow="unset" className="h-auto">
            {props.showBreadcrumb && (
                <BreadCrumb page={heading} className="mb-4 justify-center" />
            )}
            {props.showHeading && (
                <Title
                    as="h4"
                    size="2xl"
                    className="mb-8 text-center font-medium lg:mb-20"
                >
                    {heading}
                </Title>
            )}
            {showToolbar && (
                <ToolsBar
                    gridSizeDesktop={gridSizeDesktop}
                    gridSizeMobile={gridSizeMobile}
                    onGridSizeChange={handleGridSizeChange}
                    enableSort={enableSort}
                    enableFilter={enableFilter}
                    filtersPosition={filtersPosition}
                    showProductsCount={showProductsCount}
                    expandFilters={expandFilters}
                    showFiltersCount={showFiltersCount}
                    productsCount={products.nodes.length}
                    filtersProps={filtersProps}
                />
            )}
            <div className="flex gap-8 pt-6 lg:pt-12">
                {enableFilter && filtersPosition === "sidebar" && (
                    <div className="hidden w-72 shrink-0 lg:block">
                        <div className="sticky top-[calc(var(--height-nav)+40px)] space-y-4">
                            <div className="font-bold">Filters</div>
                            <Filters {...filtersProps} />
                        </div>
                    </div>
                )}
                <ProductsPagination
                    gridSizeDesktop={gridSizeDesktop}
                    gridSizeMobile={gridSizeMobile}
                    loadPrevText={prevPageText}
                    loadMoreText={nextPageText}
                    products={products}
                    appliedFilters={appliedFilters as any[]}
                />
            </div>
        </Section>
    );
}

export const schema = createSchema({
    type: "all-products",
    title: "All products",
    limit: 1,
    enabledOn: {
        pages: ["ALL_PRODUCTS"],
    },
    settings: [
        {
            group: "Layout",
            inputs: [
                ...layoutInputs.filter(
                    (inp) =>
                        inp.name !== "divider" &&
                        inp.name !== "borderRadius" &&
                        inp.name !== "gap",
                ),
            ],
        },
        {
            group: "All products",
            inputs: [
                {
                    type: "text",
                    name: "heading",
                    label: "Heading",
                    defaultValue: "All Products",
                    placeholder: "All Products",
                },
                {
                    type: "switch",
                    name: "showHeading",
                    label: "Show heading",
                    defaultValue: false,
                },
                {
                    type: "switch",
                    name: "showBreadcrumb",
                    label: "Show breadcrumb",
                    defaultValue: false,
                },
                {
                    type: "text",
                    name: "prevPageText",
                    label: "Previous page text",
                    defaultValue: "↑ Load previous",
                    placeholder: "↑ Load previous",
                },
                {
                    type: "text",
                    name: "nextPageText",
                    label: "Next page text",
                    defaultValue: "Load more ↓",
                    placeholder: "Load more ↓",
                },
            ],
        },
        {
            group: "Product grid",
            inputs: [
                {
                    type: "range",
                    name: "productsPerRowDesktop",
                    label: "Products per row (desktop)",
                    defaultValue: 4,
                    configs: {
                        min: 2,
                        max: 6,
                        step: 1,
                    },
                },
                {
                    type: "range",
                    name: "productsPerRowMobile",
                    label: "Products per row (mobile)",
                    defaultValue: 1,
                    configs: {
                        min: 1,
                        max: 3,
                        step: 1,
                    },
                },
            ],
        },
        {
            group: "Filtering & Sorting",
            inputs: [
                {
                    type: "switch",
                    name: "enableFilter",
                    label: "Enable filter",
                    defaultValue: true,
                },
                {
                    type: "select",
                    name: "filtersPosition",
                    label: "Filters position",
                    configs: {
                        options: [
                            { value: "sidebar", label: "Sidebar" },
                            { value: "drawer", label: "Drawer" },
                        ],
                    },
                    defaultValue: "sidebar",
                    condition: "enableFilter.eq.true",
                },
                {
                    type: "switch",
                    name: "expandFilters",
                    label: "Expand filters",
                    defaultValue: true,
                    condition: "enableFilter.eq.true",
                },
                {
                    type: "switch",
                    name: "showFiltersCount",
                    label: "Show filters count",
                    defaultValue: true,
                    condition: "enableFilter.eq.true",
                },
                {
                    type: "switch",
                    name: "enableSort",
                    label: "Enable sort",
                    defaultValue: true,
                },
                {
                    type: "switch",
                    name: "showToolbar",
                    label: "Show toolbar",
                    defaultValue: true,
                },
                {
                    type: "switch",
                    name: "showProductsCount",
                    label: "Show products count",
                    defaultValue: false,
                },
                {
                    type: "heading",
                    label: "Product swatches",
                },
                {
                    type: "switch",
                    name: "enableSwatches",
                    label: "Enable swatches",
                    defaultValue: true,
                    helpText: "Show swatches for color/image options.",
                },
                {
                    type: "textarea",
                    name: "displayAsButtonFor",
                    label: "Display as button",
                    defaultValue: "Size",
                    placeholder: "Size, Material",
                    helpText:
                        "Options to display as buttons (comma separated).",
                },
            ],
        },
    ],
});
