import { getContext } from "~/types/context";
import { getWeaverseLocale } from "~/utils/locale";
import { validateWeaverseData, WeaverseContent } from "~/weaverse";
import type { Route } from "./+types/catch-all";

export async function loader({ context: ctx }: Route.LoaderArgs) {
    const context = getContext(ctx);
    const weaverseData = await context.weaverse.loadPage({
        type: "CUSTOM",
        locale: getWeaverseLocale(context.storefront.i18n),
    });
    validateWeaverseData(weaverseData);

    return {
        weaverseData,
    };
}

export default function Component() {
    return <WeaverseContent />;
}
