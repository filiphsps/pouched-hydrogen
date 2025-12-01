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
    react: { useSuspense: false }, // TODO: Figure out why enabling this breaks the entire app.
    resources: {
        de: { common: commonDe },
        en: { common: commonEn },
    },
} satisfies InitOptions;
