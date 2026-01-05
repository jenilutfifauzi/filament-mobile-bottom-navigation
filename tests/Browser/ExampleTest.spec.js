import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Example Browser Test for Filament Mobile Bottom Navigation Plugin
 *
 * This test demonstrates:
 * 1. Mobile viewport configuration
 * 2. Basic page rendering verification
 * 3. Accessibility scanning with axe-core
 */

test.describe('Mobile Bottom Navigation - Example Tests', () => {

  test('page loads successfully on mobile viewport', async ({ page }) => {
    // Set mobile viewport (smaller than 768px breakpoint)
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to root page
    await page.goto('/')

    // Verify page loaded (check for common HTML elements)
    const body = await page.locator('body')
    await expect(body).toBeVisible()

    // Log viewport size for debugging
    const viewport = page.viewportSize()
    console.log(`✓ Test viewport: ${viewport?.width}x${viewport?.height}`)
  })

  test('page has no critical accessibility violations @a11y', async ({ page }) => {
    // Navigate to page
    await page.goto('/')

    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Assert no violations found
    expect(accessibilityScanResults.violations).toEqual([])

    // Log results for debugging
    console.log(`✓ Accessibility scan passed: ${accessibilityScanResults.passes.length} checks`)
  })

  test('mobile safari viewport matches iPhone 14 Pro', async ({ page, browserName }) => {
    // This test only runs on Mobile Safari project
    test.skip(browserName !== 'webkit', 'Mobile Safari specific test')

    // Verify viewport dimensions
    const viewport = page.viewportSize()
    expect(viewport?.width).toBe(390)
    expect(viewport?.height).toBe(844)

    console.log('✓ Mobile Safari viewport configured correctly')
  })

  test('mobile chrome viewport matches Pixel 7', async ({ page, browserName }) => {
    // This test only runs on Mobile Chrome project
    test.skip(browserName !== 'chromium', 'Mobile Chrome specific test')

    // Verify viewport dimensions
    const viewport = page.viewportSize()
    expect(viewport?.width).toBe(412)
    expect(viewport?.height).toBe(915)

    console.log('✓ Mobile Chrome viewport configured correctly')
  })
})

/**
 * Future Test Scenarios (to be implemented in Epic 1-8):
 *
 * Epic 1: Navigation Display Tests
 * - Bottom navigation appears on mobile viewport
 * - Navigation items render from Filament panel config
 * - Active state highlights current page
 * - Badges display correctly on menu items
 *
 * Epic 2: Responsive Behavior Tests
 * - Bottom nav hidden on desktop (>= 768px)
 * - Bottom nav visible on mobile (< 768px)
 * - Orientation change preserves navigation state
 * - No layout shift during page load
 *
 * Epic 3: Theming Tests
 * - CSS variables applied correctly
 * - Dark mode switches automatically
 * - Theme colors match Filament panel
 *
 * Epic 8: Accessibility Tests (WCAG 2.1 AA)
 * - Color contrast meets 4.5:1 ratio
 * - Touch targets >= 44x44px
 * - Keyboard navigation works
 * - Screen reader announces navigation correctly
 * - Focus indicators visible
 */
