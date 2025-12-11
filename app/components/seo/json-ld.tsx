import type { Thing, WithContext } from "schema-dts";

export function JsonLd<T extends Thing>({
    data,
    id,
}: {
    data: WithContext<T> | T | (WithContext<T> | T)[];
    id?: string;
}) {
    if (!data) {
        return null;
    }

    const dataArray = Array.isArray(data) ? data : [data];

    return (
        <>
            {dataArray.map((item, index) => {
                if (typeof item !== "object" || item === null) {
                    return null;
                }
                return (
                    <script
                        key={index}
                        type="application/ld+json"
                        id={id ? `${id}-${index}` : undefined}
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(
                                {
                                    "@context": "https://schema.org",
                                    ...item,
                                },
                                null,
                                2,
                            ),
                        }}
                    />
                );
            })}
        </>
    );
}
