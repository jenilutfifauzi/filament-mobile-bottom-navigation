import { test, expect } from '@playwright/test'

/**
 * Story 3.2: Automatic Dark Mode Support Tests
 *
 * Verifies that the bottom navigation automatically adapts to dark mode
 * through Filament's CSS variable system (no code changes needed).
 *
 * Dark mode works automatically because:
 * 1. Story 3.1 uses CSS variables (var(--gray-50), var(--primary-600))
 * 2. Filament changes CSS variable VALUES when dark mode is enabled
 * 3. Our CSS stays the same - only variable values change
 * 4. Result: Automatic dark mode support!
 */

test.describe('Story 3.2: Automatic Dark Mode Support', () => {

  test('CSS variables are defined and accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Get CSS variable values from root
    const cssVariables = await page.evaluate(() => {
      const root = document.documentElement
      const computed = getComputedStyle(root)

      return {
        gray50: computed.getPropertyValue('--gray-50').trim(),
        gray200: computed.getPropertyValue('--gray-200').trim(),
        gray700: computed.getPropertyValue('--gray-700').trim(),
        primary50: computed.getPropertyValue('--primary-50').trim(),
        primary600: computed.getPropertyValue('--primary-600').trim(),
        primary700: computed.getPropertyValue('--primary-700').trim(),
        danger600: computed.getPropertyValue('--danger-600').trim(),
      }
    })

    // All variables should be defined
    expect(cssVariables.gray50).toBeTruthy()
    expect(cssVariables.gray200).toBeTruthy()
    expect(cssVariables.gray700).toBeTruthy()
    expect(cssVariables.primary50).toBeTruthy()
    expect(cssVariables.primary600).toBeTruthy()
    expect(cssVariables.danger600).toBeTruthy()

    console.log('✓ CSS variables defined:')
    console.log(`  --gray-50: ${cssVariables.gray50}`)
    console.log(`  --gray-700: ${cssVariables.gray700}`)
    console.log(`  --primary-600: ${cssVariables.primary600}`)
  })

  test('dark mode colors invert when class added', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Get light mode colors
    const lightModeColors = await page.evaluate(() => {
      const nav = document.querySelector('.fmbn-bottom-nav')
      const computed = window.getComputedStyle(nav!)

      return {
        background: computed.backgroundColor,
        borderColor: computed.borderTopColor
      }
    })

    // Simulate dark mode by adding .dark class
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    // Wait for CSS to recalculate
    await page.waitForTimeout(100)

    // Get dark mode colors
    const darkModeColors = await page.evaluate(() => {
      const nav = document.querySelector('.fmbn-bottom-nav')
      const computed = window.getComputedStyle(nav!)

      return {
        background: computed.backgroundColor,
        borderColor: computed.borderTopColor
      }
    })

    // Colors should be different (dark mode inverted)
    expect(lightModeColors.background).not.toBe(darkModeColors.background)

    console.log(`Light mode background: ${lightModeColors.background}`)
    console.log(`Dark mode background: ${darkModeColors.background}`)
    console.log('✓ Colors invert when dark mode enabled')
  })

  test('text color inverts appropriately for readability', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Get light mode text color
    const lightModeText = await page.evaluate(() => {
      const item = document.querySelector('.fmbn-nav-item')
      const computed = window.getComputedStyle(item!)
      return computed.color
    })

    // Add dark mode class
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    await page.waitForTimeout(100)

    // Get dark mode text color
    const darkModeText = await page.evaluate(() => {
      const item = document.querySelector('.fmbn-nav-item')
      const computed = window.getComputedStyle(item!)
      return computed.color
    })

    // Colors should be different
    expect(lightModeText).not.toBe(darkModeText)

    // In dark mode, text should be lighter (higher RGB values)
    const parseLightness = (color: string) => {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (!match) return 0
      const [r, g, b] = match.slice(1).map(Number)
      return (r + g + b) / 3
    }

    const lightModeBrightness = parseLightness(lightModeText)
    const darkModeBrightness = parseLightness(darkModeText)

    // In dark mode, text should be lighter than light mode
    expect(darkModeBrightness).toBeGreaterThan(lightModeBrightness)

    console.log(`Light mode text brightness: ${lightModeBrightness.toFixed(1)}`)
    console.log(`Dark mode text brightness: ${darkModeBrightness.toFixed(1)}`)
    console.log('✓ Text color inverts for readability')
  })

  test('active state remains visible in dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check if there are active items
    const activeCount = await page.locator('.fmbn-nav-item--active').count()
    test.skip(activeCount === 0, 'No active items in test environment')

    // Get light mode active colors
    const lightModeActive = await page.evaluate(() => {
      const item = document.querySelector('.fmbn-nav-item--active')
      const computed = window.getComputedStyle(item!)

      return {
        text: computed.color,
        background: computed.backgroundColor
      }
    })

    // Add dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    await page.waitForTimeout(100)

    // Get dark mode active colors
    const darkModeActive = await page.evaluate(() => {
      const item = document.querySelector('.fmbn-nav-item--active')
      const computed = window.getComputedStyle(item!)

      return {
        text: computed.color,
        background: computed.backgroundColor
      }
    })

    // Colors should change
    expect(lightModeActive.text).not.toBe(darkModeActive.text)
    expect(lightModeActive.background).not.toBe(darkModeActive.background)

    console.log(`Light active text: ${lightModeActive.text}`)
    console.log(`Dark active text: ${darkModeActive.text}`)
    console.log('✓ Active state visible in dark mode')
  })

  test('contrast ratio maintained in dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    await page.waitForTimeout(100)

    // Get colors
    const colors = await page.evaluate(() => {
      const nav = document.querySelector('.fmbn-bottom-nav')
      const navComputed = window.getComputedStyle(nav!)

      const item = document.querySelector('.fmbn-nav-item')
      const itemComputed = window.getComputedStyle(item!)

      return {
        navBg: navComputed.backgroundColor,
        itemText: itemComputed.color
      }
    })

    // Parse RGB and calculate contrast
    const parseRgb = (rgb: string) => {
      const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (!match) return null
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      }
    }

    const navBgRgb = parseRgb(colors.navBg)
    const itemTextRgb = parseRgb(colors.itemText)

    if (navBgRgb && itemTextRgb) {
      // Calculate luminance
      const getLuminance = (rgb: { r: number; g: number; b: number }) => {
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
          val /= 255
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }

      const navLum = getLuminance(navBgRgb)
      const textLum = getLuminance(itemTextRgb)

      // Calculate contrast
      const contrast = (Math.max(navLum, textLum) + 0.05) /
                      (Math.min(navLum, textLum) + 0.05)

      // Should meet WCAG AA (4.5:1)
      expect(contrast).toBeGreaterThanOrEqual(4.5)

      console.log(`✓ Dark mode contrast ratio: ${contrast.toFixed(2)}:1 (WCAG AA: ✓)`)
    }
  })

  test('badge color visible in dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check for badges
    const badgeCount = await page.locator('.fmbn-nav-item__badge').count()
    test.skip(badgeCount === 0, 'No badges in test environment')

    // Get light mode badge
    const lightBadge = await page.evaluate(() => {
      const badge = document.querySelector('.fmbn-nav-item__badge')
      const computed = window.getComputedStyle(badge!)

      return {
        bg: computed.backgroundColor,
        color: computed.color
      }
    })

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    await page.waitForTimeout(100)

    // Get dark mode badge
    const darkBadge = await page.evaluate(() => {
      const badge = document.querySelector('.fmbn-nav-item__badge')
      const computed = window.getComputedStyle(badge!)

      return {
        bg: computed.backgroundColor,
        color: computed.color
      }
    })

    // Colors should remain visible
    expect(lightBadge.bg).toBeTruthy()
    expect(darkBadge.bg).toBeTruthy()
    expect(darkBadge.color).toBe('rgb(255, 255, 255)') // White text

    console.log(`Light badge: ${lightBadge.bg}`)
    console.log(`Dark badge: ${darkBadge.bg}`)
    console.log('✓ Badge visible in dark mode')
  })

  test('smooth transition on dark mode toggle', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Get transition property
    const transition = await page.evaluate(() => {
      const item = document.querySelector('.fmbn-nav-item')
      const computed = window.getComputedStyle(item!)
      return computed.transition
    })

    // Should have color transition (from Story 3.1)
    expect(transition).toContain('color')
    expect(transition).toContain('background-color')

    console.log(`✓ Smooth transitions configured: ${transition}`)
  })

  test('dark mode toggle multiple times without errors', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Toggle dark mode 5 times
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        const html = document.documentElement
        if (html.classList.contains('dark')) {
          html.classList.remove('dark')
        } else {
          html.classList.add('dark')
        }
      })

      await page.waitForTimeout(100)
    }

    // Should have no errors
    expect(consoleErrors).toEqual([])

    console.log('✓ Multiple dark mode toggles completed without errors')
  })

  test('border visibility in dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Get light mode border
    const lightBorder = await page.evaluate(() => {
      const nav = document.querySelector('.fmbn-bottom-nav')
      const computed = window.getComputedStyle(nav!)

      return {
        color: computed.borderTopColor,
        width: computed.borderTopWidth
      }
    })

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    await page.waitForTimeout(100)

    // Get dark mode border
    const darkBorder = await page.evaluate(() => {
      const nav = document.querySelector('.fmbn-bottom-nav')
      const computed = window.getComputedStyle(nav!)

      return {
        color: computed.borderTopColor,
        width: computed.borderTopWidth
      }
    })

    // Border should be visible in both modes
    expect(lightBorder.color).toBeTruthy()
    expect(darkBorder.color).toBeTruthy()
    expect(darkBorder.width).toBe(lightBorder.width)

    console.log(`Light border: ${lightBorder.color} (${lightBorder.width})`)
    console.log(`Dark border: ${darkBorder.color} (${darkBorder.width})`)
    console.log('✓ Border visible in both light and dark modes')
  })

  test('no hardcoded colors means dark mode works automatically', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Verify no hardcoded colors in CSS
    const hasHardcodedColors = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets)

      for (const sheet of sheets) {
        try {
          const text = Array.from(sheet.cssRules || [])
            .map(rule => rule.cssText)
            .join(' ')

          // Check for hex colors (excluding comments)
          if (text.match(/#[0-9a-fA-F]{3,6}(?!:)/)) {
            return 'hex colors'
          }

          // Check for rgb colors
          if (text.match(/rgb\([^v]/)) {
            return 'rgb colors'
          }
        } catch (e) {
          // CORS ok
        }
      }

      return null
    })

    expect(hasHardcodedColors).toBeNull()

    console.log('✓ No hardcoded colors = automatic dark mode support')
  })

  test('dark mode with custom primary color compatibility', async ({ page }) => {
    // This verifies the system can handle different primary colors
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Get primary color variable
    const primaryColor = await page.evaluate(() => {
      const root = document.documentElement
      const computed = getComputedStyle(root)
      return computed.getPropertyValue('--primary-600').trim()
    })

    // Should be defined
    expect(primaryColor).toBeTruthy()

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    await page.waitForTimeout(100)

    // Primary color should still be defined in dark mode
    const darkPrimaryColor = await page.evaluate(() => {
      const root = document.documentElement
      const computed = getComputedStyle(root)
      return computed.getPropertyValue('--primary-600').trim()
    })

    expect(darkPrimaryColor).toBeTruthy()
    expect(darkPrimaryColor).not.toBe(primaryColor) // Should be different (lighter for dark mode)

    console.log(`Light primary-600: ${primaryColor}`)
    console.log(`Dark primary-600: ${darkPrimaryColor}`)
    console.log('✓ Primary color adapts to dark mode')
  })

})
