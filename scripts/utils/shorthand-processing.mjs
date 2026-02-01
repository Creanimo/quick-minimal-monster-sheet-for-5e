/**
 * Transform shorthand dice expressions into Foundry inline roll buttons.
 * - Leaves existing [[...]] blocks alone.
 * - Applies long and short shorthand patterns outside of [[...]].
 *
 * @param {string} text - Text containing potential roll shorthands
 * @returns {string} Text with shorthands converted to [[/roll ...]] format
 *
 * @example
 * transformInlineRollShorthands("1d6+3")           // → "[[/roll 1d6+3]]"
 * transformInlineRollShorthands("+5")              // → "[[/roll 1d20+5]]"
 * transformInlineRollShorthands("Hit: 1d20 + 1")   // → "Hit: [[/roll 1d20]] + 1"
 * transformInlineRollShorthands("[[/roll 1d6]]")   // → "[[/roll 1d6]]" (unchanged)
 * transformInlineRollShorthands("2d8-1")           // → "[[/roll 2d8-1]]"
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
 * Applies two patterns:
 * 1. Dice notation: XdY±Z → [[/roll XdY±Z]]
 * 2. Short modifier: ±N → [[/roll 1d20±N]]
 *
 * @param {string} segment - Plain text segment without existing [[...]] blocks
 * @returns {string} Transformed segment with roll syntax
 *
 * @example
 * transformPlainSegment("damage 2d6+3")  // → "damage [[/roll 2d6+3]]"
 * transformPlainSegment("attack +5")     // → "attack [[/roll 1d20+5]]"
 */
export function transformPlainSegment(segment) {
    if (!segment) return segment;

    let result = segment;

    // Pattern 1: Standard dice notation (XdY±Z)
    const dicePattern = /(?<!\w)(\d*)d(\d+)([+-]\d+)?(?!\w)/g;
    result = result.replace(dicePattern, (match, nStr, faces, opMod) => {
        const n = nStr || "1";
        const formula = opMod ? `${n}d${faces}${opMod}` : `${n}d${faces}`;
        return `[[/roll ${formula}]]`;
    });

    // Pattern 2: Short modifier notation (±N → 1d20±N)
    // Negative lookbehind: not after `d\d+` (dice faces) or word char or ]
    const shortPattern = /(?<!d\d)(?<![\w\]])([+-])(\d+)(?!\w)/g;
    result = result.replace(shortPattern, (match, sign, num) => {
        return `[[/roll 1d20${sign}${num}]]`;
    });

    return result;
}