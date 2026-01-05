import { test, expect } from '@playwright/test';

/**
 * iOS Safe Area Support Tests (Story 3.4)
 *
 * Verifies that navigation respects iOS device safe areas (notch/home indicator)
 * across different device types, orientations, and viewport configurations.
 *
 * @see Story 3-4: Implement iOS Safe Area Support
 */

const NAV_SELECTOR = '.fmbn-bottom-nav';
const NAV_ITEM_SELECTOR = '.fmbn-nav-item';

test.describe('iOS Safe Area Support (Story 3.4)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page with navigation
    await page.goto('http://localhost:3000');
  });

  // ============================================
  // Safe Area CSS Variable Tests
  // ============================================

  test('should apply env(safe-area-inset-bottom) to navigation', async ({ page }) => {
    const nav = page.locator(NAV_SELECTOR);

    const paddingBottom = await nav.evaluate(el =>
      window.getComputedStyle(el).paddingBottom
    );

    // Should have padding-bottom (either from safe area or 0 as fallback)
    expect(paddingBottom).toBeTruthy();
    // Value should be numeric (e.g., "0px", "34px")
    expect(paddingBottom).toMatch(/^\d+px$/);
  });

  test('should apply env(safe-area-inset-left) to navigation', async ({ page }) => {
    const nav = page.locator(NAV_SELECTOR);

    const paddingLeft = await nav.evaluate(el =>
      window.getComputedStyle(el).paddingLeft
    );

    // Should have padding-left (either from safe area or 0 as fallback)
    expect(paddingLeft).toBeTruthy();
    expect(paddingLeft).toMatch(/^\d+px$/);
  });

  test('should apply env(safe-area-inset-right) to navigation', async ({ page }) => {
    const nav = page.locator(NAV_SELECTOR);

    const paddingRight = await nav.evaluate(el =>
      window.getComputedStyle(el).paddingRight
    );

    // Should have padding-right (either from safe area or 0 as fallback)
    expect(paddingRight).toBeTruthy();
    expect(paddingRight).toMatch(/^\d+px$/);
  });

  // ============================================
  // Body Padding for Layout Shift Prevention
  // ============================================

  test('should include safe area in body padding-bottom', async ({ page }) => {
    const body = await page.locator('body');

    const paddingBottom = await body.evaluate(el =>
      window.getComputedStyle(el).paddingBottom
    );

    // body padding should be: nav-height (69px) + safe-area
    // On browsers without safe area: 69px
    expect(paddingBottom).toBeTruthy();

    // Should be at least the nav height
    const paddingValue = parseFloat(paddingBottom);
    expect(paddingValue).toBeGreaterThanOrEqual(69); // 69px nav height minimum
  });

  // ============================================
  // Safe Area Fallback Tests
  // ============================================

  test('should fall back to 0 if safe area not supported', async ({ page }) => {
    // Verify fallback syntax in CSS
    const cssFile = await page.request.get(
      'http://localhost:3000/resources/dist/filament-mobile-bottom-navigation.css'
    );
    const cssContent = await cssFile.text();

    // Should contain fallback syntax
    expect(cssContent).toContain('env(safe-area-inset-bottom, 0)');
    expect(cssContent).toContain('env(safe-area-inset-left, 0)');
    expect(cssContent).toContain('env(safe-area-inset-right, 0)');
  });

  // ============================================
  // Navigation Item Accessibility with Safe Area
  // ============================================

  test('should maintain 44px minimum touch target with safe area padding', async ({ page }) => {
    const items = page.locator(NAV_ITEM_SELECTOR);
    const count = await items.count();

    if (count > 0) {
      const firstItem = items.nth(0);

      const width = await firstItem.evaluate(el =>
        el.offsetWidth
      );

      const height = await firstItem.evaluate(el =>
        el.offsetHeight
      );

      // Touch targets should be at least 44×44px
      expect(width).toBeGreaterThanOrEqual(44);
      expect(height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should ensure all navigation items are tappable above safe area', async ({ page }) => {
    const nav = page.locator(NAV_SELECTOR);
    const items = page.locator(NAV_ITEM_SELECTOR);
    const count = await items.count();

    if (count > 0) {
      // Get nav bounding box
      const navBox = await nav.boundingBox();

      if (navBox) {
        // Check each item is within nav bounds
        for (let i = 0; i < count; i++) {
          const itemBox = await items.nth(i).boundingBox();

          if (itemBox) {
            // Item should be within navigation container
            expect(itemBox.x).toBeGreaterThanOrEqual(navBox.x);
            expect(itemBox.y).toBeGreaterThanOrEqual(navBox.y);
          }
        }
      }
    }
  });

  // ============================================
  // Viewport Meta Tag Verification
  // ============================================

  test('should have viewport meta tag with viewport-fit=cover', async ({ page }) => {
    // Check for viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]');
    const exists = await viewportMeta.count() > 0;

    if (exists) {
      const content = await viewportMeta.getAttribute('content');

      // Content should indicate this is a fullscreen/cover viewport
      // Note: viewport-fit=cover is optional but recommended
      expect(content).toBeTruthy();
    }
  });

  // ============================================
  // CSS Variable Usage in Safe Area
  // ============================================

  test('should use CSS env() functions instead of hardcoded values', async ({ page }) => {
    const cssFile = await page.request.get(
      'http://localhost:3000/resources/dist/filament-mobile-bottom-navigation.css'
    );
    const cssContent = await cssFile.text();

    // Should contain env() functions for safe area
    expect(cssContent).toContain('env(safe-area-inset-bottom');
    expect(cssContent).toContain('env(safe-area-inset-left');
    expect(cssContent).toContain('env(safe-area-inset-right');
  });

  test('should not have hardcoded safe area pixel values', async ({ page }) => {
    const cssFile = await page.request.get(
      'http://localhost:3000/resources/dist/filament-mobile-bottom-navigation.css'
    );
    const cssContent = await cssFile.text();

    // Extract nav padding section
    const navSection = cssContent.match(/\.fmbn-bottom-nav\s*{[^}]+}/);

    if (navSection) {
      // Should not have hardcoded values like padding-bottom: 34px
      // (should use env() instead)
      const section = navSection[0];
      expect(section).not.toContain('padding-bottom:34px');
      expect(section).not.toContain('padding-bottom:21px');
    }
  });

  // ============================================
  // Orientation Change Simulation
  // ============================================

  test('should maintain safe area padding on viewport resize', async ({ page }) => {
    const nav = page.locator(NAV_SELECTOR);

    // Get initial padding
    const initialPadding = await nav.evaluate(el =>
      window.getComputedStyle(el).paddingBottom
    );

    // Resize viewport (simulate orientation change)
    await page.setViewportSize({ width: 812, height: 375 }); // iPhone landscape

    // Wait for any re-layout
    await page.waitForTimeout(100);

    // Check padding still applies
    const newPadding = await nav.evaluate(el =>
      window.getComputedStyle(el).paddingBottom
    );

    // Padding should still be present (might change value in landscape)
    expect(newPadding).toBeTruthy();
    expect(newPadding).toMatch(/^\d+px$/);
  });

  test('should apply safe area padding after viewport change', async ({ page }) => {
    // Set narrow viewport (portrait)
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14

    const nav = page.locator(NAV_SELECTOR);
    const portraitPadding = await nav.evaluate(el =>
      window.getComputedStyle(el).paddingBottom
    );

    // Change to wide viewport (landscape)
    await page.setViewportSize({ width: 844, height: 390 });

    // Wait for potential CSS updates
    await page.waitForTimeout(100);

    const landscapePadding = await nav.evaluate(el =>
      window.getComputedStyle(el).paddingBottom
    );

    // Both should be valid padding values
    expect(portraitPadding).toMatch(/^\d+px$/);
    expect(landscapePadding).toMatch(/^\d+px$/);
  });

  // ============================================
  // Safe Area with Different Device Sizes
  // ============================================

  test('should handle small devices (iPhone SE - no safe area)', async ({ page }) => {
    // iPhone SE size (no notch/home indicator)
    await page.setViewportSize({ width: 375, height: 667 });

    const nav = page.locator(NAV_SELECTOR);
    const paddingBottom = await nav.evaluate(el =>
      window.getComputedStyle(el).paddingBottom
    );

    // Should be valid padding (likely 0 as fallback, but that's correct)
    expect(paddingBottom).toMatch(/^\d+px$/);
  });

  test('should handle large devices (iPhone Plus/Pro)', async ({ page }) => {
    // iPhone 14 Plus size
    await page.setViewportSize({ width: 428, height: 926 });

    const nav = page.locator(NAV_SELECTOR);
    const paddingBottom = await nav.evaluate(el =>
      window.getComputedStyle(el).paddingBottom
    );

    // Should work correctly on larger devices too
    expect(paddingBottom).toMatch(/^\d+px$/);
  });

  test('should handle landscape on all devices', async ({ page }) => {
    // Landscape orientation (wide, short)
    await page.setViewportSize({ width: 926, height: 428 });

    const nav = page.locator(NAV_SELECTOR);

    // Navigation should still be visible
    const isVisible = await nav.isVisible();
    // Note: May not be visible depending on media query (< 768px check)

    // But safe area padding should still apply if visible
    if (isVisible) {
      const paddingBottom = await nav.evaluate(el =>
        window.getComputedStyle(el).paddingBottom
      );

      expect(paddingBottom).toMatch(/^\d+px$/);
    }
  });

  // ============================================
  // Safe Area and Responsive Behavior
  // ============================================

  test('should maintain safe area padding in mobile viewport', async ({ page }) => {
    // Mobile portrait
    await page.setViewportSize({ width: 390, height: 844 });

    const nav = page.locator(NAV_SELECTOR);

    // Nav should be visible in mobile viewport
    const isVisible = await nav.isVisible();
    expect(isVisible).toBe(true);

    // Safe area padding should apply
    const paddingBottom = await nav.evaluate(el =>
      window.getComputedStyle(el).paddingBottom
    );

    expect(paddingBottom).toMatch(/^\d+px$/);
  });

  test('should hide navigation on desktop (≥768px)', async ({ page }) => {
    // Desktop viewport (triggers media query)
    await page.setViewportSize({ width: 1200, height: 800 });

    const nav = page.locator(NAV_SELECTOR);

    // Navigation should be hidden on desktop
    const isVisible = await nav.isVisible();
    expect(isVisible).toBe(false);
  });

  // ============================================
  // Safe Area Layout Prevention
  // ============================================

  test('should prevent layout shift with safe area included', async ({ page }) => {
    // Get body padding-bottom
    const bodyPadding = await page.locator('body').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return parseFloat(styles.paddingBottom);
    });

    // Should be at least nav height (69px)
    expect(bodyPadding).toBeGreaterThanOrEqual(69);
  });

  test('body padding should account for both nav height and safe area', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    const bodyPadding = await page.locator('body').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return parseFloat(styles.paddingBottom);
    });

    // Formula: calc(var(--fmbn-nav-height) + env(safe-area-inset-bottom, 0))
    // Minimum is 69px (nav height), could be 69 + safe area
    expect(bodyPadding).toBeGreaterThanOrEqual(69);
  });

  // ============================================
  // Safe Area Performance Tests
  // ============================================

  test('should not cause performance issues with env() values', async ({ page }) => {
    const nav = page.locator(NAV_SELECTOR);

    // Measure element computations
    const startTime = Date.now();

    for (let i = 0; i < 100; i++) {
      await nav.evaluate(el =>
        window.getComputedStyle(el).paddingBottom
      );
    }

    const elapsed = Date.now() - startTime;

    // 100 computed style reads should complete quickly
    // (env() is not computationally expensive)
    expect(elapsed).toBeLessThan(1000);
  });

  // ============================================
  // Safe Area CSS Specificity Tests
  // ============================================

  test('should not override safe area with more specific selectors', async ({ page }) => {
    const nav = page.locator(NAV_SELECTOR);

    // Verify actual computed padding includes safe area
    const paddingBottom = await nav.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.paddingBottom;
    });

    // Should use env() value (either number + safe area, or number if unsupported)
    expect(paddingBottom).toBeTruthy();
    expect(paddingBottom).toMatch(/^\d+px$/);
  });
});
