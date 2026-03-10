import {
    Analytics,
    CartForm,
    type CartQueryDataReturn,
} from "@shopify/hydrogen";
import type {
    CartBuyerIdentityInput,
    CartLineInput,
    CartLineUpdateInput,
} from "@shopify/hydrogen/storefront-api-types";
import { Suspense } from "react";
import { Await, data, redirect, useLoaderData } from "react-router";
import invariant from "tiny-invariant";
import { CartMain } from "~/components/cart/cart-main";
import { ProductCard } from "~/components/product/product-card";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { Title } from "~/components/title";
import { getContext } from "~/types/context";
import { getFeaturedProducts } from "~/utils/featured-products";
import type { Route } from "./+types/cart-page";

/**
 * Ensures Set-Cookie headers from cart mutations propagate to the browser.
 * Without this, new cart IDs from first-time adds may not persist.
 */
export const headers: Route.HeadersFunction = ({ actionHeaders }) =>
    actionHeaders;

export async function action({ request, context: ctx }: Route.ActionArgs) {
    const context = getContext(ctx);
    const { cart } = context;
    const formData = await request.formData();
    const { action: cartFormAction, inputs } = CartForm.getFormInput(formData);

    invariant(cartFormAction, "No cartAction defined");

    const status = 200;
    let result: CartQueryDataReturn;

    switch (cartFormAction) {
        case CartForm.ACTIONS.LinesAdd:
            result = await cart.addLines(inputs.lines as CartLineInput[]);
            break;
        case CartForm.ACTIONS.LinesUpdate:
            result = await cart.updateLines(
                inputs.lines as CartLineUpdateInput[],
            );
            break;
        case CartForm.ACTIONS.LinesRemove:
            result = await cart.removeLines(inputs.lineIds as string[]);
            break;
        case CartForm.ACTIONS.NoteUpdate: {
            const cartNote = inputs.cartNote as string;
            result = await cart.updateNote(cartNote || "");
            break;
        }
        case CartForm.ACTIONS.DiscountCodesUpdate: {
            const formDiscountCode = inputs.discountCode;
            // User inputted discount code
            const discountCodes = (
                formDiscountCode ? [formDiscountCode] : []
            ) as string[];
            // Combine discount codes already applied on cart
            discountCodes.push(...(inputs.discountCodes as string[]));
            result = await cart.updateDiscountCodes(discountCodes);
            break;
        }
        case CartForm.ACTIONS.GiftCardCodesUpdate: {
            const formGiftCardCode = inputs.giftCardCode;
            // User inputted gift card code
            const giftCardCodes = (
                formGiftCardCode ? [formGiftCardCode] : []
            ) as string[];
            // Combine gift card codes already applied on cart
            giftCardCodes.push(...inputs.giftCardCodes);
            result = await cart.updateGiftCardCodes(giftCardCodes);
            break;
        }
        case CartForm.ACTIONS.GiftCardCodesRemove: {
            const giftCardIds = inputs.giftCardCodes as string[];
            result = await cart.removeGiftCardCodes(giftCardIds);
            break;
        }
        case CartForm.ACTIONS.BuyerIdentityUpdate:
            result = await cart.updateBuyerIdentity({
                ...(inputs.buyerIdentity as CartBuyerIdentityInput),
            });
            break;
        default:
            invariant(false, `${cartFormAction} cart action is not defined`);
    }

    /**
     * The Cart ID may change after each mutation. We need to update it each time in the session.
     * CRITICAL: These headers MUST be passed to all responses (including redirects)
     * to persist the cart session cookie.
     */
    const cartHeaders = result?.cart?.id
        ? cart.setCartId(result.cart.id)
        : new Headers();

    const redirectTo = formData.get("redirectTo") ?? null;
    if (typeof redirectTo === "string" && isLocalPath(redirectTo)) {
        return redirect(redirectTo, { headers: cartHeaders });
    }

    const { cart: cartResult, errors, userErrors, warnings } = result || {};

    return data(
        {
            cart: cartResult,
            userErrors,
            errors,
            warnings,
            action: cartFormAction,
        },
        { status, headers: cartHeaders },
    );
}

export async function loader({ context: ctx }: Route.LoaderArgs) {
    const context = getContext(ctx);
    const { cart, storefront } = context;

    return {
        cart: await cart.get(),
        featuredProducts: getFeaturedProducts(storefront),
    };
}

export default function CartRoute() {
    const { cart, featuredProducts } = useLoaderData<typeof loader>();

    return (
        <>
            <Section width="fixed" verticalPadding="medium">
                <Title as="h1" size="2xl" className="mb-8 text-center md:mb-16">
                    Cart ({cart?.totalQuantity || 0})
                </Title>
                <CartMain layout="page" cart={cart} />
                <Analytics.CartView />
            </Section>
            <Suspense fallback={null}>
                <Await resolve={featuredProducts}>
                    {({ featuredProducts: products }) => {
                        if (!products?.nodes?.length) {
                            return null;
                        }
                        return (
                            <Section
                                width="fixed"
                                verticalPadding="large"
                                gap={32}
                            >
                                <Title
                                    as="h2"
                                    size="xl"
                                    className="text-center"
                                >
                                    More from our best sellers
                                </Title>
                                <Swimlane className="gap-4">
                                    {products.nodes.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            className="w-80 snap-start"
                                        />
                                    ))}
                                </Swimlane>
                            </Section>
                        );
                    }}
                </Await>
            </Suspense>
        </>
    );
}

/**
 * Validates that a url is local
 * @param url
 * @returns `true` if local `false`if external domain
 */
function isLocalPath(url: string) {
    try {
        // We don't want to redirect cross domain,
        // doing so could create fishing vulnerability
        // If `new URL()` succeeds, it's a fully qualified
        // url which is cross domain. If it fails, it's just
        // a path, which will be the current domain.
        new URL(url);
    } catch (e) {
        return true;
    }

    return false;
}
