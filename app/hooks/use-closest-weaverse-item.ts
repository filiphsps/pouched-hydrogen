import { useItemInstance } from "@weaverse/hydrogen";
import { type RefObject, useEffect, useState } from "react";

export function useClosestWeaverseItem(ref: RefObject<HTMLElement | null>) {
    const [weaverseId, setWeaverseId] = useState<string>("");
    const weaverseItem = useItemInstance(weaverseId);

    // biome-ignore lint/correctness/useExhaustiveDependencies: assuming `selector` does not change
    useEffect(() => {
        if (!weaverseItem && ref.current) {
            const closest = ref.current.closest("[data-wv-id]");
            if (closest) {
                setWeaverseId(closest.getAttribute("data-wv-id") ?? "");
            }
        }
    }, [ref]);

    return weaverseItem;
}
