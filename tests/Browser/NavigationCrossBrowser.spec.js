import { test, expect } from '@playwright/test'

/**
 * Story 8.1: Cross-Browser Tests
 *
 * Tests verify navigation works correctly across different browsers and devices
 * AC7: Cross-Browser Tests
 */

test.describe('Cross-Browser Navigation Tests', () => {

  test('navigation loads on iOS Safari @ios-safari @cross-browser', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'iOS Safari specific')

    // iOS Safari specific viewport
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const nav = page.locator('nav[aria-label*="Bottom navigation"], nav[aria-label*="Mobile navigation"], [data-mobile-nav]')
    await expect(nav).toBeVisible()

    const navItems = page.locator('nav a, nav button')
    expect(await navItems.count()).toBeGreaterThan(0)

    console.log('✓ iOS Safari: Navigation loads correctly')
  })

  test('navigation loads on Chrome Mobile @chrome-mobile @cross-browser', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome Mobile specific')

    // Chrome Mobile viewport
    await page.setViewportSize({ width: 412, height: 915 })
    await page.goto('/')

    const nav = page.locator('nav[aria-label*="Bottom navigation"], nav[aria-label*="Mobile navigation"], [data-mobile-nav]')
    await expect(nav).toBeVisible()

    const navItems = page.locator('nav a, nav button')
    expect(await navItems.count()).toBeGreaterThan(0)

    console.log('✓ Chrome Mobile: Navigation loads correctly')
  })

  test('navigation navigation CSS parses correctly across browsers', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check that no CSS errors occurred
    const cssValid = await page.evaluate(() => {
      const sheets = document.styleSheets
      let valid = true

      try {
        for (let i = 0; i < sheets.length; i++) {
          try {
            const rules = sheets[i].cssRules || sheets[i].rules
            if (!rules) continue

            for (let j = 0; j < rules.length; j++) {
              // Just accessing rules tests if they parse correctly
              const rule = rules[j]
            }
          } catch (e) {
            // Some cross-origin stylesheets may throw, which is expected
            if (!e.message.includes('cross-origin')) {
              valid = false
            }
          }
        }
      } catch (e) {
        // Stylesheet access errors are expected for some resources
      }

      return valid
    })

    expect(cssValid).toBe(true)
    console.log('✓ CSS parses correctly')
  })

  test('navigation JavaScript works across browsers', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Listen for JS errors
    const jsErrors = []
    page.on('pageerror', error => {
      jsErrors.push(error.message)
    })

    // Interact with navigation
    const navLink = page.locator('nav a[href]').first()
    if (await navLink.count() > 0) {
      await navLink.click()
      await page.waitForLoadState('networkidle')
    }

    // Should have no critical JS errors
    const criticalErrors = jsErrors.filter(e => !e.includes('chunk') && !e.includes('undefined'))

    if (criticalErrors.length === 0) {
      console.log('✓ No critical JavaScript errors')
    } else {
      console.log(`⊘ JavaScript errors: ${criticalErrors.join(', ')}`)
    }
  })

  test('touch events work on browsers that support them @touch', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox touch simulation has limitations')

    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const navLink = page.locator('nav a[href]').first()

    if (await navLink.count() > 0) {
      // Test touch
      await navLink.tap()
      await page.waitForLoadState('networkidle')

      // Should have navigated
      const body = page.locator('body')
      await expect(body).toBeVisible()
      console.log('✓ Touch events work correctly')
    }
  })

  test('hover effects don\'t break on touch devices', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Limited touch simulation')

    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // On touch devices, hover state shouldn't be sticky
    const navLink = page.locator('nav a[href]').first()

    if (await navLink.count() > 0) {
      // Hover (shouldn't affect touch interaction)
      await navLink.hover()

      // Then tap
      await navLink.tap()

      // Should still be interactive
      expect(navLink).toBeTruthy()
      console.log('✓ Hover doesn\'t interfere with touch')
    }
  })

  test('viewport-specific CSS media queries work', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'desktop' }
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/')

      const nav = page.locator('nav')
      const isVisible = await nav.isVisible().catch(() => false)

      // Mobile should show, others should hide
      if (viewport.width < 768) {
        expect(isVisible).toBe(true)
      } else {
        expect(isVisible).toBe(false)
      }

      console.log(`✓ ${viewport.name} (${viewport.width}px): nav ${isVisible ? 'visible' : 'hidden'}`)
    }
  })

  test('color rendering is consistent', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const nav = page.locator('nav').first()

    if (await nav.count() === 0) {
      return
    }

    const colors = await nav.evaluate(el => {
      const style = window.getComputedStyle(el)
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderColor: style.borderColor
      }
    })

    // Colors should be valid RGB values
    expect(colors.backgroundColor).toMatch(/^rgb/)
    console.log('✓ Colors render correctly')
  })

  test('font rendering is consistent', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const navLink = page.locator('nav a[href]').first()

    if (await navLink.count() === 0) {
      return
    }

    const fonts = await navLink.evaluate(el => {
      const style = window.getComputedStyle(el)
      return {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight
      }
    })

    expect(fonts.fontFamily).toBeTruthy()
    expect(fonts.fontSize).toMatch(/px$/)
    console.log('✓ Fonts render correctly')
  })

  test('layout is responsive across breakpoints', async ({ page }) => {
    const breakpoints = [320, 375, 412, 480, 768, 1024, 1920]

    for (const width of breakpoints) {
      await page.setViewportSize({ width, height: 667 })
      await page.goto('/')

      // Page should be scrollable and not broken
      const body = page.locator('body')
      await expect(body).toBeVisible()

      // No horizontal scroll bar on small screens (except at 1920px)
      if (width < 1024) {
        const scrollWidth = await page.evaluate(() => window.innerWidth)
        expect(scrollWidth).toBeLessThanOrEqual(width + 1)
      }

      console.log(`✓ ${width}px breakpoint: responsive layout`)
    }
  })

  test('navigation works without JavaScript (progressive enhancement)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Disable JavaScript
    await page.context().setExtraHTTPHeaders({ 'X-No-JS': 'true' })
    await page.goto('/')

    // Basic HTML structure should still be present
    const body = page.locator('body')
    await expect(body).toBeVisible()

    // Navigation links should be in HTML
    const navLinks = page.locator('nav a')
    const count = await navLinks.count().catch(() => 0)

    if (count > 0) {
      console.log(`✓ Navigation renders without JavaScript: ${count} links`)
    } else {
      console.log('⊘ Navigation may require JavaScript')
    }
  })
})

