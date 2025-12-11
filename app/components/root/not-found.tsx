import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import { BreadCrumb } from "~/components/breadcrumb";
import Link from "~/components/link";
import { ProductCard } from "~/components/product/product-card";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { Title } from "~/components/title";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { FeaturedProductsData } from "~/utils/featured-products";

export function NotFound({ type = "page" }: { type?: string }) {
    const { t } = useTranslation();
    return (
        <Section width="fixed" verticalPadding="medium">
            <div className="space-y-4 py-20">
                <BreadCrumb className="justify-center" page="404" />
                <Title
                    as="h4"
                    size="2xl"
                    className="mt-4 mb-2.5 text-center font-medium"
                >
                    {t("error.notFound.heading", { type })}
                </Title>
                <p className="mx-auto pt-1 text-center lg:w-1/2">
                    {t("error.notFound.description", { type })}
                </p>
                <div className="pt-10">
                    <div className="text-center font-medium text-xl">
                        {t("error.notFound.actionsTitle")}
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4 pt-4 md:flex-row">
                        <Link variant="outline" to="/products">
                            {t("error.notFound.shopProducts")}
                        </Link>
                        <span>{t("error.notFound.or")}</span>
                        <Link variant="underline" to="/">
                            {t("error.notFound.homeButton")}
                        </Link>
                    </div>
                </div>
            </div>
            <FeaturedProducts />
        </Section>
    );
}

function FeaturedProducts() {
    const { load, data } = useFetcher<FeaturedProductsData>();
    const api = usePrefixPathWithLocale("/api/featured-products");
    const { t } = useTranslation();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
    useEffect(() => {
        load(api);
    }, [api]);

    if (!data) {
        return null;
    }

    const { featuredProducts } = data;

    return (
        <div className="space-y-8 pt-20">
            <Title as="h5" size="xl">
                {t("error.notFound.featuredProducts")}
            </Title>
            <Swimlane>
                {featuredProducts.nodes.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        className="w-80 snap-start"
                    />
                ))}
            </Swimlane>
        </div>
    );
}
