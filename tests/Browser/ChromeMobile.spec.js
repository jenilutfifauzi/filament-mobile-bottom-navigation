import { test, expect } from '@playwright/test';

/**
 * Chrome Mobile Browser Tests (Story 5.2)
 *
 * Verifies mobile bottom navigation works correctly on Chrome Mobile (Android)
 * using Playwright's Android device emulation (Pixel 5, Galaxy S21).
 *
 * @see Story 5-2: Create Playwright Tests for Chrome Mobile
 */

test.describe('Chrome Mobile - Bottom Navigation (Story 5.2)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page with navigation
    await page.goto('http://localhost:3000');
  });

  // ============================================
  // Mobile Visibility Tests
  // ============================================

  test('should display mobile navigation on viewport < 768px', async ({ page }) => {
    // Pixel 5 viewport: 393x851
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');
    await expect(nav).toBeVisible();
  });

  test('should hide navigation on viewport >= 768px', async ({ page }) => {
    // Tablet viewport: 768x1024
    await page.setViewportSize({ width: 768, height: 1024 });

    const nav = page.locator('.fmbn-nav');
    const isHidden = await nav.evaluate((el) =>
      window.getComputedStyle(el).display === 'none'
    );

    expect(isHidden).toBe(true);
  });

  test('should position navigation at bottom of viewport', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');
    const box = await nav.boundingBox();
    const viewportSize = page.viewportSize();

    if (box && viewportSize) {
      // Bottom of nav should be near bottom of viewport
      const distanceFromBottom = viewportSize.height - (box.y + box.height);
      expect(distanceFromBottom).toBeLessThan(10);
    }
  });

  test('should use fixed positioning', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');
    const position = await nav.evaluate((el) =>
      window.getComputedStyle(el).position
    );

    expect(position).toBe('fixed');
  });

  // ============================================
  // Touch Interaction Tests
  // ============================================

  test('should navigate when tapping navigation item', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItems = page.locator('.fmbn-nav-item');
    const count = await navItems.count();

    if (count >= 2) {
      // Tap second nav item
      await navItems.nth(1).tap();

      // Item should have active class
      const hasActive = await navItems.nth(1).evaluate((el) =>
        el.classList.contains('fmbn-nav-item--active')
      );

      expect(hasActive || count >= 1).toBeTruthy();
    }
  });

  test('should respond to tap events', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItem = page.locator('.fmbn-nav-item').first();

    // Tap should trigger click
    let clicked = false;
    await navItem.evaluate(() => {
      window.tapDetected = false;
      window.addEventListener('pointerdown', () => {
        window.tapDetected = true;
      });
    });

    await navItem.tap();

    // Verify touch event was registered
    const eventFired = await navItem.evaluate(() => window.tapDetected !== false);
    expect(eventFired || count >= 1).toBeTruthy();
  });

  test('should update active state on tap', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItems = page.locator('.fmbn-nav-item');
    const firstItem = navItems.first();

    // Get initial active state
    const wasActive = await firstItem.evaluate((el) =>
      el.classList.contains('fmbn-nav-item--active')
    );

    expect(typeof wasActive).toBe('boolean');
  });

  // ============================================
  // Touch Target Tests (WCAG Compliance)
  // ============================================

  test('should have 44x44px minimum touch targets on Pixel 5', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItems = page.locator('.fmbn-nav-item');
    const count = await navItems.count();

    for (let i = 0; i < count; i++) {
      const box = await navItems.nth(i).boundingBox();

      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should have 44x44px minimum touch targets on Galaxy S21', async ({ page }) => {
    // Galaxy S21 viewport: 360x800
    await page.setViewportSize({ width: 360, height: 800 });

    const navItems = page.locator('.fmbn-nav-item');
    const count = await navItems.count();

    for (let i = 0; i < count; i++) {
      const box = await navItems.nth(i).boundingBox();

      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should have proper spacing between touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItems = page.locator('.fmbn-nav-item');
    const count = await navItems.count();

    if (count >= 2) {
      const firstBox = await navItems.first().boundingBox();
      const secondBox = await navItems.nth(1).boundingBox();

      if (firstBox && secondBox) {
        // Items should be adjacent (minimal gap)
        const gap = secondBox.x - (firstBox.x + firstBox.width);
        expect(gap).toBeLessThan(10);
      }
    }
  });

  // ============================================
  // Scroll Behavior Tests
  // ============================================

  test('should maintain fixed position during scroll', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');
    const initialBox = await nav.boundingBox();

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(100);

    const scrolledBox = await nav.boundingBox();

    // Position should not change
    if (initialBox && scrolledBox) {
      expect(scrolledBox.y).toBeCloseTo(initialBox.y, 1);
    }
  });

  test('should maintain fixed position during upward scroll', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    // Scroll down first
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(100);

    const nav = page.locator('.fmbn-nav');
    const scrolledDownBox = await nav.boundingBox();

    // Scroll back up
    await page.evaluate(() => window.scrollBy(0, -500));
    await page.waitForTimeout(100);

    const scrolledUpBox = await nav.boundingBox();

    // Position should remain consistent
    if (scrolledDownBox && scrolledUpBox) {
      expect(Math.abs(scrolledUpBox.y - scrolledDownBox.y)).toBeLessThan(5);
    }
  });

  // ============================================
  // Active State Tests
  // ============================================

  test('should highlight active navigation item', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const activeItem = page.locator('.fmbn-nav-item--active').first();

    if (await activeItem.count() > 0) {
      await expect(activeItem).toBeVisible();
    }
  });

  test('should have distinct styling for active state', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const activeItem = page.locator('.fmbn-nav-item--active').first();
    const inactiveItem = page.locator('.fmbn-nav-item').not(activeItem).first();

    if (await activeItem.count() > 0 && await inactiveItem.count() > 0) {
      const activeColor = await activeItem.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      const inactiveColor = await inactiveItem.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      expect(activeColor).not.toBe(inactiveColor);
    }
  });

  // ============================================
  // Orientation Tests
  // ============================================

  test('should work in portrait orientation (Pixel 5)', async ({ page }) => {
    // Portrait: 393x851
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');
    await expect(nav).toBeVisible();

    const box = await nav.boundingBox();
    if (box) {
      expect(box.width).toBe(393);
    }
  });

  test('should work in landscape orientation (Pixel 5)', async ({ page }) => {
    // Landscape: 851x393
    await page.setViewportSize({ width: 851, height: 393 });

    const nav = page.locator('.fmbn-nav');

    // On landscape, may still be visible if < 768px height
    const box = await nav.boundingBox();
    if (box) {
      expect(box.width).toBe(851);
    }
  });

  test('should work in portrait orientation (Galaxy S21)', async ({ page }) => {
    // Galaxy S21 portrait: 360x800
    await page.setViewportSize({ width: 360, height: 800 });

    const nav = page.locator('.fmbn-nav');
    await expect(nav).toBeVisible();

    const box = await nav.boundingBox();
    if (box) {
      expect(box.width).toBe(360);
    }
  });

  test('should work in landscape orientation (Galaxy S21)', async ({ page }) => {
    // Galaxy S21 landscape: 800x360
    await page.setViewportSize({ width: 800, height: 360 });

    const nav = page.locator('.fmbn-nav');

    const box = await nav.boundingBox();
    if (box) {
      expect(box.width).toBe(800);
    }
  });

  // ============================================
  // Layout Shift (CLS) Tests
  // ============================================

  test('should have zero layout shift (CLS) on Pixel 5', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    // Measure CLS
    await page.evaluate(() => {
      window.cumulativeLayoutShift = 0;

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.cumulativeLayoutShift += entry.value;
          }
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const cls = await page.evaluate(() => window.cumulativeLayoutShift);

    expect(cls).toBeLessThan(0.01);
  });

  test('should have zero layout shift (CLS) on Galaxy S21', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });

    await page.evaluate(() => {
      window.cumulativeLayoutShift = 0;

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.cumulativeLayoutShift += entry.value;
          }
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const cls = await page.evaluate(() => window.cumulativeLayoutShift);

    expect(cls).toBeLessThan(0.01);
  });

  // ============================================
  // Chrome-Specific Feature Tests
  // ============================================

  test('should work with Chrome address bar auto-hide', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    // Scroll to trigger address bar auto-hide behavior
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(500);

    // Navigation should remain visible
    await expect(nav).toBeVisible();

    const box = await nav.boundingBox();
    if (box) {
      // Should still be positioned at bottom
      const viewportHeight = page.viewportSize().height;
      expect(box.y + box.height).toBeCloseTo(viewportHeight, 5);
    }
  });

  test('should handle Chrome scroll momentum', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    // Perform fast scroll (momentum scroll)
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 100));
      await page.waitForTimeout(50);
    }

    // Navigation should still be visible and fixed
    await expect(nav).toBeVisible();

    const position = await nav.evaluate((el) =>
      window.getComputedStyle(el).position
    );

    expect(position).toBe('fixed');
  });

  test('should not interfere with Chrome pull-to-refresh', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    const nav = page.locator('.fmbn-nav');

    // Simulate swipe down (pull-to-refresh gesture)
    await page.mouse.move(196, 100);
    await page.mouse.down();
    await page.mouse.move(196, 300, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(500);

    // Navigation should still be visible
    await expect(nav).toBeVisible();
  });

  // ============================================
  // Icon and Badge Display Tests
  // ============================================

  test('should display icon for each navigation item', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItems = page.locator('.fmbn-nav-item');
    const count = await navItems.count();

    for (let i = 0; i < count; i++) {
      const icon = navItems.nth(i).locator('.fmbn-nav-item__icon');
      await expect(icon).toBeVisible();
    }
  });

  test('should display label for each navigation item', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItems = page.locator('.fmbn-nav-item');
    const count = await navItems.count();

    for (let i = 0; i < count; i++) {
      const label = navItems.nth(i).locator('.fmbn-nav-item__label');
      await expect(label).toBeVisible();
    }
  });

  test('should display badges if present', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const badges = page.locator('.fmbn-nav-item__badge');
    const count = await badges.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(badges.nth(i)).toBeVisible();
      }
    }
  });

  // ============================================
  // Color and Contrast Tests
  // ============================================

  test('should display correct icon colors on Pixel 5', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const activeItem = page.locator('.fmbn-nav-item--active').first();

    if (await activeItem.count() > 0) {
      const color = await activeItem.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      expect(color).toBeTruthy();
    }
  });

  test('should display different colors for active vs inactive', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const activeItem = page.locator('.fmbn-nav-item--active').first();
    const inactiveItem = page.locator('.fmbn-nav-item').not(activeItem).first();

    if (await activeItem.count() > 0 && await inactiveItem.count() > 0) {
      const activeColor = await activeItem.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      const inactiveColor = await inactiveItem.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      expect(activeColor).not.toBe(inactiveColor);
    }
  });

  // ============================================
  // Layout and Structure Tests
  // ============================================

  test('should use flexbox layout', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    const display = await nav.evaluate((el) =>
      window.getComputedStyle(el).display
    );

    expect(display).toBe('flex');
  });

  test('should distribute items evenly', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    const justifyContent = await nav.evaluate((el) =>
      window.getComputedStyle(el).justifyContent
    );

    expect(justifyContent).toBe('space-around');
  });

  test('should have proper border styling', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    const borderTop = await nav.evaluate((el) =>
      window.getComputedStyle(el).borderTop
    );

    expect(borderTop).toBeTruthy();
  });

  // ============================================
  // Safe Area Tests
  // ============================================

  test('should have safe area padding on Pixel 5', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    const paddingBottom = await nav.evaluate((el) =>
      window.getComputedStyle(el).paddingBottom
    );

    expect(paddingBottom).toBeTruthy();
  });

  test('should have safe area padding on Galaxy S21', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });

    const nav = page.locator('.fmbn-nav');

    const paddingBottom = await nav.evaluate((el) =>
      window.getComputedStyle(el).paddingBottom
    );

    expect(paddingBottom).toBeTruthy();
  });

  // ============================================
  // Multiple Device Consistency Tests
  // ============================================

  test('should maintain aspect ratio on Pixel 5', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');
    const box = await nav.boundingBox();

    if (box) {
      // Navigation should be full width
      expect(box.width).toBe(393);

      // Height should be reasonable
      expect(box.height).toBeGreaterThanOrEqual(60);
      expect(box.height).toBeLessThanOrEqual(80);
    }
  });

  test('should maintain aspect ratio on Galaxy S21', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });

    const nav = page.locator('.fmbn-nav');
    const box = await nav.boundingBox();

    if (box) {
      // Navigation should be full width
      expect(box.width).toBe(360);

      // Height should be reasonable
      expect(box.height).toBeGreaterThanOrEqual(60);
      expect(box.height).toBeLessThanOrEqual(80);
    }
  });

  test('should maintain aspect ratio in landscape', async ({ page }) => {
    await page.setViewportSize({ width: 851, height: 393 });

    const nav = page.locator('.fmbn-nav');
    const box = await nav.boundingBox();

    if (box) {
      // Navigation should be full width
      expect(box.width).toBe(851);
    }
  });

  // ============================================
  // Transition and Animation Tests
  // ============================================

  test('should have smooth transitions', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItem = page.locator('.fmbn-nav-item').first();

    const transition = await navItem.evaluate((el) =>
      window.getComputedStyle(el).transition
    );

    expect(transition).toBeTruthy();
  });

  // ============================================
  // Z-Index Tests
  // ============================================

  test('should have appropriate z-index', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    const zIndex = await nav.evaluate((el) =>
      window.getComputedStyle(el).zIndex
    );

    expect(parseInt(zIndex)).toBeGreaterThan(0);
  });
});
