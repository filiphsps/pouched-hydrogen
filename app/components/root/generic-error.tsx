import { useTranslation } from "react-i18next";
import { Link } from "~/components/link";
import { Section } from "~/components/section";
import { Title } from "~/components/title";

export function GenericError({
    error,
}: {
    error?: { message: string; stack?: string };
}) {
    const { t } = useTranslation();
    const heading = t("error.generic.heading");
    let description = t("error.generic.description");

    // TODO hide error in prod?
    if (error) {
        description += `\n${error.message}`;
        console.error(error);
    }

    return (
        <Section
            width="fixed"
            verticalPadding="large"
            containerClassName="space-y-4 flex justify-center items-center flex-col"
        >
            <Title as="h4" size="2xl" className="font-medium">
                {heading}
            </Title>
            <p>{description}</p>
            {error?.stack && (
                <pre
                    style={{
                        padding: "2rem",
                        background: "hsla(10, 50%, 50%, 0.1)",
                        color: "red",
                        overflow: "auto",
                        maxWidth: "100%",
                    }}
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{
                        __html: addLinksToStackTrace(error.stack),
                    }}
                />
            )}
            <Link variant="outline" to="/" className="w-fit rounded-full">
                {t("error.generic.homeButton")}
            </Link>
        </Section>
    );
}

function addLinksToStackTrace(stackTrace: string) {
    return stackTrace?.replace(
        /^\s*at\s?.*?[(\s]((\/|\w:).+)\)\n/gim,
        (all, m1) =>
            all.replace(
                m1,
                `<a href="vscode://file${m1}" class="hover:underline">${m1}</a>`,
            ),
    );
}
