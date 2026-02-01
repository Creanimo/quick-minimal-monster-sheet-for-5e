import { BaseUIHandler } from './base-handler.mjs';
import { evalAddSubSafe } from '../utils/math-evaluator.mjs';

/**
 * Handles math expression evaluation in input fields
 * Evaluates expressions like "5+3" and updates the field value
 */
export class MathInputHandler extends BaseUIHandler {
    attach(root, context, sheet) {
        const fields = this.config.getMathEnabledFields();
        const selector = fields.join(",");

        if (!selector) return;

        const inputs = root.querySelectorAll(selector);
        console.log(`[MathInputHandler] Attached to ${inputs.length} fields`);

        inputs.forEach(input => {
            // Store original value on focus
            this._addEventListener(input, "focus", () => {
                input.dataset.originalValue = input.value;
            });

            // Evaluate math and submit on change
            this._addEventListener(input, "change", () => {
                const rawValue = input.value.trim();
                const originalValue = input.dataset.originalValue || rawValue;

                console.log(`[MathInputHandler] Evaluating:`, rawValue);

                // Try to evaluate math expression
                const result = evalAddSubSafe(rawValue, originalValue);

                // Update input value
                input.value = result;

                // Remove any error styling
                input.classList.remove("invalid");

                console.log(`[MathInputHandler] Result:`, result);
                sheet.submit();
            });
        });
    }
}
