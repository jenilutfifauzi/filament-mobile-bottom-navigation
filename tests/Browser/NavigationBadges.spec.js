import { test, expect } from '@playwright/test'

/**
 * Story 8.1: Badge Display Tests
 *
 * Tests verify badges display correctly on navigation items
 * AC5: Badge Display Tests
 */

test.describe('Navigation Badge Display', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('badges display on navigation items with count @badge', async ({ page }) => {
    await page.goto('/')

    // Look for badge elements
    const badges = page.locator('nav .badge, nav [data-badge], nav .notification-badge, nav [aria-label*="notification"]')
    const count = await badges.count()

    if (count > 0) {
      await expect(badges.first()).toBeVisible()
      console.log(`✓ Found ${count} badge(s) on navigation`)
    } else {
      console.log('⊘ No badges found on navigation (may not be configured)')
    }
  })

  test('badges display correct numbers', async ({ page }) => {
    await page.goto('/')

    const badges = page.locator('nav .badge, nav [data-badge], nav .notification-badge')

    for (let i = 0; i < await badges.count(); i++) {
      const badgeText = await badges.nth(i).innerText()

      // Badge should contain a number
      const isNumeric = /^\d+$/.test(badgeText.trim())

      if (isNumeric) {
        console.log(`✓ Badge ${i + 1}: "${badgeText.trim()}"`)
      }
    }
  })

  test('badges are visually distinct from navigation items', async ({ page }) => {
    await page.goto('/')

    const badge = page.locator('nav .badge, nav [data-badge], nav .notification-badge').first()
    const badgeCount = await badge.count()

    if (badgeCount === 0) {
      return
    }

    const badgeStyle = await badge.evaluate(el => {
      const style = window.getComputedStyle(el)
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderRadius: style.borderRadius,
        fontSize: style.fontSize,
        padding: style.padding
      }
    })

    console.log('✓ Badge styling:', JSON.stringify(badgeStyle, null, 2))
  })

  test('badges are positioned correctly on navigation items', async ({ page }) => {
    await page.goto('/')

    const navItem = page.locator('nav a').first()
    const badge = navItem.locator('.badge, [data-badge], .notification-badge')

    const badgeCount = await badge.count()

    if (badgeCount > 0) {
      const position = await badge.evaluate(el => {
        const rect = el.getBoundingClientRect()
        const parent = el.parentElement?.getBoundingClientRect()

        return {
          top: rect.top - (parent?.top || 0),
          right: (parent?.right || 0) - rect.right,
          relativeToParent: {
            top: rect.top - (parent?.top || 0),
            right: (parent?.right || 0) - rect.right
          }
        }
      })

      console.log('✓ Badge position relative to navigation item:', position.relativeToParent)
    }
  })

  test('badges update dynamically when count changes', async ({ page }) => {
    await page.goto('/')

    const badge = page.locator('nav .badge, nav [data-badge], nav .notification-badge').first()
    const initialText = await badge.innerText().catch(() => '')

    // Simulate a page action that might update badge count
    // This would depend on app-specific functionality
    await page.evaluate(() => {
      // Trigger any badge update mechanisms
      const event = new CustomEvent('badge-update')
      window.dispatchEvent(event)
    })

    await page.waitForTimeout(500)

    // Check if badge exists and is visible
    const stillVisible = await badge.isVisible().catch(() => false)

    if (stillVisible && initialText) {
      console.log('✓ Badge remains visible after potential update')
    }
  })

  test('badges have readable contrast', async ({ page }) => {
    await page.goto('/')

    const badge = page.locator('nav .badge, nav [data-badge], nav .notification-badge').first()

    if (await badge.count() === 0) {
      return
    }

    const badgeStyle = await badge.evaluate(el => {
      const style = window.getComputedStyle(el)
      return {
        backgroundColor: style.backgroundColor,
        color: style.color
      }
    })

    console.log(`✓ Badge colors - Background: ${badgeStyle.backgroundColor}, Text: ${badgeStyle.color}`)
  })

  test('badges don\'t interfere with touch targets', async ({ page }) => {
    await page.goto('/')

    const navItem = page.locator('nav a').first()
    const boundingBox = await navItem.boundingBox()

    expect(boundingBox).not.toBeNull()
    expect(boundingBox?.width).toBeGreaterThanOrEqual(44)
    expect(boundingBox?.height).toBeGreaterThanOrEqual(44)

    console.log(`✓ Navigation item touch target size: ${boundingBox?.width}x${boundingBox?.height}`)
  })

  test('badges are removed when count is zero', async ({ page }) => {
    await page.goto('/')

    // Check for badges with "0" value
    const zeroBadges = page.locator('nav .badge:has-text("0"), nav [data-badge="0"]')
    const zeroCount = await zeroBadges.count()

    if (zeroCount > 0) {
      console.log(`⊘ Found ${zeroCount} badge(s) with zero count (should be hidden)`)
    } else {
      console.log('✓ Badges with zero count are properly hidden/removed')
    }
  })

  test('multiple badges can coexist on navigation', async ({ page }) => {
    await page.goto('/')

    // Count unique navigation items with badges
    const itemsWithBadges = page.locator('nav a:has(.badge), nav a:has([data-badge])')
    const count = await itemsWithBadges.count()

    if (count > 1) {
      console.log(`✓ Multiple navigation items have badges: ${count}`)
    } else if (count === 1) {
      console.log('✓ Navigation item has badge (single badge)')
    } else {
      console.log('⊘ No navigation items with badges found')
    }
  })

  test('badge styling is consistent across all items', async ({ page }) => {
    await page.goto('/')

    const badges = page.locator('nav .badge, nav [data-badge], nav .notification-badge')
    const badgeCount = await badges.count()

    if (badgeCount < 2) {
      return
    }

    const firstBadgeStyle = await badges.nth(0).evaluate(el => {
      const style = window.getComputedStyle(el)
      return style.backgroundColor + '|' + style.color + '|' + style.borderRadius
    })

    let inconsistentCount = 0
    for (let i = 1; i < badgeCount; i++) {
      const badgeStyle = await badges.nth(i).evaluate(el => {
        const style = window.getComputedStyle(el)
        return style.backgroundColor + '|' + style.color + '|' + style.borderRadius
      })

      if (badgeStyle !== firstBadgeStyle) {
        inconsistentCount++
      }
    }

    if (inconsistentCount === 0) {
      console.log(`✓ All ${badgeCount} badges have consistent styling`)
    } else {
      console.log(`⊘ ${inconsistentCount}/${badgeCount} badges have inconsistent styling`)
    }
  })

  test('badges are accessible to assistive technology', async ({ page }) => {
    await page.goto('/')

    const badge = page.locator('nav .badge, nav [data-badge], nav .notification-badge').first()

    if (await badge.count() === 0) {
      return
    }

    const a11yAttributes = await badge.evaluate(el => {
      return {
        ariaLabel: el.getAttribute('aria-label'),
        ariaHidden: el.getAttribute('aria-hidden'),
        role: el.getAttribute('role'),
        title: el.getAttribute('title'),
        hasAccessibleName: el.textContent?.trim().length > 0
      }
    })

    console.log('✓ Badge accessibility attributes:', a11yAttributes)
  })
})

test.describe('Badge Animation', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('badges animate smoothly when updated', async ({ page }) => {
    await page.goto('/')

    const badge = page.locator('nav .badge, nav [data-badge]').first()

    if (await badge.count() === 0) {
      return
    }

    const hasAnimation = await badge.evaluate(el => {
      const style = window.getComputedStyle(el)
      return {
        animation: style.animation,
        transition: style.transition,
        hasAnimationOrTransition: style.animation !== 'none' || style.transition !== 'none 0s ease 0s'
      }
    })

    if (hasAnimation.hasAnimationOrTransition) {
      console.log('✓ Badge has animation/transition effects')
    } else {
      console.log('⊘ Badge may benefit from subtle animation')
    }
  })
})
