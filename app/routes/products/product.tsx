import {
    Analytics,
    getAdjacentAndFirstAvailableVariants,
    getSeoMeta,
    useOptimisticVariant,
} from "@shopify/hydrogen";
import { getSelectedProductOptions } from "@weaverse/hydrogen";
import { useEffect } from "react";
import type { MetaArgs } from "react-router";
import { useLoaderData } from "react-router";
import type { ProductQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import {
    redirectIfCombinedListing,
    redirectIfHandleIsLocalized,
} from "~/.server/redirect";
import { seoPayload } from "~/.server/seo";
import { StructuredData } from "~/components/structured-data";
import { PRODUCT_QUERY } from "~/graphql/queries";
import { getContext } from "~/types/context";
import { routeHeaders } from "~/utils/cache";
import {
    COMBINED_LISTINGS_CONFIGS,
    isCombinedListing,
} from "~/utils/combined-listings";
import { getWeaverseLocale } from "~/utils/locale";
import { generateProductSchema } from "~/utils/structured-data";
import { WeaverseContent } from "~/weaverse";
import type { Route } from "./+types/product";
import { getRecommendedProducts } from "./recommended-product";

export const headers = routeHeaders;

export async function loader({
    params,
    request,
    context: ctx,
}: Route.LoaderArgs) {
    const { productHandle: handle } = params;
    const context = getContext(ctx);

    invariant(handle, "Missing productHandle param, check route filename");

    const { storefront, weaverse } = context;
    const selectedOptions = getSelectedProductOptions(request);
    const [{ shop, product }, weaverseData] = await Promise.all([
        storefront.query<ProductQuery>(PRODUCT_QUERY, {
            variables: {
                handle,
                selectedOptions,
                country: storefront.i18n.country,
                language: storefront.i18n.language,
            },
        }),
        weaverse.loadPage({
            type: "PRODUCT",
            handle,
            locale: getWeaverseLocale(storefront.i18n),
        }),
        // Add other queries here, so that they are loaded in parallel
    ]);

    if (!product?.id) {
        throw new Response("product", { status: 404 });
    }
    redirectIfHandleIsLocalized(request, { handle, data: product });

    if (COMBINED_LISTINGS_CONFIGS.redirectToFirstVariant) {
        redirectIfCombinedListing(request, product);
    }

    // Use Hydrogen/Remix streaming for recommended products
    const recommended = getRecommendedProducts(storefront, product.id);

    return {
        shop,
        product,
        weaverseData,
        storeDomain: shop.primaryDomain.url,
        seo: seoPayload.product({ product, url: request.url }),
        recommended,
        selectedOptions,
        url: request.url,
    };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
    return getSeoMeta(
        ...matches.map((match) => (match.data as any)?.seo).filter(Boolean),
    );
};

export default function Product() {
    const { product, storeDomain, url } = useLoaderData<typeof loader>();
    const combinedListing = isCombinedListing(product);

    // Optimistically selects a variant with given available variant information
    const selectedVariant = useOptimisticVariant(
        product.selectedOrFirstAvailableVariant,
        getAdjacentAndFirstAvailableVariants(product),
    );

    // Sets the search param to the selected variant without navigation
    // when no search params are set or when variant options don't match
    useEffect(() => {
        if (!selectedVariant?.selectedOptions || combinedListing) {
            return;
        }

        const currentParams = new URLSearchParams(window.location.search);
        let needsUpdate = false;

        // If no search params exist, we need to add them
        if (window.location.search === "") {
            needsUpdate = true;
        } else {
            // Check if any of the selected variant options differ from current params
            for (const option of selectedVariant.selectedOptions) {
                const currentValue = currentParams.get(option.name);
                if (currentValue !== option.value) {
                    needsUpdate = true;
                    break;
                }
            }
        }

        if (needsUpdate) {
            // Preserve existing non-variant-related params
            const updatedParams = new URLSearchParams(currentParams);

            // Update or add variant option params
            for (const option of selectedVariant.selectedOptions) {
                updatedParams.set(option.name, option.value);
            }

            const newSearch = updatedParams.toString();
            if (newSearch !== window.location.search.slice(1)) {
                window.history.replaceState(
                    {},
                    "",
                    `${location.pathname}?${newSearch}`,
                );
            }
        }
    }, [selectedVariant?.selectedOptions, combinedListing]);

    const productSchema = generateProductSchema(product, selectedVariant, url);

    return (
        <>
            <StructuredData schema={productSchema} />
            <WeaverseContent />
            {selectedVariant && (
                <Analytics.ProductView
                    data={{
                        products: [
                            {
                                id: product.id,
                                title: product.title,
                                price: selectedVariant?.price.amount || "0",
                                vendor: product.vendor,
                                variantId: selectedVariant?.id || "",
                                variantTitle: selectedVariant?.title || "",
                                quantity: 1,
                            },
                        ],
                    }}
                />
            )}
        </>
    );
}
