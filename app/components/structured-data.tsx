interface StructuredDataProps {
    schema: object | object[];
}

export function StructuredData({ schema }: StructuredDataProps) {
    const schemaArray = Array.isArray(schema) ? schema : [schema];

    return (
        <>
            {schemaArray.map((s, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(s, null, 0),
                    }}
                />
            ))}
        </>
    );
}
