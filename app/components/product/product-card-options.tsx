import { useThemeSettings } from "@weaverse/hydrogen";
import type {
    ProductCardFragment,
    ProductVariantFragment,
} from "storefront-api.generated";
import { Link } from "~/components/link";
import { cn } from "~/utils/cn";
import { type NormalizedOptionValue, OptionValueList } from "./option-value";

/**
 * Displays product variant options as swatches or buttons on product cards.
 * Clean minimal design with subtle interactions.
 *
 * Uses the unified OptionValueList component for rendering, providing
 * consistent styling with the PDP variant selector.
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
    const option = options.find(({ name }) => name === pcardOptionToShow);
    const optionValues = option?.optionValues;
    const restCount = (optionValues?.length || 0) - pcardMaxOptionValues;

    if (!(pcardShowOptionValues && optionValues?.length)) {
        return null;
    }

    // Get the currently selected value for this option
    const selectedValue = selectedVariant?.selectedOptions?.find(
        ({ name }) => name === pcardOptionToShow,
    )?.value;

    // Create a lookup map for quick variant access by option value name
    const variantByValueName = new Map<string, ProductVariantFragment>();
    for (const optionValue of optionValues) {
        if (optionValue.firstSelectableVariant) {
            variantByValueName.set(
                optionValue.name,
                optionValue.firstSelectableVariant,
            );
        }
    }

    // Normalize option values for the unified component
    const normalizedValues: NormalizedOptionValue[] = optionValues
        .slice(0, pcardMaxOptionValues)
        .map((optionValue) => ({
            name: optionValue.name,
            selected: selectedValue === optionValue.name,
            available: true, // Product cards always show available variants
            exists: Boolean(optionValue.firstSelectableVariant),
            color: optionValue.swatch?.color ?? undefined,
            swatchImage: optionValue.swatch?.image?.previewImage
                ? {
                      url: optionValue.swatch.image.previewImage.url,
                      altText: optionValue.swatch.image.previewImage.altText,
                  }
                : undefined,
        }));

    /**
     * Handle option value selection.
     * Finds the variant associated with the selected value and updates state.
     */
    const handleSelect = (valueName: string) => {
        const variant = variantByValueName.get(valueName);
        if (variant) {
            setSelectedVariant(variant);
        }
    };

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            <OptionValueList
                optionName={pcardOptionToShow}
                values={normalizedValues}
                onSelect={handleSelect}
                size="sm"
                showTooltips={true}
                className="gap-2"
            />
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
