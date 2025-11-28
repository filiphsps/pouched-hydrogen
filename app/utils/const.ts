import type { I18nLocale, Localizations } from "~/types/others";

export const COUNTRIES: Localizations = {
  default: {
    label: "Deutschland (EUR €)",
    language: "DE",
    country: "DE",
    currency: "EUR",
  },
  "/en-de": {
    label: "Germany (EUR €)",
    language: "EN",
    country: "DE",
    currency: "EUR",
  },
};

export const DEFAULT_LOCALE: I18nLocale = Object.freeze({
  ...COUNTRIES.default,
  pathPrefix: "",
});

export const FILTER_URL_PREFIX = "filter.";
