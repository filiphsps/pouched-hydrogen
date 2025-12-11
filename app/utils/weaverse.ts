// Basic implementation of Weaverse's internal data resolution logic
// Adapted to work with the Footer's theme settings requirement.

const TEMPLATE_REGEX = /\{\{([^}]+)\}\}/g;
const ARRAY_INDEX_REGEX = /^(\w+)\[(\d+)\]$/;

function isSafePropertyName(key: string) {
    const dangerousPatterns = ["__proto__", "constructor", "prototype"];
    return !dangerousPatterns.includes(key);
}

function getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => {
        if (!current || typeof current !== "object") {
            return undefined;
        }

        const arrayMatch = key.match(ARRAY_INDEX_REGEX);
        if (arrayMatch) {
            const [, arrayKey, index] = arrayMatch;
            const arrayObj = current[arrayKey];
            if (Array.isArray(arrayObj)) {
                const indexNum = Number.parseInt(index, 10);
                if (indexNum >= 0 && indexNum < arrayObj.length) {
                    return arrayObj[indexNum];
                }
            }
            return undefined;
        }

        if (!isSafePropertyName(key)) {
            console.warn(`Unsafe property access attempted: ${key}`);
            return undefined;
        }

        return current !== null && key in current ? current[key] : undefined;
    }, obj);
}

export function resolveWeaverseString(
    content: string,
    dataContext: any,
): string {
    if (!dataContext || typeof content !== "string") {
        return content;
    }

    try {
        return content.replace(TEMPLATE_REGEX, (match, path) => {
            const trimmedPath = path.trim();
            // Weaverse context is typically { root: ..., "routes/product": ... }
            // So a path like "root.layout.shop.name" should resolve starting from dataContext.

            // Try direct resolution first (e.g. if path is "root.layout.shop.name")
            const value = getNestedValue(dataContext, trimmedPath);

            if (value !== undefined && value !== null) {
                return String(value);
            }

            // If strict resolution fails, we could try to look into keys of dataContext
            // mimic: resolveDataFromContext(path, dataContext) from Weaverse
            // For now, simple nested lookup from the root of dataContext is usually enough
            // if the user provides full paths like {{root.xyz}}.

            return match;
        });
    } catch (error) {
        console.warn("Error processing data connectors:", error, { content });
        return content;
    }
}
