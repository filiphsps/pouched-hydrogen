import type { InitOptions } from "i18next";
import { COUNTRIES } from "~/utils/const";

import commonDe from "../public/locales/de/common.json";
import commonEn from "../public/locales/en/common.json";

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
