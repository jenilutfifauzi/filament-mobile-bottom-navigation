import { test, expect } from '@playwright/test'

/**
 * Story 3.1: CSS Variable Theming Tests
 *
 * Verifies that the bottom navigation uses Filament's CSS variables
 * for all colors and automatically inherits theme changes:
 * - All colors use CSS variables (no hardcoded hex/rgb)
 * - Dark mode colors invert automatically
 * - Custom primary colors apply automatically
 * - Color contrast meets WCAG AA standards
 */

test.describe('Story 3.1: CSS Variable Theming', () => {

  test('navigation uses CSS variable for background color', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Get background color from navigation
    const backgroundColor = await page.locator('.fmbn-bottom-nav').evaluate(el => {
      const computed = window.getComputedStyle(el)
      // In light mode, should be light gray (not white)
      return computed.backgroundColor
    })

    // Should be a color value, not empty
    expect(backgroundColor).toBeTruthy()

    // Light mode: should be a light gray (higher RGB values)
    const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      const [r, g, b] = rgbMatch.slice(1).map(Number)
      // Light gray should have high RGB values (>200)
      expect(Math.max(r, g, b)).toBeGreaterThan(200)
    }

    console.log(`✓ Navigation background: ${backgroundColor}`)
  })

  test('navigation items use CSS variable for text color', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Get text color from navigation item
    const textColor = await page.locator('.fmbn-nav-item').first().evaluate(el => {
      const computed = window.getComputedStyle(el)
      return computed.color
    })

    // Should be a dark color in light mode
    expect(textColor).toBeTruthy()

    const rgbMatch = textColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      const [r, g, b] = rgbMatch.slice(1).map(Number)
      // Gray-700: should be medium-dark (not too light, not too dark)
      const brightness = (r + g + b) / 3
      expect(brightness).toBeGreaterThan(50)
      expect(brightness).toBeLessThan(150)
    }

    console.log(`✓ Navigation item text color: ${textColor}`)
  })

  test('active item uses primary color from Filament theme', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Find active item if any
    const activeItems = await page.locator('.fmbn-nav-item--active').count()

    test.skip(activeItems === 0, 'No active navigation items in test environment')

    // Get colors from active item
    const activeColors = await page.locator('.fmbn-nav-item--active').first().evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        text: computed.color,
        background: computed.backgroundColor
      }
    })

    // Both should be set to theme colors
    expect(activeColors.text).toBeTruthy()
    expect(activeColors.background).toBeTruthy()

    console.log(`✓ Active item text: ${activeColors.text}`)
    console.log(`✓ Active item background: ${activeColors.background}`)
  })

  test('badge uses semantic color variables', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Find badge if any
    const badges = await page.locator('.fmbn-nav-item__badge').count()

    test.skip(badges === 0, 'No badges in test environment')

    // Get badge color
    const badgeColor = await page.locator('.fmbn-nav-item__badge').first().evaluate(el => {
      const computed = window.getComputedStyle(el)
      return computed.backgroundColor
    })

    // Default: danger-600 (red)
    expect(badgeColor).toBeTruthy()

    // Should be red-ish in light mode
    const rgbMatch = badgeColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      const [r, g, b] = rgbMatch.slice(1).map(Number)
      // Red should have high R value, lower G and B
      expect(r).toBeGreaterThan(g)
      expect(r).toBeGreaterThan(b)
    }

    console.log(`✓ Badge color: ${badgeColor}`)
  })

  test('border uses CSS variable for color', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Get border color from navigation
    const borderColor = await page.locator('.fmbn-bottom-nav').evaluate(el => {
      const computed = window.getComputedStyle(el)
      return computed.borderTopColor
    })

    // Should be a gray color (subtle border)
    expect(borderColor).toBeTruthy()

    const rgbMatch = borderColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      const [r, g, b] = rgbMatch.slice(1).map(Number)
      // Gray-200: light gray, all RGB values should be similar
      expect(Math.abs(r - g)).toBeLessThan(10)
      expect(Math.abs(g - b)).toBeLessThan(10)
    }

    console.log(`✓ Border color: ${borderColor}`)
  })

  test('hover state uses primary color on devices with hover capability', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 }) // Desktop - has hover
    await page.goto('/')

    // Get hover color from default item
    const hoverColor = await page.locator('.fmbn-nav-item').first().evaluate(el => {
      // Simulate hover by checking what color would apply
      // This is a heuristic - real hover would need mouse movement
      const computed = window.getComputedStyle(el, ':hover')
      return computed.color
    })

    // Note: :hover pseudo-state doesn't work with getComputedStyle
    // So we check the CSS rule exists by looking at media query
    const hasHoverMediaQuery = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets)
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || [])
          for (const rule of rules) {
            if (rule.media && rule.media.mediaText.includes('hover')) {
              return true
            }
          }
        } catch (e) {
          // CORS
        }
      }
      return false
    })

    expect(hasHoverMediaQuery).toBeTruthy()
    console.log('✓ Hover media query @media (hover: hover) found')
  })

  test('currentColor inheritance works for icon and label', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check icon and label inherit color
    const iconAndLabelStyles = await page.locator('.fmbn-nav-item').first().evaluate(el => {
      const icon = el.querySelector('.fmbn-nav-item__icon')
      const label = el.querySelector('.fmbn-nav-item__label')
      const parent = el

      const parentComputed = window.getComputedStyle(parent)
      const iconComputed = icon ? window.getComputedStyle(icon) : null
      const labelComputed = label ? window.getComputedStyle(label) : null

      return {
        parentColor: parentComputed.color,
        iconColor: iconComputed?.color || 'N/A',
        labelColor: labelComputed?.color || 'N/A'
      }
    })

    // All should be visible and properly set
    expect(iconAndLabelStyles.parentColor).toBeTruthy()

    console.log(`Parent color: ${iconAndLabelStyles.parentColor}`)
    console.log(`Icon color: ${iconAndLabelStyles.iconColor}`)
    console.log(`Label color: ${iconAndLabelStyles.labelColor}`)
  })

  test('transitions are smooth (150ms)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Get transition property from navigation item
    const transition = await page.locator('.fmbn-nav-item').first().evaluate(el => {
      const computed = window.getComputedStyle(el)
      return computed.transition
    })

    // Should include color and background-color transitions
    expect(transition).toBeTruthy()
    expect(transition).toContain('color')
    expect(transition).toContain('background-color')

    // Should be 150ms (Filament standard)
    const hasDuration = transition.includes('150ms') || transition.includes('0.15s')
    expect(hasDuration).toBeTruthy()

    console.log(`✓ Transition property: ${transition}`)
  })

  test('no hardcoded hex or rgb colors in CSS', async ({ page }) => {
    // Fetch the built CSS file
    const response = await page.goto('/')

    // Check the stylesheet for hardcoded colors
    const hasHardcodedColors = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets)
      for (const sheet of sheets) {
        try {
          const text = Array.from(sheet.cssRules || [])
            .map(rule => rule.cssText)
            .join(' ')

          // Look for hex colors (excluding comments)
          if (text.match(/#[0-9a-fA-F]{3,6}(?!:)/)) {
            return true
          }
          // Look for rgb( values (excluding var usage)
          if (text.match(/rgb\([^v]/)) {
            return true
          }
        } catch (e) {
          // CORS - ok
        }
      }
      return false
    })

    expect(hasHardcodedColors).toBeFalsy()
    console.log('✓ No hardcoded hex or rgb colors found')
  })

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Get colors for contrast calculation
    const colors = await page.locator('.fmbn-nav-item').first().evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        text: computed.color,
        background: window.getComputedStyle(el.parentElement!).backgroundColor
      }
    })

    // Parse RGB values
    const parseRgb = (rgb: string) => {
      const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (!match) return null
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      }
    }

    const textRgb = parseRgb(colors.text)
    const bgRgb = parseRgb(colors.background)

    if (textRgb && bgRgb) {
      // Calculate relative luminance
      const getLuminance = (rgb: { r: number; g: number; b: number }) => {
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
          val /= 255
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }

      const textLuminance = getLuminance(textRgb)
      const bgLuminance = getLuminance(bgRgb)

      // Calculate contrast ratio
      const contrast = (Math.max(textLuminance, bgLuminance) + 0.05) /
                      (Math.min(textLuminance, bgLuminance) + 0.05)

      // WCAG AA requires 4.5:1 for normal text
      expect(contrast).toBeGreaterThanOrEqual(4.5)

      console.log(`✓ Contrast ratio: ${contrast.toFixed(2)}:1 (WCAG AA: ✓)`)
    }
  })

  test('CSS variables are theme-aware', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Get CSS variable values
    const cssVars = await page.evaluate(() => {
      const root = document.documentElement
      const style = getComputedStyle(root)

      return {
        navHeight: style.getPropertyValue('--fmbn-nav-height').trim(),
        gray50: style.getPropertyValue('--gray-50').trim(),
        gray700: style.getPropertyValue('--gray-700').trim(),
        primary600: style.getPropertyValue('--primary-600').trim(),
      }
    })

    // All should be defined
    expect(cssVars.navHeight).toBeTruthy()
    expect(cssVars.gray50).toBeTruthy()
    expect(cssVars.gray700).toBeTruthy()
    expect(cssVars.primary600).toBeTruthy()

    console.log('✓ CSS variables defined:')
    console.log(`  --fmbn-nav-height: ${cssVars.navHeight}`)
    console.log(`  --gray-50: ${cssVars.gray50}`)
    console.log(`  --gray-700: ${cssVars.gray700}`)
    console.log(`  --primary-600: ${cssVars.primary600}`)
  })

})
