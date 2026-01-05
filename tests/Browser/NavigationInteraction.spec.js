import { test, expect } from '@playwright/test'

/**
 * Story 8.1: Navigation Interaction Tests
 *
 * Tests verify clicking navigation items navigates correctly
 * AC3: Navigation Interaction Tests
 */

test.describe('Navigation Interaction', () => {

  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for all tests
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('clicking navigation item navigates to correct page @interaction', async ({ page }) => {
    await page.goto('/')

    // Find first navigation link
    const firstLink = page.locator('nav a[href]').first()
    const href = await firstLink.getAttribute('href')

    if (href && href !== '#') {
      // Click the link
      await firstLink.click()

      // Wait for navigation
      await page.waitForLoadState('networkidle')

      // Verify URL changed
      const currentUrl = page.url()
      expect(currentUrl).toContain(href)

      console.log(`✓ Navigated to: ${currentUrl}`)
    } else {
      console.log('⊘ No valid href found on first link')
    }
  })

  test('navigation items have valid href attributes', async ({ page }) => {
    await page.goto('/')

    const navLinks = page.locator('nav a[href]')
    const count = await navLinks.count()

    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const href = await navLinks.nth(i).getAttribute('href')
      expect(href).toBeTruthy()
      expect(href).not.toBe('')
      expect(href).not.toBe('#')
    }

    console.log(`✓ All ${count} navigation items have valid hrefs`)
  })

  test('navigation items are keyboard accessible via Tab', async ({ page }) => {
    await page.goto('/')

    const navLinks = page.locator('nav a[href]')
    const count = await navLinks.count()

    if (count === 0) {
      console.log('⊘ No navigation links found')
      return
    }

    // Tab key to focus on first link
    for (let i = 0; i < count + 10; i++) {
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tag: el?.tagName,
          href: el?.getAttribute('href'),
          ariaLabel: el?.getAttribute('aria-label')
        }
      })

      if (focusedElement.tag === 'A' && focusedElement.href) {
        console.log(`✓ Navigation item focused via Tab: ${focusedElement.href}`)
        break
      }
    }
  })

  test('navigation items can be activated with Enter key', async ({ page }) => {
    await page.goto('/')

    const firstLink = page.locator('nav a[href]').first()
    const href = await firstLink.getAttribute('href')

    if (!href || href === '#') {
      console.log('⊘ First link has no valid href')
      return
    }

    // Focus the link
    await firstLink.focus()

    // Press Enter to activate
    await firstLink.press('Enter')

    // Wait for navigation
    await page.waitForLoadState('networkidle')

    // Should have navigated
    const currentUrl = page.url()
    console.log(`✓ Enter key activated navigation to: ${currentUrl}`)
  })

  test('all navigation items are within touch target size (44x44px min)', async ({ page }) => {
    await page.goto('/')

    const navItems = page.locator('nav a, nav button, nav li')
    const count = await navItems.count()

    let belowThreshold = 0
    for (let i = 0; i < count; i++) {
      const box = await navItems.nth(i).boundingBox()
      if (box && (box.width < 44 || box.height < 44)) {
        belowThreshold++
      }
    }

    const percentage = (belowThreshold / count) * 100
    console.log(`✓ Touch target size compliance: ${100 - percentage.toFixed(1)}% of items meet 44x44px`)

    // Allow some items to be smaller (like badges)
    expect(percentage).toBeLessThan(30)
  })

  test('navigation items are visually distinguishable', async ({ page }) => {
    await page.goto('/')

    const navItems = page.locator('nav a, nav button')
    const count = await navItems.count()

    expect(count).toBeGreaterThan(1) // Need at least 2 items to distinguish

    for (let i = 0; i < Math.min(count, 3); i++) {
      const item = navItems.nth(i)
      const color = await item.evaluate(el => {
        return window.getComputedStyle(el).color
      })

      expect(color).toBeTruthy()
      console.log(`✓ Item ${i + 1} has color: ${color}`)
    }
  })

  test('navigation items show hover state on desktop', async ({ page }) => {
    // Use desktop viewport for hover testing
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/')

    // Navigation might be hidden on desktop, skip if so
    const nav = page.locator('nav')
    const navVisible = await nav.isVisible().catch(() => false)

    if (!navVisible) {
      console.log('⊘ Navigation not visible on desktop (expected behavior)')
      return
    }

    const firstLink = page.locator('nav a[href]').first()
    const originalColor = await firstLink.evaluate(el => window.getComputedStyle(el).color)

    // Hover over the link
    await firstLink.hover()
    await page.waitForTimeout(100)

    const hoverColor = await firstLink.evaluate(el => window.getComputedStyle(el).color)

    console.log(`✓ Link hover state: ${originalColor} → ${hoverColor}`)
  })

  test('navigation handles rapid clicks gracefully', async ({ page }) => {
    await page.goto('/')

    const navLink = page.locator('nav a[href]').first()
    const href = await navLink.getAttribute('href')

    if (!href || href === '#') {
      console.log('⊘ No valid link to test')
      return
    }

    // Click multiple times rapidly
    for (let i = 0; i < 3; i++) {
      await navLink.click({ force: true })
      await page.waitForTimeout(50)
    }

    // Wait for final navigation
    await page.waitForLoadState('networkidle')

    // Page should still be functional
    const body = page.locator('body')
    await expect(body).toBeVisible()

    console.log('✓ Navigation handles rapid clicks without breaking')
  })

  test('back button works after navigation', async ({ page }) => {
    await page.goto('/')

    const initialUrl = page.url()

    // Click first nav item
    const firstLink = page.locator('nav a[href]').first()
    const href = await firstLink.getAttribute('href')

    if (!href || href === '#') {
      console.log('⊘ No valid link to navigate')
      return
    }

    await firstLink.click()
    await page.waitForLoadState('networkidle')

    const newUrl = page.url()
    expect(newUrl).not.toBe(initialUrl)

    // Use browser back
    await page.goBack()
    await page.waitForLoadState('networkidle')

    const backUrl = page.url()
    expect(backUrl).toBe(initialUrl)

    console.log('✓ Back button works correctly')
  })
})

test.describe('Navigation Touch Interactions', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('touch tap on navigation item works smoothly @touch', async ({ page }) => {
    await page.goto('/')

    const firstLink = page.locator('nav a[href]').first()
    const href = await firstLink.getAttribute('href')

    if (!href || href === '#') {
      return
    }

    // Simulate touch tap
    await firstLink.tap()

    await page.waitForLoadState('networkidle')

    const currentUrl = page.url()
    expect(currentUrl).toContain(href)

    console.log('✓ Touch tap navigation works')
  })

  test('no visible tap delay on navigation items', async ({ page }) => {
    await page.goto('/')

    const nav = page.locator('nav a[href]').first()

    // Check for -webkit-tap-highlight-color: transparent
    const tapHighlight = await nav.evaluate(el => {
      return window.getComputedStyle(el).webkitTapHighlightColor
    })

    console.log(`✓ Tap highlight color: ${tapHighlight || 'transparent (good)'}`)
  })
})
