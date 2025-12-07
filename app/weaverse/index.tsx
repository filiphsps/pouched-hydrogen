import {
    useWeaverse,
    WeaverseHydrogenRoot,
    type WeaverseLoaderData,
} from "@weaverse/hydrogen";
import { usePresence } from "framer-motion";
import { useEffect, useLayoutEffect } from "react";

import { useLoaderData } from "react-router";
import { GenericError } from "~/components/root/generic-error";
import { components } from "./components";

const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function WeaverseContent() {
    const data = useLoaderData<any>();
    const weaverse = useWeaverse();

    const [isPresent] = usePresence();

    useIsomorphicLayoutEffect(() => {
        if (data?.weaverseData && isPresent) {
            (weaverse as any)?.setData?.(data.weaverseData);
        }
    }, [data, weaverse, isPresent]);

    if (!isPresent) {
        return null;
    }

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
