import { BaseUIHandler } from './base-handler.mjs';

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

        // Handle editor save event
        this._addEventListener(pm, "save", () => {
            console.log("[EditorHandler] Editor saved");
            sheet.submit({ preventClose: true, preventRender: false });
        });
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