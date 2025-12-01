import type { LoaderFunctionArgs } from "react-router";
import { getWeaverseLocale } from "~/utils/locale";
import { validateWeaverseData, WeaverseContent } from "~/weaverse";

export async function loader({ context }: LoaderFunctionArgs) {
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
