import {
    useWeaverse,
    WeaverseHydrogenRoot,
    type WeaverseLoaderData,
} from "@weaverse/hydrogen";
import { useEffect, useLayoutEffect } from "react";

import { useLoaderData } from "react-router";
import { GenericError } from "~/components/root/generic-error";
import { components } from "./components";

const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Weaverse content component that renders the current page's Weaverse data.
 * Previously used usePresence() to coordinate with AnimatePresence exit animations,
 * but this was removed for performance reasons.
 */
export function WeaverseContent() {
    const data = useLoaderData<any>();
    const weaverse = useWeaverse();

    useIsomorphicLayoutEffect(() => {
        if (data?.weaverseData) {
            (weaverse as any)?.setData?.(data.weaverseData);
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
