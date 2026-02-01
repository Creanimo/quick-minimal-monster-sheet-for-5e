/**
 * Utility for evaluating simple mathematical expressions
 * Handles addition and subtraction of numbers
 */

/**
 * Evaluate a simple math expression containing addition and subtraction
 * @param {string} expr - Expression like "5+3", "10-2+1", "+5", "-3"
 * @returns {number} The evaluated result
 * @throws {Error} If expression is invalid
 *
 * @example
 * evalAddSub("5+3")      // → 8
 * evalAddSub("10-2")     // → 8
 * evalAddSub("+5")       // → 5
 * evalAddSub("12")       // → 12
 */
export function evalAddSub(expr) {
    if (typeof expr !== "string") {
        throw new Error("Expression must be a string");
    }

    expr = expr.trim();

    // Handle empty string
    if (expr === "") {
        throw new Error("Expression cannot be empty");
    }

    // Check if it's a simple number (no operators)
    if (/^[+-]?\d+(\.\d+)?$/.test(expr)) {
        return Number(expr);
    }

    // Extract all terms (numbers with their signs)
    const terms = expr.match(/[+-]?\d+(\.\d+)?/g);

    if (!terms || terms.length === 0) {
        throw new Error(`Invalid expression: ${expr}`);
    }

    // Sum all terms
    return terms.reduce((sum, term) => sum + Number(term), 0);
}

/**
 * Safely evaluate math expression and return result or original value on error
 * @param {string} expr - Expression to evaluate
 * @param {number} fallback - Value to return if evaluation fails
 * @returns {number} Evaluated result or fallback value
 *
 * @example
 * evalAddSubSafe("5+3", 0)      // → 8
 * evalAddSubSafe("invalid", 0)  // → 0
 */
export function evalAddSubSafe(expr, fallback = 0) {
    try {
        return evalAddSub(expr);
    } catch (err) {
        return fallback;
    }
}

/**
 * Evaluate expression and revert to original on error
 * Perfect for input fields where you want to keep original value if invalid
 *
 * @param {string} expr - Expression to evaluate
 * @param {string|number} originalValue - Value to return on error
 * @returns {number|string} Evaluated result or original value
 */
export function evalAddSubOrRevert(expr, originalValue) {
    try {
        return evalAddSub(expr);
    } catch (err) {
        return originalValue;
    }
}

