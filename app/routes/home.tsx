import type { SeoConfig } from "@shopify/hydrogen";
import { AnalyticsPageType, getSeoMeta } from "@shopify/hydrogen";
import type { PageType } from "@weaverse/hydrogen";
import type { MetaFunction } from "react-router";
import type { ShopQuery } from "storefront-api.generated";
import { seoPayload } from "~/.server/seo";
import { getContext } from "~/types/context";
import { routeHeaders } from "~/utils/cache";
import { getWeaverseLocale } from "~/utils/locale";
import { validateWeaverseData, WeaverseContent } from "~/weaverse";
import type { Route } from "./+types/home";

export const headers = routeHeaders;

export async function loader(args: Route.LoaderArgs) {
    const { params } = args;
    const context = getContext(args.context);
    const { pathPrefix } = context.storefront.i18n;
    const locale = pathPrefix?.slice(1) || "";
    let type: PageType = "INDEX";

    if (params.locale && params.locale.toLowerCase() !== locale) {
        // Update for Weaverse: if it not locale, it probably is a custom page handle
        type = "CUSTOM";
    }

    // Load async data in parallel for better performance
    const [weaverseData, { shop }] = await Promise.all([
        context.weaverse.loadPage({
            type,
            locale: getWeaverseLocale(context.storefront.i18n),
        }),
        context.storefront.query<ShopQuery>(SHOP_QUERY),
    ]);

    // Calculate seo payload synchronously
    const seo = seoPayload.home({ shop });

    // Check weaverseData after parallel loading
    validateWeaverseData(weaverseData);

    return {
        shop,
        weaverseData,
        analytics: {
            pageType: AnalyticsPageType.home,
        },
        seo,
    };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data) return;
    return getSeoMeta(data?.seo as SeoConfig);
};
export default function Homepage() {
    return <WeaverseContent />;
}

const SHOP_QUERY = `#graphql
  query shop($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shop {
      id
      name
      description
    }
  }
` as const;
