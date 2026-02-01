import { BaseUIHandler } from './base-handler.mjs';

/**
 * Handles auto-save behavior for simple input fields
 * Submits form on change or blur
 */
export class AutoSaveHandler extends BaseUIHandler {
    attach(root, context, sheet) {
        const fields = this.config.getAutoSaveFields();
        const selector = fields.join(",");

        if (!selector) return;

        const inputs = root.querySelectorAll(selector);
        console.log(`[AutoSaveHandler] Attached to ${inputs.length} fields`);

        inputs.forEach(input => {
            this._addEventListener(input, "change", () => {
                console.log(`[AutoSaveHandler] Field changed:`, input.name);
                sheet.submit();
            });

            this._addEventListener(input, "blur", () => {
                console.log(`[AutoSaveHandler] Field blurred:`, input.name);
                sheet.submit();
            });
        });
    }
}
