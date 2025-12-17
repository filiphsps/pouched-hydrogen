import { Image } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import type {
    ProductCardFragment,
    ProductVariantFragment,
} from "storefront-api.generated";
import { Link } from "~/components/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { cn } from "~/utils/cn";
import { isLightColor, isValidColor } from "~/utils/misc";
import { OPTIONS_AS_SWATCH } from "./product-option-values";

/**
 * Displays product variant options as swatches or buttons on product cards.
 * Clean minimal design with subtle interactions.
 */
export function ProductCardOptions({
    product,
    selectedVariant,
    setSelectedVariant,
    className,
}: {
    product: ProductCardFragment;
    selectedVariant?: ProductVariantFragment | null;
    setSelectedVariant: (variant: ProductVariantFragment) => void;
    className?: string;
}) {
    const { pcardShowOptionValues, pcardOptionToShow, pcardMaxOptionValues } =
        useThemeSettings();
    const { handle, options } = product;
    const { optionValues } =
        options.find(({ name }) => name === pcardOptionToShow) || {};
    const restCount = (optionValues?.length || 0) - pcardMaxOptionValues;

    if (!(pcardShowOptionValues && optionValues?.length)) {
        return null;
    }

    let selectedValue: string | undefined | null;
    if (selectedVariant) {
        selectedValue = selectedVariant.selectedOptions?.find(
            ({ name }) => name === pcardOptionToShow,
        )?.value;
    }
    const asSwatch = OPTIONS_AS_SWATCH.includes(pcardOptionToShow);

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            {optionValues
                .slice(0, pcardMaxOptionValues)
                .map(({ name, swatch, firstSelectableVariant }) => {
                    if (asSwatch) {
                        const swatchColor = swatch?.color || name;
                        const isSelected = selectedValue === name;
                        return (
                            <Tooltip key={name}>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "relative flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200",
                                            isSelected
                                                ? "ring-2 ring-foreground ring-offset-2"
                                                : "hover:ring-1 hover:ring-line hover:ring-offset-1",
                                        )}
                                        onClick={() => {
                                            if (!firstSelectableVariant) return;
                                            setSelectedVariant(
                                                firstSelectableVariant,
                                            );
                                        }}
                                    >
                                        {swatch?.image?.previewImage ? (
                                            <Image
                                                data={swatch.image.previewImage}
                                                className="h-full w-full rounded-full object-cover object-center"
                                                width={200}
                                                sizes="auto"
                                            />
                                        ) : (
                                            <span
                                                className={cn(
                                                    "inline-block h-full w-full rounded-full text-[0px]",
                                                    (!isValidColor(
                                                        swatchColor,
                                                    ) ||
                                                        isLightColor(
                                                            swatchColor,
                                                        )) &&
                                                        "border border-line-subtle",
                                                )}
                                                style={{
                                                    backgroundColor:
                                                        swatchColor,
                                                }}
                                            >
                                                {name}
                                            </span>
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={8}>
                                    {name}
                                </TooltipContent>
                            </Tooltip>
                        );
                    }
                    return (
                        <button
                            key={name}
                            type="button"
                            className={cn(
                                "rounded-full border px-2.5 py-1 font-medium text-[11px] transition-all duration-200",
                                selectedValue === name
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-line-subtle bg-background text-body hover:border-line",
                            )}
                            onClick={() => {
                                if (!firstSelectableVariant) return;
                                setSelectedVariant(firstSelectableVariant);
                            }}
                        >
                            {name}
                        </button>
                    );
                })}
            {restCount > 0 && (
                <Link
                    to={`/products/${handle}`}
                    className="font-medium text-[11px] text-body-subtle hover:text-foreground"
                >
                    +{restCount}
                </Link>
            )}
        </div>
    );
}
