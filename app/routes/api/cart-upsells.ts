/**
 * Cart Upsells API Route.
 * Fetches intelligent product recommendations based on ALL items in the cart.
 * Returns "pairs well with" products excluding items already in cart.
 *
 * Features:
 * - Considers ALL cart products for recommendations (not just the first)
 * - Scores products based on recommendation frequency across cart items
 * - Supports multiple algorithms for A/B testing
 * - Excludes products already in cart
 */
import type { AppLoadContext } from "react-router";
import type {
    ProductCardFragment,
    ProductRecommendationsQuery,
} from "storefront-api.generated";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";

/**
 * Available recommendation algorithms for A/B testing.
 * - shopify: Uses Shopify's built-in productRecommendations API
 * - popularity: Prioritizes best-selling products
 * - hybrid: Combines recommendations with popularity scoring
 */
export type UpsellAlgorithm = "shopify" | "popularity" | "hybrid";

/**
 * Response structure for cart upsells API.
 */
export interface CartUpsellsResponse {
    /** Recommended products */
    products: ProductCardFragment[];
    /** Algorithm used for this response (for A/B testing tracking) */
    algorithm: UpsellAlgorithm;
}

/**
 * Product with recommendation score for ranking.
 */
interface ScoredProduct {
    product: ProductCardFragment;
    score: number;
}

/**
 * Loader for cart upsells API endpoint.
 * Fetches intelligent recommendations considering ALL products in cart.
 *
 * Query Parameters:
 * - productIds: Comma-separated list of product IDs in cart
 * - excludeIds: Comma-separated list of product IDs to exclude (typically same as productIds)
 * - count: Number of recommendations to return (default: 4)
 * - algorithm: Recommendation algorithm to use (default: hybrid)
 *
 * @param request - Incoming request with query parameters
 * @param context - App context with storefront client
 * @returns Product recommendations with algorithm info for A/B tracking
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

    // Parse query parameters
    const productIds =
        url.searchParams.get("productIds")?.split(",").filter(Boolean) || [];
    const excludeIds = new Set(
        url.searchParams.get("excludeIds")?.split(",").filter(Boolean) || [],
    );
    const count = Math.min(
        Number.parseInt(url.searchParams.get("count") || "4", 10),
        10,
    );
    const algorithm =
        (url.searchParams.get("algorithm") as UpsellAlgorithm) || "hybrid";

    if (productIds.length === 0) {
        return Response.json({ products: [], algorithm });
    }

    try {
        // Fetch recommendations for ALL products in cart (up to 5 for performance)
        const productIdsToQuery = productIds.slice(0, 5);
        const recommendationPromises = productIdsToQuery.map(
            (productId) =>
                storefront
                    .query<ProductRecommendationsQuery>(CART_UPSELLS_QUERY, {
                        variables: {
                            productId,
                            count: count + excludeIds.size + 10,
                            query: maybeFilterOutCombinedListingsQuery,
                        },
                    })
                    .catch(() => null), // Handle individual failures gracefully
        );

        const results = await Promise.all(recommendationPromises);

        // Score products based on recommendation frequency and source
        const productScores = new Map<string, ScoredProduct>();

        for (const data of results) {
            if (!data) continue;

            // Shopify recommendations get higher base score (more relevant)
            for (const product of data.recommended ?? []) {
                if (excludeIds.has(product.id)) continue;
                const existing = productScores.get(product.id);
                if (existing) {
                    // Boost score for products recommended for multiple cart items
                    existing.score += 10;
                } else {
                    productScores.set(product.id, { product, score: 10 });
                }
            }

            // Best-selling products get lower base score but still included
            if (algorithm !== "shopify") {
                for (const product of data.additional?.nodes ?? []) {
                    if (excludeIds.has(product.id)) continue;
                    const existing = productScores.get(product.id);
                    if (existing) {
                        existing.score += 3;
                    } else {
                        productScores.set(product.id, { product, score: 3 });
                    }
                }
            }
        }

        // Sort by score and return top results
        const sortedProducts = Array.from(productScores.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, count)
            .map(({ product }) => product);

        return Response.json({ products: sortedProducts, algorithm });
    } catch (error) {
        console.error("Cart upsells error:", error);
        return Response.json({ products: [], algorithm });
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
