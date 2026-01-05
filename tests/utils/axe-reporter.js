import fs from 'fs';
import path from 'path';

/**
 * Generate HTML report from axe results
 */
export function generateHTMLReport(results, outputPath) {
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Test Report</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            background: #f9fafb;
            color: #1f2937;
        }
        h1 {
            color: #1f2937;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 1rem;
        }
        h2 {
            color: #374151;
            margin-top: 2rem;
            border-left: 4px solid #3b82f6;
            padding-left: 1rem;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        .stat {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
            border-top: 4px solid #3b82f6;
        }
        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 0.5rem 0;
        }
        .stat-value.pass { color: #10b981; }
        .stat-value.fail { color: #dc2626; }
        .stat-label {
            color: #6b7280;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .violation {
            border-left: 4px solid #dc2626;
            background: white;
            padding: 1.5rem;
            margin: 1rem 0;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .violation-header {
            font-weight: bold;
            color: #dc2626;
            font-size: 1.125rem;
            margin-bottom: 0.5rem;
        }
        .violation-impact {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-left: 0.5rem;
        }
        .impact-critical { background: #dc2626; color: white; }
        .impact-serious { background: #f97316; color: white; }
        .impact-moderate { background: #facc15; color: #000; }
        .impact-minor { background: #60a5fa; color: white; }
        .violation-meta {
            margin: 1rem 0;
            font-size: 0.875rem;
        }
        .violation-meta strong {
            display: inline-block;
            min-width: 80px;
            color: #374151;
        }
        .node {
            background: #f3f4f6;
            padding: 0.75rem;
            margin: 0.5rem 0;
            border-left: 3px solid #6b7280;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.875rem;
            word-break: break-word;
        }
        .pass-item {
            background: white;
            padding: 1rem;
            margin: 0.5rem 0;
            border-left: 4px solid #10b981;
            border-radius: 4px;
            font-size: 0.875rem;
        }
        .pass-item strong {
            color: #10b981;
        }
        .help-link {
            color: #3b82f6;
            text-decoration: none;
            word-break: break-word;
        }
        .help-link:hover {
            text-decoration: underline;
        }
        .metadata {
            background: #f9fafb;
            padding: 1rem;
            border-radius: 4px;
            font-size: 0.875rem;
            color: #6b7280;
            margin-top: 2rem;
            border-top: 1px solid #e5e7eb;
            padding-top: 1.5rem;
        }
        .no-violations {
            background: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 1.5rem;
            border-radius: 4px;
            color: #065f46;
            font-weight: 500;
        }
        code {
            background: #f3f4f6;
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <h1>♿ Accessibility Test Report</h1>

    <div class="summary">
        <div class="stat">
            <div class="stat-value ${results.violations.length === 0 ? 'pass' : 'fail'}">
                ${results.violations.length}
            </div>
            <div class="stat-label">Violations</div>
        </div>
        <div class="stat">
            <div class="stat-value pass">${results.passes.length}</div>
            <div class="stat-label">Passed Checks</div>
        </div>
        <div class="stat">
            <div class="stat-value">${results.incomplete.length}</div>
            <div class="stat-label">Incomplete</div>
        </div>
        <div class="stat">
            <div class="stat-value">${results.inapplicable.length}</div>
            <div class="stat-label">Inapplicable</div>
        </div>
    </div>

    <h2>Overview</h2>
    <p><strong>Total Checks:</strong> ${results.violations.length + results.passes.length + results.incomplete.length + results.inapplicable.length}</p>
    <p><strong>Success Rate:</strong> ${calculateSuccessRate(results)}%</p>
    <p><strong>WCAG Level:</strong> 2.1 Level AA</p>

    <h2>Violations (${results.violations.length})</h2>
    ${results.violations.length === 0 ? '<div class="no-violations">✅ No accessibility violations found!</div>' : ''}
    ${results.violations.map((violation, index) => `
        <div class="violation">
            <div class="violation-header">
                ${index + 1}. <code>${violation.id}</code>
                <span class="violation-impact impact-${violation.impact}">${violation.impact}</span>
            </div>
            <div class="violation-meta">
                <strong>Description:</strong> ${violation.description}
            </div>
            <div class="violation-meta">
                <strong>Help:</strong> ${violation.help}
            </div>
            <div class="violation-meta">
                <strong>WCAG:</strong> ${violation.tags.filter(t => t.includes('wcag')).join(', ') || 'N/A'}
            </div>
            <div class="violation-meta">
                <strong>Learn More:</strong> <a href="${violation.helpUrl}" target="_blank" class="help-link">View Fix Guide</a>
            </div>
            <div class="violation-meta">
                <strong>Affected Elements (${violation.nodes.length}):</strong>
            </div>
            ${violation.nodes.map(node => `
                <div class="node">
                    ${node.target.join(' ')}
                </div>
            `).join('')}
        </div>
    `).join('')}

    ${results.incomplete.length > 0 ? `
    <h2>Incomplete - Manual Review Required (${results.incomplete.length})</h2>
    <p>These items require manual testing to verify:</p>
    ${results.incomplete.map((item, index) => `
        <div class="violation" style="border-left-color: #f59e0b;">
            <div class="violation-header" style="color: #d97706;">
                ${index + 1}. <code>${item.id}</code>
            </div>
            <div class="violation-meta">
                <strong>Description:</strong> ${item.description}
            </div>
            <div class="violation-meta">
                <strong>Help:</strong> ${item.help}
            </div>
            <div class="violation-meta">
                <strong>Learn More:</strong> <a href="${item.helpUrl}" target="_blank" class="help-link">View More Info</a>
            </div>
        </div>
    `).join('')}
    ` : ''}

    <h2>Passed Checks (${results.passes.length})</h2>
    <p>These accessibility checks passed:</p>
    ${results.passes.map((pass, idx) => `
        <div class="pass-item">
            <strong>✓ ${pass.id}:</strong> ${pass.description}
        </div>
    `).join('')}

    ${results.inapplicable.length > 0 ? `
    <h2>Inapplicable Checks (${results.inapplicable.length})</h2>
    <p>These checks don't apply to this page:</p>
    ${results.inapplicable.slice(0, 10).map((item, idx) => `
        <div class="pass-item" style="border-left-color: #9ca3af;">
            <strong>— ${item.id}:</strong> ${item.description}
        </div>
    `).join('')}
    ${results.inapplicable.length > 10 ? `<p><em>...and ${results.inapplicable.length - 10} more</em></p>` : ''}
    ` : ''}

    <div class="metadata">
        <div><strong>Generated:</strong> ${new Date().toISOString()}</div>
        <div><strong>Test Standard:</strong> WCAG 2.1 Level AA</div>
        <div><strong>Tool:</strong> axe-core with Playwright</div>
    </div>
</body>
</html>
    `;

    fs.writeFileSync(outputPath, html);
    console.log(`✅ HTML report generated: ${outputPath}`);
}

/**
 * Generate JSON report from axe results
 */
export function generateJSONReport(results, outputPath) {
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const report = {
        timestamp: new Date().toISOString(),
        url: results.url || 'N/A',
        wcagLevel: '2.1 AA',
        violations: results.violations,
        passes: results.passes,
        incomplete: results.incomplete,
        inapplicable: results.inapplicable,
        summary: {
            violations: results.violations.length,
            passes: results.passes.length,
            incomplete: results.incomplete.length,
            inapplicable: results.inapplicable.length,
            total: results.violations.length + results.passes.length + results.incomplete.length + results.inapplicable.length,
            successRate: calculateSuccessRate(results),
            criticalViolations: results.violations.filter(v => v.impact === 'critical').length,
            seriousViolations: results.violations.filter(v => v.impact === 'serious').length,
            moderateViolations: results.violations.filter(v => v.impact === 'moderate').length,
            minorViolations: results.violations.filter(v => v.impact === 'minor').length,
        },
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`✅ JSON report generated: ${outputPath}`);
}

/**
 * Calculate success rate
 */
function calculateSuccessRate(results) {
    const total = results.violations.length + results.passes.length;
    if (total === 0) return 100;
    return Math.round((results.passes.length / total) * 100);
}

/**
 * Generate summary statistics
 */
export function generateSummary(results) {
    return {
        total: results.violations.length + results.passes.length + results.incomplete.length + results.inapplicable.length,
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
        critical: results.violations.filter(v => v.impact === 'critical').length,
        serious: results.violations.filter(v => v.impact === 'serious').length,
        moderate: results.violations.filter(v => v.impact === 'moderate').length,
        minor: results.violations.filter(v => v.impact === 'minor').length,
        successRate: calculateSuccessRate(results),
    };
}

/**
 * Print summary to console
 */
export function printSummary(results) {
    const summary = generateSummary(results);

    console.log('\n=== Accessibility Scan Summary ===\n');
    console.log(`Total Checks: ${summary.total}`);
    console.log(`✓ Passed: ${summary.passes}`);
    console.log(`✗ Violations: ${summary.violations}`);
    console.log(`⚠ Incomplete: ${summary.incomplete}`);
    console.log(`— Inapplicable: ${summary.inapplicable}`);
    console.log(`\nViolation Breakdown:`);
    console.log(`  🔴 Critical: ${summary.critical}`);
    console.log(`  🟠 Serious: ${summary.serious}`);
    console.log(`  🟡 Moderate: ${summary.moderate}`);
    console.log(`  🔵 Minor: ${summary.minor}`);
    console.log(`\nSuccess Rate: ${summary.successRate}%`);
    console.log('');
}

/**
 * Export results for CI/CD
 */
export function exportForCI(results, outputDir = 'test-results') {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate both reports
    generateHTMLReport(results, `${outputDir}/accessibility-report.html`);
    generateJSONReport(results, `${outputDir}/accessibility-report.json`);

    // Print summary
    printSummary(results);

    // Return pass/fail status
    const hasCriticalOrSerious = results.violations.some(
        v => v.impact === 'critical' || v.impact === 'serious'
    );

    return {
        passed: !hasCriticalOrSerious,
        violations: results.violations.length,
        critical: results.violations.filter(v => v.impact === 'critical').length,
        serious: results.violations.filter(v => v.impact === 'serious').length,
    };
}
