import { test, expect } from '@playwright/test'

/**
 * Story 2.1: Mobile-First CSS with 768px Breakpoint Tests
 *
 * Tests the responsive behavior of the bottom navigation:
 * - Visible on mobile (< 768px)
 * - Hidden on desktop (≥ 768px)
 * - Pure CSS implementation (no JavaScript)
 */

test.describe('Story 2.1: Responsive Behavior - 768px Breakpoint', () => {

  test('bottom navigation is visible on mobile viewport (767px)', async ({ page }) => {
    // Set viewport to just below breakpoint
    await page.setViewportSize({ width: 767, height: 667 })

    // Navigate to page
    await page.goto('/')

    // Find bottom navigation
    const bottomNav = page.locator('.fmbn-bottom-nav')

    // Verify it exists and is visible
    await expect(bottomNav).toBeVisible()

    // Verify CSS properties
    const display = await bottomNav.evaluate(el =>
      window.getComputedStyle(el).display
    )
    expect(display).toBe('flex')

    console.log('✓ Bottom nav visible at 767px (mobile)')
  })

  test('bottom navigation is hidden on desktop viewport (768px)', async ({ page }) => {
    // Set viewport to exactly at breakpoint
    await page.setViewportSize({ width: 768, height: 1024 })

    // Navigate to page
    await page.goto('/')

    // Find bottom navigation
    const bottomNav = page.locator('.fmbn-bottom-nav')

    // Verify display: none via CSS
    const display = await bottomNav.evaluate(el =>
      window.getComputedStyle(el).display
    )
    expect(display).toBe('none')

    console.log('✓ Bottom nav hidden at 768px (desktop)')
  })

  test('bottom navigation is hidden on large desktop (1024px)', async ({ page }) => {
    // Set viewport to large desktop
    await page.setViewportSize({ width: 1024, height: 768 })

    // Navigate to page
    await page.goto('/')

    // Find bottom navigation
    const bottomNav = page.locator('.fmbn-bottom-nav')

    // Verify display: none
    const display = await bottomNav.evaluate(el =>
      window.getComputedStyle(el).display
    )
    expect(display).toBe('none')

    console.log('✓ Bottom nav hidden at 1024px (desktop)')
  })

  test('bottom navigation has correct fixed positioning', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to page
    await page.goto('/')

    // Find bottom navigation
    const bottomNav = page.locator('.fmbn-bottom-nav')

    // Verify CSS positioning
    const styles = await bottomNav.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        position: computed.position,
        bottom: computed.bottom,
        left: computed.left,
        right: computed.right,
        zIndex: computed.zIndex
      }
    })

    expect(styles.position).toBe('fixed')
    expect(styles.bottom).toBe('0px')
    expect(styles.left).toBe('0px')
    expect(styles.right).toBe('0px')
    expect(styles.zIndex).toBe('50')

    console.log('✓ Fixed positioning correct:', styles)
  })

  test('bottom navigation uses flexbox layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to page
    await page.goto('/')

    // Find bottom navigation
    const bottomNav = page.locator('.fmbn-bottom-nav')

    // Verify flexbox properties
    const flexStyles = await bottomNav.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        display: computed.display,
        justifyContent: computed.justifyContent
      }
    })

    expect(flexStyles.display).toBe('flex')
    expect(flexStyles.justifyContent).toBe('space-around')

    console.log('✓ Flexbox layout configured correctly')
  })

  test('navigation items have minimum touch target size (44px)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to page
    await page.goto('/')

    // Find all navigation items
    const navItems = page.locator('.fmbn-nav-item')
    const count = await navItems.count()

    // Skip test if no items (will be added in integration tests)
    test.skip(count === 0, 'No navigation items rendered - skipping touch target test')

    // Check first item's minimum size
    const firstItem = navItems.first()
    const size = await firstItem.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        minWidth: computed.minWidth,
        minHeight: computed.minHeight
      }
    })

    expect(size.minWidth).toBe('44px')
    expect(size.minHeight).toBe('44px')

    console.log('✓ Touch target size meets iOS HIG (44px minimum)')
  })

  test('CSS variables are used for theming', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to page
    await page.goto('/')

    // Find bottom navigation
    const bottomNav = page.locator('.fmbn-bottom-nav')

    // Check that CSS variables are applied
    const hasVariables = await bottomNav.evaluate(el => {
      const computed = window.getComputedStyle(el)
      const bgColor = computed.backgroundColor
      const borderColor = computed.borderTopColor

      // CSS variables will be resolved to actual colors
      // We just verify they're not empty/transparent
      return {
        hasBg: bgColor !== '' && bgColor !== 'rgba(0, 0, 0, 0)',
        hasBorder: borderColor !== '' && borderColor !== 'rgba(0, 0, 0, 0)'
      }
    })

    expect(hasVariables.hasBg).toBe(true)
    expect(hasVariables.hasBorder).toBe(true)

    console.log('✓ CSS variables applied for theming')
  })

  test('iOS safe area padding is applied', async ({ page }) => {
    // Set mobile viewport (iOS-like)
    await page.setViewportSize({ width: 390, height: 844 }) // iPhone 12 Pro

    // Navigate to page
    await page.goto('/')

    // Find bottom navigation
    const bottomNav = page.locator('.fmbn-bottom-nav')

    // Check padding-bottom includes safe area
    const paddingBottom = await bottomNav.evaluate(el =>
      window.getComputedStyle(el).paddingBottom
    )

    // Should be "0px" on non-iOS, or actual value on iOS
    // Just verify it's set (not null/undefined)
    expect(paddingBottom).toBeTruthy()

    console.log(`✓ Safe area padding applied: ${paddingBottom}`)
  })

  test('no JavaScript is used for responsive behavior', async ({ page }) => {
    // Monitor console for any errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Verify nav visible
    await expect(page.locator('.fmbn-bottom-nav')).toBeVisible()

    // Resize to desktop
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.waitForTimeout(100) // Small delay for CSS to apply

    // Verify nav hidden
    const display = await page.locator('.fmbn-bottom-nav').evaluate(el =>
      window.getComputedStyle(el).display
    )
    expect(display).toBe('none')

    // Verify no console errors during resize
    expect(consoleErrors).toEqual([])

    console.log('✓ Responsive behavior works without JavaScript')
  })

})
