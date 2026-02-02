/**
 * Base class for processing form submissions
 * Handles the pipeline: extract → transform → validate → prepare → submit
 */
export class FormProcessor {
    constructor(adapter, config) {
        this.adapter = adapter;
        this.config = config;
    }

    /**
     * Process form submission
     * @param {Actor} actor - The actor being updated
     * @param {Object} formData - Raw form data from Foundry
     * @returns {Promise<boolean>} True if update was successful
     */
    async process(actor, formData) {
        // 1. Extract data
        const data = this.extractData(formData);
        console.debug("[QMMS] [FormProcessor] Extracted data:", data);

        // 2. Transform data (for system-specific transformations)
        const transformed = await this.transformData(data, actor);
        console.debug("[QMMS] [FormProcessor] Transformed data");

        // 3. Validate data
        const validation = this.validateData(transformed);
        console.debug("[QMMS] [FormProcessor] Validation result:", validation);

        if (!validation.valid) {
            this.handleValidationErrors(validation.errors);
            return false;
        }

        // 4. Prepare update data
        const updateData = this.prepareUpdateData(transformed);
        console.debug("[QMMS] [FormProcessor] Prepared update data:", updateData);

        if (!Object.keys(updateData).length) {
            console.debug("[QMMS] [FormProcessor] No changes to save");
            return false;
        }

        // 5. Submit update
        await this.submitUpdate(actor, updateData);
        console.debug("[QMMS] [FormProcessor] Update submitted successfully");

        return true;
    }

    /**
     * Extract data from FormData object
     * @param {Object} formData - Raw FormData from Foundry
     * @returns {Object} Extracted data object
     */
    extractData(formData) {
        return formData?.object ?? formData;
    }

    /**
     * Transform data (override in subclass for system-specific transformations)
     * @param {Object} data - Extracted form data
     * @param {Actor} actor - The actor being updated
     * @returns {Promise<Object>} Transformed data
     */
    async transformData(data, actor) {
        return data;
    }

    /**
     * Validate data using adapter
     * @param {Object} data - Data to validate
     * @returns {Object} { valid: boolean, errors: Array<string> }
     */
    validateData(data) {
        return this.adapter.validateFormData(data);
    }

    /**
     * Handle validation errors
     * @param {Array<string>} errors - Validation error messages
     */
    handleValidationErrors(errors) {
        console.error("[FormProcessor] Validation failed:", errors);
        ui.notifications?.error(`Invalid data: ${errors.join(", ")}`);
    }

    /**
     * Prepare update data using adapter
     * @param {Object} data - Validated data
     * @returns {Object} Update data for actor.update()
     */
    prepareUpdateData(data) {
        return this.adapter.prepareUpdateData(data);
    }

    /**
     * Submit update to actor
     * @param {Actor} actor - The actor to update
     * @param {Object} updateData - Data to update
     * @returns {Promise<void>}
     */
    async submitUpdate(actor, updateData) {
        console.log("[FormProcessor] Actor before:", actor.name);

        try {
            await actor.update(updateData);
            console.log("[FormProcessor] Actor after:", actor.name);
        } catch (err) {
            console.error("[FormProcessor] Update failed:", err);
            if (game.user.isGM) {
                ui.notifications.error("Actor update failed: " + err.message);
            }
        }
    }
}
