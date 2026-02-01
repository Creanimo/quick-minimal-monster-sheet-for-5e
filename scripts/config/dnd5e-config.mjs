import {QMMSBaseConfig} from './base-config.mjs';

export class QMMSDnd5eConfig extends QMMSBaseConfig {
    constructor(options = {}) {
        super({
            moduleId: options.moduleId || "quick-minimal-monster-sheet-for-5e",
            systemId: "dnd5e",
            templatePath: options.templatePath || "modules/quick-minimal-monster-sheet-for-5e/templates/qmms-monster-sheet.hbs"
        });
    }

    getApplicationOptions() {
        const baseOptions = super.getApplicationOptions();
        return foundry.utils.mergeObject(baseOptions, {
            id: `${this.moduleId}-sheet`,
            classes: [...baseOptions.classes, "qmms5e"]
        });
    }

    getAutoSaveFields() {
        return [
            'input[name="name"]'
        ];
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
        return "Quick Minimal Monster Sheet for 5e";
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

    /**
     * Semantic field paths mapped to D&D 5e V13 structure
     */
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