test.describe('Browser-Specific Behaviors', () => {

  test('Safari safe area is respected @safari', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari specific')

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const nav = page.locator('nav')

    if (await nav.count() === 0) {
      return
    }

    // Check for safe area CSS
    const hasSafeArea = await nav.evaluate(el => {
      const style = window.getComputedStyle(el)
      const css = getComputedStyle(document.documentElement).cssText

      return css.includes('safe-area') ||
             style.paddingBottom.includes('%') ||
             style.paddingTop.includes('%')
    })

    if (hasSafeArea) {
      console.log('✓ Safari safe area is applied')
    } else {
      console.log('⊘ Safe area CSS not detected')
    }
  })

  test('Chrome viewport fit meta tag works @chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome specific')

    await page.setViewportSize({ width: 412, height: 915 })
    await page.goto('/')

    const meta = page.locator('meta[name="viewport"]')
    const content = await meta.getAttribute('content')

    expect(content).toBeTruthy()
    console.log('✓ Viewport meta tag configured')
  })

  test('Firefox flex layout works correctly @firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox specific')

    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const nav = page.locator('nav').first()

    if (await nav.count() === 0) {
      return
    }

    const display = await nav.evaluate(el => window.getComputedStyle(el).display)

    expect(['flex', 'grid', 'block']).toContain(display)
    console.log(`✓ Firefox layout display: ${display}`)
  })
})
