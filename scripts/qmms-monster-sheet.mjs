import {transformInlineRollShorthands} from "./utils/shorthand-processing.mjs";
import {evalAddSubSafe} from "./utils/math-evaluator.mjs";
import {enrichActorBiography} from "./utils/text-enricher.mjs";
import {AdapterFactory} from "./adapters/adapter-factory.mjs";

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
                        handler: QuickMinimalMonsterSheet.prototype._onSubmitForm  // ← Reference method
                    }
                }
            )
        );

        _updateToggleButton(btn, isOpen) {
            btn.classList.toggle("toggled", isOpen);
        }

        async _prepareContext(options) {
            const context = await super._prepareContext(options);
            const actor = this.document;

            const adapter = AdapterFactory.createAdapter(actor, sheetConfig);
            console.log("[QMMS] Adapter paths:", adapter.paths);
            console.log("[QMMS] Actor system data:", actor.system);
            console.log("[QMMS} Adapter reads:", {
                defense: adapter.getDefenseValue(),
                hpValue: adapter.getHealthValue(),
                hpMax: adapter.getHealthMax()
            });

            // Get data through adapter
            const biography = adapter.getBiography();

            // Enrich biography using utility
            let biographyEnriched = biography;
            try {
                biographyEnriched = await enrichActorBiography(actor, biography);
            } catch (err) {
                console.warn(`${moduleId} | Biography enrichment failed`, err);
            }

            // Use adapter's prepareSheetContext for structured data
            const sheetData = await adapter.prepareSheetContext();

            // Build context with semantic naming
            context.qmms5e = {
                name: sheetData.name,
                defense: sheetData.defense,
                health: sheetData.health,
                difficulty: sheetData.difficulty,
                biography,
                biographyEnriched,
                // Legacy compatibility (can remove once template is updated)
                ac: sheetData.defense.value,
                hp: sheetData.health,
                cr: sheetData.difficulty.value
            };

            return context;
        }

        /**
         * Custom form submission handler
         */
        async _onSubmitForm(event, form, formData) {
            console.log("[QMMS] 📝 Form submitted!");

            const data = formData?.object ?? formData;

            console.log("[QMMS] 🔍 Raw form data:", data);

            // Create adapter for this actor
            const adapter = AdapterFactory.createAdapter(this.document, sheetConfig);

            // Get biography field path from config
            const biographyPath = sheetConfig.getBiographyFieldName();
            const biographyRaw = foundry.utils.getProperty(data, biographyPath);

            console.log("[QMMS] 🔍 Biography raw value:", biographyRaw);

            // Transform inline roll shorthands in biography
            if (biographyRaw !== undefined && biographyRaw !== "") {
                const transformed = transformInlineRollShorthands(biographyRaw);

                if (transformed !== biographyRaw) {
                    foundry.utils.setProperty(data, biographyPath, transformed);
                    console.log("[QMMS] ✅ Inline rolls transformed");
                }
            }

            // Validate data before submission
            const validation = adapter.validateFormData(data);
            console.log("[QMMS] 🔍 Validation result:", validation);

            if (!validation.valid) {
                console.error(`Form validation failed:`, validation.errors);
                ui.notifications?.error(`Invalid data: ${validation.errors.join(", ")}`);
                return;
            }

            // Use adapter to prepare update data
            const updateData = adapter.prepareUpdateData(data);

            console.log("[QMMS] 🔍 Prepared update data:", updateData);

            // Don't update if no data
            if (!Object.keys(updateData).length) {
                console.log("[QMMS] ⚠️ No update data, skipping");
                return;
            }

            console.log("[QMMS] 📤 Calling actor.update");
            await this.document.update(updateData);
            console.log("[QMMS] ✅ Actor updated");
        }

        _onRender(context, options) {
            super._onRender?.(context, options);

            const root = this.element;
            if (!root) return;

            // Auto-save fields (simple fields without math)
            const autosaveFields = sheetConfig.getAutoSaveFields();
            const autosaveSelector = autosaveFields.join(",");

            if (autosaveSelector) {
                root.querySelectorAll(autosaveSelector).forEach(input => {
                    input.addEventListener("change", () => this.submit());
                    input.addEventListener("blur", () => this.submit());
                });
            }

            // Math-enabled fields (fields that support math expressions)
            const mathFields = sheetConfig.getMathEnabledFields();
            const mathFieldSelector = mathFields.join(",");

            console.log("[QMMS] 🔍 Math field selector:", mathFieldSelector);

            if (mathFieldSelector) {
                const foundFields = root.querySelectorAll(mathFieldSelector);
                console.log("[QMMS] 🔍 Found math-enabled fields:", foundFields.length);

                foundFields.forEach(input => {
                    console.log("[QMMS] 🔍 Attaching listeners to:", input.getAttribute('name'));

                    // Store original value on focus
                    input.addEventListener("focus", () => {
                        input.dataset.originalValue = input.value;
                        console.log("[QMMS] 📝 Focused field, stored value:", input.value);
                    });

                    input.addEventListener("change", (event) => {
                        console.log("[QMMS] 🔄 Change event fired!");
                        const rawValue = input.value.trim();
                        const originalValue = input.dataset.originalValue || rawValue;

                        console.log("[QMMS] 🔍 Raw value:", rawValue);
                        console.log("[QMMS] 🔍 Original value:", originalValue);

                        // Try to evaluate math expression
                        const result = evalAddSubSafe(rawValue, originalValue);

                        console.log("[QMMS] 🔍 Evaluated result:", result);

                        // Update input value
                        input.value = result;

                        // Remove any error styling
                        input.classList.remove("invalid");

                        console.log("[QMMS] 📤 Submitting form...");
                        this.submit();
                    });
                });
            }

            // Biography editor (ProseMirror) handling
            if (sheetConfig.hasBiographyEditor()) {
                const biographyFieldName = sheetConfig.getBiographyFieldName();
                const pm = root.querySelector(`prose-mirror[name="${biographyFieldName}"]`);
                const toggleBtn = root.querySelector('.qmms5e__freetext__edit-toggle');

                if (pm && toggleBtn) {
                    this._updateToggleButton(toggleBtn, pm.isOpen);

                    toggleBtn.addEventListener("click", () => {
                        pm.toggleAttribute("open");
                    });

                    ["open", "close"].forEach(eventType => {
                        pm.addEventListener(eventType, () => {
                            this._updateToggleButton(toggleBtn, pm.isOpen);
                        }, {once: false});
                    });

                    pm.addEventListener("save", (event) => {
                        this.submit({preventClose: true, preventRender: false});
                    }, {once: false});
                }
            }

            // Update health bar visual
            const healthBar = root.querySelector(".qmms5e__health__bar__fill");
            if (healthBar) {
                healthBar.style.width = context.qmms5e.hp.percentage + "%";
            }
        }
    };
}
