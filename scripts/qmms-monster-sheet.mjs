export function createQuickMinimalMonsterSheetClass({
  moduleId = "quick-minimal-monster-sheet-for-5e",
  templatePath = `modules/quick-minimal-monster-sheet-for-5e/templates/qmms-monster-sheet.hbs`
} = {}) {
  const ActorSheetV2 = foundry?.applications?.sheets?.ActorSheetV2;
  if (!ActorSheetV2) {
    throw new Error(
      `${moduleId} | ActorSheetV2 is not available yet. ` +
      `Create this sheet class after Hooks.once("ready") (or later).`
    );
  }

  return class QuickMinimalMonsterSheet extends ActorSheetV2 {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
      id: `${moduleId}-sheet`,
      classes: ["dnd5e", "sheet", "actor", "qmms-sheet"],
      template: templatePath,
      position: {
        width: 520,
        height: 720
      }
      // Keep options minimal at first; add tabs/actions later if needed.
    });

    /**
     * Prepare the rendering context for the Handlebars template.
     * ActorSheetV2 participates in the ApplicationV2 lifecycle and uses a context
     * object to render HTML. [page:0]
     */
    async _prepareContext(options) {
      const context = await super._prepareContext(options);

      const actor = this.document; // Actor document
      const system = actor.system ?? {};

      const biography =
        foundry.utils.getProperty(system, "details.biography.value") ??
        foundry.utils.getProperty(system, "details.biography") ??
        "";

      // What we expose to the template:
      context.qmms = {
        ac: foundry.utils.getProperty(system, "attributes.ac.value") ?? null,
        hp: {
          value: foundry.utils.getProperty(system, "attributes.hp.value") ?? null,
          max: foundry.utils.getProperty(system, "attributes.hp.max") ?? null
        },
        cr: foundry.utils.getProperty(system, "details.cr") ?? null,

        // Raw text (editable textarea)
        biography,

        // Enriched HTML (view mode) - supports [[/roll ...]] style enrichment.
        biographyEnriched: await this.#enrichBiography(actor, biography)
      };

      return context;
    }

    /**
     * Attach listeners after render.
     * This is the right place for sheet-specific UX helpers (later: +X/-Y HP input).
     */
    _attachPartListeners(partId, htmlElement, options) {
      super._attachPartListeners(partId, htmlElement, options);

      // Example placeholder:
      // - add listeners later for "+5"/"-7" HP delta parsing in the current HP input
      // - add a toggle between edit/view for biography if you want both at once
    }

    /**
     * Enrich biography text similarly to journals so inline roll syntax becomes clickable.
     */
    async #enrichBiography(actor, text) {
      // Prefer actor roll data when available so inline formulas can use @data paths.
      const rollData =
        typeof actor.getRollData === "function" ? actor.getRollData() : actor.system;

      return TextEditor.enrichHTML(text ?? "", {
        async: true,
        documents: true,
        links: true,
        rolls: true,
        rollData
      });
    }
  };
}