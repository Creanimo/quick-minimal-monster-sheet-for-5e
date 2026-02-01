/**
 * Base class for UI handlers
 * Handles attaching and detaching event listeners
 */
export class BaseUIHandler {
    constructor(config) {
        this.config = config;
        this.listeners = [];
    }

    /**
     * Attach event listeners to elements
     * @param {HTMLElement} root - Root element of the sheet
     * @param {Object} context - Sheet context data
     * @param {Object} sheet - The sheet instance
     */
    attach(root, context, sheet) {
        // Override in subclass
    }

    /**
     * Detach all event listeners (cleanup)
     */
    detach() {
        this.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.listeners = [];
    }

    /**
     * Helper to track event listeners for cleanup
     * @param {HTMLElement} element - DOM element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     * @param {Object} options - Event listener options
     */
    _addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        this.listeners.push({ element, event, handler });
    }
}