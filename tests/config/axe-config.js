/**
 * Custom axe-core configuration for WCAG 2.1 Level AA compliance
 */

export const axeConfig = {
    // Run WCAG 2.1 Level AA rules
    runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    },

    // Custom rule configuration
    rules: {
        // Enable color contrast checks
        'color-contrast': { enabled: true },

        // Require alt text on images
        'image-alt': { enabled: true },

        // Require labels on form inputs
        'label': { enabled: true },

        // Require valid ARIA attributes
        'aria-valid-attr-value': { enabled: true },

        // Require keyboard accessibility
        'button-name': { enabled: true },
        'link-name': { enabled: true },

        // Disable certain rules if needed
        'region': { enabled: false }, // May not apply to component
    },

    // Reporter configuration
    reporter: 'v2',

    // Include selectors (set at runtime)
    include: [],

    // Exclude selectors (set at runtime)
    exclude: [],
};

/**
 * Get axe config for mobile navigation tests
 */
export function getMobileNavAxeConfig() {
    return {
        ...axeConfig,
        include: ['.fmbn-nav'],
        exclude: [],
    };
}

/**
 * Get axe config for full page tests
 */
export function getFullPageAxeConfig() {
    return {
        ...axeConfig,
        include: [],
        exclude: [],
    };
}

/**
 * Get axe config for light mode testing
 */
export function getLightModeAxeConfig() {
    return {
        ...axeConfig,
        include: ['.fmbn-nav'],
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    };
}

/**
 * Get axe config for dark mode testing
 */
export function getDarkModeAxeConfig() {
    return {
        ...axeConfig,
        include: ['.fmbn-nav'],
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    };
}

/**
 * WCAG 2.1 rule descriptions for reference
 */
export const WCAG_RULES = {
    'color-contrast': 'Ensure text and background colors have sufficient contrast',
    'list': 'Ensure lists are properly structured',
    'listitem': 'Ensure list items are used correctly',
    'link-name': 'Ensure links have accessible names',
    'button-name': 'Ensure buttons have accessible names',
    'aria-allowed-attr': 'Ensure ARIA attributes are allowed for the element',
    'aria-required-attr': 'Ensure required ARIA attributes are present',
    'aria-required-children': 'Ensure elements have required children',
    'aria-required-parent': 'Ensure elements have required parents',
    'aria-valid-attr-value': 'Ensure ARIA attribute values are valid',
    'aria-valid-attr': 'Ensure ARIA attributes are valid',
    'image-alt': 'Ensure images have alt text',
    'label': 'Ensure form inputs have labels',
    'focus-order-semantics': 'Ensure focus order follows DOM order',
    'tabindex': 'Ensure tabindex is used correctly',
    'duplicate-id': 'Ensure IDs are unique',
    'page-has-heading-one': 'Ensure page has one h1 element',
    'landmark-one-main': 'Ensure page has one main landmark',
    'landmark-unique': 'Ensure landmarks are unique',
};

/**
 * Impact level descriptions
 */
export const IMPACT_LEVELS = {
    critical: 'Failures that have serious consequences for users',
    serious: 'Failures that have serious consequences for users (second highest)',
    moderate: 'Failures that have moderate consequences',
    minor: 'Failures that have minor consequences',
};
