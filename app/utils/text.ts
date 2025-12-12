export type TextEndingMode = "as_is" | "force_punctuation" | "remove_period";

/**
 * Normalizes the ending of a text string based on the specified mode.
 *
 * @param text The text to normalize
 * @param mode The normalization mode ("as_is", "force_punctuation", "remove_period")
 * @param preferredEnding The character to append when mode is "force_punctuation" (default: ".")
 * @returns The normalized text
 */
export function normalizeTextEnding(
    text: string | null | undefined,
    mode: TextEndingMode = "as_is",
    preferredEnding = ".",
): string | undefined {
    if (!text) return undefined;

    const trimmed = text.trim();
    if (!trimmed) return undefined;

    // Common ending punctuation
    const endings = [".", "!", "?"];
    const hasEnding = endings.some((char) => trimmed.endsWith(char));

    switch (mode) {
        case "force_punctuation":
            if (hasEnding) return trimmed;
            return `${trimmed}${preferredEnding}`;

        case "remove_period":
            if (trimmed.endsWith(".")) {
                return trimmed.slice(0, -1);
            }
            return trimmed;
        default:
            return trimmed;
    }
}
