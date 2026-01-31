/**
 * Transform shorthand dice expressions into Foundry inline roll buttons.
 * - Leaves existing [[...]] blocks alone.
 * - Applies long and short shorthand patterns outside of [[...]].
 * @param {string} text
 * @returns {string}
 */
export function transformInlineRollShorthands(text) {
    if (!text || typeof text !== "string") return text;

    // 1. Split on existing [[...]] so we don't touch them
    const parts = [];
    const regex = /\[\[(?:[^\]]|\](?!\]))*?\]\]/g; // matches [[...]] non-greedily
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: "plain", text: text.slice(lastIndex, match.index) });
        }
        parts.push({ type: "inline", text: match[0] });
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
        parts.push({ type: "plain", text: text.slice(lastIndex) });
    }

    // 2. Transform only the plain parts
    const transformed = parts.map(part => {
        if (part.type === "inline") return part.text;
        return transformPlainSegment(part.text);
    });

    return transformed.join("");
}

/**
 * Transform a segment with no existing [[...]].
 * @param {string} segment
 * @returns {string}
 */
export function transformPlainSegment(segment) {
    if (!segment) return segment;

    let result = segment;

    // Long form: {N?}d{F}{op?}{M?}
    // - N: optional digits
    // - F: required digits
    // - op: + or -, no spaces
    // - M: digits
    //
    // We capture:
    //   1: optional leading N (digits)
    //   2: faces F
    //   3: operator + or - (optional)
    //   4: modifier M (optional)
    const dicePattern = /(?<!\w)(\d*)d(\d+)([+-](\d+))?(?!\w)/g;

    result = result.replace(dicePattern, (match, nStr, faces, opMod, modStr) => {
        const n = nStr && nStr.length ? nStr : "1";
        const formula = opMod ? `${n}d${faces}${opMod}` : `${n}d${faces}`;
        return `[[/roll ${formula}]]`;
    });

    // Short form: +M or -M → 1d20+M or 1d20-M
    // Avoid matching things like "++" or "+-" by requiring digits.
    const shortPattern = /(?<![\w\]])([+-])(\d+)(?!\w)/g;

    result = result.replace(shortPattern, (match, sign, num) => {
        // To avoid rewriting part of a larger dice or roll command, re-check context if desired.
        // For now we trust the boundaries from the regex.
        return `[[/roll 1d20${sign}${num}]]`;
    });

    return result;
}
