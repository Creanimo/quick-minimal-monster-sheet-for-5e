import {BaseAdapter} from './base-adapter.mjs';

export class Dnd5eAdapter extends BaseAdapter {
    // ==================== SEMANTIC READ METHODS ====================

    getHealthValue() {
        return foundry.utils.getProperty(this.actor, this.paths.healthValue) ?? 0;
    }

    getHealthMax() {
        return foundry.utils.getProperty(this.actor, this.paths.healthMax) ?? 1;
    }

    getDefenseValue() {
        return foundry.utils.getProperty(this.actor, this.paths.defense) ?? 10;
    }

    getDifficultyRating() {
        return foundry.utils.getProperty(this.actor, this.paths.difficulty) ?? 12;
    }

    getBiography() {
        return foundry.utils.getProperty(this.actor, this.paths.biography) ?? "";
    }

    // ==================== WRITE METHODS ====================

    prepareUpdateData(data) {
        const updateData = {
            [this.paths.name]: foundry.utils.getProperty(data, "name"),
            [this.paths.defense]: foundry.utils.getProperty(data, this.paths.defense),
            [this.paths.healthValue]: foundry.utils.getProperty(data, this.paths.healthValue),
            [this.paths.healthMax]: foundry.utils.getProperty(data, this.paths.healthMax),
            [this.paths.difficulty]: foundry.utils.getProperty(data, this.paths.difficulty),
            [this.paths.biography]: foundry.utils.getProperty(data, this.paths.biography)
        };

        for (const [k, v] of Object.entries(updateData)) {
            if (v === undefined) delete updateData[k];
        }

        return updateData;
    }

    validateFormData(formData) {
        const baseValidation = super.validateFormData(formData);
        const errors = [...baseValidation.errors];

        const defense = foundry.utils.getProperty(formData, this.paths.defense);
        if (defense !== undefined && isNaN(Number(defense))) {
            errors.push(`${this.getDefenseLabel()} must be a number`);
        }

        const difficulty = foundry.utils.getProperty(formData, this.paths.difficulty);
        if (difficulty !== undefined && difficulty !== "" && isNaN(Number(difficulty))) {
            errors.push(`${this.getDifficultyLabel()} must be a number or empty`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
