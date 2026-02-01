/**
 * Manages multiple UI handlers
 * Handles attachment and cleanup of all handlers
 */
export class UIHandlerManager {
    constructor() {
        this.handlers = [];
    }

    /**
     * Register a UI handler
     * @param {BaseUIHandler} handler - Handler instance
     */
    register(handler) {
        this.handlers.push(handler);
    }

    /**
     * Attach all handlers
     * @param {HTMLElement} root - Root element
     * @param {Object} context - Context data
     * @param {Object} sheet - Sheet instance
     */
    attachAll(root, context, sheet) {
        console.log(`[UIHandlerManager] Attaching ${this.handlers.length} handlers`);

        this.handlers.forEach(handler => {
            try {
                handler.attach(root, context, sheet);
            } catch (err) {
                console.error(`[UIHandlerManager] Handler failed to attach:`, handler.constructor.name, err);
            }
        });
    }

    /**
     * Detach all handlers (cleanup)
     */
    detachAll() {
        console.log(`[UIHandlerManager] Detaching ${this.handlers.length} handlers`);

        this.handlers.forEach(handler => {
            try {
                handler.detach();
            } catch (err) {
                console.error(`[UIHandlerManager] Handler failed to detach:`, handler.constructor.name, err);
            }
        });
    }
}
