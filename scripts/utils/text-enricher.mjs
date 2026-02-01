/**
 * Utility for enriching text content with Foundry's TextEditor
 * Handles HTML enrichment with links, rolls, and documents
 */

/**
 * Enrich HTML content using Foundry's TextEditor
 * @param {string} content - Raw HTML content to enrich
 * @param {Object} options - Enrichment options
 * @param {Object} options.rollData - Roll data for evaluating expressions
 * @param {Actor} options.actor - Actor document for context
 * @returns {Promise<string>} Enriched HTML content
 */
export async function enrichHTML(content, { rollData = {}, actor = null } = {}) {
    if (!content || typeof content !== "string") {
        return "";
    }

    const TextEditorImpl = foundry.applications.ux.TextEditor.implementation;

    if (!TextEditorImpl) {
        console.warn("TextEditor implementation not available, returning raw content");
        return content;
    }

    try {
        return await TextEditorImpl.enrichHTML(content, {
            async: true,
            documents: true,
            links: true,
            rolls: true,
            rollData: rollData || {}
        });
    } catch (err) {
        console.error("Failed to enrich HTML content:", err);
        return content; // Return original on error
    }
}

/**
 * Enrich actor biography/description text
 * @param {Actor} actor - The actor document
 * @param {string} biography - Raw biography HTML
 * @returns {Promise<string>} Enriched biography HTML
 */
export async function enrichActorBiography(actor, biography) {
    const rollData = typeof actor.getRollData === "function"
        ? actor.getRollData()
        : actor.system;

    return enrichHTML(biography, { rollData, actor });
}
