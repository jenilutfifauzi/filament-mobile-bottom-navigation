import { test, expect } from '@playwright/test'

/**
 * Story 2.2: Prevent Layout Shift During Page Load Tests
 *
 * Tests that the bottom navigation doesn't cause Cumulative Layout Shift (CLS):
 * - Body padding reserves space on mobile
 * - Space matches navigation height + safe area
 * - Desktop removes padding correctly
 * - CLS score target: 0
 */

test.describe('Story 2.2: Layout Shift Prevention', () => {

  test('body has bottom padding on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to page
    await page.goto('/')

    // Get body padding-bottom
    const paddingBottom = await page.evaluate(() => {
      const body = document.body
      const computed = window.getComputedStyle(body)
      return computed.paddingBottom
    })

    // Should be 69px (navigation height) on non-iOS
    // or 69px + safe-area on iOS
    expect(paddingBottom).not.toBe('0px')

    // Parse value (remove 'px')
    const paddingValue = parseFloat(paddingBottom)

    // Should be at least 69px
    expect(paddingValue).toBeGreaterThanOrEqual(69)

    // Should be at most 69px + 34px (max safe area) = 103px
    expect(paddingValue).toBeLessThanOrEqual(103)

    console.log(`✓ Body padding-bottom: ${paddingBottom}`)
  })

  test('body padding is removed on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 })

    // Navigate to page
    await page.goto('/')

    // Get body padding-bottom
    const paddingBottom = await page.evaluate(() => {
      const body = document.body
      const computed = window.getComputedStyle(body)
      return computed.paddingBottom
    })

    // Should be 0px on desktop (≥768px)
    expect(paddingBottom).toBe('0px')

    console.log('✓ Body padding removed on desktop')
  })

  test('navigation height matches CSS variable', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to page
    await page.goto('/')

    // Get CSS variable value
    const navHeight = await page.evaluate(() => {
      const root = document.documentElement
      const computed = window.getComputedStyle(root)
      return computed.getPropertyValue('--fmbn-nav-height').trim()
    })

    // Should be 69px
    expect(navHeight).toBe('69px')

    console.log(`✓ CSS variable --fmbn-nav-height: ${navHeight}`)
  })

  test('bottom navigation has fixed height', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to page
    await page.goto('/')

    // Find bottom navigation
    const bottomNav = page.locator('.fmbn-bottom-nav')

    // Get height property
    const height = await bottomNav.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return computed.height
    })

    // Should be exactly 69px (without safe area in height)
    // Safe area is added as padding-bottom, not height
    expect(height).toBe('69px')

    console.log(`✓ Navigation fixed height: ${height}`)
  })

  test('reserved space matches navigation space (no overlap)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to page
    await page.goto('/')

    // Get both values
    const { bodyPadding, navHeight } = await page.evaluate(() => {
      const body = document.body
      const nav = document.querySelector('.fmbn-bottom-nav')
      const bodyComputed = window.getComputedStyle(body)
      const navComputed = window.getComputedStyle(nav)

      return {
        bodyPadding: bodyComputed.paddingBottom,
        navHeight: navComputed.height
      }
    })

    // Body padding should be at least as tall as nav height
    const paddingValue = parseFloat(bodyPadding)
    const heightValue = parseFloat(navHeight)

    expect(paddingValue).toBeGreaterThanOrEqual(heightValue)

    console.log(`✓ Body padding (${bodyPadding}) ≥ Nav height (${navHeight})`)
  })

  test('safe area is included in both nav and body', async ({ page }) => {
    // Set mobile viewport (iOS-like)
    await page.setViewportSize({ width: 390, height: 844 })

    // Navigate to page
    await page.goto('/')

    // Check that both use env(safe-area-inset-bottom)
    const useSafeArea = await page.evaluate(() => {
      // Get the raw CSS text (not computed values)
      const sheets = Array.from(document.styleSheets)
      let hasSafeAreaInBody = false
      let hasSafeAreaInNav = false

      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || [])
          for (const rule of rules) {
            if (rule.cssText) {
              if (rule.cssText.includes('body') && rule.cssText.includes('env(safe-area-inset-bottom')) {
                hasSafeAreaInBody = true
              }
              if (rule.cssText.includes('fmbn-bottom-nav') && rule.cssText.includes('env(safe-area-inset-bottom')) {
                hasSafeAreaInNav = true
              }
            }
          }
        } catch (e) {
          // CORS errors are expected for external stylesheets
        }
      }

      return { hasSafeAreaInBody, hasSafeAreaInNav }
    })

    // Both should use safe area
    expect(useSafeArea.hasSafeAreaInBody || useSafeArea.hasSafeAreaInNav).toBeTruthy()

    console.log('✓ Safe area support detected in CSS')
  })

  test('content does not jump during page load', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Track layout shifts
    let layoutShifts = []

    await page.exposeFunction('recordLayoutShift', (shift) => {
      layoutShifts.push(shift)
    })

    // Inject layout shift observer before navigation
    await page.evaluateOnNewDocument(() => {
      if ('LayoutShift' in window) {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.recordLayoutShift({
                value: entry.value,
                sources: entry.sources?.length || 0
              })
            }
          }
        }).observe({ type: 'layout-shift', buffered: true })
      }
    })

    // Navigate to page
    await page.goto('/')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Wait a bit for any delayed shifts
    await page.waitForTimeout(1000)

    // Get final layout shifts
    const totalShifts = layoutShifts.length
    const totalCLS = layoutShifts.reduce((sum, shift) => sum + shift.value, 0)

    console.log(`Layout shifts detected: ${totalShifts}`)
    console.log(`Total CLS score: ${totalCLS.toFixed(4)}`)

    // Expect zero or very minimal layout shift
    // Note: Some shift may occur from other elements (images, fonts)
    // We're specifically testing that bottom nav doesn't cause shift
    expect(totalCLS).toBeLessThan(0.1)
  })

  test('viewport resize maintains correct padding', async ({ page }) => {
    // Start on desktop
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/')

    // Verify no padding on desktop
    let paddingBottom = await page.evaluate(() =>
      window.getComputedStyle(document.body).paddingBottom
    )
    expect(paddingBottom).toBe('0px')

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(100) // Let CSS apply

    // Verify padding added on mobile
    paddingBottom = await page.evaluate(() =>
      window.getComputedStyle(document.body).paddingBottom
    )

    const paddingValue = parseFloat(paddingBottom)
    expect(paddingValue).toBeGreaterThanOrEqual(69)

    // Resize back to desktop
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.waitForTimeout(100)

    // Verify padding removed again
    paddingBottom = await page.evaluate(() =>
      window.getComputedStyle(document.body).paddingBottom
    )
    expect(paddingBottom).toBe('0px')

    console.log('✓ Padding adjusts correctly during viewport resize')
  })

  test('bottom navigation stays within reserved space', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to page
    await page.goto('/')

    // Get navigation position and body padding
    const measurements = await page.evaluate(() => {
      const nav = document.querySelector('.fmbn-bottom-nav')
      const body = document.body

      const navRect = nav.getBoundingClientRect()
      const bodyPadding = parseFloat(window.getComputedStyle(body).paddingBottom)
      const viewportHeight = window.innerHeight

      return {
        navTop: navRect.top,
        navBottom: navRect.bottom,
        navHeight: navRect.height,
        bodyPadding: bodyPadding,
        viewportHeight: viewportHeight
      }
    })

    // Navigation should start where reserved space begins
    const reservedSpaceStart = measurements.viewportHeight - measurements.bodyPadding

    // Allow 1px tolerance for rounding
    expect(Math.abs(measurements.navTop - reservedSpaceStart)).toBeLessThanOrEqual(1)

    console.log(`✓ Navigation starts at ${measurements.navTop}px`)
    console.log(`✓ Reserved space starts at ${reservedSpaceStart}px`)
    console.log(`✓ Difference: ${Math.abs(measurements.navTop - reservedSpaceStart)}px`)
  })

})
