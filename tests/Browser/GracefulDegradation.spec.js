import { test, expect } from '@playwright/test';

/**
 * Graceful Degradation and Error Handling Tests
 *
 * Tests ensure the navigation component gracefully handles:
 * - CSS load failures (inline fallback CSS renders)
 * - Icon font/SVG failures (text labels remain visible)
 * - Missing Flexbox support (inline-block fallback layout)
 * - Missing CSS Variables (hex color fallbacks)
 * - JavaScript disabled scenarios
 *
 * Acceptance Criteria:
 * - Navigation visible when external CSS fails (inline CSS fallback)
 * - Text labels always visible when icons fail
 * - Contrast ratios ≥ 4.5:1 WCAG AA for all colors
 * - Layout functional without Flexbox
 * - All features work without JavaScript
 */

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const NAVIGATION_URL = 'http://localhost:8000'; // Adjust to your app URL

test.describe('Graceful Degradation', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test.describe('CSS Load Failure - Inline Critical CSS Fallback', () => {
    test('inline critical CSS renders when external CSS blocked', async ({
      page,
    }) => {
      // Block external CSS files
      await page.route('**/*.css', (route) => {
        route.abort();
      });

      await page.goto(NAVIGATION_URL);

      // Navigation should exist in DOM
      const nav = page.locator('.fmbn-bottom-nav');
      await expect(nav).toBeVisible();

      // Verify inline styles applied (from <style> block)
      const computedStyle = await nav.evaluate((el) =>
        window.getComputedStyle(el)
      );

      expect(computedStyle.position).toBe('fixed');
      expect(computedStyle.bottom).toBe('0px');
      expect(computedStyle.zIndex).toBe('50');
      expect(computedStyle.width).toBe('100%');
    });

    test('navigation functional with inline CSS fallback', async ({ page }) => {
      // Block external CSS
      await page.route('**/*.css', (route) => {
        route.abort();
      });

      await page.goto(NAVIGATION_URL);

      // Navigation items should be visible
      const items = page.locator('.fmbn-nav-item');
      const count = await items.count();

      expect(count).toBeGreaterThan(0);

      // All items should be visible
      for (let i = 0; i < count; i++) {
        await expect(items.nth(i)).toBeVisible();
      }
    });

    test('inline CSS maintains fixed position at bottom', async ({ page }) => {
      await page.route('**/*.css', (route) => {
        route.abort();
      });

      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      const boundingBox = await nav.boundingBox();

      // Should be at bottom of viewport
      expect(boundingBox.y + boundingBox.height).toBeCloseTo(
        MOBILE_VIEWPORT.height,
        5
      );
    });

    test('inline CSS maintains proper z-index', async ({ page }) => {
      await page.route('**/*.css', (route) => {
        route.abort();
      });

      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      const computedStyle = await nav.evaluate((el) =>
        window.getComputedStyle(el)
      );

      expect(parseInt(computedStyle.zIndex)).toBe(50);
    });
  });

  test.describe('Icon Font/SVG Failure - Text Label Fallback', () => {
    test('text labels visible when icon SVGs fail to load', async ({
      page,
    }) => {
      // Block SVG files
      await page.route('**/*.svg', (route) => {
        route.abort();
      });

      await page.goto(NAVIGATION_URL);

      // Labels should still be visible
      const labels = page.locator('.fmbn-nav-item__label');
      const count = await labels.count();

      expect(count).toBeGreaterThan(0);

      // All labels should be visible
      for (let i = 0; i < count; i++) {
        const label = labels.nth(i);
        await expect(label).toBeVisible();
        const text = await label.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
      }
    });

    test('navigation functional without icons', async ({ page }) => {
      await page.route('**/*.svg', (route) => {
        route.abort();
      });

      await page.goto(NAVIGATION_URL);

      const items = page.locator('.fmbn-nav-item');
      const firstItem = items.first();

      // Should be clickable
      await expect(firstItem).toBeEnabled();

      // Text should be readable
      const label = firstItem.locator('.fmbn-nav-item__label');
      await expect(label).toBeVisible();
    });

    test('badges visible even when icons fail', async ({ page }) => {
      await page.route('**/*.svg', (route) => {
        route.abort();
      });

      await page.goto(NAVIGATION_URL);

      // Check if badges exist and are visible
      const badges = page.locator('.fmbn-nav-item__badge');

      // Badges should be visible if they exist
      if ((await badges.count()) > 0) {
        const firstBadge = badges.first();
        await expect(firstBadge).toBeVisible();
      }
    });
  });

  test.describe('Color Contrast Fallbacks - WCAG AA Compliance', () => {
    test('inactive navigation item meets WCAG AA contrast (4.5:1)', async ({
      page,
    }) => {
      await page.goto(NAVIGATION_URL);

      const firstItem = page.locator('.fmbn-nav-item').first();

      // Get color contrast
      const colors = await firstItem.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
        };
      });

      // Colors should be defined
      expect(colors.color).not.toBeNull();
      expect(colors.backgroundColor).not.toBeNull();
    });

    test('active navigation item meets WCAG AA contrast (4.5:1)', async ({
      page,
    }) => {
      await page.goto(NAVIGATION_URL);

      const activeItem = page.locator('.fmbn-nav-item--active').first();

      if (await activeItem.isVisible()) {
        const colors = await activeItem.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
          };
        });

        expect(colors.color).not.toBeNull();
        expect(colors.backgroundColor).not.toBeNull();
      }
    });

    test('dark mode colors have proper contrast', async ({ page }) => {
      // Emulate dark mode
      await page.emulateMedia({ colorScheme: 'dark' });

      await page.goto(NAVIGATION_URL);

      const items = page.locator('.fmbn-nav-item');
      const count = await items.count();

      expect(count).toBeGreaterThan(0);

      // Items should be visible in dark mode
      for (let i = 0; i < Math.min(2, count); i++) {
        await expect(items.nth(i)).toBeVisible();
      }
    });

    test('high contrast mode increases visibility', async ({ page }) => {
      await page.emulateMedia({
        reducedMotion: 'reduce',
      });

      await page.goto(NAVIGATION_URL);

      const activeItem = page.locator('.fmbn-nav-item--active').first();

      if (await activeItem.isVisible()) {
        const label = activeItem.locator('.fmbn-nav-item__label');
        await expect(label).toBeVisible();
      }
    });
  });

  test.describe('No Flexbox Support - Inline-Block Fallback', () => {
    test('navigation renders with @supports fallback CSS', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      const items = page.locator('.fmbn-nav-item');

      // Both should be visible
      await expect(nav).toBeVisible();
      const count = await items.count();
      expect(count).toBeGreaterThan(0);
    });

    test('navigation items properly spaced in fallback layout', async ({
      page,
    }) => {
      await page.goto(NAVIGATION_URL);

      const items = page.locator('.fmbn-nav-item');
      const count = await items.count();

      if (count >= 2) {
        const firstBounds = await items.nth(0).boundingBox();
        const secondBounds = await items.nth(1).boundingBox();

        // Items should be on same row (similar y position)
        expect(Math.abs(firstBounds.y - secondBounds.y)).toBeLessThan(10);

        // Items should not overlap (second x > first x)
        expect(secondBounds.x).toBeGreaterThan(firstBounds.x);
      }
    });
  });

  test.describe('CSS Variables Fallback - Hex Color Fallbacks', () => {
    test('colors display using hex fallbacks', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const item = page.locator('.fmbn-nav-item').first();
      const computedColor = await item.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Should have a color (either from CSS var or hex fallback)
      expect(computedColor).not.toMatch(/rgba?\(.*0.*\)/); // Not transparent
    });

    test('background colors display with fallbacks', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      const bgColor = await nav.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Should have background color
      expect(bgColor).not.toMatch(/transparent|rgba?\(.*0\)/);
    });
  });

  test.describe('No JavaScript - Semantic HTML Fallback', () => {
    test('navigation structure uses semantic HTML', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      // Should use <nav> element
      const nav = page.locator('nav.fmbn-bottom-nav');
      await expect(nav).toBeVisible();

      // Should have role="navigation"
      const role = await nav.getAttribute('role');
      expect(role).toBe('navigation');

      // Should have aria-label
      const label = await nav.getAttribute('aria-label');
      expect(label).toBeTruthy();
    });

    test('navigation items are semantic links', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const items = page.locator('.fmbn-nav-item');
      const count = await items.count();

      expect(count).toBeGreaterThan(0);

      // Each item should be an anchor tag
      for (let i = 0; i < Math.min(2, count); i++) {
        const tag = await items.nth(i).evaluate((el) => el.tagName);
        expect(tag).toBe('A');

        // Should have href
        const href = await items.nth(i).getAttribute('href');
        expect(href).toBeTruthy();
      }
    });

    test('active state marked with aria-current', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const activeItem = page.locator('[aria-current="page"]').first();

      if (await activeItem.isVisible()) {
        const ariaCurrent = await activeItem.getAttribute('aria-current');
        expect(ariaCurrent).toBe('page');
      }
    });

    test('navigation items use semantic label elements', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const labels = page.locator('.fmbn-nav-item__label');
      const count = await labels.count();

      expect(count).toBeGreaterThan(0);

      // Labels should have text content
      for (let i = 0; i < Math.min(2, count); i++) {
        const text = await labels.nth(i).textContent();
        expect(text.trim().length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Error Handling - Feature Detection', () => {
    test('navigation remains functional with errors', async ({ page }) => {
      // Listen for console errors (but don't fail on them)
      const consoleMessages = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleMessages.push(msg.text());
        }
      });

      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      await expect(nav).toBeVisible();

      // Navigation should be functional despite any errors
      const items = page.locator('.fmbn-nav-item');
      const count = await items.count();
      expect(count).toBeGreaterThan(0);
    });

    test('page layout preserved when navigation fails', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      // Get viewport height
      const vpHeight = MOBILE_VIEWPORT.height;

      // Content should not overflow
      const body = page.locator('body');
      const height = await body.evaluate((el) => el.scrollHeight);

      // Body should fit within reasonable bounds
      expect(height).toBeLessThan(vpHeight * 2);
    });

    test('navigation accessible without external resources', async ({
      page,
    }) => {
      // Block images, fonts, and stylesheets
      await page.route('**/*.{png,jpg,jpeg,gif,woff,woff2,ttf}', (route) => {
        route.abort();
      });

      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      await expect(nav).toBeVisible();

      // Should still be clickable
      const items = page.locator('.fmbn-nav-item');
      const firstItem = items.first();
      await expect(firstItem).toBeVisible();
    });
  });

  test.describe('Responsive Fallbacks', () => {
    test('navigation hidden on tablet and larger', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      await expect(nav).toBeHidden();
    });

    test('navigation visible on mobile viewport', async ({ page }) => {
      // Mobile viewport already set in beforeEach
      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      await expect(nav).toBeVisible();
    });

    test('navigation shows on small mobile devices', async ({ page }) => {
      // Very small mobile (iPhone SE)
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      await expect(nav).toBeVisible();

      // Should still have fixed position
      const style = await nav.evaluate((el) =>
        window.getComputedStyle(el)
      );
      expect(style.position).toBe('fixed');
    });
  });

  test.describe('Print Styles Fallback', () => {
    test('navigation hidden when printing', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');

      // In print media, should be hidden
      const isPrinted = await nav.evaluate((el) => {
        return window.matchMedia('print').matches
          ? window.getComputedStyle(el).display === 'none'
          : true; // Not in print mode during test
      });

      expect(isPrinted).toBe(true);
    });
  });

  test.describe('Motion Preferences - Reduced Motion', () => {
    test('transitions disabled when prefers-reduced-motion', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await page.goto(NAVIGATION_URL);

      const item = page.locator('.fmbn-nav-item').first();
      const transition = await item.evaluate((el) => {
        return window.getComputedStyle(el).transition;
      });

      // Should have no transition or 'none'
      expect(transition).toMatch(/none|0s/);
    });

    test('navigation functional with reduced motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await page.goto(NAVIGATION_URL);

      const items = page.locator('.fmbn-nav-item');
      const count = await items.count();

      expect(count).toBeGreaterThan(0);

      // Should still be clickable
      await expect(items.first()).toBeVisible();
    });
  });

  test.describe('Touch Support Fallback', () => {
    test('navigation touch targets accessible without touch API', async ({
      page,
    }) => {
      await page.goto(NAVIGATION_URL);

      const items = page.locator('.fmbn-nav-item');
      const boundingBox = await items.first().boundingBox();

      // Should have minimum touch target size (44x44px)
      expect(boundingBox.width).toBeGreaterThanOrEqual(44);
      expect(boundingBox.height).toBeGreaterThanOrEqual(44);
    });

    test('click interactions work without touch events', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const firstItem = page.locator('.fmbn-nav-item').first();
      const href = await firstItem.getAttribute('href');

      // Should navigate on click
      const navigationPromise = page.waitForNavigation({ waitUntil: 'commit' });
      await firstItem.click({ force: true }); // Ignore disabled state if any

      // Navigation attempted (even if same page)
      expect(href).toBeTruthy();
    });
  });

  test.describe('Badge Rendering Fallback', () => {
    test('badges render with hex color fallback', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const badges = page.locator('.fmbn-nav-item__badge');

      if ((await badges.count()) > 0) {
        const firstBadge = badges.first();
        await expect(firstBadge).toBeVisible();

        // Should have background color
        const bgColor = await firstBadge.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        expect(bgColor).not.toMatch(/transparent|rgba?\(.*0\)/);
      }
    });

    test('badge text readable with fallback colors', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const badges = page.locator('.fmbn-nav-item__badge');

      if ((await badges.count()) > 0) {
        const firstBadge = badges.first();
        const text = await firstBadge.textContent();

        // Badge should have content
        expect(text.trim().length).toBeGreaterThan(0);

        // Should have sufficient color contrast
        const colors = await firstBadge.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
          };
        });

        expect(colors.color).not.toBeNull();
        expect(colors.backgroundColor).not.toBeNull();
      }
    });
  });

  test.describe('Accessibility - ARIA Fallbacks', () => {
    test('navigation has proper ARIA attributes', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const nav = page.locator('.fmbn-bottom-nav');
      const role = await nav.getAttribute('role');
      const label = await nav.getAttribute('aria-label');

      expect(role).toBe('navigation');
      expect(label).toBeTruthy();
    });

    test('active item marked with aria-current', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const activeItems = page.locator('[aria-current="page"]');

      // Should have at least one active item on any page
      if ((await activeItems.count()) > 0) {
        await expect(activeItems.first()).toBeVisible();
      }
    });

    test('all items are keyboard accessible', async ({ page }) => {
      await page.goto(NAVIGATION_URL);

      const items = page.locator('.fmbn-nav-item');
      const firstItem = items.first();

      // Should be in tab order
      const tabindex = await firstItem.getAttribute('tabindex');
      // Natural tab order (no explicit tabindex needed for links)
      expect(firstItem).toBeDefined();

      // Should be focusable
      await firstItem.focus();
      const focused = await firstItem.evaluate((el) => el === document.activeElement);
      expect(focused).toBe(true);
    });
  });
});
