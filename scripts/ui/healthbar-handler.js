import { BaseUIHandler } from './base-handler.mjs';

/**
 * Handles visual health bar updates
 * Updates the width of the health bar based on percentage
 */
export class HealthBarHandler extends BaseUIHandler {
    attach(root, context, sheet) {
        const healthBar = root.querySelector(".qmms5e__health__bar__fill");

        if (!healthBar) {
            console.warn("[HealthBarHandler] Health bar element not found");
            return;
        }

        // Get health percentage from context
        const percentage = context.qmms5e?.hp?.percentage ?? 0;

        console.debug(`[HealthBarHandler] Setting health bar to ${percentage}%`);
        healthBar.style.width = percentage + "%";
    }
}