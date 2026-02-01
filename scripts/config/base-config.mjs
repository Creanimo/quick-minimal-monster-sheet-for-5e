/**
 * Base configuration class for QMMS sheets
 * Override this for each game system
 */
export class QMMSBaseConfig {
    constructor(options = {}) {
        this.moduleId = options.moduleId || "quick-minimal-monster-sheet";
        this.systemId = options.systemId || "unknown";
        this.templatePath = options.templatePath;
    }

    /**
     * @returns {string} The module ID
     */
    getModuleId() {
        return this.moduleId;
    }

    /**
     * @returns {string} The system ID this config is for
     */
    getSystemId() {
        return this.systemId;
    }

    /**
     * @returns {string} Path to the Handlebars template
     */
    getTemplatePath() {
        return this.templatePath;
    }

    /**
     * @returns {Object} ApplicationV2 DEFAULT_OPTIONS overrides
     */
    getApplicationOptions() {
        return {
            classes: ["sheet", "actor", "qmms"],
            tag: "form",
            form: {
                submitOnChange: false,
                closeOnSubmit: false
            },
            position: { width: 600, height: 800 }
        };
    }

    /**
     * @returns {Array<string>} CSS selectors for fields that auto-save on change/blur
     */
    getAutoSaveFields() {
        return ['input[name="name"]'];
    }

    /**
     * @returns {Array<string>} CSS selectors for fields that support math expressions
     */
    getMathEnabledFields() {
        return [];
    }

    /**
     * @returns {boolean} Whether this sheet has a biography/freetext editor
     */
    hasBiographyEditor() {
        return true;
    }

    /**
     * @returns {string|null} Name attribute of the biography field
     */
    getBiographyFieldName() {
        return null; // Override in system-specific config
    }

    /**
     * @returns {Array<string>} Actor types this sheet applies to
     */
    getActorTypes() {
        return ["npc"];
    }

    /**
     * @returns {string} Label shown in sheet selector
     */
    getSheetLabel() {
        return "Quick Minimal Monster Sheet";
    }

    // ==================== DISPLAY LABELS ====================

    /**
     * @returns {string} Display label for defense/armor value
     * Examples: "AC", "Parry", "Defense", "Armor"
     */
    getDefenseLabel() {
        return "Defense";
    }

    /**
     * @returns {string} Display label for difficulty/level/CR
     * Examples: "CR", "Level", "HD", "Rank", "Tier"
     */
    getDifficultyLabel() {
        return "Difficulty";
    }

    /**
     * @returns {string} Display label for health/hit points
     * Examples: "HP", "Health", "Wounds", "Vitality"
     */
    getHealthLabel() {
        return "HP";
    }

    // ==================== DATA FIELD PATHS ====================

    /**
     * Semantic field paths - override in system-specific configs
     * Maps generic concepts to system-specific data paths
     *
     * @returns {Object} Field path mappings
     */
    getFieldPaths() {
        return {
            name: "name",
            defense: null,        // System-specific: AC, Parry, Defense, etc.
            healthValue: null,    // System-specific: hp.value, health.value, etc.
            healthMax: null,      // System-specific: hp.max, health.max, etc.
            difficulty: null,     // System-specific: CR, Level, HD, Rank, etc.
            biography: null       // System-specific: biography, description, etc.
        };
    }
}
