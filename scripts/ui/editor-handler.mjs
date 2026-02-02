import {BaseUIHandler} from './base-handler.mjs';

/**
 * Handles ProseMirror editor integration
 * Manages toggle button and editor save events
 */
export class EditorHandler extends BaseUIHandler {
    attach(root, context, sheet) {
        if (!this.config.hasBiographyEditor()) return;

        const biographyFieldName = this.config.getBiographyFieldName();
        const pm = root.querySelector(`prose-mirror[name="${biographyFieldName}"]`);
        const toggleBtn = root.querySelector('.qmms5e__freetext__edit-toggle');

        if (!pm || !toggleBtn) {
            console.warn("[EditorHandler] ProseMirror or toggle button not found");
            return;
        }

        console.log("[EditorHandler] Attached to ProseMirror editor");

        // Update toggle button state
        this._updateToggleButton(toggleBtn, pm.isOpen);

        // Handle toggle button click
        this._addEventListener(toggleBtn, "click", () => {
            pm.toggleAttribute("open");
        });

        // Handle editor open/close events
        ["open", "close"].forEach(eventType => {
            this._addEventListener(pm, eventType, () => {
                this._updateToggleButton(toggleBtn, pm.isOpen);
            });
        });


        /**
         * Handle editor save event
         */
        this._addEventListener(pm, "save", async () => {
            console.log("[EditorHandler] Editor saved, value:", pm.value);

            // Transform inline rolls directly
            const biographyPath = this.config.getBiographyFieldName();
            const biographyRaw = pm.value;
            const transformed = transformInlineRollShorthands(biographyRaw);

            if (transformed !== biographyRaw) {
                console.log("[EditorHandler] Transforming:", biographyRaw.slice(0, 50), '→', transformed.slice(0, 50));

                // Update actor directly
                await sheet.document.update({
                    [biographyPath]: transformed
                });

                // Trigger re-render to update display
                sheet.render(false);
            } else {
                console.log("[EditorHandler] No transformation needed");
            }
        }, {once: false});
    }

    /**
     * Update toggle button visual state
     * @param {HTMLElement} btn - Toggle button element
     * @param {boolean} isOpen - Whether editor is open
     */
    _updateToggleButton(btn, isOpen) {
        btn.classList.toggle("toggled", isOpen);
    }
}