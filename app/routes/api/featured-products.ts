import { data } from "react-router";
import { getContext } from "~/types/context";
import { getFeaturedProducts } from "~/utils/featured-products";
import type { Route } from "./+types/featured-products";

export async function loader({ context: ctx }: Route.LoaderArgs) {
    const context = getContext(ctx);
    return data(await getFeaturedProducts(context.storefront));
}
