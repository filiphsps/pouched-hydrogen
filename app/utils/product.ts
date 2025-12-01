import type { MappedProductOptions } from "@shopify/hydrogen";

export function hasOnlyDefaultVariant(
    productOptions: MappedProductOptions[] = [],
) {
    if (productOptions.length === 1) {
        const option = productOptions[0];
        if (option.name === "Title" && option.optionValues.length === 1) {
            const optionValue = option.optionValues[0];
            return optionValue.name === "Default Title";
        }
    }
    return false;
}

export function removeVendorFromTitle(
    title: string,
    vendor: string,
    enabled: boolean = true,
) {
    if (!enabled) return title;

    if (!title || !vendor) return title;
    if (title.startsWith(vendor)) {
        return title.slice(vendor.length).trim();
    }
    return title;
}
