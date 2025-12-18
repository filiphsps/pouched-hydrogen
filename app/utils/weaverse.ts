// Basic implementation of Weaverse's internal data resolution logic
// Adapted to work with the Footer's theme settings requirement.

/**
 * Known Weaverse props that should not be passed to DOM elements.
 * These are custom props that Weaverse passes to components for configuration,
 * but they cause React warnings if spread onto HTML elements.
 */
const WEAVERSE_NON_DOM_PROPS = new Set([
    "maxDays",
    "minDays",
    "cutoffHour",
    "freeShippingThreshold",
    "loaderData",
    "weaverseData",
]);

/**
 * Filters props to only include DOM-safe attributes.
 * Keeps: standard HTML attributes, data-* attributes, aria-* attributes, event handlers.
 * Removes: custom Weaverse props that would cause React hydration warnings.
 *
 * @param props - The props object to filter
 * @returns A new object containing only DOM-safe props
 */
export function filterDOMProps<T extends Record<string, unknown>>(
    props: T,
): Partial<T> {
    const filtered: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(props)) {
        // Skip known Weaverse non-DOM props
        if (WEAVERSE_NON_DOM_PROPS.has(key)) {
            continue;
        }

        // Keep data-* and aria-* attributes
        if (key.startsWith("data-") || key.startsWith("aria-")) {
            filtered[key] = value;
            continue;
        }

        // Keep event handlers (on*)
        if (key.startsWith("on") && typeof value === "function") {
            filtered[key] = value;
            continue;
        }

        // Keep standard DOM props
        if (isDOMProp(key)) {
            filtered[key] = value;
        }
    }

    return filtered as Partial<T>;
}

/**
 * Checks if a prop name is a valid DOM attribute.
 */
function isDOMProp(name: string): boolean {
    const domProps = new Set([
        "className",
        "style",
        "id",
        "ref",
        "key",
        "children",
        "dangerouslySetInnerHTML",
        "suppressHydrationWarning",
        "suppressContentEditableWarning",
        // Common HTML attributes
        "title",
        "lang",
        "dir",
        "hidden",
        "tabIndex",
        "accessKey",
        "draggable",
        "spellCheck",
        "contentEditable",
        "role",
        // Form attributes
        "name",
        "value",
        "defaultValue",
        "checked",
        "defaultChecked",
        "disabled",
        "readOnly",
        "required",
        "placeholder",
        "autoComplete",
        "autoFocus",
        "form",
        "formAction",
        "formMethod",
        "formTarget",
        "formNoValidate",
        "formEncType",
        "maxLength",
        "minLength",
        "pattern",
        "size",
        "min",
        "max",
        "step",
        "multiple",
        "accept",
        "list",
        // Link/media attributes
        "href",
        "target",
        "rel",
        "download",
        "src",
        "srcSet",
        "sizes",
        "alt",
        "width",
        "height",
        "loading",
        "decoding",
        "crossOrigin",
        "referrerPolicy",
        "type",
        "media",
        "poster",
        "preload",
        "controls",
        "autoPlay",
        "loop",
        "muted",
        "playsInline",
        // Table attributes
        "colSpan",
        "rowSpan",
        "headers",
        "scope",
        // Other common attributes
        "htmlFor",
        "open",
        "cite",
        "dateTime",
        "high",
        "low",
        "optimum",
        "coords",
        "shape",
        "usemap",
        "sandbox",
        "allow",
        "allowFullScreen",
        "seamless",
        "scrolling",
        "marginWidth",
        "marginHeight",
        "frameBorder",
    ]);

    return domProps.has(name);
}

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
