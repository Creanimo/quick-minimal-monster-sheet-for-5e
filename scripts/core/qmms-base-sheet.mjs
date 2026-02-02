import { AdapterFactory } from '../adapters/adapter-factory.mjs';
import { QMMSFormProcessor } from './qmms-form-processor.mjs';
import { QMMSContextBuilder } from './qmms-context-builder.mjs';
import { UIHandlerManager,
    AutosaveHandler,
    MathInputHandler,
    EditorHandler,
    HealthbarHandler } from '../ui/index.mjs';

/**
 * Base sheet class for QMMS sheets
 * Orchestrates all the modular components
 */
export class QMMSBaseSheet {
    /**
     * Factory function to create sheet class
     * @param {Object} options - Sheet configuration
     * @param {QMMSBaseConfig} options.config - Sheet configuration
     * @param {string} options.templatePath - Handlebars template path
     * @param {string} options.moduleId - Module ID for logging
     * @returns {class} Sheet class ready for registration
     */
    static create(options) {
        const { config, templatePath, moduleId } = options;

        // Create UI handler manager
        const uiManager = new UIHandlerManager();
        uiManager.register(new AutosaveHandler(config));
        uiManager.register(new MathInputHandler(config));
        uiManager.register(new EditorHandler(config));
        uiManager.register(new HealthbarHandler(config));

        const ActorSheetV2 = foundry?.applications?.sheets?.ActorSheetV2;
        const HandlebarsApplicationMixin = foundry?.applications?.api?.HandlebarsApplicationMixin;

        const Base = HandlebarsApplicationMixin(ActorSheetV2);

        return class QMMSMonsterSheet extends Base {
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
                    config.getApplicationOptions(),
                    {
                        form: {
                            handler: this.prototype._onSubmitForm
                        }
                    }
                )
            );

            constructor(sheetOptions) {
                super(sheetOptions);

                // Store references for instance methods
                this.moduleId = moduleId;
                this.config = config;
                this.uiManager = uiManager;

                // Re-render on actor updates
                Hooks.on("updateActor", (actor, changes, options, userId) => {
                    if (actor === this.document && this.rendered) {
                        this.render(false);
                    }
                });
            }

            /**
             * Custom form submission handler
             */
            async _onSubmitForm(event, form, formData) {
                console.debug(`[QMMS] Form submitted`);

                // Create adapter and form processor
                const adapter = AdapterFactory.createAdapter(this.document, this.config);
                const processor = new QMMSFormProcessor(adapter, this.config);

                // Process the form submission
                await processor.process(this.document, formData);
            }

            /**
             * Prepare rendering context
             */
            async _prepareContext(options) {
                // Get base context from parent
                const context = await super._prepareContext(options);

                console.debug(`[QMMS] Preparing context`);

                // Create adapter and context builder
                const adapter = AdapterFactory.createAdapter(this.document, this.config);
                const contextBuilder = new QMMSContextBuilder(adapter, this.config);

                // Build complete context
                return await contextBuilder.build(this.document, context);
            }

            /**
             * Handle rendering complete
             */
            _onRender(context, options) {
                super._onRender?.(context, options);

                const root = this.element;
                if (!root) return;

                // Attach all UI handlers
                this.uiManager.attachAll(root, context, this);
            }

            /**
             * Cleanup on close
             */
            async close(options) {
                this.uiManager.detachAll();
                return super.close(options);
            }
        };
    }
}
