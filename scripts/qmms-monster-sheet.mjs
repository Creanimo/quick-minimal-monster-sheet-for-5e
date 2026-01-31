import {transformInlineRollShorthands} from "./shorthand-processing.mjs";

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

        const biographyRaw = foundry.utils.getProperty(data, "system.details.biography.value");
        if (biographyRaw !== undefined) {
            const transformed = transformInlineRollShorthands(biographyRaw);
            foundry.utils.setProperty(data, "system.details.biography.value", transformed);
        }

        const updateData = {
            "name": foundry.utils.getProperty(data, "name"),
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
            classes: ["sheet", "actor", "qmms5e"],
            tag: "form",
            form: {
                handler: onSubmitForm,
                submitOnChange: false,
                closeOnSubmit: false
            },
            position: {width: 600, height: 800}
        });

        _updateToggleButton(btn, isOpen) {
            btn.classList.toggle("toggled", isOpen);
        }

        async _prepareContext(options) {
            const context = await super._prepareContext(options);

            const actor = this.document;
            const system = actor.system ?? {};

            const actorName = foundry.utils.getProperty(actor, "name");

            const biography =
                foundry.utils.getProperty(system, "details.biography.value") ??
                foundry.utils.getProperty(system, "details.biography") ??
                "";

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

            const currentHp = foundry.utils.getProperty(system, "attributes.hp.value") ?? 0;
            const maxHp = foundry.utils.getProperty(system, "attributes.hp.max") ?? 1;
            const percentageHP = Math.max(
                0,
                Math.min(100, (currentHp / maxHp) * 100)
            );

            context.qmms5e = {
                name: actorName,
                ac: foundry.utils.getProperty(system, "attributes.ac.value") ?? 0,
                hp: {
                    value: currentHp,
                    max: maxHp,
                    percentage: percentageHP,
                },
                cr: foundry.utils.getProperty(system, "details.cr") ?? "",
                biography,
                biographyEnriched
            };

            return context;
        }

        /**
         * @param {string} expr
         */
        evalAddSub(expr) {
            expr = expr.trim();

            if (/^[+-]?\d+(\.\d+)?$/.test(expr)) {
                return Number(expr);
            }

            const terms = expr.match(/[+-]?\d+(\.\d+)?/g);
            if (!terms) throw new Error("Invalid expression: " + expr);

            return terms.reduce((sum, term) => sum + Number(term), 0);
        }

        _onRender(context, options) {
            super._onRender?.(context, options);

            const root = this.element;
            if (!root) return;

            const autosaveSelector = [
                'input[name="name"]',
            ].join(",");

            root.querySelectorAll(autosaveSelector).forEach(input => {
                input.addEventListener("change", () => this.submit());
                input.addEventListener("blur", () => this.submit());
            });

            const autosaveWithMathSelector = [
                'input[name="system.attributes.ac.value"]',
                'input[name="system.attributes.hp.value"]',
                'input[name="system.attributes.hp.max"]',
                'input[name="system.details.cr"]'
            ].join(",");

            root.querySelectorAll(autosaveWithMathSelector).forEach(input => {
                input.addEventListener("change", (event) => {
                    const rawValue = input.value;
                    try {
                        input.value = this.evalAddSub(rawValue);
                    } catch (err) {
                        console.warn(`${moduleId} | Invalid math expression: ${rawValue}`, err);
                    }

                    this.submit();
                });
            });

            const pm = root.querySelector('prose-mirror[name="system.details.biography.value"]');
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

            root.querySelector(".qmms5e__health__bar__fill").style.width = context.qmms5e.hp.percentage + "%";

            console.log(transformInlineRollShorthands("1d6+3"));                    // → "[[/roll 1d6+3]]"
            console.log(transformInlineRollShorthands("+5"));                        // → "[[/roll 1d20+5]]"
            console.log(transformInlineRollShorthands("Hit: 1d20 + 1"));             // → "Hit: [[/roll 1d20]] + 1"
            console.log(transformInlineRollShorthands("[[/roll 1d6]] 2d8-1"));       // → "[[/roll 1d6]] [[/roll 2d8-1]]"
        }
    };
}
