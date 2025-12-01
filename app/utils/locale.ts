import type { I18nBase } from "@shopify/hydrogen";

export function getWeaverseLocale(i18n: I18nBase): string {
    return `${i18n.language.toLowerCase()}-${i18n.country.toUpperCase()}`;
}
