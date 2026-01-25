// scripts/qmms-monster-sheet.mjs

export function createQuickMinimalMonsterSheetClass({
  moduleId = "quick-minimal-monster-sheet-for-5e",
  templatePath = "modules/quick-minimal-monster-sheet-for-5e/templates/qmms-monster-sheet.hbs"
} = {}) {
  const ActorSheetV2 = foundry?.applications?.sheets?.ActorSheetV2;
  const HandlebarsApplicationMixin = foundry?.applications?.api?.HandlebarsApplicationMixin;

  if (!ActorSheetV2) {
    throw new Error(`${moduleId} | ActorSheetV2 not available. Create the class after Hooks.once("ready").`);
  }
  if (!HandlebarsApplicationMixin) {
    throw new Error(`${moduleId} | HandlebarsApplicationMixin not available. Create the class after Hooks.once("ready").`);
  }

  const Base = HandlebarsApplicationMixin(ActorSheetV2);

  return class QuickMinimalMonsterSheet extends Base {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
      id: `${moduleId}-sheet`,
      classes: ["dnd5e", "sheet", "actor", "qmms-sheet"],

      /**
       * Handlebars template to render.
       */
      template: templatePath,

      /**
       * Tell ApplicationV2 that this is a form-driven sheet and how to handle submits.
       * (This is the missing piece when coming from ActorSheet v1.)
       */
      tag: "form",
      form: {
        handler: QuickMinimalMonsterSheet._onSubmitForm,
        submitOnChange: false,
        closeOnSubmit: false
      },

      position: {
        width: 520,
        height: 720
      }
    });

    /**
     * Prepare render context.
     */
    async _prepareContext(options) {
      const context = await super._prepareContext(options);

      const actor = this.document;
      const system = actor.system ?? {};

      const biography =
        foundry.utils.getProperty(system, "details.biography.value") ??
        foundry.utils.getProperty(system, "details.biography") ??
        "";

      // v13 namespaced TextEditor implementation (no deprecated global)
      const TextEditorImpl = foundry.applications.ux.TextEditor.implementation;

      let biographyEnriched = biography;
      try {
        biographyEnriched = await TextEditorImpl.enrichHTML(biography ?? "", {
          async: true,
          documents: true,
          links: true,
          rolls: true,
          // Let inline rolls resolve actor data if used (optional but nice)
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

    /**
     * V2 form submit handler (wired through DEFAULT_OPTIONS.form.handler).
     * @this {QuickMinimalMonsterSheet} - Foundry binds the application instance as `this`. [web:132]
     */
    static async _onSubmitForm(event, form, formData) {
      // formData is FormDataExtended; expanded includes nested keys if present. [web:197]
      const data = formData.object ?? formData;

      // We only update the fields we actually render/edit.
      const updateData = {
        "system.attributes.ac.value": foundry.utils.getProperty(data, "system.attributes.ac.value"),
        "system.attributes.hp.value": foundry.utils.getProperty(data, "system.attributes.hp.value"),
        "system.attributes.hp.max": foundry.utils.getProperty(data, "system.attributes.hp.max"),
        "system.details.cr": foundry.utils.getProperty(data, "system.details.cr"),
        "system.details.biography.value": foundry.utils.getProperty(data, "system.details.biography.value")
      };

      // Strip undefined (so we don't overwrite fields with undefined)
      for (const [k, v] of Object.entries(updateData)) {
        if (v === undefined) delete updateData[k];
      }

      if (!Object.keys(updateData).length) return;

      await this.document.update(updateData);
    }

    /**
     * Optional: add listeners for custom behaviors (we'll use this for +X/-Y HP later).
     */
    _onRender(context, options) {
      super._onRender?.(context, options);

      // Example placeholder: later hook your delta-HP behavior here
      // const el = this.element?.querySelector('input[name="system.attributes.hp.value"]');
    }
  };
}