import { Dnd5eAdapter } from './dnd5e-adapter.mjs';

/**
 * Factory for creating appropriate adapter based on system
 */
export class AdapterFactory {
    /**
     * Create an adapter for the given actor and config
     * @param {Actor} actor - The actor document
     * @param {QMMSBaseConfig} config - The configuration
     * @returns {BaseAdapter} Appropriate adapter instance
     */
    static createAdapter(actor, config) {
        const systemId = config.getSystemId();

        switch (systemId) {
            case "dnd5e":
                return new Dnd5eAdapter(actor, config);

            // Future systems can be added here:
            // case "pf2e":
            //     return new Pf2eAdapter(actor, config);
            // case "ose":
            //     return new OseAdapter(actor, config);

            default:
                throw new Error(`No adapter available for system: ${systemId}`);
        }
    }
}
