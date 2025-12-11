import type { InitOptions } from "i18next";
import commonDe from "~/locales/de/common.json";
import commonEn from "~/locales/en/common.json";
import { COUNTRIES } from "~/utils/const";

export default {
    supportedLngs: Object.values(COUNTRIES).map((c) =>
        c.language.toLowerCase(),
    ),
    fallbackLng: COUNTRIES.default.language.toLowerCase(),
    defaultNS: "common",
    react: { useSuspense: true },
    resources: {
        de: { common: commonDe },
        en: { common: commonEn },
    },
} satisfies InitOptions;
