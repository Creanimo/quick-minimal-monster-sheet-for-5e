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
        #bioEditing = false;

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

            const TextEditorImpl = foundry.applications.ux.TextEditor.implementation;

            let biographyEnriched = biography;
            if (!this.#bioEditing) {
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
            }

            context.qmms = {
                ac: foundry.utils.getProperty(system, "attributes.ac.value") ?? 0,
                hp: {
                    value: foundry.utils.getProperty(system, "attributes.hp.value") ?? 0,
                    max: foundry.utils.getProperty(system, "attributes.hp.max") ?? 1
                },
                cr: foundry.utils.getProperty(system, "details.cr") ?? "",

                biography,
                biographyEnriched,

                bioEditing: this.#bioEditing,
                canEdit: context.editable ?? this.isEditable,
            };

            return context;
        }

        _onRender(context, options) {
            super._onRender?.(context, options);

            const root = this.element;
            if (!root) return;

            const autosaveSelector = [
                'input[name="system.attributes.ac.value"]',
                'input[name="system.attributes.hp.value"]',
                'input[name="system.attributes.hp.max"]',
                'input[name="system.details.cr"]'
            ].join(",");

            root.querySelectorAll(autosaveSelector).forEach(el => {
                el.addEventListener("change", () => this.submit());
            });
            const toggle = root.querySelector("[data-action='qmms-toggle-bio']");
            const done = root.querySelector("[data-action='qmms-done-bio']");
            const preview = root.querySelector("[data-action='qmms-edit-bio']");

            const enterEdit = async () => {
                if (!(context?.qmms?.canEdit ?? this.isEditable)) return;
                this.#bioEditing = true;
                await this.render({force: true});
            };

            const exitEdit = async () => {
                // Save changes before leaving edit mode.
                await this.submit(); // ApplicationV2 submit (calls your form handler). [web:195]
                this.#bioEditing = false;
                await this.render({force: true});
            };

            toggle?.addEventListener("click", async (ev) => {
                ev.preventDefault();
                if (this.#bioEditing) await exitEdit();
                else await enterEdit();
            });

            done?.addEventListener("click", async (ev) => {
                ev.preventDefault();
                await exitEdit();
            });

        }
    };
}
