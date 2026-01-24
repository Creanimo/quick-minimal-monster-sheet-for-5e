export class QuickMinimalMonsterSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/quick-minimal-monster-sheet-for-5e/templates/qmms-monster-sheet.hbs",
      classes: ["dnd5e", "sheet", "actor", "qmms-sheet"],
      width: 800,
      height: 600
    });
  }

  getData(options) {
    const context = super.getData(options);
    const system = this.actor.system ?? {};

    context.qmms = {
      ac: system.attributes?.ac?.value ?? 0,
      hp: {
        value: system.attributes?.hp?.value ?? 0,
        max: system.attributes?.hp?.max ?? 1
      },
      cr: system.details?.cr ?? "",
      biography: system.details?.biography?.value ?? ""
    };

    return context;
  }

  async _updateObject(event, formData) {
    const updateData = {
      "system.attributes.ac.value": formData["system.attributes.ac.value"],
      "system.attributes.hp.value": formData["system.attributes.hp.value"],
      "system.attributes.hp.max": formData["system.attributes.hp.max"],
      "system.details.cr": formData["system.details.cr"],
      "system.details.biography.value": formData["system.details.biography.value"]
    };

    return this.actor.update(updateData);
  }
}