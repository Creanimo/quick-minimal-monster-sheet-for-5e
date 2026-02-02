import {createQuickMinimalMonsterSheetClass} from "./qmms-monster-sheet.mjs";

/**
 * System configuration registry
 * Maps system IDs to their configuration classes and templates
 */
const SYSTEM_CONFIGS = {
    "dnd5e": () => import("./systems/dnd5e.mjs"),
    // "pf2e": () => import("./systems/pf2e.mjs"),
    // "daggerheart": () => import("./systems/daggerheart.mjs"),
};

Hooks.once("ready", () => {
    console.log("Quick Minimal Monster Sheet | ready hook ✅");

    const systemId = game.system.id;

    if (!SYSTEM_CONFIGS[systemId]) {
        console.warn(`QMMS: No configuration for system "${systemId}". Available:`, Object.keys(SYSTEM_CONFIGS));
        return;
    }

    // Load system configuration dynamically
    SYSTEM_CONFIGS[systemId]().then(module => {
        const {QMMSSystemConfig, TEMPLATE_PATH} = module;

        // Create configuration instance
        const config = new QMMSSystemConfig({
            moduleId: "quick-minimal-monster-sheet",
            templatePath: TEMPLATE_PATH
        });

        // Create sheet class
        const QuickMinimalMonsterSheet = createQuickMinimalMonsterSheetClass({
            moduleId: config.getModuleId(),
            templatePath: config.getTemplatePath(),
            config: config
        });

        const ActorsCollection = foundry.documents.collections.Actors;

        // Register sheet using configuration values
        ActorsCollection.registerSheet(
            config.getSystemId(),
            QuickMinimalMonsterSheet,
            {
                types: config.getActorTypes(),
                makeDefault: false,
                label: config.getSheetLabel()
            }
        );

        console.log(`${config.getSheetLabel()} | sheet registered ✅`);
    }).catch(err => {
        console.error(`QMMS: Failed to load config for ${systemId}:`, err);
    });
});
