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
    const regex = /\[\[(?:[^\]]|\](?!\]))*?\]\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({type: "plain", text: text.slice(lastIndex, match.index)});
        }
        parts.push({type: "inline", text: match[0]});
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
        parts.push({type: "plain", text: text.slice(lastIndex)});
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

    const dicePattern = /(?<!\w)(\d*)d(\d+)([+-]\d+)?(?!\w)/g;
    result = result.replace(dicePattern, (match, nStr, faces, opMod) => {
        const n = nStr || "1";
        const formula = opMod ? `${n}d${faces}${opMod}` : `${n}d${faces}`;
        return `[[/roll ${formula}]]`;
    });

    // Negative lookbehind: not after `d\d+` (dice faces) or word char or ]
    const shortPattern = /(?<!d\d)(?<![\w\]])([+-])(\d+)(?!\w)/g;
    result = result.replace(shortPattern, (match, sign, num) => {
        return `[[/roll 1d20${sign}${num}]]`;
    });

    return result;
}
