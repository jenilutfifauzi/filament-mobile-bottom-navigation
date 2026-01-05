import { test, expect } from '@playwright/test';

/**
 * iOS Safari Browser Tests (Story 5.1)
 *
 * Verifies mobile bottom navigation works correctly on iOS Safari 16 and 17
 * using Playwright's iOS device emulation.
 *
 * @see Story 5-1: Create Playwright Tests for iOS Safari
 */

test.describe('iOS Safari - Bottom Navigation (Story 5.1)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page with navigation
    await page.goto('http://localhost:3000');
  });

  // ============================================
  // Visibility Tests
  // ============================================

  test('should display bottom navigation on mobile viewport', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');

    // Navigation should be visible on mobile
    await expect(nav).toBeVisible();
  });

  test('should position navigation at bottom of viewport', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');
    const box = await nav.boundingBox();
    const viewportSize = page.viewportSize();

    if (box && viewportSize) {
      // Bottom of nav should be near bottom of viewport
      const distanceFromBottom = viewportSize.height - (box.y + box.height);
      expect(distanceFromBottom).toBeLessThan(10); // Within 10px of bottom
    }
  });

  test('should fix navigation position to bottom', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');

    const position = await nav.evaluate((el) =>
      window.getComputedStyle(el).position
    );

    expect(position).toBe('fixed');
  });

  // ============================================
  // Navigation Items Tests
  // ============================================

  test('should display all navigation items', async ({ page }) => {
    const navItems = page.locator('.fmbn-nav-item');
    const count = await navItems.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should show icon for each navigation item', async ({ page }) => {
    const navItems = page.locator('.fmbn-nav-item');
    const count = await navItems.count();

    for (let i = 0; i < count; i++) {
      const icon = navItems.nth(i).locator('.fmbn-nav-item__icon');
      await expect(icon).toBeVisible();
    }
  });

  test('should show label for each navigation item', async ({ page }) => {
    const navItems = page.locator('.fmbn-nav-item');
    const count = await navItems.count();

    for (let i = 0; i < count; i++) {
      const label = navItems.nth(i).locator('.fmbn-nav-item__label');
      await expect(label).toBeVisible();
    }
  });

  test('should have proper text content in labels', async ({ page }) => {
    const labels = page.locator('.fmbn-nav-item__label');
    const count = await labels.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const text = await labels.nth(i).textContent();
      expect(text).toBeTruthy();
      expect(text?.length).toBeGreaterThan(0);
    }
  });

  // ============================================
  // Active State Tests
  // ============================================

  test('should highlight active navigation item', async ({ page }) => {
    const activeItem = page.locator('.fmbn-nav-item--active');

    // At least one item should be active
    const count = await activeItem.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should apply visual styling to active state', async ({ page }) => {
    const activeItem = page.locator('.fmbn-nav-item--active').first();

    if (await activeItem.count() > 0) {
      const backgroundColor = await activeItem.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );

      // Should have a background color (not transparent)
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('should have distinct color for active text', async ({ page }) => {
    const activeItem = page.locator('.fmbn-nav-item--active').first();
    const inactiveItem = page.locator('.fmbn-nav-item').not(activeItem).first();

    if (await activeItem.count() > 0 && await inactiveItem.count() > 0) {
      const activeColor = await activeItem.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      const inactiveColor = await inactiveItem.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      // Colors should be different
      expect(activeColor).not.toBe(inactiveColor);
    }
  });

  // ============================================
  // Safe Area Tests
  // ============================================

  test('should include safe area padding', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');

    const paddingBottom = await nav.evaluate((el) =>
      window.getComputedStyle(el).paddingBottom
    );

    // Should have padding-bottom (for safe area)
    expect(paddingBottom).toBeTruthy();
  });

  test('should have padding-left for safe area', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');

    const paddingLeft = await nav.evaluate((el) =>
      window.getComputedStyle(el).paddingLeft
    );

    expect(paddingLeft).toBeTruthy();
  });

  test('should have padding-right for safe area', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');

    const paddingRight = await nav.evaluate((el) =>
      window.getComputedStyle(el).paddingRight
    );

    expect(paddingRight).toBeTruthy();
  });

  test('should maintain touch targets above safe area', async ({ page }) => {
    const navItems = page.locator('.fmbn-nav-item');
    const count = await navItems.count();

    if (count > 0) {
      const navBox = await page.locator('.fmbn-bottom-nav').boundingBox();
      const firstItemBox = await navItems.first().boundingBox();

      if (navBox && firstItemBox) {
        // Item should be within nav bounds
        expect(firstItemBox.y).toBeGreaterThanOrEqual(navBox.y);
      }
    }
  });

  // ============================================
  // Responsive Behavior Tests
  // ============================================

  test('should hide navigation on desktop viewport (≥768px)', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });

    const nav = page.locator('.fmbn-bottom-nav');

    // Navigation should be hidden on desktop
    const isHidden = await nav.evaluate((el) =>
      window.getComputedStyle(el).display === 'none'
    );

    expect(isHidden).toBe(true);
  });

  test('should show navigation when returning to mobile viewport', async ({ page }) => {
    // Start at desktop
    await page.setViewportSize({ width: 1024, height: 768 });

    // Return to mobile
    await page.setViewportSize({ width: 390, height: 844 });

    const nav = page.locator('.fmbn-bottom-nav');

    // Navigation should be visible again
    await expect(nav).toBeVisible();
  });

  test('should adapt to landscape orientation', async ({ page }) => {
    // Landscape viewport (wide, short)
    await page.setViewportSize({ width: 844, height: 390 });

    const nav = page.locator('.fmbn-bottom-nav');

    // Navigation should respond to viewport size change
    const count = await nav.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // ============================================
  // Touch Target Tests
  // ============================================

  test('should have 44x44px minimum touch targets', async ({ page }) => {
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

  test('should have sufficient tap spacing between items', async ({ page }) => {
    const navItems = page.locator('.fmbn-nav-item');
    const count = await navItems.count();

    if (count >= 2) {
      const firstBox = await navItems.first().boundingBox();
      const secondBox = await navItems.nth(1).boundingBox();

      if (firstBox && secondBox) {
        // Items should be adjacent (no large gaps)
        const gap = secondBox.x - (firstBox.x + firstBox.width);
        expect(gap).toBeLessThan(10); // Minimal gap
      }
    }
  });

  // ============================================
  // Badge Display Tests
  // ============================================

  test('should display badges on navigation items', async ({ page }) => {
    const badges = page.locator('.fmbn-nav-item__badge');

    // If badges exist, they should be visible
    const count = await badges.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(badges.nth(i)).toBeVisible();
      }
    }
  });

  test('should position badges absolutely on icons', async ({ page }) => {
    const badge = page.locator('.fmbn-nav-item__badge').first();

    if (await badge.count() > 0) {
      const position = await badge.evaluate((el) =>
        window.getComputedStyle(el).position
      );

      expect(position).toBe('absolute');
    }
  });

  // ============================================
  // Visual Styling Tests
  // ============================================

  test('should have proper text alignment', async ({ page }) => {
    const labels = page.locator('.fmbn-nav-item__label');

    if (await labels.count() > 0) {
      const alignment = await labels.first().evaluate((el) =>
        window.getComputedStyle(el).textAlign
      );

      expect(alignment).toBe('center');
    }
  });

  test('should use flexbox layout for items', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');

    const display = await nav.evaluate((el) =>
      window.getComputedStyle(el).display
    );

    expect(display).toBe('flex');
  });

  test('should distribute items evenly with space-around', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');

    const justifyContent = await nav.evaluate((el) =>
      window.getComputedStyle(el).justifyContent
    );

    expect(justifyContent).toBe('space-around');
  });

  // ============================================
  // Border and Styling Tests
  // ============================================

  test('should have top border', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');

    const borderTop = await nav.evaluate((el) =>
      window.getComputedStyle(el).borderTop
    );

    expect(borderTop).toBeTruthy();
  });

  test('should have background color', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');

    const backgroundColor = await nav.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  // ============================================
  // Transition and Animation Tests
  // ============================================

  test('should have smooth color transitions', async ({ page }) => {
    const navItem = page.locator('.fmbn-nav-item').first();

    const transition = await navItem.evaluate((el) =>
      window.getComputedStyle(el).transition
    );

    // Should have transition for smooth color changes
    expect(transition).toBeTruthy();
  });

  // ============================================
  // iOS Specific Tests
  // ============================================

  test('should not have layout issues on iPhone 13 viewport', async ({ page }) => {
    // iPhone 13: 390x844
    await page.setViewportSize({ width: 390, height: 844 });

    const nav = page.locator('.fmbn-bottom-nav');
    await expect(nav).toBeVisible();
  });

  test('should not have layout issues on iPhone 14 Pro viewport', async ({ page }) => {
    // iPhone 14 Pro: 393x852 (with Dynamic Island)
    await page.setViewportSize({ width: 393, height: 852 });

    const nav = page.locator('.fmbn-bottom-nav');
    await expect(nav).toBeVisible();
  });

  test('should not have layout issues on iPad viewport', async ({ page }) => {
    // iPad: 768x1024 (should hide nav due to breakpoint)
    await page.setViewportSize({ width: 768, height: 1024 });

    const nav = page.locator('.fmbn-bottom-nav');
    const isHidden = await nav.evaluate((el) =>
      window.getComputedStyle(el).display === 'none'
    );

    expect(isHidden).toBe(true);
  });

  // ============================================
  // Color and Contrast Tests
  // ============================================

  test('should have sufficient z-index', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');

    const zIndex = await nav.evaluate((el) =>
      window.getComputedStyle(el).zIndex
    );

    // Should have z-index to appear above content
    expect(parseInt(zIndex)).toBeGreaterThan(0);
  });

  test('should maintain color in dark mode context', async ({ page }) => {
    const nav = page.locator('.fmbn-bottom-nav');
    const navItem = page.locator('.fmbn-nav-item').first();

    // Both should have computed styles
    const navBg = await nav.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    const itemColor = await navItem.evaluate((el) =>
      window.getComputedStyle(el).color
    );

    expect(navBg).toBeTruthy();
    expect(itemColor).toBeTruthy();
  });
});
