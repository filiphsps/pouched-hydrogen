/**
 * Country picker component with searchable dropdown.
 *
 * A reusable combobox component for selecting countries with:
 * - Searchable dropdown with type-ahead filtering
 * - Country flags using react-country-flag
 * - Priority countries (DE, AT, CH) shown first
 * - i18n support via translation files
 * - Form integration with hidden input for the selected value
 *
 * @module components/country-picker
 */

import {
    CaretDownIcon,
    CheckIcon,
    MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import * as Popover from "@radix-ui/react-popover";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import { inputVariants } from "~/components/input";
import { cn } from "~/utils/cn";
import type { CountryCode } from "~/utils/countries";
import {
    COUNTRY_CODES,
    isPriorityCountry,
    isValidCountryCode,
    PRIORITY_COUNTRY_CODES,
} from "~/utils/countries";

export interface CountryPickerProps {
    /** The name attribute for the hidden form input */
    name: string;
    /** The HTML id for the component */
    id?: string;
    /** Currently selected country code (ISO 3166-1 alpha-2) */
    value?: string;
    /** Default value when uncontrolled */
    defaultValue?: string;
    /** Called when selection changes */
    onChange?: (countryCode: string) => void;
    /** Placeholder text override (defaults to translation) */
    placeholder?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Additional class name for the trigger button */
    className?: string;
    /** Aria label override (defaults to translation) */
    "aria-label"?: string;
    /** Input variant style */
    variant?: "default" | "outline" | "ghost" | "dialog";
    /** Search placeholder text override (defaults to translation) */
    searchPlaceholder?: string;
    /** No results text override (defaults to translation) */
    noResultsText?: string;
}

/**
 * Country picker with searchable dropdown.
 *
 * @example
 * ```tsx
 * <CountryPicker
 *   name="territoryCode"
 *   defaultValue="DE"
 *   required
 * />
 * ```
 */
export function CountryPicker({
    name,
    id,
    value: controlledValue,
    defaultValue = "",
    onChange,
    placeholder: placeholderProp,
    required = false,
    disabled = false,
    className,
    "aria-label": ariaLabelProp,
    variant = "default",
    searchPlaceholder: searchPlaceholderProp,
    noResultsText: noResultsTextProp,
}: CountryPickerProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [internalValue, setInternalValue] = useState(defaultValue);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    // Use translations with fallback to prop values
    const placeholder = placeholderProp ?? t("countryPicker.placeholder");
    const searchPlaceholder =
        searchPlaceholderProp ?? t("countryPicker.searchPlaceholder");
    const noResultsText = noResultsTextProp ?? t("countryPicker.noResults");
    const ariaLabel = ariaLabelProp ?? t("countryPicker.ariaLabel");

    // Controlled vs uncontrolled
    const isControlled = controlledValue !== undefined;
    const selectedCode = isControlled ? controlledValue : internalValue;

    // Get translated country name
    const getCountryName = useCallback(
        (code: string): string => {
            const translationKey = `countries.${code}`;
            const translated = t(translationKey);
            // If translation returns the key, fall back to the code itself
            return translated === translationKey ? code : translated;
        },
        [t],
    );

    // Get filtered and sorted countries based on search
    const filteredCountries = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim();

        if (!normalizedSearch) {
            // No search - return priority countries first, then others sorted by name
            const priorityCodes = [...PRIORITY_COUNTRY_CODES];
            const otherCodes = COUNTRY_CODES.filter(
                (code) => !isPriorityCountry(code),
            ).sort((a, b) =>
                getCountryName(a).localeCompare(getCountryName(b)),
            );

            return [...priorityCodes, ...otherCodes];
        }

        // Filter by search term (code or name)
        const exactCodeMatch: CountryCode[] = [];
        const nameMatches: CountryCode[] = [];

        for (const code of COUNTRY_CODES) {
            const lowerCode = code.toLowerCase();
            const countryName = getCountryName(code).toLowerCase();

            if (lowerCode === normalizedSearch) {
                exactCodeMatch.push(code);
            } else if (
                countryName.includes(normalizedSearch) ||
                lowerCode.includes(normalizedSearch)
            ) {
                nameMatches.push(code);
            }
        }

        // Sort name matches: priority countries first, then by name
        const sortedNameMatches = nameMatches.sort((a, b) => {
            const aIsPriority = isPriorityCountry(a);
            const bIsPriority = isPriorityCountry(b);

            if (aIsPriority && !bIsPriority) return -1;
            if (!aIsPriority && bIsPriority) return 1;

            return getCountryName(a).localeCompare(getCountryName(b));
        });

        return [...exactCodeMatch, ...sortedNameMatches];
    }, [search, getCountryName]);

    // Reset search and highlighted index when popover opens
    useEffect(() => {
        if (open) {
            setSearch("");
            setHighlightedIndex(0);
            // Focus search input after popover opens
            requestAnimationFrame(() => {
                searchInputRef.current?.focus();
            });
        }
    }, [open]);

    // Handle selection
    const handleSelect = useCallback(
        (code: CountryCode) => {
            if (!isControlled) {
                setInternalValue(code);
            }
            onChange?.(code);
            setOpen(false);
        },
        [isControlled, onChange],
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setHighlightedIndex((prev) =>
                        Math.min(prev + 1, filteredCountries.length - 1),
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (filteredCountries[highlightedIndex]) {
                        handleSelect(filteredCountries[highlightedIndex]);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    setOpen(false);
                    break;
                default:
                    break;
            }
        },
        [filteredCountries, highlightedIndex, handleSelect],
    );

    // Scroll highlighted item into view
    useEffect(() => {
        if (open && listRef.current) {
            const highlightedEl = listRef.current.querySelector(
                `[data-highlighted="true"]`,
            );
            highlightedEl?.scrollIntoView({ block: "nearest" });
        }
    }, [open]);

    // Get selected country name for display
    const selectedCountryName =
        selectedCode && isValidCountryCode(selectedCode)
            ? getCountryName(selectedCode)
            : null;

    return (
        <div className="relative">
            {/* Hidden input for form submission */}
            <input
                type="hidden"
                name={name}
                value={selectedCode}
                required={required}
            />

            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        id={id}
                        disabled={disabled}
                        aria-label={ariaLabel}
                        aria-expanded={open}
                        aria-haspopup="listbox"
                        className={cn(
                            inputVariants({ variant }),
                            "flex cursor-pointer items-center justify-between gap-2 text-left",
                            !selectedCountryName && "text-body-subtle",
                            className,
                        )}
                    >
                        <span className="flex items-center gap-2 truncate">
                            {selectedCountryName ? (
                                <>
                                    <ReactCountryFlag
                                        svg
                                        countryCode={selectedCode}
                                        style={{
                                            width: "20px",
                                            height: "15px",
                                        }}
                                        aria-hidden="true"
                                    />
                                    <span>{selectedCountryName}</span>
                                </>
                            ) : (
                                placeholder
                            )}
                        </span>
                        <CaretDownIcon
                            className={cn(
                                "h-4 w-4 shrink-0 transition-transform",
                                open && "rotate-180",
                            )}
                            aria-hidden="true"
                        />
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] rounded-md border border-border bg-background shadow-lg"
                        sideOffset={4}
                        align="start"
                        onKeyDown={handleKeyDown}
                    >
                        {/* Search input */}
                        <div className="flex items-center gap-2 border-border border-b px-3 py-2">
                            <MagnifyingGlassIcon
                                className="h-4 w-4 shrink-0 text-body-subtle"
                                aria-hidden="true"
                            />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setHighlightedIndex(0);
                                }}
                                placeholder={searchPlaceholder}
                                className="w-full bg-transparent text-sm outline-none placeholder:text-body-subtle"
                                aria-label={searchPlaceholder}
                            />
                        </div>

                        {/* Country list */}
                        <ScrollArea.Root className="h-[min(300px,var(--radix-popover-content-available-height))]">
                            <ScrollArea.Viewport className="h-full w-full">
                                <div
                                    ref={listRef}
                                    className="p-1"
                                    role="listbox"
                                >
                                    {filteredCountries.length === 0 ? (
                                        <div className="px-3 py-6 text-center text-body-subtle text-sm">
                                            {noResultsText}
                                        </div>
                                    ) : (
                                        filteredCountries.map((code, index) => {
                                            const isSelected =
                                                code === selectedCode;
                                            const isHighlighted =
                                                index === highlightedIndex;
                                            const showSeparator =
                                                !search &&
                                                isPriorityCountry(code) &&
                                                index ===
                                                    PRIORITY_COUNTRY_CODES.length -
                                                        1;

                                            return (
                                                <div key={code}>
                                                    <button
                                                        type="button"
                                                        role="option"
                                                        aria-selected={
                                                            isSelected
                                                        }
                                                        data-highlighted={
                                                            isHighlighted
                                                        }
                                                        onClick={() =>
                                                            handleSelect(code)
                                                        }
                                                        onMouseEnter={() =>
                                                            setHighlightedIndex(
                                                                index,
                                                            )
                                                        }
                                                        className={cn(
                                                            "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors",
                                                            isHighlighted &&
                                                                "bg-muted",
                                                            isSelected &&
                                                                "font-medium",
                                                        )}
                                                    >
                                                        <ReactCountryFlag
                                                            svg
                                                            countryCode={code}
                                                            style={{
                                                                width: "20px",
                                                                height: "15px",
                                                            }}
                                                            aria-hidden="true"
                                                        />
                                                        <span className="flex-1 truncate">
                                                            {getCountryName(
                                                                code,
                                                            )}
                                                        </span>
                                                        <span className="text-body-subtle text-xs">
                                                            {code}
                                                        </span>
                                                        {isSelected && (
                                                            <CheckIcon
                                                                className="h-4 w-4 shrink-0 text-primary"
                                                                aria-hidden="true"
                                                            />
                                                        )}
                                                    </button>
                                                    {showSeparator && (
                                                        <div className="my-1 h-px bg-border" />
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea.Viewport>
                            <ScrollArea.Scrollbar
                                className="flex w-2.5 touch-none select-none bg-transparent p-0.5 transition-colors"
                                orientation="vertical"
                            >
                                <ScrollArea.Thumb className="relative flex-1 rounded-full bg-border" />
                            </ScrollArea.Scrollbar>
                        </ScrollArea.Root>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
}

CountryPicker.displayName = "CountryPicker";
