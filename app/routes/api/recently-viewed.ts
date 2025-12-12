/**
 * Recently Viewed Products API Route.
 * Fetches product data for an array of product handles.
 */
import type { AppLoadContext } from "react-router";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";

interface RecentlyViewedResponse {
    products: unknown[];
}

/**
 * Loader for recently viewed products API endpoint.
 *
 * @param {Request} request - Incoming request with handles as comma-separated query param
 * @param {AppLoadContext} context - App context with storefront client
 * @returns {Promise<RecentlyViewedResponse>} Product data for the handles
 */
export async function loader({
    request,
    context,
}: {
    request: Request;
    context: AppLoadContext;
}) {
    const { storefront } = context;
    const url = new URL(request.url);

    // Get product handles from query param
    const handlesParam = url.searchParams.get("handles") || "";
    const handles = handlesParam
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h.length > 0);

    if (handles.length === 0) {
        return Response.json({ products: [] });
    }

    try {
        // Build the query with aliases for each product
        const queryParts = handles.map(
            (handle, index) => `
				product${index}: product(handle: "${handle}") {
					...ProductCard
				}
			`,
        );

        const query = `#graphql
			query recentlyViewedProducts(
				$country: CountryCode
				$language: LanguageCode
			) @inContext(country: $country, language: $language) {
				${queryParts.join("\n")}
			}
			${PRODUCT_CARD_FRAGMENT}
		`;

        const data = await storefront.query(query, {
            variables: {},
        });

        // Extract products from aliased results
        const products = handles
            .map((_, index) => data?.[`product${index}`])
            .filter(Boolean);

        return Response.json({ products });
    } catch (error) {
        console.error("Recently viewed products error:", error);
        return Response.json({ products: [] });
    }
}
