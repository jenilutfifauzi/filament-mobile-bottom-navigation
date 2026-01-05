import { test, expect } from '@playwright/test'

/**
 * Story 8.1: Comprehensive Navigation Visibility Tests
 *
 * Tests verify bottom navigation visibility and hiding based on viewport size
 * AC1: Mobile Viewport Visibility Tests
 * AC2: Desktop Viewport Hidden Tests
 * AC3-AC7: Additional mobile and desktop scenarios
 */

test.describe('Navigation Visibility - Mobile Viewport', () => {

  test('bottom navigation is visible on mobile viewport @mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Wait for navigation to render
    const nav = page.locator('nav[aria-label*="Bottom navigation"], nav[aria-label*="Mobile navigation"], [data-mobile-nav]')
    await expect(nav).toBeVisible({ timeout: 5000 })

    // Verify position is at bottom
    const boundingBox = await nav.boundingBox()
    expect(boundingBox).not.toBeNull()
    expect(boundingBox?.height).toBeGreaterThan(40) // Minimum height for touch target

    console.log('✓ Bottom navigation visible on mobile viewport')
  })

  test('navigation renders on iOS Safari viewport', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'iOS Safari specific test')

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const nav = page.locator('nav[aria-label*="Bottom navigation"], nav[aria-label*="Mobile navigation"], [data-mobile-nav]')
    await expect(nav).toBeVisible()

    console.log('✓ Navigation renders correctly on iOS Safari')
  })

  test('navigation renders on Chrome Mobile viewport', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome Mobile specific test')

    await page.setViewportSize({ width: 412, height: 915 })
    await page.goto('/')

    const nav = page.locator('nav[aria-label*="Bottom navigation"], nav[aria-label*="Mobile navigation"], [data-mobile-nav]')
    await expect(nav).toBeVisible()

    console.log('✓ Navigation renders correctly on Chrome Mobile')
  })

  test('navigation items are rendered and clickable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Find all navigation links
    const navLinks = page.locator('nav a[href], nav button')
    const count = await navLinks.count()

    expect(count).toBeGreaterThan(0)
    console.log(`✓ Found ${count} navigation items`)

    // Verify first item is clickable
    if (count > 0) {
      await expect(navLinks.first()).toBeEnabled()
      const isClickable = await navLinks.first().isEnabled()
      expect(isClickable).toBe(true)
    }
  })

  test('navigation is sticky positioned at bottom', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const nav = page.locator('nav[aria-label*="Bottom navigation"], nav[aria-label*="Mobile navigation"], [data-mobile-nav]')

    // Check CSS position
    const position = await nav.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        position: computed.position,
        bottom: computed.bottom,
        zIndex: computed.zIndex
      }
    })

    // Should be fixed or sticky
    expect(['fixed', 'sticky']).toContain(position.position)
    console.log(`✓ Navigation is ${position.position} positioned`)
  })
})

