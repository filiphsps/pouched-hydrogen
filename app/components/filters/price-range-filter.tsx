import * as Slider from "@radix-ui/react-slider";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import type { ProductFilter } from "@shopify/hydrogen/storefront-api-types";
import { useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Input } from "~/components/input";
import { cn } from "~/utils/cn";
import { FILTER_URL_PREFIX } from "~/utils/const";
import { filterInputToParams } from "./filter-utils";

export function PriceRangeFilter({
    minVariantPrice,
    maxVariantPrice,
}: {
    minVariantPrice: number;
    maxVariantPrice: number;
}) {
    const [params] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const thumbRef = useRef<"from" | "to" | null>(null);

    const { min, max } = getPricesFromFilter(params);

    const [minPrice, setMinPrice] = useState(min);
    const [maxPrice, setMaxPrice] = useState(max);

    function handleFilter() {
        let paramsClone = new URLSearchParams(params);
        if (minPrice === undefined && maxPrice === undefined) {
            paramsClone.delete(`${FILTER_URL_PREFIX}price`);
        } else {
            const price = {
                ...(minPrice === undefined ? {} : { min: minPrice }),
                ...(maxPrice === undefined ? {} : { max: maxPrice }),
            };
            paramsClone = filterInputToParams({ price }, paramsClone);
        }
        if (params.toString() !== paramsClone.toString()) {
            navigate(`${location.pathname}?${paramsClone.toString()}`, {
                preventScrollReset: true,
            });
        }
    }

    return (
        <div className="space-y-4">
            <Slider.Root
                min={minVariantPrice}
                max={maxVariantPrice}
                step={1}
                minStepsBetweenThumbs={1}
                value={[
                    minPrice || minVariantPrice,
                    maxPrice || maxVariantPrice,
                ]}
                onValueChange={([newMin, newMax]) => {
                    if (thumbRef.current) {
                        if (thumbRef.current === "from") {
                            if (maxPrice === undefined || newMin < maxPrice) {
                                setMinPrice(newMin);
                            }
                        } else if (
                            minPrice === undefined ||
                            newMax > minPrice
                        ) {
                            setMaxPrice(newMax);
                        }
                    } else {
                        setMinPrice(newMin);
                        setMaxPrice(newMax);
                    }
                }}
                onValueCommit={handleFilter}
                className="relative flex h-4 w-full items-center"
            >
                <Slider.Track className="relative h-1 grow rounded-full bg-gray-200">
                    <Slider.Range className="absolute h-full rounded-full bg-gray-800" />
                </Slider.Track>
                {(["from", "to"] as const).map((s) => (
                    <Slider.Thumb
                        key={s}
                        onPointerUp={() => {
                            thumbRef.current = null;
                        }}
                        onPointerDown={() => {
                            thumbRef.current = s;
                        }}
                        className={cn(
                            "block h-4 w-4 cursor-grab rounded-full bg-gray-800 shadow-md",
                            "focus-visible:outline-hidden",
                        )}
                    />
                ))}
            </Slider.Root>
            <div className="flex items-center gap-4">
                <div className="flex shrink items-center gap-1 rounded-full border border-line-subtle bg-gray-100 px-4">
                    <VisuallyHidden.Root asChild>
                        <label htmlFor="minPrice" aria-label="Min price">
                            Min price
                        </label>
                    </VisuallyHidden.Root>
                    <span>$</span>
                    <Input
                        variant="ghost"
                        name="minPrice"
                        type="number"
                        value={minPrice ?? ""}
                        min={minVariantPrice}
                        placeholder={minVariantPrice.toString()}
                        onChange={(e) => {
                            const { value } = e.target;
                            const newMinPrice = Number.isNaN(
                                Number.parseFloat(value),
                            )
                                ? undefined
                                : Number.parseFloat(value);
                            setMinPrice(newMinPrice);
                        }}
                        onBlur={handleFilter}
                        className="py-3 text-right"
                    />
                </div>
                <span>To</span>
                <div className="flex items-center gap-1 rounded-full border border-line-subtle bg-gray-100 px-4">
                    <VisuallyHidden.Root asChild>
                        <label htmlFor="maxPrice" aria-label="Max price">
                            Max price
                        </label>
                    </VisuallyHidden.Root>
                    <span>$</span>
                    <Input
                        variant="ghost"
                        name="maxPrice"
                        type="number"
                        value={maxPrice ?? ""}
                        max={maxVariantPrice}
                        placeholder={maxVariantPrice.toString()}
                        onChange={(e) => {
                            const { value } = e.target;
                            const newMaxPrice = Number.isNaN(
                                Number.parseFloat(value),
                            )
                                ? undefined
                                : Number.parseFloat(value);
                            setMaxPrice(newMaxPrice);
                        }}
                        onBlur={handleFilter}
                        className="py-3 text-right"
                    />
                </div>
            </div>
        </div>
    );
}

function getPricesFromFilter(params: URLSearchParams) {
    const priceFilter = params.get(`${FILTER_URL_PREFIX}price`);
    const price = priceFilter
        ? (JSON.parse(priceFilter) as ProductFilter["price"])
        : undefined;
    const min = Number.isNaN(Number(price?.min))
        ? undefined
        : Number(price?.min);
    const max = Number.isNaN(Number(price?.max))
        ? undefined
        : Number(price?.max);
    return { min, max };
}
