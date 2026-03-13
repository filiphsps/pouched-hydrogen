import type {
    OptimisticCartLineInput,
    ShopifyAddToCartPayload,
    ShopifyPageViewPayload,
} from "@shopify/hydrogen";
import {
    AnalyticsEventName,
    getClientBrowserParameters,
    sendShopifyAnalytics,
} from "@shopify/hydrogen";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMatches } from "react-router";
import { Button } from "~/components/button";
import { Spinner } from "~/components/spinner";
import { toast } from "~/components/toast";
import { useAddToCart } from "~/lib/cart";
import { cn } from "~/utils/cn";
import { DEFAULT_LOCALE } from "~/utils/const";

export function AddToCartButton({
    children,
    lines,
    className = "",
    width = "full",
    disabled,
    analytics,
    ...props
}: {
    children?: React.ReactNode;
    lines: OptimisticCartLineInput[];
    className?: string;
    width?: "auto" | "full";
    disabled?: boolean;
    analytics?: Record<string, unknown>;
    [key: string]: unknown;
}) {
    const { t } = useTranslation();
    const { mutate, isLoading, data } = useAddToCart({
        onError: (errors) =>
            toast.error(errors[0]?.message || t("cart.mutationError")),
    });

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        mutate(lines);
    }

    return (
        <AddToCartAnalytics
            analytics={analytics}
            cartData={data}
            isSubmitting={isLoading}
        >
            <form onSubmit={handleSubmit}>
                <input
                    type="hidden"
                    name="analytics"
                    value={JSON.stringify(analytics)}
                />
                <Button
                    variant="primary"
                    type="submit"
                    className={cn(
                        "relative h-12 rounded-full hover:bg-(--btn-primary-bg) hover:text-(--btn-primary-text)",
                        className,
                    )}
                    disabled={disabled ?? isLoading}
                    {...props}
                >
                    <span className={cn(isLoading && "invisible")}>
                        {children || t("cart.addToCart")}
                    </span>
                    {isLoading && (
                        <Spinner className="z-0" size={20} duration={400} />
                    )}
                </Button>
            </form>
        </AddToCartAnalytics>
    );
}

function usePageAnalytics({ hasUserConsent }: { hasUserConsent: boolean }) {
    const matches = useMatches();

    return useMemo(() => {
        const data: Record<string, unknown> = {};
        for (const match of matches) {
            const eventData = match?.data as Record<string, unknown>;
            if (eventData) {
                if (eventData.analytics) {
                    Object.assign(data, eventData.analytics);
                }
                const selectedLocale =
                    (eventData.selectedLocale as typeof DEFAULT_LOCALE) ||
                    DEFAULT_LOCALE;
                Object.assign(data, {
                    currency: selectedLocale.currency,
                    acceptedLanguage: selectedLocale.language,
                });
            }
        }

        return {
            ...data,
            hasUserConsent,
        } as unknown as ShopifyPageViewPayload;
    }, [matches, hasUserConsent]);
}

function AddToCartAnalytics({
    analytics,
    cartData,
    isSubmitting,
    children,
}: {
    analytics?: Record<string, unknown>;
    cartData: { cart?: { id: string } } | null;
    isSubmitting: boolean;
    children: React.ReactNode;
}) {
    const pageAnalytics = usePageAnalytics({ hasUserConsent: true });

    useEffect(() => {
        if (!isSubmitting && cartData?.cart?.id && analytics) {
            const cartResponse = cartData.cart;
            const addToCartPayload: ShopifyAddToCartPayload = {
                ...getClientBrowserParameters(),
                ...pageAnalytics,
                ...analytics,
                cartId: cartResponse.id,
            };

            sendShopifyAnalytics({
                eventName: AnalyticsEventName.ADD_TO_CART,
                payload: addToCartPayload,
            });
        }
    }, [isSubmitting, cartData, analytics, pageAnalytics]);

    return <>{children}</>;
}
