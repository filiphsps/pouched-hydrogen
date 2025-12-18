import { useThemeSettings } from "@weaverse/hydrogen";
import type {
    ProductCardFragment,
    ProductVariantFragment,
} from "storefront-api.generated";
import { Link } from "~/components/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { cn } from "~/utils/cn";
import {
    getOptionDisplayType,
    OptionButton,
    OptionSwatch,
} from "./option-value";

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

    const displayType = getOptionDisplayType(pcardOptionToShow);
    const isSwatch = displayType === "swatch";

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            {optionValues
                .slice(0, pcardMaxOptionValues)
                .map(({ name, swatch, firstSelectableVariant }) => {
                    const isSelected = selectedValue === name;
                    const handleClick = () => {
                        if (!firstSelectableVariant) return;
                        setSelectedVariant(firstSelectableVariant);
                    };

                    if (isSwatch) {
                        return (
                            <Tooltip key={name}>
                                <TooltipTrigger asChild>
                                    <div>
                                        <OptionSwatch
                                            name={name}
                                            color={swatch?.color}
                                            swatchImage={
                                                swatch?.image?.previewImage
                                                    ? {
                                                          url: swatch.image
                                                              .previewImage.url,
                                                          altText:
                                                              swatch.image
                                                                  .previewImage
                                                                  .altText,
                                                      }
                                                    : undefined
                                            }
                                            selected={isSelected}
                                            onClick={handleClick}
                                            size="sm"
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={8}>
                                    {name}
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return (
                        <OptionButton
                            key={name}
                            name={name}
                            selected={isSelected}
                            onClick={handleClick}
                            size="sm"
                        />
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
