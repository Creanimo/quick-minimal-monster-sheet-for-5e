import { FormProcessor } from './form-processor.mjs';
import { BiographyTransformer } from './biography-transformer.mjs';

/**
 * Form processor for QMMS sheets
 * Adds biography transformation to the base processing pipeline
 */
export class QMMSFormProcessor extends FormProcessor {
    constructor(adapter, config) {
        super(adapter, config);
        this.biographyTransformer = new BiographyTransformer(config);
    }
}