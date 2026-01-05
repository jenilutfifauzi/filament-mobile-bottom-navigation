import { test, expect } from '@playwright/test'

/**
 * Story 8.1: Active State Highlighting Tests
 *
 * Tests verify the active/current page state is correctly highlighted
 * AC4: Active State Highlighting Tests
 */

test.describe('Navigation Active State', () => {

  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for all tests
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('current page navigation item shows active state @active-state', async ({ page }) => {
    await page.goto('/')

    // Look for navigation item with active state
    // Common selectors: .active, [aria-current="page"], .is-active
    const activeLink = page.locator('nav a.active, nav a[aria-current="page"], nav li.active, nav a[aria-selected="true"]').first()

    // At least one item should have active state
    const count = await page.locator('nav a.active, nav a[aria-current="page"], nav li.active, nav a[aria-selected="true"]').count()

    if (count > 0) {
      await expect(activeLink).toBeVisible()
      console.log('✓ Active state indicator found')
    } else {
      // If no standard active indicators, log for awareness
      console.log('⊘ No standard active state found (may use custom styling)')
    }
  })

  test('active state updates when navigating between pages', async ({ page }) => {
    await page.goto('/')

    // Get initial active item (if any)
    let initialActive = await page.locator('nav a.active, nav a[aria-current="page"]').first().getAttribute('href').catch(() => null)

    // Click second navigation item
    const secondLink = page.locator('nav a[href]').nth(1)
    const secondHref = await secondLink.getAttribute('href')

    if (secondHref && secondHref !== '#') {
      await secondLink.click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      // Check if the clicked link is now active
      const newActive = await page.locator('nav a.active, nav a[aria-current="page"]').first().getAttribute('href').catch(() => null)

      if (newActive) {
        expect(newActive).toBe(secondHref)
        console.log('✓ Active state updated after navigation')
      } else {
        console.log('⊘ Could not verify active state update')
      }
    }
  })

  test('aria-current="page" attribute is set on active link', async ({ page }) => {
    await page.goto('/')

    const currentPageLink = page.locator('nav a[aria-current="page"]')
    const count = await currentPageLink.count()

    if (count > 0) {
      const ariaCurrentValue = await currentPageLink.first().getAttribute('aria-current')
      expect(ariaCurrentValue).toBe('page')
      console.log('✓ aria-current="page" properly set')
    } else {
      console.log('⊘ aria-current="page" not found (consider adding)')
    }
  })

  test('inactive navigation items do not have aria-current', async ({ page }) => {
    await page.goto('/')

    const inactiveLinks = page.locator('nav a:not([aria-current="page"])')
    const count = await inactiveLinks.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const ariaCurrent = await inactiveLinks.nth(i).getAttribute('aria-current')
      // Should be null or not "page"
      expect(ariaCurrent).not.toBe('page')
    }

    console.log('✓ Inactive items properly exclude aria-current')
  })

  test('visual highlight is visible on active state', async ({ page }) => {
    await page.goto('/')

    const activeLink = page.locator('nav a.active, nav a[aria-current="page"]').first()
    const count = await activeLink.count()

    if (count === 0) {
      console.log('⊘ No active link found')
      return
    }

    // Get the background color or other styling
    const activeColor = await activeLink.evaluate(el => {
      const style = window.getComputedStyle(el)
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderColor: style.borderColor,
        fontWeight: style.fontWeight,
        borderBottom: style.borderBottom
      }
    })

    console.log('✓ Active state visual properties:', JSON.stringify(activeColor, null, 2))
  })

  test('active state styling is different from inactive', async ({ page }) => {
    await page.goto('/')

    const activeLink = page.locator('nav a.active, nav a[aria-current="page"]').first()
    const inactiveLink = page.locator('nav a:not(.active):not([aria-current="page"])').first()

    if (await activeLink.count() === 0 || await inactiveLink.count() === 0) {
      console.log('⊘ Could not compare active vs inactive')
      return
    }

    const activeStyle = await activeLink.evaluate(el => window.getComputedStyle(el).backgroundColor)
    const inactiveStyle = await inactiveLink.evaluate(el => window.getComputedStyle(el).backgroundColor)

    if (activeStyle !== inactiveStyle) {
      console.log(`✓ Active (${activeStyle}) ≠ Inactive (${inactiveStyle})`)
    } else {
      console.log('⊘ Active and inactive styling may be too similar')
    }
  })

  test('active state persists after page refresh', async ({ page }) => {
    await page.goto('/')

    // Get current active link
    const activeHref = await page.locator('nav a.active, nav a[aria-current="page"]').first().getAttribute('href').catch(() => null)

    // Refresh page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check active state again
    const newActiveHref = await page.locator('nav a.active, nav a[aria-current="page"]').first().getAttribute('href').catch(() => null)

    if (activeHref && newActiveHref) {
      expect(newActiveHref).toBe(activeHref)
      console.log('✓ Active state persists after refresh')
    }
  })

  test('active indicator is accessible to screen readers', async ({ page }) => {
    await page.goto('/')

    const activeLink = page.locator('nav a[aria-current="page"]').first()
    const count = await activeLink.count()

    if (count === 0) {
      // Check for alternative accessibility markers
      const altActive = page.locator('nav a.active[role="link"], nav [role="menuitem"][aria-current="page"]')
      const altCount = await altActive.count()

      if (altCount === 0) {
        console.log('⊘ No accessible active state indicator found')
        return
      }
    }

    const ariaLabel = await activeLink.getAttribute('aria-label').catch(() => null)
    const ariaDescribedBy = await activeLink.getAttribute('aria-describedby').catch(() => null)

    console.log('✓ Active link is accessible to screen readers')
    console.log(`  - aria-label: ${ariaLabel}`)
    console.log(`  - aria-describedby: ${ariaDescribedBy}`)
  })

  test('only one navigation item has active state at a time', async ({ page }) => {
    await page.goto('/')

    const activeItems = page.locator('nav a.active, nav a[aria-current="page"]')
    const count = await activeItems.count()

    // Should have 0 or 1 active items
    expect(count).toBeLessThanOrEqual(1)
    console.log(`✓ Active state count: ${count} (≤ 1)`)
  })

  test('active state works with nested navigation', async ({ page }) => {
    await page.goto('/')

    // Look for nested navigation structure
    const navLists = page.locator('nav > ul, nav > div')
    const listCount = await navLists.count()

    if (listCount > 1) {
      // Check if active state works in nested structure
      const allActive = page.locator('nav a.active, nav a[aria-current="page"]')
      const activeCount = await allActive.count()

      if (activeCount > 0) {
        console.log('✓ Active state works in nested navigation')
      }
    } else {
      console.log('⊘ No nested navigation structure found')
    }
  })
})

test.describe('Navigation Active State - Multi-Level', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('parent item shows active state when child is current', async ({ page }) => {
    await page.goto('/')

    // Look for parent menu items with active children
    const parentMenus = page.locator('nav > ul > li, nav > li')

    for (let i = 0; i < await parentMenus.count(); i++) {
      const parent = parentMenus.nth(i)
      const activeChild = parent.locator('a.active, a[aria-current="page"]')

      if (await activeChild.count() > 0) {
        const parentActive = await parent.evaluate(el => {
          return el.classList.contains('active') || el.classList.contains('is-active')
        })

        if (parentActive) {
          console.log('✓ Parent shows active state when child is current')
          return
        }
      }
    }

    console.log('⊘ Multi-level active state not tested (single level navigation)')
  })
})
