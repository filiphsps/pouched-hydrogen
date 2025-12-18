import { Image } from "@shopify/hydrogen";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { cn } from "~/utils/cn";
import { isLightColor, isValidColor } from "~/utils/misc";

/**
 * Configure how different product option types are rendered by adding the option name to the appropriate array:
 * - OPTIONS_AS_SWATCH: Renders as color swatches (circular buttons with image/color)
 * - OPTIONS_AS_BUTTON: Renders as rectangular buttons
 * - OPTIONS_AS_IMAGE: Renders as image thumbnails
 * - OPTIONS_AS_DROPDOWN: Renders as a dropdown select menu
 *
 * If an option name is not found in any of these arrays, it will render with the default UI (underlined links).
 */
export const OPTIONS_AS_SWATCH: string[] = [
    "Color",
    "Colors",
    "Colour",
    "Colours",
];
export const OPTIONS_AS_BUTTON: string[] = ["Size"];
export const OPTIONS_AS_IMAGE: string[] = [];
export const OPTIONS_AS_DROPDOWN: string[] = [];

/** Display type for option values */
export type OptionDisplayType =
    | "swatch"
    | "button"
    | "image"
    | "dropdown"
    | "default";

/**
 * Determines the display type for a given option name based on configuration arrays.
 * @param optionName - The name of the product option (e.g., "Color", "Size")
 * @returns The display type to use for rendering
 */
export function getOptionDisplayType(optionName: string): OptionDisplayType {
    if (OPTIONS_AS_SWATCH.includes(optionName)) return "swatch";
    if (OPTIONS_AS_BUTTON.includes(optionName)) return "button";
    if (OPTIONS_AS_IMAGE.includes(optionName)) return "image";
    if (OPTIONS_AS_DROPDOWN.includes(optionName)) return "dropdown";
    return "default";
}

/** Swatch image data structure */
export interface SwatchImage {
    url?: string;
    altText?: string;
}

/** Common props shared between all option value components */
interface BaseOptionProps {
    /** The display name of the option value */
    name: string;
    /** Whether this option is currently selected */
    selected?: boolean;
    /** Whether this option is available for purchase */
    available?: boolean;
    /** Whether the button should be disabled */
    disabled?: boolean;
    /** Click handler */
    onClick: () => void;
    /** Additional CSS classes */
    className?: string;
}

/** Props specific to swatch display */
export interface OptionSwatchProps extends BaseOptionProps {
    /** The color value (hex, rgb, or color name) */
    color?: string;
    /** Optional swatch image to display instead of color */
    swatchImage?: SwatchImage | null;
    /** Size variant */
    size?: "sm" | "md";
}

/**
 * Renders a color swatch option as a circular button with color or image.
 * Used for color/colour product options.
 */
export function OptionSwatch({
    name,
    color,
    swatchImage,
    selected = false,
    available = true,
    disabled = false,
    onClick,
    className,
    size = "md",
}: OptionSwatchProps) {
    const swatchColor = color || name;
    const needsBorder = !isValidColor(swatchColor) || isLightColor(swatchColor);

    const sizeClasses =
        size === "sm" ? "h-6 w-6" : "aspect-square size-(--option-swatch-size)";

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "flex overflow-hidden rounded-full outline-1 outline-offset-2 transition-[outline-color]",
                sizeClasses,
                disabled && "cursor-not-allowed",
                selected
                    ? "outline-line"
                    : "outline-transparent hover:outline-line",
                !available && "diagonal",
                className,
            )}
        >
            {swatchImage?.url ? (
                <Image
                    data={{
                        url: swatchImage.url,
                        altText: swatchImage.altText,
                    }}
                    className="h-full w-full rounded-full object-cover object-center"
                    width={200}
                    sizes="auto"
                />
            ) : (
                <span
                    className={cn(
                        "block h-full w-full rounded-full text-[0px]",
                        needsBorder && "border border-line",
                    )}
                    style={{ backgroundColor: swatchColor }}
                >
                    {name}
                </span>
            )}
        </button>
    );
}

/** Props specific to button display */
export interface OptionButtonProps extends BaseOptionProps {
    /** Size variant */
    size?: "sm" | "md";
}

/**
 * Renders a text button option with selection state styling.
 * Used for size and other text-based product options.
 */
export function OptionButton({
    name,
    selected = false,
    available = true,
    disabled = false,
    onClick,
    className,
    size = "md",
}: OptionButtonProps) {
    const sizeClasses =
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-4 py-2.5";

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "rounded-full border border-line-subtle text-center transition-colors",
                sizeClasses,
                disabled && "cursor-not-allowed",
                selected
                    ? [
                          available
                              ? "bg-body text-body-inverse"
                              : "text-body-subtle",
                          "border-body",
                      ]
                    : "hover:border-line",
                !available && "diagonal bg-gray-100 text-body-subtle",
                className,
            )}
        >
            {name}
        </button>
    );
}

