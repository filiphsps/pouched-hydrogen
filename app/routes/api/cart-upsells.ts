/**
 * Cart Upsells API Route.
 * Fetches product recommendations based on items in the cart.
 * Returns "pairs well with" products excluding items already in cart.
 */
import type { AppLoadContext } from "react-router";
import type { ProductRecommendationsQuery } from "storefront-api.generated";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";

interface CartUpsellsResponse {
    products: ProductRecommendationsQuery["recommended"];
}

/**
 * Loader for cart upsells API endpoint.
 * Fetches recommendations for products in the cart.
 *
 * @param {Request} request - Incoming request with productIds as comma-separated query param
 * @param {AppLoadContext} context - App context with storefront client
 * @returns {Promise<CartUpsellsResponse>} Product recommendations
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

    // Get product IDs from cart (comma-separated)
    const productIds = url.searchParams.get("productIds")?.split(",") || [];
    const excludeIds = url.searchParams.get("excludeIds")?.split(",") || [];
    const count = Number.parseInt(url.searchParams.get("count") || "4", 10);

    if (productIds.length === 0) {
        return Response.json({ products: [] });
    }

    // Get recommendations for the first product (most relevant)
    const primaryProductId = productIds[0];

    try {
        const data = await storefront.query<ProductRecommendationsQuery>(
            CART_UPSELLS_QUERY,
            {
                variables: {
                    productId: primaryProductId,
                    count: count + excludeIds.length + 5, // Request extra in case some are excluded
                    query: maybeFilterOutCombinedListingsQuery,
                },
            },
        );

        // Merge recommended and additional products
        const allProducts = (data?.recommended ?? [])
            .concat(data?.additional?.nodes ?? [])
            .filter((product, index, arr) => {
                // Deduplicate by ID
                return arr.findIndex(({ id }) => id === product.id) === index;
            })
            .filter((product) => {
                // Exclude products already in cart
                return !excludeIds.includes(product.id);
            })
            .slice(0, count);

        return Response.json({ products: allProducts });
    } catch (error) {
        console.error("Cart upsells error:", error);
        return Response.json({ products: [] });
    }
}

const CART_UPSELLS_QUERY = `#graphql
  query cartUpsells(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
    $query: String
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
