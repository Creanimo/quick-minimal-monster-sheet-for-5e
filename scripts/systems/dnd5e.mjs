import { QMMSBaseConfig } from '../config/base-config.mjs';

export const TEMPLATE_PATH = "modules/quick-minimal-monster-sheet/templates/qmms-monster-sheet.hbs";

/**
 * D&D 5e system configuration
 */
export class QMMSDnd5eConfig extends QMMSBaseConfig {
    constructor(options = {}) {
        super({
            moduleId: options.moduleId || "quick-minimal-monster-sheet",
            systemId: "dnd5e",
            templatePath: options.templatePath || "modules/quick-minimal-monster-sheet/templates/qmms-monster-sheet.hbs"
        });
    }

    getApplicationOptions() {
        const baseOptions = super.getApplicationOptions();
        return foundry.utils.mergeObject(baseOptions, {
            id: `${this.moduleId}-dnd5e-sheet`,
            classes: [...baseOptions.classes, "qmms5e"]
        });
    }

    getAutoSaveFields() {
        return ['input[name="name"]'];
    }

    getMathEnabledFields() {
        return [
            'input[name="system.attributes.ac.value"]',
            'input[name="system.attributes.hp.value"]',
            'input[name="system.attributes.hp.max"]',
            'input[name="system.details.cr"]'
        ];
    }

    getBiographyFieldName() {
        return "system.details.biography.value";
    }

    getActorTypes() {
        return ["npc"];
    }

    getSheetLabel() {
        return "Quick Minimal Monster Sheet (5e)";
    }

    getDefenseLabel() {
        return "AC";
    }

    getDifficultyLabel() {
        return "CR";
    }

    getHealthLabel() {
        return "HP";
    }

    getFieldPaths() {
        return {
            name: "name",
            defense: "system.attributes.ac.value",
            healthValue: "system.attributes.hp.value",
            healthMax: "system.attributes.hp.max",
            difficulty: "system.details.cr",
            biography: "system.details.biography.value"
        };
    }
}

