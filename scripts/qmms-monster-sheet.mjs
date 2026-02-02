import {AdapterFactory} from "./adapters/adapter-factory.mjs";
import {QMMSFormProcessor, QMMSContextBuilder} from "./core/index.mjs";
import {
    UIHandlerManager,
    AutosaveHandler,
    MathInputHandler,
    EditorHandler,
    HealthbarHandler
} from "./ui/index.mjs";

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

    // Store config for use in class
    const sheetConfig = config;

    // Create UI handler manager
    const uiManager = new UIHandlerManager();
    uiManager.register(new AutosaveHandler(sheetConfig));
    uiManager.register(new MathInputHandler(sheetConfig));
    uiManager.register(new EditorHandler(sheetConfig));
    uiManager.register(new HealthbarHandler(sheetConfig));

    const Base = HandlebarsApplicationMixin(ActorSheetV2);

    return class QuickMinimalMonsterSheet extends Base {
        static PARTS = {
            form: {
                template: templatePath,
                templates: [templatePath],
                root: true
            }
        };

        static DEFAULT_OPTIONS = foundry.utils.mergeObject(
            super.DEFAULT_OPTIONS,
            foundry.utils.mergeObject(
                sheetConfig.getApplicationOptions(),
                {
                    form: {
                        handler: QuickMinimalMonsterSheet.prototype._onSubmitForm
                    }
                }
            )
        );

        constructor(options) {
            super(options);

            // Re-render on actor updates
            Hooks.on("updateActor", (actor, changes, options, userId) => {
                if (actor === this.document && this.rendered) {
                    this.render(false);
                }
            });
        }

        async close(options) {
            uiManager.detachAll();
            return super.close(options);
        }

        async _prepareContext(options) {
            const context = await super._prepareContext(options);

            console.debug("[QMMS] Preparing context");

            const adapter = AdapterFactory.createAdapter(this.document, sheetConfig);
            const contextBuilder = new QMMSContextBuilder(adapter, sheetConfig);

            return await contextBuilder.build(this.document, context);
        }

        /**
         * Custom form submission handler
         */
        async _onSubmitForm(event, form, formData) {
            console.debug("[QMMS] 📝 Form submitted!");

            // Create adapter and form processor
            const adapter = AdapterFactory.createAdapter(this.document, sheetConfig);
            const processor = new QMMSFormProcessor(adapter, sheetConfig);

            // Process the form submission
            await processor.process(this.document, formData);
        }

        _onRender(context, options) {
            super._onRender?.(context, options);

            const root = this.element;
            if (!root) return;

            // Attach all UI handlers
            uiManager.attachAll(root, context, this);
        }

    };
}
