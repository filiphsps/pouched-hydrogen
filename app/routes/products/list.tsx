import { getPaginationVariables, getSeoMeta } from "@shopify/hydrogen";
import type {
    ProductFilter,
    SearchSortKeys,
} from "@shopify/hydrogen/storefront-api-types";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { seoPayload } from "~/.server/seo";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import type { SortParam } from "~/types/others";
import { routeHeaders } from "~/utils/cache";
import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";
import { FILTER_URL_PREFIX } from "~/utils/const";
import { getWeaverseLocale } from "~/utils/locale";
import { WeaverseContent } from "~/weaverse";
import { parseAsCurrency } from "../collections/utils";

export const headers = routeHeaders;

export async function loader({
    request,
    context: { storefront, weaverse },
}: LoaderFunctionArgs) {
    const pagingVariables = getPaginationVariables(request, { pageBy: 16 });
    const searchParams = new URL(request.url).searchParams;
    const { sortKey, reverse } = getSearchSortValues(
        searchParams.get("sort") as SortParam,
    );
    const filters = [...searchParams.entries()].reduce((flt, [key, value]) => {
        if (key.startsWith(FILTER_URL_PREFIX)) {
            const filterKey = key.substring(FILTER_URL_PREFIX.length);
            flt.push({
                [filterKey]: JSON.parse(value),
            });
        }
        return flt;
    }, [] as ProductFilter[]);

    const q = searchParams.get("q") || "";

    // Load search data and weaverseData in parallel
    const [data, weaverseData] = await Promise.all([
        storefront
            .query(SEARCH_QUERY, {
                variables: {
                    ...pagingVariables,
                    searchTerm:
                        (q || "*") +
                        (maybeFilterOutCombinedListingsQuery
                            ? ` ${maybeFilterOutCombinedListingsQuery}`
                            : ""),
                    productFilters: filters,
                    sortKey,
                    reverse,
                    types: ["PRODUCT"],
                    country: storefront.i18n.country,
                    language: storefront.i18n.language,
                },
            })
            .catch((error) => {
                console.error("Search query failed:", error);
                return { search: null };
            }),
        weaverse.loadPage({
            type: "ALL_PRODUCTS",
            locale: getWeaverseLocale(storefront.i18n),
        }),
    ]);

    const products = data?.search || {
        nodes: [],
        pageInfo: {
            hasPreviousPage: false,
            hasNextPage: false,
            startCursor: null,
            endCursor: null,
        },
        productFilters: [],
        totalCount: 0,
    };

    // Filter out non-product nodes (e.g. if they don't have priceRange)
    if (products.nodes) {
        products.nodes = products.nodes.filter((node: any) => node?.priceRange);
    }

    const allFilterValues =
        products?.productFilters?.flatMap((filter: any) => filter.values) || [];

    const appliedFilters = filters
        .map((filter) => {
            const foundValue = allFilterValues.find((value: any) => {
                const valueInput = JSON.parse(
                    value.input as string,
                ) as ProductFilter;
                if (valueInput.price && filter.price) {
                    return true;
                }
                return JSON.stringify(valueInput) === JSON.stringify(filter);
            });
            if (!foundValue) {
                return null;
            }

            if (foundValue.id === "filter.v.price") {
                const input = JSON.parse(
                    foundValue.input as string,
                ) as ProductFilter;
                const min = parseAsCurrency(
                    input.price?.min ?? 0,
                    storefront.i18n,
                );
                const max = input.price?.max
                    ? parseAsCurrency(input.price.max, storefront.i18n)
                    : "";
                const label = min && max ? `${min} - ${max}` : "Price";

                return { filter, label };
            }
            return { filter, label: foundValue.label };
        })
        .filter(
            (filter): filter is NonNullable<typeof filter> => filter !== null,
        );

    const seo = seoPayload.collection({
        url: request.url,
        collection: {
            id: "all-products",
            title: "All Products",
            handle: "products",
            description: "All the store products",
            seo: {
                title: "All Products",
                description: "All the store products",
            },
            products: {
                ...products,
                filters: products.productFilters,
            } as any,
        },
    });

    return {
        products: {
            ...products,
            filters: products.productFilters,
        },
        appliedFilters,
        seo,
        weaverseData,
    };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data) return;
    return getSeoMeta(data.seo as any);
};

export default function AllProducts() {
    return <WeaverseContent />;
}

function getSearchSortValues(sortParam: SortParam | null): {
    sortKey: SearchSortKeys;
    reverse: boolean;
} {
    switch (sortParam) {
        case "price-high-low":
            return {
                sortKey: "PRICE",
                reverse: true,
            };
        case "price-low-high":
            return {
                sortKey: "PRICE",
                reverse: false,
            };
        case "best-selling":
            return {
                sortKey: "RELEVANCE",
                reverse: false,
            };
        case "newest":
            return {
                sortKey: "RELEVANCE",
                reverse: true,
            };
        case "relevance":
            return {
                sortKey: "RELEVANCE",
                reverse: false,
            };
        default:
            return {
                sortKey: "RELEVANCE",
                reverse: false,
            };
    }
}

const SEARCH_QUERY = `#graphql
  query search(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $searchTerm: String!
    $productFilters: [ProductFilter!]
    $sortKey: SearchSortKeys
    $reverse: Boolean
    $types: [SearchType!]
  ) @inContext(country: $country, language: $language) {
    search(
      query: $searchTerm,
      productFilters: $productFilters,
      sortKey: $sortKey,
      reverse: $reverse,
      types: $types,
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ... on Product {
            ...ProductCard
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
      productFilters {
        id
        label
        type
        values {
          id
          label
          count
          input
        }
      }
      totalCount
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
