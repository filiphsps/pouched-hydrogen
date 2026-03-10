import {
    useWeaverse,
    WeaverseHydrogenRoot,
    type WeaverseLoaderData,
} from "@weaverse/hydrogen";
import { useEffect } from "react";

import { useLoaderData } from "react-router";
import { GenericError } from "~/components/root/generic-error";
import { components } from "./components";

/**
 * Weaverse content component that renders the current page's Weaverse data.
 * Uses useEffect (not useLayoutEffect) to avoid "Cannot update a component
 * while rendering a different component" warnings in React 19.
 */
export function WeaverseContent() {
    const data = useLoaderData<any>();
    const weaverse = useWeaverse();

    useEffect(() => {
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
