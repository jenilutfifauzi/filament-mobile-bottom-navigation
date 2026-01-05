import { AxeBuilder } from '@axe-core/playwright';

/**
 * Inject axe-core into page and run full accessibility scan
 */
export async function scanForAccessibility(page, options = {}) {
    const {
        include = null,        // CSS selector to scan (null = entire page)
        exclude = [],          // CSS selectors to exclude
        rules = {},            // axe rule configuration
        tags = ['wcag2a', 'wcag2aa', 'wcag21aa'], // WCAG tags to test
    } = options;

    // Create AxeBuilder instance
    let builder = new AxeBuilder({ page });

    // Configure selector scope if include is specified
    if (include) {
        // Check if element exists on page
        const elementExists = await page.locator(include).count().then(count => count > 0).catch(() => false);

        if (elementExists) {
            builder = builder.include(include);
        } else {
            // If include selector not found, log warning and scan whole page
            console.warn(`Warning: Include selector "${include}" not found on page, scanning entire page instead`);
        }
    }

    // Exclude selectors if provided
    if (exclude.length > 0) {
        exclude.forEach(selector => {
            builder = builder.exclude(selector);
        });
    }

    // Configure run options with tags
    if (tags && tags.length > 0) {
        builder = builder.withTags(tags);
    }

    // Run scan
    const results = await builder.analyze();

    return results;
}

/**
 * Assert no accessibility violations (throws if violations found)
 */
export async function assertNoViolations(page, options = {}) {
    const results = await scanForAccessibility(page, options);

    if (results.violations.length > 0) {
        const violationReport = formatViolations(results.violations);
        throw new Error(`Accessibility violations found:\n${violationReport}`);
    }

    return results;
}

/**
 * Format violations for readable output
 */
export function formatViolations(violations) {
    return violations.map((violation, index) => {
        const nodes = violation.nodes.map(node => {
            return `      - ${node.target.join(' ')}`;
        }).join('\n');

        return `
  ${index + 1}. ${violation.id} (${violation.impact})
     Description: ${violation.description}
     Help: ${violation.help}
     WCAG: ${violation.tags.filter(tag => tag.includes('wcag')).join(', ')}
     Elements:
${nodes}
     Fix: ${violation.helpUrl}
`;
    }).join('\n');
}

/**
 * Get violations by impact level
 */
export function getViolationsByImpact(violations, impact) {
    return violations.filter(v => v.impact === impact);
}

/**
 * Check if specific rule passed
 */
export function didRulePass(results, ruleId) {
    const violation = results.violations.find(v => v.id === ruleId);
    return !violation;
}

/**
 * Get violations by rule ID
 */
export function getViolationsByRule(violations, ruleId) {
    return violations.filter(v => v.id === ruleId);
}

/**
 * Check if all rules in a list passed
 */
export function didRulesPasses(results, ruleIds) {
    return ruleIds.every(ruleId => didRulePass(results, ruleId));
}
