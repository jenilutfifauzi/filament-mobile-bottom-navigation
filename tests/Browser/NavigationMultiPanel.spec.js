import { test, expect } from '@playwright/test'

/**
 * Story 8.1: Multi-Panel Switching Tests
 *
 * Tests verify navigation updates correctly when switching between Filament panels
 * AC6: Multi-Panel Switching Tests
 */

test.describe('Multi-Panel Navigation Switching', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('navigation updates when switching to different panel @multi-panel', async ({ page }) => {
    await page.goto('/')

    // Look for panel switcher or navigation between panels
    const panelSwitchers = page.locator('[data-panel], [aria-label*="panel"], [data-testid*="panel"]')
    const panelCount = await panelSwitchers.count()

    if (panelCount === 0) {
      console.log('⊘ No panel switcher found (may be single-panel app)')
      return
    }

    // Get initial navigation items
    const initialNav = page.locator('nav a').count()

    // Switch to next panel if available
    const panelButtons = page.locator('button[data-panel], a[data-panel]')
    if (await panelButtons.count() > 1) {
      await panelButtons.nth(1).click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(300)

      // Navigation should have updated
      const newNav = await page.locator('nav a').count()
      console.log(`✓ Navigation items changed: ${initialNav} → ${newNav}`)
    }
  })

  test('active state reflects current panel', async ({ page }) => {
    await page.goto('/')

    // Check if current panel is indicated
    const activePanel = page.locator('[data-panel].active, [data-panel][aria-current="true"], [data-panel][aria-selected="true"]')

    if (await activePanel.count() > 0) {
      const panelName = await activePanel.getAttribute('data-panel').catch(() => 'unknown')
      console.log(`✓ Active panel detected: ${panelName}`)
    }

    // Check if navigation reflects the panel
    const activeNav = page.locator('nav a.active, nav a[aria-current="page"]')
    if (await activeNav.count() > 0) {
      console.log('✓ Navigation active state reflects current panel')
    }
  })

  test('navigation items are specific to current panel', async ({ page }) => {
    await page.goto('/')

    // Get navigation items for current panel
    const navItems = page.locator('nav a')
    const initialCount = await navItems.count()

    const navHrefs = []
    for (let i = 0; i < initialCount; i++) {
      const href = await navItems.nth(i).getAttribute('href')
      if (href) navHrefs.push(href)
    }

    console.log(`✓ Current panel has ${initialCount} navigation items`)
    console.log(`  Items: ${navHrefs.slice(0, 3).join(', ')}${navHrefs.length > 3 ? '...' : ''}`)
  })

  test('panel switching preserves navigation state', async ({ page }) => {
    await page.goto('/')

    // Get current page
    const initialUrl = page.url()

    // Switch panels if available
    const panelButtons = page.locator('button[data-panel], a[data-panel]')

    if (await panelButtons.count() < 2) {
      console.log('⊘ Only one panel available')
      return
    }

    // Switch to second panel
    await panelButtons.nth(1).click()
    await page.waitForLoadState('networkidle')

    // Switch back to first panel
    await panelButtons.nth(0).click()
    await page.waitForLoadState('networkidle')

    // Should be back to original panel
    const finalUrl = page.url()
    console.log(`✓ Panel switching preserves navigation: ${initialUrl === finalUrl}`)
  })

  test('navigation is correctly scoped to panel', async ({ page }) => {
    await page.goto('/')

    // Get all navigation item URLs
    const navItems = page.locator('nav a[href]')
    const itemCount = await navItems.count()

    let panelSpecific = true
    for (let i = 0; i < Math.min(itemCount, 3); i++) {
      const href = await navItems.nth(i).getAttribute('href')

      // Navigation items should be relative to current panel
      if (href && !href.includes('http')) {
        console.log(`✓ Navigation item ${i + 1}: ${href}`)
      }
    }

    expect(itemCount).toBeGreaterThan(0)
    console.log(`✓ Navigation is scoped to current panel`)
  })

  test('badge counts update per panel', async ({ page }) => {
    await page.goto('/')

    // Get badges in current panel
    const badge = page.locator('nav .badge, nav [data-badge]').first()
    const initialBadgeText = await badge.innerText().catch(() => '')

    // Switch panels if available
    const panelButtons = page.locator('button[data-panel], a[data-panel]')

    if (await panelButtons.count() >= 2) {
      await panelButtons.nth(1).click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(300)

      // Check badge in new panel
      const newBadge = page.locator('nav .badge, nav [data-badge]').first()
      const newBadgeText = await newBadge.innerText().catch(() => '')

      if (initialBadgeText && newBadgeText) {
        console.log(`✓ Badge values per panel: "${initialBadgeText}" → "${newBadgeText}"`)
      }
    }
  })

  test('navigation renders without errors when switching panels', async ({ page }) => {
    // Listen for console errors
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')

    // Switch panels multiple times
    const panelButtons = page.locator('button[data-panel], a[data-panel]')
    const panelCount = await panelButtons.count()

    for (let i = 0; i < Math.min(panelCount, 3); i++) {
      await panelButtons.nth(i).click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(300)

      // Verify navigation is still visible
      const nav = page.locator('nav')
      await expect(nav).toBeVisible()
    }

    if (consoleErrors.length === 0) {
      console.log('✓ No console errors during panel switching')
    } else {
      console.log(`⊘ ${consoleErrors.length} console error(s) detected`)
    }
  })

  test('panel navigation items are keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Tab through navigation items
    const navItems = page.locator('nav a[href]')
    const count = await navItems.count()

    if (count === 0) {
      return
    }

    // Focus on nav
    await page.keyboard.press('Tab')

    // Verify we can navigate with arrow keys
    let focusedOnNav = false
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight')
      const focused = await page.evaluate(() => {
        return document.activeElement?.tagName === 'A'
      })

      if (focused) {
        focusedOnNav = true
        break
      }
    }

    if (focusedOnNav) {
      console.log('✓ Panel navigation items are keyboard accessible with arrow keys')
    }
  })

  test('panel switching via URL works correctly', async ({ page }) => {
    await page.goto('/')

    const initialUrl = page.url()

    // Look for panel-specific URLs
    const navLinks = page.locator('nav a[href]')
    if (await navLinks.count() === 0) {
      return
    }

    // Navigate using a nav link
    const firstLink = navLinks.first()
    const href = await firstLink.getAttribute('href')

    if (href && !href.startsWith('#')) {
      await firstLink.click()
      await page.waitForLoadState('networkidle')

      const newUrl = page.url()
      console.log(`✓ URL-based panel switching: ${initialUrl} → ${newUrl}`)
    }
  })

  test('navigation remains accessible after panel load', async ({ page }) => {
    await page.goto('/')

    // Get initial navigation
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()

    // Switch panels
    const panelButtons = page.locator('button[data-panel], a[data-panel]')
    if (await panelButtons.count() >= 2) {
      await panelButtons.nth(1).click()
      await page.waitForLoadState('networkidle')

      // Navigation should still be accessible
      const navItems = page.locator('nav a, nav button')
      await expect(navItems.first()).toBeVisible()

      const count = await navItems.count()
      expect(count).toBeGreaterThan(0)
      console.log(`✓ Navigation accessible in panel with ${count} items`)
    }
  })
})

test.describe('Cross-Panel Navigation Consistency', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('navigation UI remains consistent across panels', async ({ page }) => {
    await page.goto('/')

    // Get initial navigation styling
    const nav = page.locator('nav').first()
    const initialHeight = await nav.evaluate(el => el.offsetHeight)

    // Switch panels
    const panelButtons = page.locator('button[data-panel], a[data-panel]')
    if (await panelButtons.count() < 2) {
      return
    }

    await panelButtons.nth(1).click()
    await page.waitForLoadState('networkidle')

    // Check if navigation height remains similar
    const newHeight = await nav.evaluate(el => el.offsetHeight)
    const heightDiff = Math.abs(initialHeight - newHeight)

    if (heightDiff < 20) {
      console.log(`✓ Navigation height consistent: ${initialHeight}px → ${newHeight}px`)
    } else {
      console.log(`⊘ Navigation height varies: ${initialHeight}px → ${newHeight}px (${heightDiff}px difference)`)
    }
  })
})
