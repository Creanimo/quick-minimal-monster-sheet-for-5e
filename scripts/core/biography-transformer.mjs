import {transformInlineRollShorthands} from '../utils/shorthand-processing.mjs';

/**
 * Handles transformation of biography text
 * Specifically for inline roll shorthand conversion
 */
export class BiographyTransformer {
    constructor(config) {
        this.config = config;
        this.biographyPath = config.getBiographyFieldName();
    }

    /**
     * Transform biography field in form data
     * @param {Object} data - Form data object (will be mutated)
     * @returns {boolean} True if transformation occurred
     */
    transform(data) {
        console.debug("[BiographyTransformer] Called with data keys:", Object.keys(data));

        const biographyRaw = foundry.utils.getProperty(data, this.biographyPath);

        if (biographyRaw === undefined || biographyRaw === "") {
            console.debug("[BiographyTransformer] No biography field found");
            return false;
        }

        const transformed = transformInlineRollShorthands(biographyRaw);

        if (transformed === biographyRaw) {
            return false;
        }

        // Use the working mutation pattern from original code
        if (data[this.biographyPath] !== undefined) {
            data[this.biographyPath] = transformed;
        } else if (data.system?.details?.biography) {
            data.system.details.biography.value = transformed;
        }

        console.debug("[QMMS] [BiographyTransformer] Transformed inline rolls");
        return true;
    }

    /**
     * Check if biography field has content
     * @param {Object} data - Form data
     * @returns {boolean} True if biography exists and is not empty
     */
    hasBiography(data) {
        const biography = foundry.utils.getProperty(data, this.biographyPath);
        return biography !== undefined && biography !== "";
    }
}
