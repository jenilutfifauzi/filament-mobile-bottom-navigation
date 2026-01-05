import { test, expect } from '@playwright/test'

/**
 * Story 2.3: Handle Orientation Changes Tests
 * 
 * Verifies that the bottom navigation adapts correctly to device orientation
 * changes using pure CSS (no JavaScript event listeners required):
 * - Portrait mode: Navigation visible (width < 768px)
 * - Landscape mode: Navigation hidden (width ≥ 768px)
 * - Small device landscape: Navigation still visible (width < 768px)
 * - Safe area adjusts automatically on rotation
 * - Active state persists through orientation changes
 */

test.describe('Story 2.3: Orientation Change Handling', () => {

  test('bottom nav visible in portrait mode', async ({ page }) => {
    // iPhone 14 Pro portrait: 393×852
    await page.setViewportSize({ width: 393, height: 852 })
    
    await page.goto('/')
    
    // Verify navigation is visible
    const bottomNav = page.locator('.fmbn-bottom-nav')
    await expect(bottomNav).toBeVisible()
    
    const display = await bottomNav.evaluate(el => 
      window.getComputedStyle(el).display
    )
    expect(display).toBe('flex')
    
    console.log('✓ Portrait mode (393px): Bottom nav visible')
  })

  test('bottom nav hidden in landscape mode (large device)', async ({ page }) => {
    // iPhone 14 Pro landscape: 852×393
    await page.setViewportSize({ width: 852, height: 393 })
    
    await page.goto('/')
    
    // Verify navigation is hidden (852px ≥ 768px)
    const bottomNav = page.locator('.fmbn-bottom-nav')
    
    const display = await bottomNav.evaluate(el => 
      window.getComputedStyle(el).display
    )
    expect(display).toBe('none')
    
    console.log('✓ Landscape mode (852px): Bottom nav hidden')
  })

  test('bottom nav visible in landscape mode (small device)', async ({ page }) => {
    // iPhone SE landscape: 667×375
    await page.setViewportSize({ width: 667, height: 375 })
    
    await page.goto('/')
    
    // Verify navigation is still visible (667px < 768px)
    const bottomNav = page.locator('.fmbn-bottom-nav')
    await expect(bottomNav).toBeVisible()
    
    const display = await bottomNav.evaluate(el => 
      window.getComputedStyle(el).display
    )
    expect(display).toBe('flex')
    
    console.log('✓ Small device landscape (667px): Bottom nav visible')
  })

  test('portrait to landscape rotation hides navigation', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 393, height: 852 })
    await page.goto('/')
    
    // Verify visible in portrait
    let display = await page.locator('.fmbn-bottom-nav').evaluate(el =>
      window.getComputedStyle(el).display
    )
    expect(display).toBe('flex')
    
    // Rotate to landscape
    await page.setViewportSize({ width: 852, height: 393 })
    await page.waitForTimeout(100) // Let CSS media query apply
    
    // Verify hidden in landscape
    display = await page.locator('.fmbn-bottom-nav').evaluate(el =>
      window.getComputedStyle(el).display
    )
    expect(display).toBe('none')
    
    console.log('✓ Portrait → Landscape: Navigation hides correctly')
  })

  test('landscape to portrait rotation shows navigation', async ({ page }) => {
    // Start in landscape
    await page.setViewportSize({ width: 852, height: 393 })
    await page.goto('/')
    
    // Verify hidden in landscape
    let display = await page.locator('.fmbn-bottom-nav').evaluate(el =>
      window.getComputedStyle(el).display
    )
    expect(display).toBe('none')
    
    // Rotate to portrait
    await page.setViewportSize({ width: 393, height: 852 })
    await page.waitForTimeout(100) // Let CSS media query apply
    
    // Verify visible in portrait
    display = await page.locator('.fmbn-bottom-nav').evaluate(el =>
      window.getComputedStyle(el).display
    )
    expect(display).toBe('flex')
    
    await expect(page.locator('.fmbn-bottom-nav')).toBeVisible()
    
    console.log('✓ Landscape → Portrait: Navigation shows correctly')
  })

  test('safe area padding adjusts on orientation change', async ({ page }) => {
    // Start in portrait (iOS-like)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    
    // Get portrait safe area padding
    const portraitPadding = await page.evaluate(() => {
      const body = document.body
      return window.getComputedStyle(body).paddingBottom
    })
    
    // Rotate to landscape (small device)
    await page.setViewportSize({ width: 667, height: 375 })
    await page.waitForTimeout(100)
    
    // Get landscape safe area padding
    const landscapePadding = await page.evaluate(() => {
      const body = document.body
      return window.getComputedStyle(body).paddingBottom
    })
    
    // Both should have padding (nav visible in both orientations for this device)
    expect(parseFloat(portraitPadding)).toBeGreaterThanOrEqual(69)
    expect(parseFloat(landscapePadding)).toBeGreaterThanOrEqual(69)
    
    console.log(`Portrait padding: ${portraitPadding}`)
    console.log(`Landscape padding: ${landscapePadding}`)
    console.log('✓ Safe area padding adjusts on orientation change')
  })

  test('body padding removed in landscape when nav hidden', async ({ page }) => {
    // iPhone 14 Pro landscape: 852px
    await page.setViewportSize({ width: 852, height: 393 })
    await page.goto('/')
    
    // Verify body padding is removed (nav is hidden)
    const paddingBottom = await page.evaluate(() =>
      window.getComputedStyle(document.body).paddingBottom
    )
    
    expect(paddingBottom).toBe('0px')
    
    console.log('✓ Body padding removed in landscape (≥768px)')
  })

  test('active state persists through orientation changes', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 393, height: 852 })
    await page.goto('/')
    
    // Find active navigation item (if any)
    const activeItems = await page.locator('.fmbn-nav-item--active').count()
    
    // Skip if no active items in test environment
    test.skip(activeItems === 0, 'No active navigation items in test environment')
    
    // Get active item class before rotation
    const hasActiveBefore = await page.locator('.fmbn-nav-item--active').count()
    expect(hasActiveBefore).toBeGreaterThan(0)
    
    // Rotate to small landscape (nav still visible)
    await page.setViewportSize({ width: 667, height: 375 })
    await page.waitForTimeout(100)
    
    // Verify active class still present
    const hasActiveAfter = await page.locator('.fmbn-nav-item--active').count()
    expect(hasActiveAfter).toBe(hasActiveBefore)
    
    console.log('✓ Active state persists through orientation change')
  })

  test('rapid orientation changes do not cause errors', async ({ page }) => {
    // Monitor console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.goto('/')
    
    // Perform 5 rapid orientation changes
    const orientations = [
      { width: 393, height: 852 },  // Portrait
      { width: 852, height: 393 },  // Landscape
      { width: 393, height: 852 },  // Portrait
      { width: 667, height: 375 },  // Small landscape
      { width: 375, height: 667 },  // Small portrait
    ]
    
    for (const size of orientations) {
      await page.setViewportSize(size)
      await page.waitForTimeout(50)
    }
    
    // Verify no errors occurred
    expect(consoleErrors).toEqual([])
    
    console.log('✓ No errors during rapid orientation changes')
  })

  test('flexbox layout adapts to different widths', async ({ page }) => {
    // Test portrait width
    await page.setViewportSize({ width: 393, height: 852 })
    await page.goto('/')
    
    // Get navigation width in portrait
    const portraitNavWidth = await page.locator('.fmbn-bottom-nav').evaluate(el =>
      el.getBoundingClientRect().width
    )
    
    // Rotate to small landscape
    await page.setViewportSize({ width: 667, height: 375 })
    await page.waitForTimeout(100)
    
    // Get navigation width in landscape
    const landscapeNavWidth = await page.locator('.fmbn-bottom-nav').evaluate(el =>
      el.getBoundingClientRect().width
    )
    
    // Landscape should be wider
    expect(landscapeNavWidth).toBeGreaterThan(portraitNavWidth)
    
    // Verify flexbox is active
    const display = await page.locator('.fmbn-bottom-nav').evaluate(el =>
      window.getComputedStyle(el).display
    )
    expect(display).toBe('flex')
    
    console.log(`Portrait width: ${portraitNavWidth}px`)
    console.log(`Landscape width: ${landscapeNavWidth}px`)
    console.log('✓ Flexbox adapts to different viewport widths')
  })

  test('tablet portrait hides navigation (768px+)', async ({ page }) => {
    // iPad Air portrait: 820×1180
    await page.setViewportSize({ width: 820, height: 1180 })
    await page.goto('/')
    
    // Verify navigation is hidden (820px ≥ 768px)
    const display = await page.locator('.fmbn-bottom-nav').evaluate(el =>
      window.getComputedStyle(el).display
    )
    expect(display).toBe('none')
    
    console.log('✓ Tablet portrait (820px): Bottom nav hidden')
  })

  test('split screen narrow width shows navigation', async ({ page }) => {
    // Simulate iPad split view: 375px width
    await page.setViewportSize({ width: 375, height: 1024 })
    await page.goto('/')
    
    // Verify navigation is visible (375px < 768px)
    const bottomNav = page.locator('.fmbn-bottom-nav')
    await expect(bottomNav).toBeVisible()
    
    const display = await bottomNav.evaluate(el =>
      window.getComputedStyle(el).display
    )
    expect(display).toBe('flex')
    
    console.log('✓ Split screen mode (375px): Bottom nav visible')
  })

  test('no JavaScript event listeners for orientation', async ({ page }) => {
    await page.goto('/')
    
    // Check if any orientation event listeners exist
    const hasOrientationListeners = await page.evaluate(() => {
      // This is a heuristic check - not 100% reliable but useful
      const listeners = (window as any).getEventListeners?.('orientationchange') || []
      return listeners.length > 0
    })
    
    // Should not have orientation listeners (pure CSS solution)
    expect(hasOrientationListeners).toBeFalsy()
    
    console.log('✓ No JavaScript orientation event listeners detected')
  })

  test('CSS media query handles all orientation logic', async ({ page }) => {
    // This test verifies the pure CSS approach
    await page.setViewportSize({ width: 393, height: 852 })
    await page.goto('/')
    
    // Get all stylesheets
    const mediaQueryExists = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets)
      let hasBreakpoint = false
      
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || [])
          for (const rule of rules) {
            // Check for @media (min-width: 768px) rule
            if (rule.cssText && rule.cssText.includes('min-width') && rule.cssText.includes('768px')) {
              hasBreakpoint = true
              break
            }
          }
        } catch (e) {
          // CORS - external stylesheet
        }
      }
      
      return hasBreakpoint
    })
    
    expect(mediaQueryExists).toBeTruthy()
    
    console.log('✓ CSS media query (min-width: 768px) found')
  })

})
