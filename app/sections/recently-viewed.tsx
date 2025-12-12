/**
 * Recently Viewed Products Section.
 * Displays a carousel of products the user has recently viewed.
 * Uses localStorage to persist viewing history across sessions.
 */
import { createSchema } from "@weaverse/hydrogen";
import { useEffect } from "react";
import { useFetcher, useLoaderData } from "react-router";
import type { ProductCardFragment } from "storefront-api.generated";
import Heading, {
    type HeadingProps,
    headingInputs,
} from "~/components/heading";
import { ProductCard } from "~/components/product/product-card";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { Skeleton } from "~/components/skeleton";
import { Swimlane } from "~/components/swimlane";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import { useRecentlyViewed } from "~/hooks/use-recently-viewed";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface RecentlyViewedProps
    extends Omit<SectionProps, "content">,
        Omit<HeadingProps, "as" | "ref"> {
    ref: React.Ref<HTMLElement>;
    headingTagName?: "h2" | "h3" | "h4";
    maxProducts?: number;
}

interface RecentlyViewedResponse {
    products: ProductCardFragment[];
}

/**
 * Recently Viewed Products Section.
 * Tracks current product and displays previously viewed products.
 */
export default function RecentlyViewed(props: RecentlyViewedProps) {
    const {
        ref,
        headingTagName = "h2",
        content,
        size,
        mobileSize,
        desktopSize,
        color,
        weight,
        alignment,
        minSize,
        maxSize,
        maxProducts = 8,
        ...rest
    } = props;

    const loaderData = useLoaderData<typeof productRouteLoader>();
    const product = loaderData?.product;
    const currentHandle = product?.handle;

    const {
        recentlyViewed,
        addToRecentlyViewed,
        isLoading: hookLoading,
    } = useRecentlyViewed(currentHandle);

    const { load, data, state } = useFetcher<RecentlyViewedResponse>();

    // Add current product to recently viewed
    useEffect(() => {
        if (currentHandle) {
            addToRecentlyViewed(currentHandle);
        }
    }, [currentHandle, addToRecentlyViewed]);

    // Fetch product data for recently viewed handles
    const handlesToFetch = recentlyViewed.slice(0, maxProducts);
    const apiPath = usePrefixPathWithLocale(
        `/api/recently-viewed?handles=${handlesToFetch.join(",")}`,
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies: refetch when handles change
    useEffect(() => {
        if (handlesToFetch.length > 0 && !hookLoading) {
            load(apiPath);
        }
    }, [handlesToFetch.join(","), hookLoading]);

    const products = data?.products || [];
    const isLoading = hookLoading || state === "loading";
    const hasProducts = products.length > 0;

    // Don't render if no recently viewed products
    if (!isLoading && !hasProducts && handlesToFetch.length === 0) {
        return null;
    }

    return (
        <Section ref={ref} {...rest} overflow="unset">
            {content && (
                <Heading
                    content={content}
                    as={headingTagName}
                    color={color}
                    size={size}
                    mobileSize={mobileSize}
                    desktopSize={desktopSize}
                    minSize={minSize}
                    maxSize={maxSize}
                    weight={weight}
                    alignment={alignment}
                />
            )}

            {isLoading ? (
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-64 shrink-0">
                            <Skeleton className="aspect-square" />
                            <Skeleton className="mt-2 h-4 w-32" />
                            <Skeleton className="mt-1 h-4 w-20" />
                        </div>
                    ))}
                </div>
            ) : hasProducts ? (
                <Swimlane>
                    {products.map((productItem) => (
                        <ProductCard
                            key={productItem.id}
                            product={productItem}
                            className="w-64 shrink-0 snap-start md:w-80"
                        />
                    ))}
                </Swimlane>
            ) : null}
        </Section>
    );
}

export const schema = createSchema({
    type: "recently-viewed",
    title: "Recently viewed",
    limit: 1,
    enabledOn: {
        pages: ["PRODUCT"],
    },
    settings: [
        {
            group: "Layout",
            inputs: layoutInputs.filter((i) => i.name !== "borderRadius"),
        },
        {
            group: "Heading",
            inputs: [
                ...headingInputs.map((input) => {
                    if (input.name === "as") {
                        return {
                            ...input,
                            name: "headingTagName",
                        };
                    }
                    return input;
                }),
            ],
        },
        {
            group: "Products",
            inputs: [
                {
                    type: "range",
                    label: "Max products to show",
                    name: "maxProducts",
                    configs: {
                        min: 4,
                        max: 12,
                        step: 1,
                    },
                    defaultValue: 8,
                },
            ],
        },
    ],
    presets: {
        gap: 32,
        content: "Recently viewed",
    },
});
