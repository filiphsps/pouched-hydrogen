// Translation lookup for common test keys
const translations: Record<string, string> = {
    // Country picker UI strings
    "countryPicker.placeholder": "Select country",
    "countryPicker.searchPlaceholder": "Search countries...",
    "countryPicker.noResults": "No countries found",
    "countryPicker.ariaLabel": "Select country",
    // Common countries used in tests
    "countries.DE": "Germany",
    "countries.AT": "Austria",
    "countries.CH": "Switzerland",
    "countries.FR": "France",
    "countries.GB": "United Kingdom",
    "countries.US": "United States",
    "countries.IT": "Italy",
    "countries.ES": "Spain",
    "countries.NL": "Netherlands",
    "countries.BE": "Belgium",
    "countries.PL": "Poland",
    "countries.SE": "Sweden",
};

export const useTranslation = () => ({
    t: (key: string) => translations[key] ?? key,
    i18n: {
        language: "en",
    },
});

export const initReactI18next = {
    type: "3rdParty",
    init: () => {
        // Mock init
    },
};
