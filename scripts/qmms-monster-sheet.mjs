export function createQuickMinimalMonsterSheetClass({
                                                        moduleId = "quick-minimal-monster-sheet-for-5e",
                                                        templatePath = "modules/quick-minimal-monster-sheet-for-5e/templates/qmms-monster-sheet.hbs"
                                                    } = {}) {
    const ActorSheetV2 = foundry?.applications?.sheets?.ActorSheetV2;
    const HandlebarsApplicationMixin = foundry?.applications?.api?.HandlebarsApplicationMixin;

    if (!ActorSheetV2) throw new Error(`${moduleId} | ActorSheetV2 not available. Create the class after Hooks.once("ready").`);
    if (!HandlebarsApplicationMixin) throw new Error(`${moduleId} | HandlebarsApplicationMixin not available. Create the class after Hooks.once("ready").`);

    async function onSubmitForm(event, form, formData) {
        const data = formData?.object ?? formData;

        const updateData = {
            "system.attributes.ac.value": foundry.utils.getProperty(data, "system.attributes.ac.value"),
            "system.attributes.hp.value": foundry.utils.getProperty(data, "system.attributes.hp.value"),
            "system.attributes.hp.max": foundry.utils.getProperty(data, "system.attributes.hp.max"),
            "system.details.cr": foundry.utils.getProperty(data, "system.details.cr"),
            "system.details.biography.value": foundry.utils.getProperty(data, "system.details.biography.value")
        };

        for (const [k, v] of Object.entries(updateData)) {
            if (v === undefined) delete updateData[k];
        }
        if (!Object.keys(updateData).length) return;

        await this.document.update(updateData);
    }

    const Base = HandlebarsApplicationMixin(ActorSheetV2);

    return class QuickMinimalMonsterSheet extends Base {
        static PARTS = {
            form: {
                template: templatePath,
                templates: [templatePath],
                root: true
            }
        };

        static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
            id: `${moduleId}-sheet`,
            classes: ["dnd5e", "sheet", "actor", "qmms-sheet"],
            tag: "form",
            form: {
                handler: onSubmitForm,
                submitOnChange: false,
                closeOnSubmit: false
            },
            position: {width: 520, height: 720}
        });

        async _prepareContext(options) {
            const context = await super._prepareContext(options);

            const actor = this.document;
            const system = actor.system ?? {};

            const biography =
                foundry.utils.getProperty(system, "details.biography.value") ??
                foundry.utils.getProperty(system, "details.biography") ??
                "";

            // Enriched preview HTML for inline rolls, links, etc. [web:229]
            const TextEditorImpl = foundry.applications.ux.TextEditor.implementation;

            let biographyEnriched = biography;
            try {
                biographyEnriched = await TextEditorImpl.enrichHTML(biography ?? "", {
                    async: true,
                    documents: true,
                    links: true,
                    rolls: true,
                    rollData: typeof actor.getRollData === "function" ? actor.getRollData() : actor.system
                });
            } catch (err) {
                console.warn(`${moduleId} | Biography enrichment failed`, err);
            }

            context.qmms = {
                ac: foundry.utils.getProperty(system, "attributes.ac.value") ?? 0,
                hp: {
                    value: foundry.utils.getProperty(system, "attributes.hp.value") ?? 0,
                    max: foundry.utils.getProperty(system, "attributes.hp.max") ?? 1
                },
                cr: foundry.utils.getProperty(system, "details.cr") ?? "",
                biography,
                biographyEnriched
            };

            return context;
        }

        _onRender(context, options) {
            super._onRender?.(context, options);

            const root = this.element;
            if (!root) return;

            // Autosave numeric fields
            const autosaveSelector = [
                'input[name="system.attributes.ac.value"]',
                'input[name="system.attributes.hp.value"]',
                'input[name="system.attributes.hp.max"]',
                'input[name="system.details.cr"]'
            ].join(",");

            root.querySelectorAll(autosaveSelector).forEach(el => {
                el.addEventListener("change", () => this.submit());
            });

            // Optional: Save when prose-mirror changes.
            // (Exact event name can vary; if it doesn’t fire, you can just rely on a Done button or manual submit.)
            const pm = root.querySelector('prose-mirror[name="system.details.biography.value"]');
            pm?.addEventListener("change", () => this.submit());
            pm?.addEventListener("input", () => this.submit());
        }
    };
}
