import {
    useWeaverse,
    WeaverseHydrogenRoot,
    type WeaverseLoaderData,
} from "@weaverse/hydrogen";
import { useEffect } from "react";

import { useLoaderData } from "react-router";
import { GenericError } from "~/components/root/generic-error";
import { components } from "./components";

export function WeaverseContent() {
    const data = useLoaderData<any>();
    const weaverse = useWeaverse();

    useEffect(() => {
        if (data?.weaverseData) {
            setTimeout(() => {
                (weaverse as any)?.setData?.(data.weaverseData);
            }, 0);
        }
    }, [data, weaverse]);

    return (
        <WeaverseHydrogenRoot
            components={components}
            errorComponent={GenericError}
        />
    );
}

export function validateWeaverseData(weaverseData: WeaverseLoaderData | null) {
    if (
        !weaverseData?.page?.id ||
        (weaverseData?.page?.id?.includes("fallback") &&
            !weaverseData?.configs?.requestInfo?.queries?.isDesignMode)
    ) {
        throw new Response(null, { status: 404 });
    }
}