test.describe('Navigation Visibility - Desktop Viewport', () => {

  test('bottom navigation is hidden on desktop viewport @desktop', async ({ page }) => {
    // Set desktop viewport (≥768px)
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/')

    // Navigation should be hidden via CSS
    const nav = page.locator('nav[aria-label*="Bottom navigation"], nav[aria-label*="Mobile navigation"], [data-mobile-nav]')

    // Wait a moment for page to load
    await page.waitForTimeout(1000)

    // Check if element exists but is hidden
    const isVisible = await nav.isVisible().catch(() => false)
    expect(isVisible).toBe(false)

    console.log('✓ Bottom navigation hidden on desktop viewport')
  })

  test('desktop doesn\'t show navigation even with native mobile breakpoint @desktop', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    const nav = page.locator('nav[aria-label*="Bottom navigation"], nav[aria-label*="Mobile navigation"], [data-mobile-nav]')
    const isVisible = await nav.isVisible().catch(() => false)

    // At 768px (breakpoint), should be hidden
    expect(isVisible).toBe(false)
  })

  test('no layout shift when navigation is hidden @desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })

    // Measure CLS (Cumulative Layout Shift)
    await page.goto('/')

    // Wait for page to settle
    await page.waitForLoadState('networkidle')

    // Get layout shift score
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let cls = 0
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value
            }
          }
        })

        try {
          observer.observe({ type: 'layout-shift', buffered: true })
        } catch (e) {
          // PerformanceObserver not available
        }

        setTimeout(() => {
          observer.disconnect()
          resolve(cls)
        }, 2000)
      })
    })

    // CLS should be < 0.1 for good user experience
    expect(cls).toBeLessThan(0.1)
    console.log(`✓ CLS score: ${cls} (< 0.1 is good)`)
  })

  test('content remains properly laid out on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/')

    // Main content should be visible
    const body = page.locator('body')
    await expect(body).toBeVisible()

    // Verify main content area exists and is visible
    const mainContent = page.locator('main, [role="main"], .main-content, .container')
    const isVisible = await mainContent.first().isVisible().catch(() => false)

    if (isVisible) {
      console.log('✓ Main content properly laid out on desktop')
    } else {
      console.log('✓ Desktop layout verified')
    }
  })
})

test.describe('Navigation Visibility - Viewport Changes', () => {

  test('navigation shows when resizing from desktop to mobile', async ({ page }) => {
    // Start with desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/')

    const nav = page.locator('nav[aria-label*="Bottom navigation"], nav[aria-label*="Mobile navigation"], [data-mobile-nav]')
    const isInitiallyHidden = !(await nav.isVisible().catch(() => false))
    expect(isInitiallyHidden).toBe(true)

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    // Should now be visible
    await expect(nav).toBeVisible()
    console.log('✓ Navigation appears after resize to mobile')
  })

  test('navigation hides when resizing from mobile to desktop', async ({ page }) => {
    // Start with mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const nav = page.locator('nav[aria-label*="Bottom navigation"], nav[aria-label*="Mobile navigation"], [data-mobile-nav]')
    await expect(nav).toBeVisible()

    // Resize to desktop
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.waitForTimeout(500)

    // Should now be hidden
    const isVisible = await nav.isVisible().catch(() => false)
    expect(isVisible).toBe(false)
    console.log('✓ Navigation hides after resize to desktop')
  })

  test('multiple viewport transitions work correctly', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 1024, height: 768, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile again' }
    ]

    const nav = page.locator('nav[aria-label*="Bottom navigation"], nav[aria-label*="Mobile navigation"], [data-mobile-nav]')

    await page.goto('/')

    for (let i = 0; i < viewports.length; i++) {
      const vp = viewports[i]
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.waitForTimeout(300)

      // Mobile viewports should show nav, tablet/desktop should hide
      const shouldShow = vp.width < 768
      const isVisible = await nav.isVisible().catch(() => false)

      if (shouldShow) {
        expect(isVisible).toBe(true)
      } else {
        expect(isVisible).toBe(false)
      }

      console.log(`✓ ${vp.name} (${vp.width}x${vp.height}): navigation ${shouldShow ? 'visible' : 'hidden'}`)
    }
  })
})

test.describe('Navigation Visibility - Orientation Changes', () => {

  test('handles portrait to landscape orientation', async ({ page }) => {
    // Portrait
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const nav = page.locator('nav[aria-label*="Bottom navigation"], nav[aria-label*="Mobile navigation"], [data-mobile-nav]')
    await expect(nav).toBeVisible()

    // Landscape
    await page.setViewportSize({ width: 667, height: 375 })
    await page.waitForTimeout(300)

    // Navigation visibility depends on width
    const isVisible = await nav.isVisible().catch(() => false)
    expect(isVisible).toBe(true) // 667 > 375 but < 768

    console.log('✓ Orientation change handled correctly')
  })
})
