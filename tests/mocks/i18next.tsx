export const useTranslation = () => ({
    t: (key: string) => key,
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
