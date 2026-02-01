export class BaseAdapter {
    constructor(actor, config) {
        this.actor = actor;
        this.config = config;
        this.paths = config.getFieldPaths();
    }

    // ==================== SEMANTIC READ METHODS ====================

    /**
     * @returns {string} Actor's name
     */
    getName() {
        return foundry.utils.getProperty(this.actor, "name") || "Unknown";
    }

    /**
     * @returns {number} Current health value
     */
    getHealthValue() {
        throw new Error("getHealthValue() must be implemented by subclass");
    }

    /**
     * @returns {number} Maximum health value
     */
    getHealthMax() {
        throw new Error("getHealthMax() must be implemented by subclass");
    }

    /**
     * @returns {number} Defense value (AC, Parry, Defense, etc.)
     */
    getDefenseValue() {
        throw new Error("getDefenseValue() must be implemented by subclass");
    }

    /**
     * @returns {string|number} Difficulty rating (CR, Level, HD, Rank, etc.)
     */
    getDifficultyRating() {
        throw new Error("getDifficultyRating() must be implemented by subclass");
    }

    /**
     * @returns {string} Biography/description text (raw HTML)
     */
    getBiography() {
        throw new Error("getBiography() must be implemented by subclass");
    }

    // ==================== COMPUTED PROPERTIES ====================

    /**
     * @returns {number} Health percentage (0-100)
     */
    getHealthPercentage() {
        const current = this.getHealthValue();
        const max = this.getHealthMax();

        if (max <= 0) return 0;

        return Math.max(0, Math.min(100, (current / max) * 100));
    }

    // ==================== DISPLAY LABELS ====================

    /**
     * @returns {string} Display label for defense (e.g., "AC", "Parry")
     */
    getDefenseLabel() {
        return this.config.getDefenseLabel();
    }

    /**
     * @returns {string} Display label for difficulty (e.g., "CR", "Level")
     */
    getDifficultyLabel() {
        return this.config.getDifficultyLabel();
    }

    /**
     * @returns {string} Display label for health (e.g., "HP", "Health")
     */
    getHealthLabel() {
        return this.config.getHealthLabel();
    }

    // ==================== CONTEXT PREPARATION ====================

    /**
     * Prepare sheet context data with semantic naming
     * @returns {Object} Context object for template rendering
     */
    async prepareSheetContext() {
        return {
            name: this.getName(),
            defense: {
                value: this.getDefenseValue(),
                label: this.getDefenseLabel()
            },
            health: {
                value: this.getHealthValue(),
                max: this.getHealthMax(),
                percentage: this.getHealthPercentage(),
                label: this.getHealthLabel()
            },
            difficulty: {
                value: this.getDifficultyRating(),
                label: this.getDifficultyLabel()
            },
            biography: this.getBiography()
        };
    }

    // ==================== WRITE METHODS ====================

    /**
     * Prepare update data for the actor
     * @param {Object} formData - Raw form data from submission
     * @returns {Object} Update data in format ready for actor.update()
     */
    prepareUpdateData(formData) {
        throw new Error("prepareUpdateData() must be implemented by subclass");
    }

    /**
     * Validate form data before applying updates
     * @param {Object} formData - Raw form data
     * @returns {Object} { valid: boolean, errors: Array<string> }
     */
    validateFormData(formData) {
        const errors = [];

        const health = foundry.utils.getProperty(formData, this.paths.healthValue);
        const healthMax = foundry.utils.getProperty(formData, this.paths.healthMax);

        if (health !== undefined && isNaN(Number(health))) {
            errors.push(`${this.getHealthLabel()} value must be a number`);
        }

        if (healthMax !== undefined && isNaN(Number(healthMax))) {
            errors.push(`${this.getHealthLabel()} max must be a number`);
        }

        if (healthMax !== undefined && Number(healthMax) < 0) {
            errors.push(`${this.getHealthLabel()} max cannot be negative`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