/** Props for default (underlined) option display */
export interface OptionDefaultProps extends BaseOptionProps {}

/**
 * Renders a default underlined option value.
 * Used as fallback for options not configured in any display type array.
 */
export function OptionDefault({
    name,
    selected = false,
    available = true,
    disabled = false,
    onClick,
    className,
}: OptionDefaultProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "border-b py-0.5",
                disabled && "cursor-not-allowed",
                selected
                    ? [available ? "border-line" : "border-line-subtle"]
                    : [
                          "border-transparent",
                          available
                              ? "hover:border-line"
                              : "hover:border-line-subtle",
                      ],
                !available && "text-body-subtle line-through",
                className,
            )}
        >
            {name}
        </button>
    );
}

/** Props for the unified OptionValue component */
export interface OptionValueProps extends BaseOptionProps {
    /** The option name to determine display type (e.g., "Color", "Size") */
    optionName: string;
    /** Color value for swatch display */
    color?: string;
    /** Swatch image for swatch display */
    swatchImage?: SwatchImage | null;
    /** Size variant */
    size?: "sm" | "md";
}

/**
 * Unified option value component that automatically renders the appropriate
 * display type based on the option name configuration.
 */
export function OptionValue({
    optionName,
    name,
    color,
    swatchImage,
    selected = false,
    available = true,
    disabled = false,
    onClick,
    className,
    size = "md",
}: OptionValueProps) {
    const displayType = getOptionDisplayType(optionName);

    switch (displayType) {
        case "swatch":
            return (
                <OptionSwatch
                    name={name}
                    color={color}
                    swatchImage={swatchImage}
                    selected={selected}
                    available={available}
                    disabled={disabled}
                    onClick={onClick}
                    className={className}
                    size={size}
                />
            );
        case "button":
            return (
                <OptionButton
                    name={name}
                    selected={selected}
                    available={available}
                    disabled={disabled}
                    onClick={onClick}
                    className={className}
                    size={size}
                />
            );
        default:
            return (
                <OptionDefault
                    name={name}
                    selected={selected}
                    available={available}
                    disabled={disabled}
                    onClick={onClick}
                    className={className}
                />
            );
    }
}

/**
 * Normalized option value data structure.
 * This interface abstracts the common properties needed to render an option value,
 * allowing both ProductOptionValues and ProductCardOptions to share rendering logic.
 */
export interface NormalizedOptionValue {
    /** The display name of the option value */
    name: string;
    /** Whether this option is currently selected */
    selected: boolean;
    /** Whether this option is available for purchase (in stock) */
    available: boolean;
    /** Whether this option combination exists (for variant matrix) */
    exists: boolean;
    /** Color value for swatch display */
    color?: string;
    /** Swatch image data */
    swatchImage?: SwatchImage | null;
    /** Tooltip text to display (defaults to name if not provided) */
    tooltipText?: string;
}

/** Props for OptionValueList component */
export interface OptionValueListProps {
    /** The option name to determine display type (e.g., "Color", "Size") */
    optionName: string;
    /** List of normalized option values to render */
    values: NormalizedOptionValue[];
    /** Click handler called with the option value name when clicked */
    onSelect: (valueName: string) => void;
    /** Size variant for the option buttons/swatches */
    size?: "sm" | "md";
    /** Whether to show tooltips on hover */
    showTooltips?: boolean;
    /** Additional CSS classes for the container */
    className?: string;
}

/**
 * Renders a list of option values as swatches, buttons, or default style
 * based on the option name configuration. This is the unified abstraction
 * used by both ProductOptionValues (PDP) and ProductCardOptions (cards).
 */
export function OptionValueList({
    optionName,
    values,
    onSelect,
    size = "md",
    showTooltips = true,
    className,
}: OptionValueListProps) {
    const displayType = getOptionDisplayType(optionName);
    const isSwatch = displayType === "swatch";

    return (
        <div
            className={cn(
                "flex flex-wrap gap-3",
                isSwatch && size === "md" && "pt-0.5",
                size === "sm" && "gap-2",
                className,
            )}
        >
            {values.map((value) => {
                const tooltipText =
                    value.tooltipText ||
                    (value.exists
                        ? value.name
                        : `${value.name} (Not available)`);

                const optionElement = (
                    <OptionValue
                        optionName={optionName}
                        name={value.name}
                        color={value.color}
                        swatchImage={value.swatchImage}
                        selected={value.selected}
                        available={value.available}
                        disabled={!value.exists}
                        onClick={() => onSelect(value.name)}
                        size={size}
                    />
                );

                if (!showTooltips) {
                    return (
                        <div key={value.name} className="inline-flex">
                            {optionElement}
                        </div>
                    );
                }

                return (
                    <Tooltip key={value.name}>
                        <TooltipTrigger asChild>
                            <div>{optionElement}</div>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={size === "sm" ? 8 : 6}>
                            {tooltipText}
                        </TooltipContent>
                    </Tooltip>
                );
            })}
        </div>
    );
}
