import { flattenConnection } from "@shopify/hydrogen";

import type { OrderCardFragment } from "customer-account-api.generated";
import { useTranslation } from "react-i18next";
import { Image } from "~/components/image";
import Link from "~/components/link";

type OrderCardsProps = {
    orders: OrderCardFragment[];
};

export function OrdersHistory({ orders }: OrderCardsProps) {
    const { t } = useTranslation();
    return (
        <div className="space-y-4">
            <div className="font-bold">{t("account.orders.title")}</div>
            {orders?.length ? (
                <Orders orders={orders} />
            ) : (
                <div>{t("account.orders.none")}</div>
            )}
        </div>
    );
}

function Orders({ orders }: OrderCardsProps) {
    const { t } = useTranslation();
    return (
        <ul className="grid grid-flow-row grid-cols-1 gap-5 sm:grid-cols-2">
            {orders.map((order) => {
                if (!order?.id) return null;

                const [legacyOrderId, key] = (
                    order.id.split("/").pop() || ""
                ).split("?");
                const lineItems = flattenConnection(order?.lineItems);
                const fulfillmentStatus = flattenConnection(
                    order?.fulfillments,
                )[0]?.status;
                const orderLink = key
                    ? `/account/orders/${legacyOrderId}?${key}`
                    : `/account/orders/${legacyOrderId}`;

                return (
                    <li
                        key={order.id}
                        className="flex items-center gap-5 border border-line-subtle p-5 text-center"
                    >
                        {lineItems[0].image && (
                            <Link
                                className="w-36 shrink-0"
                                to={orderLink}
                                prefetch="intent"
                            >
                                <Image
                                    width={500}
                                    height={500}
                                    className="h-auto w-36"
                                    alt={
                                        lineItems[0].image?.altText ??
                                        t("account.orders.imageAlt")
                                    }
                                    src={lineItems[0].image.url}
                                />
                            </Link>
                        )}
                        <div
                            className={`h-full flex-col justify-center text-left ${
                                lineItems[0].image ? "" : "md:col-span-2"
                            }`}
                        >
                            <div className="line-clamp-1 font-medium">
                                {lineItems.length > 1
                                    ? `${lineItems[0].title} +${lineItems.length - 1} more`
                                    : lineItems[0].title}
                            </div>
                            <dl className="mt-2 flex flex-col">
                                <dt className="sr-only">
                                    {t("account.orders.orderNo")}
                                </dt>
                                <dd>
                                    <p className="text-body-subtle">
                                        {t("account.orders.orderNo")}{" "}
                                        {order.number}
                                    </p>
                                </dd>
                                <dt className="sr-only">
                                    {t("account.orders.orderDate")}
                                </dt>
                                <dd>
                                    <p className="text-body-subtle">
                                        {new Date(
                                            order.processedAt,
                                        ).toDateString()}
                                    </p>
                                </dd>
                                {fulfillmentStatus && (
                                    <>
                                        <dt className="sr-only">
                                            {t(
                                                "account.orders.fulfillmentStatus",
                                            )}
                                        </dt>
                                        <dd className="mt-3">
                                            <span className="border bg-gray-100 px-2.5 py-1 font-medium text-xs">
                                                {t(
                                                    `account.orders.status.${fulfillmentStatus}`,
                                                ) || fulfillmentStatus}
                                            </span>
                                        </dd>
                                    </>
                                )}
                                <Link
                                    to={orderLink}
                                    prefetch="intent"
                                    variant="underline"
                                    className="mt-3 w-fit text-body-subtle after:bg-body-subtle"
                                >
                                    {t("account.orders.viewDetails")}
                                </Link>
                            </dl>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
