import { ArrowLeftIcon } from "@phosphor-icons/react";
import { flattenConnection } from "@shopify/hydrogen";
import type { FulfillmentStatus } from "@shopify/hydrogen/customer-account-api-types";
import clsx from "clsx";
import type { OrderFragment, OrderQuery } from "customer-account-api.generated";
import { useTranslation } from "react-i18next";
import { type MetaFunction, redirect, useLoaderData } from "react-router";
import { Link } from "~/components/link";
import { Section } from "~/components/section";
import type { Route } from "./+types/order";
import { OrderLineItem } from "./order-line-item";
import { CUSTOMER_ORDER_QUERY } from "./order-query";
import { OrderSummary } from "./order-summary";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [{ title: `Order ${data?.order?.name}` }];
};

export async function loader({ request, context, params }: Route.LoaderArgs) {
    if (!params.id) {
        return redirect(
            params?.locale ? `${params.locale}/account` : "/account",
        );
    }

    const queryParams = new URL(request.url).searchParams;
    const orderToken = queryParams.get("key");

    try {
        const orderId = orderToken
            ? `gid://shopify/Order/${params.id}?key=${orderToken}`
            : `gid://shopify/Order/${params.id}`;

        const { data, errors } =
            await context.customerAccount.query<OrderQuery>(
                CUSTOMER_ORDER_QUERY,
                { variables: { orderId } },
            );

        if (errors?.length || !data?.order?.lineItems) {
            throw new Error("Order not found");
        }

        const order: OrderFragment = data.order;
        const lineItems = flattenConnection(order.lineItems);
        const discountApplications = flattenConnection(
            order.discountApplications,
        );
        const firstDiscount = discountApplications[0]?.value;
        const discountValue =
            firstDiscount?.__typename === "MoneyV2" && firstDiscount;
        const discountPercentage =
            firstDiscount?.__typename === "PricingPercentageValue" &&
            firstDiscount?.percentage;
        const fulfillments = flattenConnection(order.fulfillments);
        const fulfillmentStatus =
            fulfillments.length > 0
                ? fulfillments[0].status
                : ("OPEN" as FulfillmentStatus);

        return {
            order,
            lineItems,
            discountValue,
            discountPercentage,
            fulfillmentStatus,
        };
    } catch (error) {
        throw new Response(error instanceof Error ? error.message : undefined, {
            status: 404,
        });
    }
}

export default function OrderDetails() {
    const { order, lineItems, fulfillmentStatus } =
        useLoaderData<typeof loader>();
    const { t } = useTranslation();

    let totalDiscount = 0;
    for (const lineItem of lineItems) {
        totalDiscount += lineItem.discountAllocations.reduce(
            (acc, curr) => acc + Number.parseFloat(curr.allocatedAmount.amount),
            0,
        );
    }

    return (
        <Section width="fixed" verticalPadding="medium">
            <div className="w-full lg:py-6">
                <div className="mb-8 flex flex-col gap-4">
                    <h1 className="h4 font-medium">
                        {t("account.orders.detail")}
                    </h1>
                    <Link
                        to="/account"
                        className="w-fit items-center gap-2 text-body-subtle after:bg-body-subtle"
                        variant="underline"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        <span>{t("account.orders.returnToAccount")}</span>
                    </Link>
                </div>
                <div>
                    <p>
                        {t("account.orders.orderNo")} {order.name}
                    </p>
                    <p className="mt-2">
                        {t("account.orders.placedOn", {
                            date: new Date(order.processedAt).toDateString(),
                        })}
                    </p>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3">
                        <div className="col-span-2 space-y-6 md:pr-14">
                            {lineItems.map((lineItem) => (
                                <OrderLineItem
                                    key={lineItem.id}
                                    lineItem={lineItem}
                                />
                            ))}
                            <hr className="border-line-subtle border-t" />
                            <OrderSummary order={order} lineItems={lineItems} />
                        </div>
                        <div className="mt-4 shrink-0 pt-10 md:m-0 md:border-none md:pt-0">
                            <div className="font-bold">
                                {t("account.orders.shippingAddress")}
                            </div>
                            {order?.shippingAddress ? (
                                <ul className="mt-3">
                                    <li>{order.shippingAddress.name}</li>
                                    {order?.shippingAddress?.formatted
                                        ? order.shippingAddress.formatted.map(
                                              (line: string) => (
                                                  <li
                                                      key={line}
                                                      className="text-body-subtle"
                                                  >
                                                      {line}
                                                  </li>
                                              ),
                                          )
                                        : null}
                                </ul>
                            ) : (
                                <p className="mt-3">
                                    {t("account.orders.noShippingAddress")}
                                </p>
                            )}
                            <div className="mt-6 font-bold">
                                {t("account.orders.statusTitle")}
                            </div>
                            {fulfillmentStatus && (
                                <div
                                    className={clsx(
                                        "mt-3 inline-block w-auto px-2.5 py-1 text-sm",
                                        "bg-body-subtle text-body-inverse",
                                    )}
                                >
                                    {t(
                                        `account.orders.status.${fulfillmentStatus}`,
                                    ) || fulfillmentStatus}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}
