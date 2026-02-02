import { AdapterFactory } from "./adapters/adapter-factory.mjs";
import { QMMSBaseSheet } from "./core/qmms-base-sheet.mjs";

/**
 * Factory for creating QMMS sheet class
 * Now just a thin wrapper around QMMSBaseSheet
 */
export function createQuickMinimalMonsterSheetClass({
    moduleId = "quick-minimal-monster-sheet-for-5e",
    templatePath = "modules/quick-minimal-monster-sheet-for-5e/templates/qmms-monster-sheet.hbs",
    config = null
} = {}) {
    const ActorSheetV2 = foundry?.applications?.sheets?.ActorSheetV2;
    const HandlebarsApplicationMixin = foundry?.applications?.api?.HandlebarsApplicationMixin;

    if (!ActorSheetV2) throw new Error(`${moduleId} | ActorSheetV2 not available. Create the class after Hooks.once("ready").`);
    if (!HandlebarsApplicationMixin) throw new Error(`${moduleId} | HandlebarsApplicationMixin not available. Create the class after Hooks.once("ready").`);
    if (!config) throw new Error(`${moduleId} | config is required`);

    // Create sheet using QMMSBaseSheet factory
    return QMMSBaseSheet.create({
        config,
        templatePath,
        moduleId
    });
}