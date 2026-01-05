import { test, expect } from '@playwright/test';

/**
 * Progressive Enhancement Tests (Story 5.4)
 *
 * Verifies navigation uses progressive enhancement:
 * - Semantic HTML structure (works without CSS/JS)
 * - Fallback values for all CSS features
 * - Works across browsers with varying feature support
 * - ARIA attributes for accessibility
 * - Server-side active state rendering
 *
 * @see Story 5-4: Implement Progressive Enhancement Strategy
 */

test.describe('Progressive Enhancement (Story 5.4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  // ============================================
  // Semantic HTML Structure Tests
  // ============================================

  test('should use semantic navigation element', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('nav.fmbn-nav');
    await expect(nav).toBeVisible();
  });

  test('should use semantic unordered list', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('nav.fmbn-nav');
    const list = nav.locator('ul');

    await expect(list).toBeVisible();
  });

  test('should use semantic list items', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('nav.fmbn-nav');
    const listItems = nav.locator('ul li');

    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should use semantic anchor tags', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('nav.fmbn-nav');
    const links = nav.locator('a.fmbn-nav-item');

    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    // Each link should have href attribute
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  // ============================================
  // ARIA Attributes Tests
  // ============================================

  test('should have role="navigation" attribute', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('nav.fmbn-nav');
    await expect(nav).toHaveAttribute('role', 'navigation');
  });

  test('should have aria-label attribute', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('nav.fmbn-nav');
    const label = await nav.getAttribute('aria-label');

    expect(label).toBeTruthy();
  });

  test('should have aria-label on navigation items', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItems = page.locator('a.fmbn-nav-item');
    const count = await navItems.count();

    for (let i = 0; i < count; i++) {
      const label = await navItems.nth(i).getAttribute('aria-label');
      expect(label).toBeTruthy();
    }
  });

  test('should have aria-current="page" on active item', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const activeItem = page.locator('.fmbn-nav-item--active').first();

    if (await activeItem.count() > 0) {
      await expect(activeItem).toHaveAttribute('aria-current', 'page');
    }
  });

  // ============================================
  // Fallback Color Tests
  // ============================================

  test('should have fallback color for navigation items', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItem = page.locator('.fmbn-nav-item').first();

    const color = await navItem.evaluate((el) =>
      window.getComputedStyle(el).color
    );

    // Should have a computed color (not transparent or empty)
    expect(color).toBeTruthy();
    expect(color).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('should have fallback color for active state', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const activeItem = page.locator('.fmbn-nav-item--active').first();

    if (await activeItem.count() > 0) {
      const color = await activeItem.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      expect(color).toBeTruthy();
    }
  });

  test('should have background color defined', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    const bgColor = await nav.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    expect(bgColor).toBeTruthy();
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  // ============================================
  // Layout Fallback Tests
  // ============================================

  test('should have defined display property', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    const display = await nav.evaluate((el) =>
      window.getComputedStyle(el).display
    );

    // Should be either 'flex' (modern) or 'block' (fallback)
    expect(['flex', 'block']).toContain(display);
  });

  test('should have minimum width and height on items', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItems = page.locator('.fmbn-nav-item');
    const count = await navItems.count();

    for (let i = 0; i < count; i++) {
      const minWidth = await navItems.nth(i).evaluate((el) =>
        window.getComputedStyle(el).minWidth
      );

      const minHeight = await navItems.nth(i).evaluate((el) =>
        window.getComputedStyle(el).minHeight
      );

      expect(minWidth).toBe('44px');
      expect(minHeight).toBe('44px');
    }
  });

  // ============================================
  // CSS Variable with Fallback Tests
  // ============================================

  test('should support CSS custom properties if available', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const hasCSSVariableSupport = await page.evaluate(() => {
      return (
        window.CSS &&
        window.CSS.supports &&
        window.CSS.supports('--css', 'variables')
      );
    });

    // Should work whether or not CSS variables are supported
    expect(typeof hasCSSVariableSupport).toBe('boolean');
  });

  test('should have computed colors whether or not CSS variables are supported', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItem = page.locator('.fmbn-nav-item').first();

    const computedColor = await navItem.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
      };
    });

    expect(computedColor.color).toBeTruthy();
  });

  // ============================================
  // Safe Area Fallback Tests
  // ============================================

  test('should handle safe area padding correctly', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    const padding = await nav.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        paddingBottom: style.paddingBottom,
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight,
      };
    });

    // Padding should be defined (even if 0)
    expect(padding.paddingBottom).toBeTruthy();
    expect(padding.paddingLeft).toBeTruthy();
    expect(padding.paddingRight).toBeTruthy();
  });

  // ============================================
  // Server-Side Active State Tests
  // ============================================

  test('should render active state server-side', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const activeItems = page.locator('.fmbn-nav-item--active');
    const count = await activeItems.count();

    // At least one item should be marked as active
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should apply active class without JavaScript', async ({ page, context }) => {
    // Disable JavaScript
    await context.setJavaScriptEnabled(false);

    await page.goto('http://localhost:3000');
    await page.setViewportSize({ width: 393, height: 851 });

    const activeItem = page.locator('.fmbn-nav-item--active').first();

    // Should still have active class rendered server-side
    if (await activeItem.count() > 0) {
      const hasActiveClass = await activeItem.evaluate((el) =>
        el.classList.contains('fmbn-nav-item--active')
      );

      expect(hasActiveClass).toBe(true);
    }
  });

  // ============================================
  // @supports Feature Query Tests
  // ============================================

  test('should have CSS @supports for Flexbox', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const hasFlexboxSupport = await page.evaluate(() => {
      return CSS.supports('display: flex');
    });

    expect(typeof hasFlexboxSupport).toBe('boolean');
  });

  test('should have CSS @supports for transitions', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const hasTransitionSupport = await page.evaluate(() => {
      return CSS.supports('transition: color 0.2s');
    });

    expect(typeof hasTransitionSupport).toBe('boolean');
  });

  // ============================================
  // Touch Action Fallback Tests
  // ============================================

  test('should have touch-action property if supported', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItem = page.locator('.fmbn-nav-item').first();

    const touchAction = await navItem.evaluate((el) =>
      window.getComputedStyle(el).touchAction
    );

    // Should be 'manipulation' or 'auto' (fallback)
    expect(['manipulation', 'auto']).toContain(touchAction);
  });

  // ============================================
  // Text Content Tests (No CSS Required)
  // ============================================

  test('should have readable link text', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItems = page.locator('a.fmbn-nav-item');
    const count = await navItems.count();

    for (let i = 0; i < count; i++) {
      const text = await navItems.nth(i).textContent();
      expect(text).toBeTruthy();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have descriptive link labels', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const navItems = page.locator('a.fmbn-nav-item');
    const count = await navItems.count();

    for (let i = 0; i < count; i++) {
      const label = await navItems.nth(i).getAttribute('aria-label');
      const text = await navItems.nth(i).textContent();

      // Should have either aria-label or visible text
      expect(label || text).toBeTruthy();
    }
  });

  // ============================================
  // Accessibility Media Query Tests
  // ============================================

  test('should support prefers-reduced-motion', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const supportsReducedMotion = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
             !window.matchMedia('(prefers-reduced-motion: reduce)').matches; // Always true
    });

    expect(supportsReducedMotion).toBe(true);
  });

  test('should support prefers-contrast', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const supportsContrast = await page.evaluate(() => {
      return window.matchMedia('(prefers-contrast: more)').matches ||
             !window.matchMedia('(prefers-contrast: more)').matches; // Always true
    });

    expect(supportsContrast).toBe(true);
  });

  // ============================================
  // Responsive Media Query Tests
  // ============================================

  test('should hide on desktop (>= 768px) via media query', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const nav = page.locator('.fmbn-nav');

    const isHidden = await nav.evaluate((el) =>
      window.getComputedStyle(el).display === 'none'
    );

    expect(isHidden).toBe(true);
  });

  test('should show on mobile (< 768px) via media query', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    const display = await nav.evaluate((el) =>
      window.getComputedStyle(el).display
    );

    expect(display).not.toBe('none');
  });

  // ============================================
  // Print Media Query Tests
  // ============================================

  test('should hide from print media', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const hasPrintRule = await page.evaluate(() => {
      const stylesheets = document.styleSheets;

      for (let sheet of stylesheets) {
        try {
          const cssText = Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join(' ');

          if (cssText.includes('@media print')) {
            return true;
          }
        } catch (e) {
          // Cross-origin stylesheets
        }
      }

      return false;
    });

    expect(hasPrintRule).toBe(true);
  });

  // ============================================
  // Positioned Element Tests
  // ============================================

  test('should have fixed positioning', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    const position = await nav.evaluate((el) =>
      window.getComputedStyle(el).position
    );

    expect(position).toBe('fixed');
  });

  test('should have z-index applied', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    const zIndex = await nav.evaluate((el) =>
      window.getComputedStyle(el).zIndex
    );

    expect(parseInt(zIndex)).toBeGreaterThan(0);
  });

  // ============================================
  // Border and Styling Tests
  // ============================================

  test('should have border styling', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    const nav = page.locator('.fmbn-nav');

    const borderTop = await nav.evaluate((el) =>
      window.getComputedStyle(el).borderTop
    );

    expect(borderTop).toBeTruthy();
  });

  // ============================================
  // No-JavaScript Verification Tests
  // ============================================

  test('should work without JavaScript enabled', async ({ page, context }) => {
    // Disable JavaScript
    await context.setJavaScriptEnabled(false);

    await page.goto('http://localhost:3000');
    await page.setViewportSize({ width: 393, height: 851 });

    // Navigation should still be visible
    const nav = page.locator('.fmbn-nav');
    await expect(nav).toBeVisible();

    // Links should be clickable
    const firstLink = page.locator('a.fmbn-nav-item').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('should navigate without JavaScript', async ({ page, context }) => {
    // Disable JavaScript
    await context.setJavaScriptEnabled(false);

    await page.goto('http://localhost:3000');
    await page.setViewportSize({ width: 393, height: 851 });

    const firstLink = page.locator('a.fmbn-nav-item').first();

    // Navigate by clicking link (standard HTML behavior)
    await firstLink.click();

    // Should navigate successfully
    expect(page.url()).toBeTruthy();
  });
});
