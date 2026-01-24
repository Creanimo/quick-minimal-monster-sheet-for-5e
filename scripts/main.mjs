import { QuickMinimalMonsterSheet } from "./qmms-monster-sheet.mjs";

Hooks.once("init", () => {
  console.log("Quick Minimal Monster Sheet for 5e | Initialized");

  Actors.registerSheet("dnd5e", QuickMinimalMonsterSheet, {
    types: ["npc"],  // Monsters only
    makeDefault: false,
    label: "QMMS.Sheet"
  });
});
