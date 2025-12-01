import { COUNTRIES } from "~/utils/const";

export default {
    supportedLngs: Object.values(COUNTRIES).map((c) =>
        c.language.toLowerCase(),
    ),
    fallbackLng: COUNTRIES.default.language.toLowerCase(),
    defaultNS: "common",
    react: { useSuspense: true },
};
